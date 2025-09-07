import React, { createContext, useContext, useState, ReactNode } from 'react';

type BluetoothConectionContextType = {
  conectado: boolean;
  setConectado: (val: boolean) => void;
};

const BluetoothConectionContext = createContext<BluetoothConectionContextType>({
  conectado: false,
  setConectado: () => {},
});

export const BluetoothConectionProvider = ({ children }: { children: ReactNode }) => {
  const [conectado, setConectado] = useState(false);

  return (
    <BluetoothConectionContext.Provider value={{ conectado, setConectado }}>
      {children}
    </BluetoothConectionContext.Provider>
  );
};

export const useBluetoothConection = () => useContext(BluetoothConectionContext);
