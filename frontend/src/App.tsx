import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import CustomCursor from './components/shared/CustomCursor'
import ProtectedRoute from './components/shared/ProtectedRoute'
import ScrollToTop from './components/shared/ScrollToTop'

// Pages
import HomePage from './pages/HomePage'
import DemoPage from './pages/DemoPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'
import AboutPage from './pages/AboutPage'
import ContactPage from './pages/ContactPage'
import NotFoundPage from './pages/NotFoundPage'
import PricingPage from './pages/PricingPage'
import PhotographerPage from './pages/PhotographerPage'

// Guest flow
import EventLandingPage from './pages/guest/EventLandingPage'
import OTPPage from './pages/guest/OTPPage'
import SelfiePage from './pages/guest/SelfiePage'
import GalleryPage from './pages/guest/GalleryPage'
import VIPLandingPage from './pages/guest/VIPLandingPage'

// Photographer
import PhotographerLayout from './pages/photographer/PhotographerLayout'
import PhotographerEvents from './pages/photographer/PhotographerEvents'
import PhotographerUpload from './pages/photographer/PhotographerUpload'
import PhotographerQR from './pages/photographer/PhotographerQR'
import PhotographerAnalytics from './pages/photographer/PhotographerAnalytics'
import PhotographerProfile from './pages/photographer/PhotographerProfile'
import OnboardingWizard from './pages/photographer/OnboardingWizard'
import PhotographerFTP from './pages/photographer/PhotographerFTP'
import GlobalDelivery from './pages/photographer/GlobalDelivery'
import NotificationCenter from './pages/photographer/NotificationCenter'
import GuestIntelligence from './pages/photographer/GuestIntelligence'
import PhotographerShowcase from './pages/photographer/PhotographerShowcase'
import PricingManager from './pages/photographer/PricingManager'
import PhotographerBookings from './pages/photographer/BookingsPage'
import PhotographerChatPage from './pages/photographer/PhotographerChatPage'

// Admin
import AdminLayout from './pages/admin/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminPhotographers from './pages/admin/AdminPhotographers'
import AdminEvents from './pages/admin/AdminEvents'
import AdminAnalytics from './pages/admin/AdminAnalytics'
import AdminMessages from './pages/admin/AdminMessages'
import AdminInvoices from './pages/admin/AdminInvoices'
import AdminSettings from './pages/admin/AdminSettings'

// Client Marketplace
import PhotographerSearchPage from './pages/client/PhotographerSearchPage'
import PhotographerProfilePublic from './pages/client/PhotographerProfilePublic'
import EventCreationWizard from './pages/client/EventCreationWizard'
import ClientEventDetails from './pages/client/ClientEventDetails'
import ClientLayout from './pages/client/ClientLayout'
import ClientDashboard from './pages/client/ClientDashboard'
import DiscoverTalent from './pages/client/DiscoverTalent'
import ClientMessages from './pages/client/ClientMessages'
import ClientFavorites from './pages/client/Favorites'
import ClientProfile from './pages/client/ClientProfile'
import { ThemeProvider } from './components/shared/ThemeProvider'

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ScrollToTop />
        <Toaster position="top-center" reverseOrder={false} />
        <Routes>
          {/* Public */}
          <Route path="/" element={<HomePage />} />
          <Route path="/demo" element={<DemoPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/pricing" element={<PricingPage />} />
          <Route path="/photographer" element={<PhotographerPage />} />
          <Route path="/p/:slug" element={<PhotographerShowcase />} />
          <Route path="/photographers" element={<PhotographerSearchPage />} />
          <Route path="/photographers/:id" element={<PhotographerProfilePublic />} />

          {/* Client Marketplace - protected */}
          <Route path="/client" element={<ProtectedRoute requiredRole="client"><ClientLayout /></ProtectedRoute>}>
            <Route index element={<ClientDashboard />} />
            <Route path="dashboard" element={<ClientDashboard />} />
            <Route path="discover" element={<DiscoverTalent />} />
            <Route path="messages" element={<ClientMessages />} />
            <Route path="favorites" element={<ClientFavorites />} />
            <Route path="profile" element={<ClientProfile />} />
            <Route path="events/new" element={<EventCreationWizard />} />
            <Route path="events/:id" element={<ClientEventDetails />} />
          </Route>

          {/* Guest flow */}
          <Route path="/event/:token" element={<EventLandingPage />} />
          <Route path="/event/:token/otp" element={<OTPPage />} />
          <Route path="/event/:token/selfie" element={<SelfiePage />} />
          <Route path="/event/:token/gallery" element={<GalleryPage />} />
          <Route path="/vip/:vipToken" element={<VIPLandingPage />} />
          <Route path="/gallery" element={<GalleryPage />} />

          {/* Onboarding - protected but not dashboard */}
          <Route path="/onboarding" element={<ProtectedRoute requiredRole="photographer"><OnboardingWizard /></ProtectedRoute>} />

          {/* Photographer - protected */}
          <Route path="/photographer" element={<ProtectedRoute requiredRole="photographer"><PhotographerLayout /></ProtectedRoute>}>
            <Route index element={<PhotographerEvents />} />
            <Route path="events" element={<PhotographerEvents />} />
            <Route path="bookings" element={<PhotographerBookings />} />
            <Route path="chat" element={<PhotographerChatPage />} />
            <Route path="events/:id/upload" element={<PhotographerUpload />} />
            <Route path="events/:id/qr" element={<PhotographerQR />} />
            <Route path="events/:id/ftp" element={<PhotographerFTP />} />
            <Route path="analytics" element={<PhotographerAnalytics />} />
            <Route path="engagement" element={<GuestIntelligence />} />
            <Route path="profile" element={<PhotographerProfile />} />
            <Route path="pricing-manager" element={<PricingManager />} />
            <Route path="delivery" element={<GlobalDelivery />} />
            <Route path="notifications" element={<NotificationCenter />} />
          </Route>

          {/* Admin - protected */}
          <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="photographers" element={<AdminPhotographers />} />
            <Route path="events" element={<AdminEvents />} />
            <Route path="messages" element={<AdminMessages />} />
            <Route path="invoices" element={<AdminInvoices />} />
            <Route path="analytics" element={<AdminAnalytics />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  )
}
