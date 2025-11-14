import {
  type ReactNode,
  createContext,
  useCallback,
  useRef,
  useState,
  useEffect,
} from "react";
import {
  DEFAULT_OVERLAY_BACKGROUND_COLOR,
  DEFAULT_OVERLAY_Z_INDEX,
  DEFAULT_SWIPEBAR_Z_INDEX,
  DEFAULT_TOGGLE_ICON_COLOR,
  DEFAULT_TOGGLE_ICON_EDGE_DISTANCE_PX,
  DEFAULT_TOGGLE_ICON_SIZE_PX,
  DEFAULT_TOGGLE_Z_INDEX,
  DRAG_ACTIVATION_DELTA_PX,
  EDGE_ACTIVATION_REGION_PX,
  IS_ABSOLUTE,
  MEDIA_QUERY_WIDTH,
  PANE_WIDTH_PX,
  SHOW_OVERLAY,
  SHOW_TOGGLE,
  TRANSITION_MS,
  type TSidebarSide,
  type TSwipeBarOptions,
  applyClosePaneStyles,
  applyDragPaneStyles,
  applyOpenPaneStyles,
  FADE_CONTENT,
} from "./swipeSidebarShared";

type TLockedSidebar = TSidebarSide | null;

type TSwipeSidebarContext = {
  lockedSidebar: TLockedSidebar;
  setLockedSidebar: (side: TLockedSidebar) => void;
  leftSidebarRef: React.RefObject<HTMLDivElement | null>;
  rightSidebarRef: React.RefObject<HTMLDivElement | null>;
  isLeftOpen: boolean;
  isRightOpen: boolean;
  openSidebar: (side: TSidebarSide) => void;
  closeSidebar: (side: TSidebarSide) => void;
  dragSidebar: (side: TSidebarSide, translateX: number | null) => void;
  globalOptions: Required<TSwipeBarOptions>;
  setGlobalOptions: (options: Partial<Required<TSwipeBarOptions>>) => void;
  leftSidebarOptions: TSwipeBarOptions;
  rightSidebarOptions: TSwipeBarOptions;
  setLeftSidebarOptions: (options: TSwipeBarOptions) => void;
  setRightSidebarOptions: (options: TSwipeBarOptions) => void;
  leftToggleRef: React.RefObject<HTMLDivElement | null>;
  rightToggleRef: React.RefObject<HTMLDivElement | null>;
};

export const SwipeSidebarContext = createContext<TSwipeSidebarContext | null>(
  null
);

