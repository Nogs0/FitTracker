import React, { createContext, useContext, useState, ReactNode } from 'react';

// 🔹 Definindo o tipo do contexto
type NavigationBlockContextType = {
  bloqueado: boolean;
  setBloqueado: (val: boolean) => void;
};

const NavigationBlockContext = createContext<NavigationBlockContextType>({
  bloqueado: false,
  setBloqueado: () => {},
});

// 🔹 Provider do contexto
export const NavigationBlockProvider = ({ children }: { children: ReactNode }) => {
  const [bloqueado, setBloqueado] = useState(false);

  return (
    <NavigationBlockContext.Provider value={{ bloqueado, setBloqueado }}>
      {children}
    </NavigationBlockContext.Provider>
  );
};

// 🔹 Hook customizado para usar o contexto
export const useNavigationBlock = () => useContext(NavigationBlockContext);
