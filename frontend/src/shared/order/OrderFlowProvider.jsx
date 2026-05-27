/**
 * OrderFlowProvider.jsx
 * State orchestrator for the professional authenticated order flow.
 * Intercepts WhatsApp CTA clicks, enforces login, stores order state,
 * and automatically resumes order modals post-authentication.
 */

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation as useRoutingLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../core/auth/useAuth';
import { useLocation as useGeoLocation } from '../../core/contexts/useLocation';
import { savePendingOrder, getPendingOrder, clearPendingOrder } from './orderStorage';
import WhatsAppOrderModal from './WhatsAppOrderModal';

export const OrderFlowContext = createContext(null);

export const OrderFlowProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { location: geoLoc } = useGeoLocation();
  const navigate = useNavigate();
  const routerLocation = useRoutingLocation();

  const [activeProduct, setActiveProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // ── Start Order Flow (Checks Auth) ──
  const startOrderFlow = useCallback((productData) => {
    if (isAuthenticated) {
      setActiveProduct(productData);
      setIsModalOpen(true);
    } else {
      // Not logged in: preserve state to localStorage
      const orderPayload = {
        product: {
          id: productData.id || productData._id,
          name: productData.name,
          price: productData.price,
          discountPrice: productData.discountPrice,
          image: productData.image,
          selectedSize: productData.selectedSize || '',
          selectedColor: productData.selectedColor || '',
          quantity: productData.quantity || 1,
          shopName: productData.shopName || productData.shop?.name || ''
        },
        returnPath: routerLocation.pathname + routerLocation.search
      };

      savePendingOrder(orderPayload);
      toast.success('Please log in to continue your WhatsApp order.', { id: 'auth-redirect-toast' });
      navigate('/login');
    }
  }, [isAuthenticated, navigate, routerLocation]);

  // ── Close Modal ──
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setActiveProduct(null);
  }, []);

  // ── Auto-Resume Pending Orders on Login ──
  useEffect(() => {
    if (isAuthenticated) {
      const pending = getPendingOrder();
      if (pending && pending.product) {
        // Safe timeout so page renders completely
        const timer = setTimeout(() => {
          setActiveProduct(pending.product);
          setIsModalOpen(true);
          clearPendingOrder();
          toast.success('Welcome back! Resuming your order flow...', { id: 'order-restore-toast' });
        }, 300);
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated]);

  return (
    <OrderFlowContext.Provider value={{ startOrderFlow, activeProduct, isModalOpen, closeModal }}>
      {children}
      <WhatsAppOrderModal
        isOpen={isModalOpen}
        onClose={closeModal}
        product={activeProduct}
        userProfile={user}
        currentLoc={geoLoc}
      />
    </OrderFlowContext.Provider>
  );
};
