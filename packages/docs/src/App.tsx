import { useMemo, useState } from "react";
import {
  Sidebar,
  Toggle,
  useSwipeLeftPane,
  useSwipeRightPane,
} from "@luciodale/swipe-pane";

export function App() {
  const [isLeftSidebarCollapsed, setIsLeftSidebarCollapsed] = useState(true);
  const [isRightSidebarCollapsed, setIsRightSidebarCollapsed] = useState(false);
  const [leftDragX, setLeftDragX] = useState<number | null>(null);
  const [rightDragX, setRightDragX] = useState<number | null>(null);

  const leftCallbacks = useMemo(
    () => ({
      getIsLeftOpen: () => !isLeftSidebarCollapsed,
      openLeft: () => setIsLeftSidebarCollapsed(false),
      closeLeft: () => setIsLeftSidebarCollapsed(true),
      onLeftDrag: (translateX: number | null) => {
        setLeftDragX(translateX);
      },
    }),
    [isLeftSidebarCollapsed]
  );

  const rightCallbacks = useMemo(
    () => ({
      getIsRightOpen: () => !isRightSidebarCollapsed,
      openRight: () => setIsRightSidebarCollapsed(false),
      closeRight: () => setIsRightSidebarCollapsed(true),
      onRightDrag: (translateX: number | null) => {
        setRightDragX(translateX);
      },
    }),
    [isRightSidebarCollapsed]
  );

  useSwipeLeftPane(leftCallbacks);
  useSwipeRightPane(rightCallbacks);

  return (
    <>
      <div className="flex" style={{ height: "100dvh" }}>
        <div className="relative flex h-full w-full overflow-hidden">
          <Sidebar
            isCollapsed={isLeftSidebarCollapsed}
            setIsCollapsed={setIsLeftSidebarCollapsed}
            translateX={leftDragX}
            side="left"
          />
          <Toggle
            isCollapsed={isLeftSidebarCollapsed}
            setIsCollapsed={setIsLeftSidebarCollapsed}
            side="left"
          />
          <div className="relative flex h-full max-w-full flex-1 flex-col overflow-hidden">
            <div className="h-full relative flex w-full grow overflow-hidden">
              <div className="flex flex-col transition-width relative h-full w-full flex-1 overflow-auto bg-presentation">
                {/* main chat */}
                <main className="flex h-full flex-col overflow-y-auto overscroll-contain">
                  <div className="flex h-full w-full flex-col">
                    {/* HEADER */}
                    <div className="sticky top-0 z-10 flex justify-between h-14 w-full items-center gap-2 p-2 bg-black">
                      <div>header</div>
                      <div>end</div>
                    </div>

                    <div className="flex flex-col h-full overflow-y-auto">
                      content
                    </div>
                  </div>
                </main>
              </div>
            </div>
          </div>
          <Sidebar
            isCollapsed={isRightSidebarCollapsed}
            setIsCollapsed={setIsRightSidebarCollapsed}
            translateX={rightDragX}
            side="right"
          />
          <Toggle
            isCollapsed={isRightSidebarCollapsed}
            setIsCollapsed={setIsRightSidebarCollapsed}
            side="right"
          />
        </div>
      </div>
    </>
  );
}
