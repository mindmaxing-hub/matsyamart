import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { CartProvider } from './context/CartContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/layout/CartDrawer';
import { HomePage } from './pages/HomePage';
import { ExperienceDetailPage } from './pages/ExperienceDetailPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { HostWithUsPage } from './pages/HostWithUsPage';
import { AdminPage } from './pages/AdminPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Scroll to top helper on route change
function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export function App() {
  return (
    <DataProvider>
      <CartProvider>
        <BrowserRouter>
          <ScrollToTop />
          <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
            <Navbar />
            <div className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/experience/:slug" element={<ExperienceDetailPage />} />
                <Route path="/product/:slug" element={<ProductDetailPage />} />
                <Route path="/order/confirmation/:orderRef" element={<OrderConfirmationPage />} />
                <Route path="/host-with-us" element={<HostWithUsPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </div>
            <Footer />
            <CartDrawer />
          </div>
        </BrowserRouter>
      </CartProvider>
    </DataProvider>
  );
}

export default App;
