import React, { createContext, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { AppController } from '../controllers/AppController';

const AppControllerContext = createContext<AppController | null>(null);

interface AppControllerProviderProps {
  children: ReactNode;
}

export const AppControllerProvider: React.FC<AppControllerProviderProps> = ({
  children,
}) => {
  const controller = useMemo(() => new AppController(), []);
  return (
    <AppControllerContext.Provider value={controller}>
      {children}
    </AppControllerContext.Provider>
  );
};

export function useAppController(): AppController {
  const context = useContext(AppControllerContext);
  if (!context) {
    throw new Error(
      'useAppController must be used within an AppControllerProvider'
    );
  }
  return context;
}
