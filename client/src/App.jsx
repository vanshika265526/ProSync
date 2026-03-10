import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardProvider } from "./context/DashboardContext";
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

function App() {
  return (
    <BrowserRouter>
      <DashboardProvider>
        <Suspense fallback={<LoadingScreen />}>
          <Routes>
            {/* Auth routes (NO navbar/sidebar) */}
            <Route path="/login" element={<Auth />} />
            <Route path="/signup" element={<Auth />} />
            {/* App routes (WITH navbar/sidebar) */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/dashboard/docs" element={<DashboardDocs />} />
            <Route path="/docs" element={<LandingDocs />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/support" element={<Support />} />
            <Route path="/contact" element={<LandingContact />} />
          </Routes>
        </Suspense>
      </DashboardProvider>
    </BrowserRouter>
  );
}

export default App;
