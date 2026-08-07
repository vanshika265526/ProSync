import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useDashboard } from './DashboardContext';
import { API_ORIGIN } from '../services/apiClient';

/**
 * Socket.IO connection shared by the Notification Center and Activity Feed.
 *
 * Consumers don't touch the socket directly — they call `subscribe(event, fn)`
 * and get an unsubscribe function back. That keeps the socket a singleton
 * while letting any number of components listen, and means a component
 * unmounting can never tear down someone else's listener.
 *
 * The connection is optional by design: in demo mode, or when the server has
 * no socket layer, `connected` stays false and every consumer falls back to
 * its REST endpoint. Nothing in the UI breaks.
 */

const RealtimeContext = createContext(null);

export const useRealtime = () => useContext(RealtimeContext) || {
    socket: null,
    connected: false,
    subscribe: () => () => { },
    joinProject: () => { },
};

export const RealtimeProvider = ({ children }) => {
    const { authToken, isDemoMode, activeProjectId } = useDashboard();

    const socketRef = useRef(null);
    const [connected, setConnected] = useState(false);

    // event name -> Set<handler>. One socket listener per event name, however
    // many React components are interested.
    const listenersRef = useRef(new Map());
    const boundEventsRef = useRef(new Set());

    // --- Connect / disconnect with the session ---
    useEffect(() => {
        if (!authToken || isDemoMode) {
            socketRef.current?.disconnect();
            socketRef.current = null;
            setConnected(false);
            return undefined;
        }

        const socket = io(API_ORIGIN, {
            auth: { token: authToken },
            // Poll first, then upgrade. Opening on 'websocket' fails loudly in
            // the console whenever the API is down or sitting behind a proxy
            // that blocks upgrades; polling degrades quietly and upgrades on
            // its own once a real WebSocket is available.
            transports: ['polling', 'websocket'],
            reconnectionAttempts: 10,
            reconnectionDelay: 1000,
            reconnectionDelayMax: 10000,
            timeout: 10000,
        });

        socketRef.current = socket;

        socket.on('connect', () => setConnected(true));
        socket.on('disconnect', () => setConnected(false));
        socket.on('connect_error', (error) => {
            setConnected(false);
            // Expected while the API restarts — log once at debug level rather
            // than letting socket.io spam the console on every retry.
            if (import.meta.env.DEV) {
                console.debug('[Realtime] not connected:', error?.message);
            }
        });

        // Re-attach every event a consumer registered before this socket existed.
        for (const eventName of listenersRef.current.keys()) {
            if (!boundEventsRef.current.has(eventName)) {
                socket.on(eventName, (payload) => {
                    listenersRef.current.get(eventName)?.forEach((fn) => {
                        try { fn(payload); } catch (error) { console.error(`[Realtime] ${eventName} handler failed:`, error); }
                    });
                });
                boundEventsRef.current.add(eventName);
            }
        }

        return () => {
            boundEventsRef.current.clear();
            socket.removeAllListeners();
            socket.disconnect();
            socketRef.current = null;
            setConnected(false);
        };
    }, [authToken, isDemoMode]);

    /** Register a handler for a server event. Returns an unsubscribe function. */
    const subscribe = useCallback((eventName, handler) => {
        if (!eventName || typeof handler !== 'function') return () => { };

        if (!listenersRef.current.has(eventName)) {
            listenersRef.current.set(eventName, new Set());
        }
        listenersRef.current.get(eventName).add(handler);

        // Bind the underlying socket listener lazily, once per event name.
        const socket = socketRef.current;
        if (socket && !boundEventsRef.current.has(eventName)) {
            socket.on(eventName, (payload) => {
                listenersRef.current.get(eventName)?.forEach((fn) => {
                    try { fn(payload); } catch (error) { console.error(`[Realtime] ${eventName} handler failed:`, error); }
                });
            });
            boundEventsRef.current.add(eventName);
        }

        return () => {
            listenersRef.current.get(eventName)?.delete(handler);
        };
    }, []);

    const joinProject = useCallback((projectId) => {
        if (!projectId) return;
        socketRef.current?.emit('project:join', projectId);
    }, []);

    const leaveProject = useCallback((projectId) => {
        if (!projectId) return;
        socketRef.current?.emit('project:leave', projectId);
    }, []);

    // Follow the active board: joining a room is what makes the feed live.
    // Re-runs on reconnect because `connected` is a dependency.
    useEffect(() => {
        if (!connected || !activeProjectId) return undefined;
        joinProject(activeProjectId);
        return () => leaveProject(activeProjectId);
    }, [connected, activeProjectId, joinProject, leaveProject]);

    const value = {
        socket: socketRef.current,
        connected,
        subscribe,
        joinProject,
        leaveProject,
    };

    return <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>;
};

export default RealtimeContext;