export const SwipeBarProvider = ({
  children,
  sidebarWidthPx,
  transitionMs,
  edgeActivationWidthPx,
  dragActivationDeltaPx,
  showOverlay,
  isAbsolute,
  overlayBackgroundColor,
  toggleIconColor,
  toggleIconSizePx,
  toggleIconEdgeDistancePx,
  showToggle,
  mediaQueryWidth,
  swipeBarZIndex,
  toggleZIndex,
  overlayZIndex,
  fadeContent,
}: { children: ReactNode } & TSwipeBarOptions) => {
  const [lockedSidebar, setLockedSidebar] = useState<TLockedSidebar>(null);
  const [isLeftOpen, setIsLeftOpen] = useState(false);
  const [isRightOpen, setIsRightOpen] = useState(false);
  const [leftSidebarOptions, setLeftSidebarOptions] =
    useState<TSwipeBarOptions>({});
  const [rightSidebarOptions, setRightSidebarOptions] =
    useState<TSwipeBarOptions>({});
  const leftSidebarRef = useRef<HTMLDivElement>(null);
  const rightSidebarRef = useRef<HTMLDivElement>(null);
  const leftToggleRef = useRef<HTMLDivElement>(null);
  const rightToggleRef = useRef<HTMLDivElement>(null);
  const [globalOptions, setGlobalOptions] = useState<
    Required<TSwipeBarOptions>
  >({
    sidebarWidthPx: sidebarWidthPx ?? PANE_WIDTH_PX,
    transitionMs: transitionMs ?? TRANSITION_MS,
    edgeActivationWidthPx: edgeActivationWidthPx ?? EDGE_ACTIVATION_REGION_PX,
    dragActivationDeltaPx: dragActivationDeltaPx ?? DRAG_ACTIVATION_DELTA_PX,
    showOverlay: showOverlay ?? SHOW_OVERLAY,
    isAbsolute: isAbsolute ?? IS_ABSOLUTE,
    overlayBackgroundColor:
      overlayBackgroundColor ?? DEFAULT_OVERLAY_BACKGROUND_COLOR,
    toggleIconColor: toggleIconColor ?? DEFAULT_TOGGLE_ICON_COLOR,
    toggleIconSizePx: toggleIconSizePx ?? DEFAULT_TOGGLE_ICON_SIZE_PX,
    toggleIconEdgeDistancePx:
      toggleIconEdgeDistancePx ?? DEFAULT_TOGGLE_ICON_EDGE_DISTANCE_PX,
    showToggle: showToggle ?? SHOW_TOGGLE,
    mediaQueryWidth: mediaQueryWidth ?? MEDIA_QUERY_WIDTH,
    swipeBarZIndex: swipeBarZIndex ?? DEFAULT_SWIPEBAR_Z_INDEX,
    toggleZIndex: toggleZIndex ?? DEFAULT_TOGGLE_Z_INDEX,
    overlayZIndex: overlayZIndex ?? DEFAULT_OVERLAY_Z_INDEX,
    fadeContent: fadeContent ?? FADE_CONTENT,
  });

  // Ensure child content becomes visible when fading is disabled at runtime
  useEffect(() => {
    if (leftSidebarOptions.fadeContent === false) {
      const child = leftSidebarRef.current
        ?.firstElementChild as HTMLElement | null;
      if (child) child.style.opacity = "1";
    }
  }, [leftSidebarOptions.fadeContent]);

  useEffect(() => {
    if (rightSidebarOptions.fadeContent === false) {
      const child = rightSidebarRef.current
        ?.firstElementChild as HTMLElement | null;
      if (child) child.style.opacity = "1";
    }
  }, [rightSidebarOptions.fadeContent]);

  const updateGlobalOptions = useCallback(
    (options: Partial<Required<TSwipeBarOptions>>) => {
      setGlobalOptions((prev) => ({ ...prev, ...options }));
    },
    []
  );

  const openSidebar = useCallback(
    (side: TSidebarSide) => {
      applyOpenPaneStyles({
        side,
        ref: side === "left" ? leftSidebarRef : rightSidebarRef,
        options: side === "left" ? leftSidebarOptions : rightSidebarOptions,
        toggleRef: side === "left" ? leftToggleRef : rightToggleRef,
        afterApply: () => {
          side === "left" ? setIsLeftOpen(true) : setIsRightOpen(true);
          setLockedSidebar(side);
        },
      });
    },
    [leftSidebarOptions, rightSidebarOptions]
  );

  const closeSidebar = useCallback(
    (side: TSidebarSide) => {
      applyClosePaneStyles({
        ref: side === "left" ? leftSidebarRef : rightSidebarRef,
        options: side === "left" ? leftSidebarOptions : rightSidebarOptions,
        toggleRef: side === "left" ? leftToggleRef : rightToggleRef,
        side,
        afterApply: () => {
          side === "left" ? setIsLeftOpen(false) : setIsRightOpen(false);
          setLockedSidebar(null);
        },
      });
    },
    [leftSidebarOptions, rightSidebarOptions]
  );

  const dragSidebar = useCallback(
    (side: TSidebarSide, translateX: number | null) => {
      applyDragPaneStyles({
        ref: side === "left" ? leftSidebarRef : rightSidebarRef,
        toggleRef: side === "left" ? leftToggleRef : rightToggleRef,
        options: side === "left" ? leftSidebarOptions : rightSidebarOptions,
        translateX,
      });
    },
    [leftSidebarOptions, rightSidebarOptions]
  );

  return (
    <SwipeSidebarContext.Provider
      value={{
        lockedSidebar,
        setLockedSidebar,
        isLeftOpen,
        isRightOpen,
        leftSidebarRef,
        rightSidebarRef,
        openSidebar,
        closeSidebar,
        dragSidebar,
        globalOptions,
        setGlobalOptions: updateGlobalOptions,
        leftSidebarOptions,
        rightSidebarOptions,
        setLeftSidebarOptions,
        setRightSidebarOptions,
        leftToggleRef,
        rightToggleRef,
      }}
    >
      {children}
    </SwipeSidebarContext.Provider>
  );
};
