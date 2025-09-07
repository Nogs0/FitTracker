import React, { createContext, useContext, useState, ReactNode } from 'react';

type NavigationBlockContextType = {
  bloqueado: boolean;
  setBloqueado: (val: boolean) => void;
};

const NavigationBlockContext = createContext<NavigationBlockContextType>({
  bloqueado: false,
  setBloqueado: () => {},
});

export const NavigationBlockProvider = ({ children }: { children: ReactNode }) => {
  const [bloqueado, setBloqueado] = useState(false);

  return (
    <NavigationBlockContext.Provider value={{ bloqueado, setBloqueado }}>
      {children}
    </NavigationBlockContext.Provider>
  );
};

export const useNavigationBlock = () => useContext(NavigationBlockContext);
