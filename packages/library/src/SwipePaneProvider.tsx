import { createContext, useContext, useState, type ReactNode } from "react";

type LockedPane = "left" | "right" | null;

type SwipePaneContextType = {
  lockedPane: LockedPane;
  setLockedPane: (pane: LockedPane) => void;
};

const SwipePaneContext = createContext<SwipePaneContextType | null>(null);

export const SwipePaneProvider = ({ children }: { children: ReactNode }) => {
  const [lockedPane, setLockedPane] = useState<LockedPane>(null);

  return (
    <SwipePaneContext.Provider value={{ lockedPane, setLockedPane }}>
      {children}
    </SwipePaneContext.Provider>
  );
};

export const useSwipePaneContext = () => {
  const context = useContext(SwipePaneContext);
  if (!context) {
    throw new Error(
      "useSwipePaneContext must be used within SwipePaneProvider"
    );
  }
  return context;
};

