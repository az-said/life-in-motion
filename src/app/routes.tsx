import { lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import EntryPage from "./views/EntryPage";
import DashboardPage from "./views/DashboardPage";
import CvRedirect from "./views/CvRedirect";
import AppErrorFallback from "../components/AppErrorFallback";

/**
 * Chunking strategy.
 *
 * Eager: EntryPage, DashboardPage, CvRedirect. These three are the arrival
 * path — a QR scan in a loud room resolves to one of them, and none may wait on
 * a second network round-trip.
 *
 * Lazy: everything else. Story, Atlas and Ventures carry the heavy media
 * components and the case-file machinery; a recruiter who reads the dashboard
 * and downloads the CV should never pay to download them. The Suspense boundary
 * lives in AppLayout, around the Outlet.
 */
const StoryPage = lazy(() => import("./views/StoryPage"));
const HonorsPage = lazy(() => import("./views/HonorsPage"));
const VenturesPage = lazy(() => import("./views/VenturesPage"));
const AtlasPage = lazy(() => import("./views/AtlasPage"));
const BooksPage = lazy(() => import("./views/BooksPage"));
const AboutPage = lazy(() => import("./views/AboutPage"));
const ContactPage = lazy(() => import("./views/ContactPage"));

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    errorElement: <AppErrorFallback />,
    children: [
      // "/" branches on viewport: gate on desktop, dashboard on mobile.
      { path: "/", element: <EntryPage /> },
      // The recruiter surface. This is what the card's QR ultimately reaches.
      { path: "/dashboard", element: <DashboardPage /> },
      // Permanent CV URL. Vercel answers this with a 307 in production.
      { path: "/cv", element: <CvRedirect /> },
      { path: "/story", element: <StoryPage /> },
      { path: "/honors", element: <HonorsPage /> },
      { path: "/ventures", element: <VenturesPage /> },
      { path: "/atlas", element: <AtlasPage /> },
      { path: "/books", element: <BooksPage /> },
      { path: "/about", element: <AboutPage /> },
      { path: "/contact", element: <ContactPage /> },
    ],
  },
]);
