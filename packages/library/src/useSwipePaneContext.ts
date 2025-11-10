import { useContext } from "react";
import { SwipeBarContext } from "./SwipePaneProvider";

export const useSwipePaneContext = () => {
  const context = useContext(SwipeBarContext);
  if (!context) {
    throw new Error(
      "useSwipePaneContext must be used within SwipePaneProvider"
    );
  }
  return context;
};
