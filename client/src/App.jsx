import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import StorefrontLayout from './layouts/StorefrontLayout';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import ProductDetailPage from './pages/ProductDetailPage';
import OurStoryPage from './pages/OurStoryPage';
import OzoneShieldPage from './pages/OzoneShieldPage';
import CSRInitiativesPage from './pages/CSRInitiativesPage';
import BlogPage from './pages/BlogPage';
import ContactPage from './pages/ContactPage';
import B2BPage from './pages/B2BPage';
import FAQPage from './pages/FAQPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import TrackOrderPage from './pages/TrackOrderPage';
import ProtectedRoute from './components/common/ProtectedRoute';
import LoadingSpinner from './components/common/LoadingSpinner';
import { FullWebsiteSkeleton } from './components/common/Skeleton';

// Dynamic Code Splitting for Admin Module (<150KB user bundle)
const AdminLayout = lazy(() => import('./layouts/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminReels = lazy(() => import('./pages/admin/AdminReels'));
const WebsiteEditor = lazy(() => import('./pages/admin/WebsiteEditor'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AdminCoupons = lazy(() => import('./pages/admin/AdminCoupons'));
const AdminCustomers = lazy(() => import('./pages/admin/AdminCustomers'));
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'));
const AdminInventory = lazy(() => import('./pages/admin/AdminInventory'));
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews'));
const AdminInquiries = lazy(() => import('./pages/admin/AdminInquiries'));
const AdminNewsletter = lazy(() => import('./pages/admin/AdminNewsletter'));
const AdminAuditLogs = lazy(() => import('./pages/admin/AdminAuditLogs'));
const AdminRoles = lazy(() => import('./pages/admin/AdminRoles'));
const AdminBlogs = lazy(() => import('./pages/admin/AdminBlogs'));
const AdminTestimonials = lazy(() => import('./pages/admin/AdminTestimonials'));
const AdminEmailSetup = lazy(() => import('./pages/admin/AdminEmailSetup'));
const AdminEmailTemplates = lazy(() => import('./pages/admin/AdminEmailTemplates'));
const AdminFAQs = lazy(() => import('./pages/admin/AdminFAQs'));

const App = () => {
  return (
    <Routes>
      {/* Public Storefront Routes */}
      <Route path="/" element={<StorefrontLayout />}>
        <Route index element={<HomePage />} />
        <Route path="shop" element={<ShopPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route path="our-story" element={<OurStoryPage />} />
        <Route path="about" element={<OurStoryPage />} />
        <Route path="ozone-shield" element={<OzoneShieldPage />} />
        <Route path="csr-initiatives" element={<CSRInitiativesPage />} />
        <Route path="b2b" element={<B2BPage />} />
        <Route path="b2c" element={<B2BPage />} />
        <Route path="commercial" element={<B2BPage />} />
        <Route path="partnerships" element={<B2BPage />} />
        <Route path="faqs" element={<FAQPage />} />
        <Route path="faq" element={<FAQPage />} />
        <Route path="blog" element={<BlogPage />} />
        <Route path="blogs" element={<BlogPage />} />
        <Route path="contact-us" element={<ContactPage />} />
        <Route path="contact" element={<ContactPage />} />
        <Route path="order-success" element={<OrderSuccessPage />} />
        <Route path="orders/success" element={<OrderSuccessPage />} />
        <Route path="track-order" element={<TrackOrderPage />} />
        <Route path="track-order/:id" element={<TrackOrderPage />} />
        <Route path="track" element={<TrackOrderPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
      </Route>

      {/* Protected Admin Routes */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute adminOnly>
            <Suspense fallback={<LoadingSpinner fullScreen />}>
              <AdminLayout />
            </Suspense>
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="reels" element={<AdminReels />} />
        <Route path="editor" element={<WebsiteEditor />} />
        <Route path="blogs" element={<AdminBlogs />} />
        <Route path="testimonials" element={<AdminTestimonials />} />
        <Route path="analytics" element={<AdminAnalytics />} />
        <Route path="coupons" element={<AdminCoupons />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="inventory" element={<AdminInventory />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="inquiries" element={<AdminInquiries />} />
        <Route path="newsletter" element={<AdminNewsletter />} />
        <Route path="email-setup" element={<AdminEmailSetup />} />
        <Route path="email-templates" element={<AdminEmailTemplates />} />
        <Route path="audit-logs" element={<AdminAuditLogs />} />
        <Route path="roles" element={<AdminRoles />} />
        <Route path="faqs" element={<AdminFAQs />} />
      </Route>

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
