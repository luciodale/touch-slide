import { useEffect, useRef } from "react";
import { useMediaQuery } from "./useMediaQuery";
import { useSwipePaneContext } from "./SwipePaneProvider";
import {
  type RightPaneCallbacks,
  type DragRefs,
  type DragState,
  EDGE_SWIPE_THRESHOLD_PX,
  ACTIVATION_DELTA_X_PX,
  RIGHT_PANE_WIDTH_PX,
  handleDragStart,
  handleDragCancel,
  isEditableTarget,
} from "./swipePaneShared";

const handleRightDragMove = (
  refs: DragRefs,
  callbacks: RightPaneCallbacks,
  currentX: number,
  preventDefault: () => void,
  onActivate: () => void
) => {
  if (!refs.draggingRef.current) return;

  const deltaX = currentX - refs.draggingRef.current.startX;

  if (
    !refs.draggingRef.current.isActivated &&
    Math.abs(deltaX) >= ACTIVATION_DELTA_X_PX
  ) {
    refs.draggingRef.current.isActivated = true;
    onActivate();
  }

  if (!refs.draggingRef.current.isActivated) return;

  refs.prevXRef.current = refs.currentXRef.current;
  refs.currentXRef.current = currentX;

  const rightOpen = callbacks.getIsRightOpen();
  const viewportWidth = window.innerWidth;

  let isValidGesture = false;

  if (rightOpen) {
    isValidGesture = true;
  } else if (
    refs.draggingRef.current.startX >=
    viewportWidth - EDGE_SWIPE_THRESHOLD_PX
  ) {
    isValidGesture = true;
  }

  if (!isValidGesture) {
    refs.draggingRef.current = null;
    callbacks.onRightDrag?.(null);
    return;
  }

  preventDefault();

  if (rightOpen) {
    const translateX = Math.max(0, Math.min(RIGHT_PANE_WIDTH_PX, deltaX));
    callbacks.onRightDrag?.(translateX);
    refs.lastTranslateRef.current = translateX;
  } else if (
    refs.draggingRef.current.startX >=
    viewportWidth - EDGE_SWIPE_THRESHOLD_PX
  ) {
    const translateX = Math.max(
      0,
      Math.min(RIGHT_PANE_WIDTH_PX, RIGHT_PANE_WIDTH_PX + deltaX)
    );
    callbacks.onRightDrag?.(translateX);
    refs.lastTranslateRef.current = translateX;
  }
};

const handleRightDragEnd = (
  refs: DragRefs,
  callbacks: RightPaneCallbacks,
  onDeactivate: () => void
) => {
  if (!refs.draggingRef.current) return;

  const currentX = refs.currentXRef.current ?? refs.draggingRef.current.startX;
  const prevX = refs.prevXRef.current ?? refs.draggingRef.current.startX;
  const startX = refs.draggingRef.current.startX;
  const rightOpen = callbacks.getIsRightOpen();
  const viewportWidth = window.innerWidth;

  refs.draggingRef.current = null;
  refs.currentXRef.current = null;
  refs.prevXRef.current = null;

  const swipedRight = currentX > prevX;
  const swipedLeft = currentX < prevX;

  const moreThanEdgeSwipeThreshold =
    startX >= viewportWidth - EDGE_SWIPE_THRESHOLD_PX;
  const canOpenRight = moreThanEdgeSwipeThreshold && swipedLeft;

  if (rightOpen) {
    if (swipedRight) {
      callbacks.closeRight();
    } else {
      callbacks.openRight();
    }
    callbacks.onRightDrag?.(null);
  } else if (moreThanEdgeSwipeThreshold && swipedLeft) {
    callbacks.openRight();
    callbacks.onRightDrag?.(null);
  } else {
    callbacks.onRightDrag?.(null);
  }

  const unlockPane =
    (rightOpen && swipedRight) ||
    (!canOpenRight && startX <= EDGE_SWIPE_THRESHOLD_PX);
  if (unlockPane) {
    onDeactivate();
  }
};

