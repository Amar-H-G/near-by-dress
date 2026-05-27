/**
 * useOrderFlow.js
 * Custom React Hook to access the authenticated WhatsApp order flow.
 */

import { useContext } from 'react';
import { OrderFlowContext } from './OrderFlowProvider';

export const useOrderFlow = () => {
  const context = useContext(OrderFlowContext);
  if (!context) {
    throw new Error('useOrderFlow must be used within an OrderFlowProvider');
  }
  return context;
};
