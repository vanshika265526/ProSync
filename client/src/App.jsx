import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardProvider } from "./context/DashboardContext";
import { ToastProvider } from "./context/ToastContext";
import { GithubProvider } from "./context/GithubContext";
import { RealtimeProvider } from "./context/RealtimeContext";
import { NotificationProvider } from "./context/NotificationContext";
import { ActivityProvider } from "./context/ActivityContext";
import { CommandPaletteProvider } from "./context/CommandPaletteContext";
import LoadingScreen from "./components/LoadingScreen";
import "./index.css";

const Auth = lazy(() => import("./pages/Auth"));
const Home = lazy(() => import("./pages/Home"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const Profile = lazy(() => import("./pages/Profile"));
const DashboardDocs = lazy(() => import("./pages/DashboardDocs"));
const LandingDocs = lazy(() => import("./pages/LandingDocs"));
const Support = lazy(() => import("./pages/Support"));
const LandingContact = lazy(() => import("./pages/LandingContact"));
const Onboarding = lazy(() => import("./pages/Onboarding"));

// Global overlays. Lazy so the palette, drawer and feed (and socket.io-client
// with them) stay out of the landing-page bundle.
const CommandPalette = lazy(() => import("./components/command/CommandPalette"));
const NotificationDrawer = lazy(() => import("./components/notifications/NotificationDrawer"));
const ActivityFeed = lazy(() => import("./components/activity/ActivityFeed"));

/**
 * Provider order matters here:
 *   Dashboard  -> owns the session (authToken) everything else reads
 *   Toast      -> so GitHub and the rest can surface messages
 *   Realtime   -> opens the socket once the session exists
 *   Notification / Activity -> consume the socket
 *   Github     -> unchanged, now sits inside the realtime layer
 *   CommandPalette -> outermost of the UI layers so any page can open it
 */
function App() {
  return (
    <BrowserRouter>
      <DashboardProvider>
        <ToastProvider>
          <RealtimeProvider>
            <NotificationProvider>
              <ActivityProvider>
                <GithubProvider>
                  <CommandPaletteProvider>
                    <Suspense fallback={<LoadingScreen />}>
                      <Routes>
                        {/* Auth routes (NO navbar/sidebar) */}
                        <Route path="/login" element={<Auth />} />
                        <Route path="/signup" element={<Auth />} />
                        {/* App routes (WITH navbar/sidebar) */}
                        <Route path="/" element={<LandingPage />} />
                        <Route path="/dashboard" element={<Home />} />
                        <Route path="/profile" element={<Profile />} />
                        {/* Viewing someone else's profile (read-only) */}
                        <Route path="/profile/:identifier" element={<Profile />} />
                        <Route path="/dashboard/docs" element={<DashboardDocs />} />
                        <Route path="/docs" element={<LandingDocs />} />
                        <Route path="/onboarding" element={<Onboarding />} />
                        <Route path="/support" element={<Support />} />
                        <Route path="/contact" element={<LandingContact />} />
                      </Routes>

                      {/* Rendered outside the routes so Ctrl+K and the drawers
                          work from every page, and survive navigation. */}
                      <CommandPalette />
                      <NotificationDrawer />
                      <ActivityFeed />
                    </Suspense>
                  </CommandPaletteProvider>
                </GithubProvider>
              </ActivityProvider>
            </NotificationProvider>
          </RealtimeProvider>
        </ToastProvider>
      </DashboardProvider>
    </BrowserRouter>
  );
}

export default App;