export const useSwipeRightPane = (callbacks: RightPaneCallbacks) => {
  const isSmallScreen = useMediaQuery("small");
  const { lockedPane, setLockedPane } = useSwipePaneContext();

  console.log("useSwipeRightPane lockedPane", lockedPane);

  const draggingRef = useRef<DragState | null>(null);
  const lastTranslateRef = useRef<number | null>(null);
  const currentXRef = useRef<number | null>(null);
  const prevXRef = useRef<number | null>(null);

  useEffect(() => {
    if (!isSmallScreen) return;
    if (lockedPane === "left") return;

    const refs: DragRefs = {
      draggingRef,
      lastTranslateRef,
      currentXRef,
      prevXRef,
    };

    const onActivate = () => setLockedPane("right");
    const onDeactivate = () => setLockedPane(null);

    function onTouchStart(e: TouchEvent) {
      console.log("onTouchStart");
      if (lockedPane === "left") return;
      if (isEditableTarget(e.target)) return;
      if (e.changedTouches.length === 0) return;

      const firstTouch = e.changedTouches[0];
      const viewportWidth = window.innerWidth;

      console.log(
        "onTouchStart",
        "isRightOpen",
        callbacks.getIsRightOpen(),
        "clientX",
        firstTouch.clientX,
        "viewportWidth - EDGE_SWIPE_THRESHOLD_PX",
        viewportWidth - EDGE_SWIPE_THRESHOLD_PX,
        "firstTouch.clientX >= viewportWidth - EDGE_SWIPE_THRESHOLD_PX",
        firstTouch.clientX >= viewportWidth - EDGE_SWIPE_THRESHOLD_PX
      );
      if (
        callbacks.getIsRightOpen() ||
        firstTouch.clientX >= viewportWidth - EDGE_SWIPE_THRESHOLD_PX
      ) {
        handleDragStart(
          refs,
          firstTouch.clientX,
          firstTouch.clientY,
          firstTouch.identifier,
          false
        );
      }
    }

    function onTouchMove(e: TouchEvent) {
      console.log("onTouchMove");
      if (lockedPane === "left") return;
      if (!draggingRef.current || draggingRef.current.isMouse) return;

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

      console.log("onTouchMove", changedTouch.clientX);

      handleRightDragMove(
        refs,
        callbacks,
        changedTouch.clientX,
        () => e.preventDefault(),
        onActivate
      );
    }

    function onTouchEnd(e: TouchEvent) {
      console.log("onTouchEnd");
      if (lockedPane === "left") return;
      if (!draggingRef.current || draggingRef.current.isMouse) return;

      const trackedId = draggingRef.current.activeTouchId;
      let endedTracked = false;
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === trackedId) {
          endedTracked = true;
          break;
        }
      }
      if (!endedTracked) return;

      console.log("onTouchEnd", trackedId, endedTracked);
      handleRightDragEnd(refs, callbacks, onDeactivate);
    }

    function onTouchCancel() {
      if (lockedPane === "left") return;
      if (!draggingRef.current || draggingRef.current.isMouse) return;
      handleDragCancel(refs, callbacks.onRightDrag, onDeactivate);
    }

    function onMouseDown(e: MouseEvent) {
      console.log("onMouseDown");
      if (lockedPane === "left") return;
      if (isEditableTarget(e.target)) return;
      if (e.button !== 0) return;

      const viewportWidth = window.innerWidth;
      console.log(
        "onMouseDown",
        "clientX",
        e.clientX,
        "viewportWidth - EDGE_SWIPE_THRESHOLD_PX",
        viewportWidth - EDGE_SWIPE_THRESHOLD_PX,
        "e.clientX >= viewportWidth - EDGE_SWIPE_THRESHOLD_PX",
        e.clientX >= viewportWidth - EDGE_SWIPE_THRESHOLD_PX
      );

      if (
        callbacks.getIsRightOpen() ||
        e.clientX >= viewportWidth - EDGE_SWIPE_THRESHOLD_PX
      ) {
        handleDragStart(refs, e.clientX, e.clientY, null, true);
      }
    }

    function onMouseMove(e: MouseEvent) {
      console.log("onMouseMove");
      if (lockedPane === "left") return;
      if (!draggingRef.current || !draggingRef.current.isMouse) return;

      console.log("onMouseMove", e.clientX);

      handleRightDragMove(
        refs,
        callbacks,
        e.clientX,
        () => e.preventDefault(),
        onActivate
      );
    }

    function onMouseUp() {
      console.log("onMouseUp");
      if (lockedPane === "left") return;
      if (!draggingRef.current || !draggingRef.current.isMouse) return;

      console.log("onMouseUp");

      handleRightDragEnd(refs, callbacks, onDeactivate);
    }

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchCancel, { passive: true });

    window.addEventListener("mousedown", onMouseDown, { passive: true });
    window.addEventListener("mousemove", onMouseMove, { passive: false });
    window.addEventListener("mouseup", onMouseUp, { passive: true });

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchCancel);

      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [isSmallScreen, callbacks, lockedPane, setLockedPane]);
};
