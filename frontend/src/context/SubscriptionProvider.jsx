import React, { useState } from 'react';
import { useAuth } from './AuthContext';
import { SubscriptionContext } from './SubscriptionContext';

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
