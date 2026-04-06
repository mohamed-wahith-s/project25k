import React, { createContext, useContext, useState } from 'react';
import { useAuth } from './AuthContext';

const SubscriptionContext = createContext();

export const SubscriptionProvider = ({ children }) => {
  const { user, updateUser } = useAuth();
  const isSubscribed = !!user?.isSubscribed;
  const [loading, setLoading] = useState(false);

  const subscribe = (data) => {
    updateUser({ isSubscribed: true, ...data });
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
