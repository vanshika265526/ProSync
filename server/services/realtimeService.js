const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Project = require('../models/Project');

/**
 * Socket.IO transport for the Activity Feed and Notification Center.
 *
 * Two kinds of rooms:
 *   user:<userId>      — private channel, receives `notification:new`
 *   project:<id>       — shared channel, receives `activity:new` / `history:new`
 *
 * Membership in a project room is verified against Mongo on join, not trusted
 * from the client, so a signed-in user can't subscribe to a board they aren't
 * on. Everything degrades gracefully: if the socket layer never initialises,
 * `emitTo*` becomes a no-op and the REST endpoints still serve the same data
 * (the client polls as a fallback).
 */

let io = null;

const userRoom = (userId) => `user:${userId}`;
const projectRoom = (projectId) => `project:${projectId}`;

/** Verify the JWT handed over in the Socket.IO handshake. */
const authenticate = async (socket, next) => {
    try {
        const token =
            socket.handshake.auth?.token ||
            socket.handshake.query?.token ||
            (socket.handshake.headers?.authorization || '').replace(/^Bearer\s+/i, '');

        if (!token) return next(new Error('Not authorized, no token'));

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('_id name email avatar');
        if (!user) return next(new Error('Not authorized, user not found'));

        socket.data.user = {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            avatar: user.avatar,
        };
        return next();
    } catch (error) {
        return next(new Error('Not authorized'));
    }
};

/** Is this user allowed in this project's room? */
const canJoinProject = async (user, projectId) => {
    if (!projectId) return false;
    try {
        const project = await Project.findById(projectId).select('user team');
        if (!project) return false;
        return (
            project.user.toString() === user.id ||
            (project.team || []).some((m) => m.email === user.email)
        );
    } catch {
        return false;
    }
};

const init = (httpServer) => {
    let Server;
    try {
        ({ Server } = require('socket.io'));
    } catch {
        console.warn('[Realtime] socket.io not installed — falling back to REST polling only.');
        return null;
    }

    io = new Server(httpServer, {
        // Same allowlist Express uses, so a origin that can call the REST API
        // can also open a socket — and one that can't, can't do either.
        cors: require('../config/cors').socketCorsOptions,
        // Long-poll first keeps this working behind proxies that block upgrades;
        // clients upgrade to a real WebSocket once the handshake succeeds.
        transports: ['polling', 'websocket'],
        pingInterval: 25000,
        pingTimeout: 20000,
    });

    io.use(authenticate);

    io.on('connection', (socket) => {
        const user = socket.data.user;

        // Private channel: notifications addressed to this person.
        socket.join(userRoom(user.id));

        socket.on('project:join', async (projectId, ack) => {
            if (!(await canJoinProject(user, projectId))) {
                if (typeof ack === 'function') ack({ ok: false, error: 'Not a member of this project' });
                return;
            }
            socket.join(projectRoom(projectId));
            socket.to(projectRoom(projectId)).emit('presence:join', {
                userId: user.id, name: user.name, avatar: user.avatar,
            });
            if (typeof ack === 'function') ack({ ok: true });
        });

        socket.on('project:leave', (projectId) => {
            if (!projectId) return;
            socket.leave(projectRoom(projectId));
            socket.to(projectRoom(projectId)).emit('presence:leave', { userId: user.id });
        });

        socket.on('disconnect', () => {
            // Rooms are torn down by Socket.IO; only presence needs announcing.
            for (const room of socket.rooms) {
                if (room.startsWith('project:')) {
                    socket.to(room).emit('presence:leave', { userId: user.id });
                }
            }
        });
    });

    console.log('[Realtime] Socket.IO ready');
    return io;
};

/** Push to one person's private channel. Silent no-op when sockets are off. */
const emitToUser = (userId, event, payload) => {
    if (!io || !userId) return;
    io.to(userRoom(userId.toString())).emit(event, payload);
};

/** Push to everyone currently viewing a project. */
const emitToProject = (projectId, event, payload) => {
    if (!io || !projectId) return;
    io.to(projectRoom(projectId.toString())).emit(event, payload);
};

const getIO = () => io;

module.exports = { init, emitToUser, emitToProject, getIO, userRoom, projectRoom };
