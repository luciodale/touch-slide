import type { Dispatch, SetStateAction } from "react";
import { cn } from "../utils";

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

  const isAbsolute = false;

  return (
    <>
      {/*  overlay */}
      <div
        className={cn(
          "fixed z-10 top-0 left-0 w-full h-full bg-yellow-400 transition-opacity duration-200 pointer-events-none",
          !isCollapsed ? "opacity-50 pointer-events-auto" : "opacity-0"
        )}
        onKeyUp={() => setIsCollapsed(true)}
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
          "top-0 bottom-0 z-50 active w-[320px] md:w-[260px] shrink-0 transform overflow-x-hidden bg-yellow-300 transition-all duration-200 ease-in-out",
          isAbsolute && "fixed left-0 top-0 bottom-0"
        )}
      >
        <div className="z-20 flex items-center w-full justify-between gap-4 p-2 h-14">
          <button type="button" onClick={() => setIsCollapsed(!isCollapsed)}>
            toggle
          </button>
        </div>
      </div>
    </>
  );
}
