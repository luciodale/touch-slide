import { useMemo, useState } from "react";
import { useMobileSwipePanes } from "touch-slide";
import { Sidebar } from "./components/Sidebar";

export function App() {
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(false);
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);
  const [leftDragX, setLeftDragX] = useState<number | null>(null);
  const [rightDragX, setRightDragX] = useState<number | null>(null);

  const cbs = useMemo(
    () => ({
      getIsLeftOpen: () => !isLeftSidebarCollapsed,
      getIsRightOpen: () => !isRightSidebarCollapsed,
      openLeft: () => setIsLeftSidebarCollapsed(false),
      closeLeft: () => setIsLeftSidebarCollapsed(true),
      openRight: () => setIsRightSidebarCollapsed(false),
      closeRight: () => setIsRightSidebarCollapsed(true),
      onLeftDrag: (translateX: number | null) => {
        console.log("left drag", translateX);
        setLeftDragX(translateX);
      },
      onRightDrag: (translateX: number | null) => {
        console.log("right drag", translateX);
        setRightDragX(translateX);
      },
    }),
    [isLeftSidebarCollapsed, isRightSidebarCollapsed]
  );

  useMobileSwipePanes(cbs);

  return (
    <div className="flex" style={{ height: "100dvh" }}>
      <div className="relative z-0 flex h-full w-full overflow-hidden">
        <Sidebar
          isCollapsed={isLeftSidebarCollapsed}
          setIsCollapsed={setIsLeftSidebarCollapsed}
          translateX={leftDragX ?? undefined}
          side="left"
        />
        <div className="relative flex h-full max-w-full flex-1 flex-col overflow-hidden">
          <div className="h-full relative flex w-full grow overflow-hidden bg-red-500">
            {/* split between main and left component */}
            <div className="flex flex-col transition-width relative h-full w-full flex-1 overflow-auto bg-presentation">
              {/* main chat */}
              <main className="flex h-full flex-col overflow-y-auto overscroll-contain">
                <div className="flex h-full w-full flex-col">
                  {/* HEADER */}
                  <div className="sticky top-0 z-10 flex h-14 w-full items-center gap-2 p-2 font-semibold text-text-primary">
                    header
                  </div>

                  <div className="flex flex-col h-full overflow-y-auto">
                    content
                  </div>
                </div>
              </main>
              {/* <Sidebar
                isCollapsed={isRightSidebarCollapsed}
                setIsCollapsed={setIsRightSidebarCollapsed}
                translateX={rightDragX ?? undefined}
                side="right"
              /> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
