import { overlayIsOpenStyle, overlayStyle } from "../swipeSidebarShared";

type TOverlay = {
  isCollapsed: boolean;
  setCollapsed: () => void;
  closeSidebarOnClick?: boolean;
  overlayBackgroundColor?: string;
  transitionMs?: number;
};

export function Overlay({
  isCollapsed,
  setCollapsed,
  closeSidebarOnClick = true,
  transitionMs,
  overlayBackgroundColor,
}: TOverlay) {
  return (
    <div
      style={{
        transitionDuration: `${transitionMs}ms`,
        ...overlayStyle,
        ...(!isCollapsed ? overlayIsOpenStyle : {}),
        ...(overlayBackgroundColor
          ? { backgroundColor: overlayBackgroundColor }
          : {}),
      }}
      onMouseDown={(e) => {
        if (closeSidebarOnClick) {
          e.stopPropagation();
          setCollapsed();
        }
      }}
    />
  );
}
