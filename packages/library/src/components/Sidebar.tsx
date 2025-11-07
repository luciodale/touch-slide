import type { Dispatch, SetStateAction } from "react";
import { cn } from "../utils";
import { Overlay } from "./Overlay";
import { useSwipePaneContext } from "../SwipePaneProvider";

type SidebarProps = {
  isCollapsed: boolean;
  setIsCollapsed: Dispatch<SetStateAction<boolean>>;
  translateX?: number | null;
  side: "left" | "right";
};

export function Sidebar({
  isCollapsed,
  setIsCollapsed,
  translateX,
  side,
}: SidebarProps) {
  // const isSmallScreen = useMediaQuery("small");

  const { setLockedPane } = useSwipePaneContext();

  const isAbsolute = false;

  return (
    <>
      {/*  overlay */}

      <Overlay
        isCollapsed={isCollapsed}
        setIsCollapsed={(isCollapsed) => {
          setIsCollapsed(isCollapsed);
          setLockedPane(null);
        }}
      />

      <div
        style={{
          willChange: "transform",
          ...(translateX != null
            ? {
                transform: `translate3d(${translateX}px, 0, 0)`,
                transition: "none",
              }
            : isCollapsed
            ? {
                transform:
                  side === "left" ? "translateX(-100%)" : "translateX(100%)",
                width: "0px",
              }
            : {}),
        }}
        className={cn(
          "z-30 top-0 bottom-0 active w-[320px] md:w-[260px] shrink-0 transform overflow-x-hidden bg-yellow-300 transition-all duration-200 ease-in-out",
          isAbsolute && "fixed left-0 top-0 bottom-0"
        )}
      >
        <div className="flex items-center w-full justify-between gap-4 p-2 h-14">
          <button type="button" onClick={() => setIsCollapsed(!isCollapsed)}>
            toggle
          </button>
        </div>
      </div>
    </>
  );
}
