import { useEffect, useRef } from "react";
import { useMediaQuery } from "./useMediaQuery";

type SwipeCallbacks = {
  getIsLeftOpen: () => boolean;
  getIsRightOpen: () => boolean;
  openLeft: () => void;
  closeLeft: () => void;
  openRight: () => void;
  closeRight: () => void;
  onLeftDrag?: (translateX: number | null) => void;
  onRightDrag?: (translateX: number | null) => void;
};

const EDGE_SWIPE_THRESHOLD_PX = 40; // px from the screen edge to start opening when closed
const ACTIVATION_DELTA_X_PX = 20; // minimal horizontal movement to lock onto a gesture
const LEFT_PANE_WIDTH_PX = 320;
const RIGHT_PANE_WIDTH_PX = 352;

export function useMobileSwipePanes(cbs: SwipeCallbacks) {
  const isSmallScreen = useMediaQuery("small");

  const draggingRef = useRef<null | {
    touchStartX: number;
    touchStartY: number;
    activeTouchId: number | null;
  }>(null);
  const lastLeftTranslateRef = useRef<number | null>(null);
  const lastRightTranslateRef = useRef<number | null>(null);
  const currentXRef = useRef<number | null>(null);
  const prevXRef = useRef<number | null>(null);

  // Destructure for stable deps; these are memoized in the parent
  const {
    getIsLeftOpen,
    getIsRightOpen,
    openLeft,
    closeLeft,
    openRight,
    closeRight,
    onLeftDrag,
    onRightDrag,
  } = cbs;

  useEffect(() => {
    if (!isSmallScreen) return;

    // Helper to detect inputs/contenteditable
    const isEditableTarget = (el: EventTarget | null) => {
      if (!(el instanceof Element)) return false;
      const editable = el.closest("input, textarea, [contenteditable='true']");
      return !!editable;
    };

    function onTouchStart(e: TouchEvent) {
      if (isEditableTarget(e.target)) return;
      if (e.changedTouches.length === 0) return;

      const firstTouch = e.changedTouches[0];
      draggingRef.current = {
        touchStartX: firstTouch.clientX,
        touchStartY: firstTouch.clientY,
        activeTouchId: firstTouch.identifier,
      };
      lastLeftTranslateRef.current = null;
      lastRightTranslateRef.current = null;
      currentXRef.current = firstTouch.clientX;
      prevXRef.current = firstTouch.clientX;
    }

    function onTouchMove(e: TouchEvent) {
      if (!draggingRef.current) return;

      // Find the tracked touch
      const trackedId = draggingRef.current.activeTouchId;
      let changedTouch: Touch | null = null;
      for (let i = 0; i < e.changedTouches.length; i++) {
        const candidateTouch = e.changedTouches[i];
        if (trackedId == null || candidateTouch.identifier === trackedId) {
          changedTouch = candidateTouch;
          break;
        }
      }
      if (!changedTouch) return;

      const currentX = changedTouch.clientX;
      const deltaX = currentX - draggingRef.current.touchStartX;

      // Only process if we have enough movement
      if (Math.abs(deltaX) < ACTIVATION_DELTA_X_PX) return;

      // Update X position tracking
      prevXRef.current = currentXRef.current;
      currentXRef.current = currentX;

      // Check if this is a valid gesture based on current state and start position
      const leftOpen = getIsLeftOpen();
      const rightOpen = getIsRightOpen();
      const viewportWidth = window.innerWidth;

      let isValidGesture = false;

      if (leftOpen) {
        // Left pane is open - allow any direction (user can change mind)
        isValidGesture = true;
      } else if (rightOpen) {
        // Right pane is open - allow any direction (user can change mind)
        isValidGesture = true;
      } else {
        // No panes open - only allow opening from edges
        if (draggingRef.current.touchStartX <= EDGE_SWIPE_THRESHOLD_PX) {
          isValidGesture = true; // Can open left pane
        } else if (
          draggingRef.current.touchStartX >=
          viewportWidth - EDGE_SWIPE_THRESHOLD_PX
        ) {
          isValidGesture = true; // Can open right pane
        }
      }

      // No panes are open AND not starting from an edge - cancel the gesture
      if (!isValidGesture) {
        draggingRef.current = null;
        onLeftDrag?.(null);
        onRightDrag?.(null);
        return;
      }

      // Prevent scrolling during valid gestures
      e.preventDefault();

      // Apply live transform while dragging for visual feedback
      if (leftOpen) {
        // Left pane is open - show closing animation
        const translateX = Math.min(0, Math.max(-LEFT_PANE_WIDTH_PX, deltaX)); // 0..-width
        onLeftDrag?.(translateX);
        lastLeftTranslateRef.current = translateX;
      } else if (rightOpen) {
        // Right pane is open - show closing animation
        const translateX = Math.max(0, Math.min(RIGHT_PANE_WIDTH_PX, deltaX)); // 0..width
        onRightDrag?.(translateX);
        lastRightTranslateRef.current = translateX;
      } else if (draggingRef.current.touchStartX <= EDGE_SWIPE_THRESHOLD_PX) {
        // Opening left pane from left edge
        const translateX = Math.min(
          0,
          Math.max(-LEFT_PANE_WIDTH_PX, -LEFT_PANE_WIDTH_PX + deltaX)
        );
        onLeftDrag?.(translateX);
        lastLeftTranslateRef.current = translateX;
      } else if (
        draggingRef.current.touchStartX >=
        viewportWidth - EDGE_SWIPE_THRESHOLD_PX
      ) {
        // Opening right pane from right edge
        const translateX = Math.max(
          0,
          Math.min(RIGHT_PANE_WIDTH_PX, RIGHT_PANE_WIDTH_PX + deltaX)
        );
        onRightDrag?.(translateX);
        lastRightTranslateRef.current = translateX;
      }
    }

    function onTouchEnd(e: TouchEvent) {
      if (!draggingRef.current) return;

      const trackedId = draggingRef.current.activeTouchId;
      let endedTracked = false;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === trackedId) {
          endedTracked = true;
          break;
        }
      }
      if (!endedTracked) return;

      const currentX = currentXRef.current ?? draggingRef.current.touchStartX;
      const prevX = prevXRef.current ?? draggingRef.current.touchStartX;
      const startX = draggingRef.current.touchStartX;
      const leftOpen = getIsLeftOpen();
      const rightOpen = getIsRightOpen();

      // Reset refs
      draggingRef.current = null;
      currentXRef.current = null;
      prevXRef.current = null;

      // Determine direction: if currentX > prevX, user swiped right; if currentX < prevX, user swiped left
      const swipedRight = currentX > prevX;
      const swipedLeft = currentX < prevX;

      // Decide final state based on current pane state and final direction
      if (leftOpen) {
        if (swipedLeft) {
          // Left pane is open and user swiped left - close it
          closeLeft();
        } else {
          // Left pane is open and user swiped right - keep it open
          openLeft();
        }
        onLeftDrag?.(null);
      } else if (rightOpen) {
        if (swipedRight) {
          // Right pane is open and user swiped right - close it
          closeRight();
        } else {
          // Right pane is open and user swiped left - keep it open
          openRight();
        }
        onRightDrag?.(null);
      } else {
        // No panes open - determine which pane to open based on start position and direction
        const viewportWidth = window.innerWidth;
        if (startX <= EDGE_SWIPE_THRESHOLD_PX && swipedRight) {
          // Started from left edge and swiped right - open left pane
          openLeft();
          onLeftDrag?.(null);
        } else if (
          startX >= viewportWidth - EDGE_SWIPE_THRESHOLD_PX &&
          swipedLeft
        ) {
          // Started from right edge and swiped left - open right pane
          openRight();
          onRightDrag?.(null);
        } else {
          // Invalid gesture - reset everything
          onLeftDrag?.(null);
          onRightDrag?.(null);
        }
      }
    }

    function onTouchCancel() {
      draggingRef.current = null;
      currentXRef.current = null;
      prevXRef.current = null;
      onLeftDrag?.(null);
      onRightDrag?.(null);
    }

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    // touchmove must be non-passive to allow preventDefault() for scroll lock during gesture
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchCancel, { passive: true });

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchCancel);
    };
  }, [
    isSmallScreen,
    getIsLeftOpen,
    getIsRightOpen,
    openLeft,
    closeLeft,
    openRight,
    closeRight,
    onLeftDrag,
    onRightDrag,
  ]);
}
