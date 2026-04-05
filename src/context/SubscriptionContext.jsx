import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';

const SubscriptionContext = createContext();

export const SubscriptionProvider = ({ children }) => {
  const { user, updateUser } = useAuth();
  const isSubscribed = !!user?.isSubscribed;
  const [loading, setLoading] = useState(false);

  // We no longer need the local useEffect since isSubscribed is derived from the user object.

  const subscribe = (planId, metadata = {}) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        updateUser({ isSubscribed: true, ...metadata });
        resolve();
      }, 1500);
    });
  };

  const unsubscribe = () => {
    updateUser({ isSubscribed: false });
  };

  return (
    <SubscriptionContext.Provider value={{ isSubscribed, subscribe, unsubscribe, loading }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => useContext(SubscriptionContext);
