import { useEffect, useMemo, useRef } from "react";
import { useSwipePaneContext } from "./SwipePaneProvider";
import {
	type DragRefs,
	type DragState,
	type PaneConfig,
	RIGHT_DRAG_ACTIVATION_DELTA_PX,
	RIGHT_EDGE_ACTIVATION_REGION_PX,
	RIGHT_PANE_WIDTH_PX,
	RIGHT_TRANSITION_CLOSE_MS,
	RIGHT_TRANSITION_OPEN_MS,
	type RightPaneCallbacks,
	applyClosePaneStyles,
	applyDragPaneStyles,
	applyOpenPaneStyles,
	findChangedTouch,
	handleDragCancel,
	handleDragStart,
	hasTrackedTouchEnded,
	isEditableTarget,
} from "./swipePaneShared";
import { useMediaQuery } from "./useMediaQuery";

type HandleRightDragMoveProps = {
	refs: DragRefs;
	callbacks: RightPaneCallbacks;
	currentX: number;
	preventDefault: () => void;
	lockPane: () => void;
	config: PaneConfig;
	edgeActivationWidthPx: number;
	dragActivationDeltaPx: number;
};

const handleRightDragMove = ({
	refs,
	callbacks,
	currentX,
	preventDefault,
	lockPane,
	config,
	edgeActivationWidthPx,
	dragActivationDeltaPx,
}: HandleRightDragMoveProps) => {
	if (!refs.draggingRef.current) return;

	const viewportWidth = window.innerWidth;

	const swipingDistanceFromInitialDrag = currentX - refs.draggingRef.current.startX;

	const isLegalSwipeDistanceWhenRightIsClosed =
		refs.draggingRef.current.startX >= viewportWidth - edgeActivationWidthPx;

	const isPaneActiveted = refs.draggingRef.current.isActivated;

	if (!isPaneActiveted && Math.abs(swipingDistanceFromInitialDrag) >= dragActivationDeltaPx) {
		refs.draggingRef.current.isActivated = true;
		lockPane();
	}

	// The legal distance for activating the pane has not been reached yet.
	if (!isPaneActiveted) return;

	refs.prevXRef.current = refs.currentXRef.current;
	refs.currentXRef.current = currentX;

	const rightOpen = callbacks.getIsOpen();

	let isValidGesture = false;

	if (rightOpen) {
		isValidGesture = true;
	} else if (isLegalSwipeDistanceWhenRightIsClosed) {
		isValidGesture = true;
	}

	// defensive case:
	// The user starts dragging when the right pane is open
	// (from anywhere on screen), but then during the drag,
	// the right pane gets programmatically closed by something else.
	// This is defensive code protecting against:
	// - Race conditions where the pane state changes during an active drag
	// - Programmatic pane closes while user is dragging
	// - External state mutations

	if (!isValidGesture) {
		refs.draggingRef.current = null;
		callbacks.onDrag?.(null);
		return;
	}

	// when the gesture is valid, we prevent the default browser behavior
	// to avoid scrolling the page while dragging the pane.
	preventDefault();

	const paneWidthPx = config.widthPx;

	// Closing the pane
	if (rightOpen) {
		const translateX = Math.max(
			0,
			Math.min(paneWidthPx, swipingDistanceFromInitialDrag - dragActivationDeltaPx),
		);

		callbacks.onDrag?.(translateX);

		// Opening the pane
	} else {
		const translateX = Math.max(
			0,
			Math.min(paneWidthPx, paneWidthPx + swipingDistanceFromInitialDrag + dragActivationDeltaPx),
		);
		callbacks.onDrag?.(translateX);
	}
};

type HandleRightDragEndProps = {
	refs: DragRefs;
	rightPaneRef: React.RefObject<HTMLDivElement | null>;
	callbacks: RightPaneCallbacks;
	unlockPane: () => void;
	config: PaneConfig;
	edgeActivationWidthPx: number;
};

const handleRightDragEnd = ({
	refs,
	rightPaneRef,
	callbacks,
	unlockPane,
	config,
	edgeActivationWidthPx,
}: HandleRightDragEndProps) => {
	if (!refs.draggingRef.current) return;

	const currentX = refs.currentXRef.current ?? refs.draggingRef.current.startX;
	const prevX = refs.prevXRef.current ?? refs.draggingRef.current.startX;
	const startX = refs.draggingRef.current.startX;
	const rightOpen = callbacks.getIsOpen();
	const viewportWidth = window.innerWidth;

	refs.draggingRef.current = null;
	refs.currentXRef.current = null;
	refs.prevXRef.current = null;

	const swipedRight = currentX > prevX;
	const swipedLeft = currentX < prevX;

	const moreThanEdgeSwipeThreshold = startX >= viewportWidth - edgeActivationWidthPx;

	let shouldUnlock = false;

	if (rightOpen) {
		if (swipedRight) {
			applyClosePaneStyles({
				ref: rightPaneRef,
				config,
				side: "right",
				afterApply: callbacks.closePane,
			});
			shouldUnlock = true; // Pane closed, unlock
		} else {
			applyOpenPaneStyles({
				ref: rightPaneRef,
				config,
				afterApply: callbacks.openPane,
			});
			// Pane stays open, keep locked
		}
		callbacks.onDrag?.(null);
	} else if (moreThanEdgeSwipeThreshold && swipedLeft) {
		applyOpenPaneStyles({
			ref: rightPaneRef,
			config,
			afterApply: callbacks.openPane,
		});
		// Pane opened, keep locked
		callbacks.onDrag?.(null);
	} else {
		shouldUnlock = true; // Gesture ended without opening
		applyClosePaneStyles({
			ref: rightPaneRef,
			config,
			side: "right",
			afterApply: callbacks.closePane,
		});
		callbacks.onDrag?.(null);
	}

	if (shouldUnlock) {
		unlockPane();
	}
};

type PaneOptions = {
	transitionMs?: number;
	paneWidthPx?: number;
	edgeActivationWidthPx?: number;
	dragActivationDeltaPx?: number;
};

export function useSwipeRightPane(options?: PaneOptions) {
	const isSmallScreen = useMediaQuery("small");
	const { lockedPane, setLockedPane, isRightOpen, openRight, closeRight, rightPaneRef } =
		useSwipePaneContext();

	const draggingRef = useRef<DragState | null>(null);
	const currentXRef = useRef<number | null>(null);
	const prevXRef = useRef<number | null>(null);

	const config: PaneConfig = useMemo(
		() => ({
			widthPx: options?.paneWidthPx ?? RIGHT_PANE_WIDTH_PX,
			transitionMsOpen: options?.transitionMs ?? RIGHT_TRANSITION_OPEN_MS,
			transitionMsClose: options?.transitionMs ?? RIGHT_TRANSITION_CLOSE_MS,
		}),
		[options?.paneWidthPx, options?.transitionMs],
	);
	const edgeActivationWidthPx = options?.edgeActivationWidthPx ?? RIGHT_EDGE_ACTIVATION_REGION_PX;
	const dragActivationDeltaPx = options?.dragActivationDeltaPx ?? RIGHT_DRAG_ACTIVATION_DELTA_PX;

	useEffect(() => {
		if (!isSmallScreen) return;
		if (lockedPane === "left") return;

		const callbacks: RightPaneCallbacks = {
			getIsOpen: () => isRightOpen,
			openPane: openRight,
			closePane: closeRight,
			onDrag: (px) => applyDragPaneStyles({ ref: rightPaneRef, config, translateX: px }),
		};

		const refs: DragRefs = {
			draggingRef,
			currentXRef,
			prevXRef,
		};

		const lockPane = () => setLockedPane("right");
		const unlockPane = () => setLockedPane(null);

		function onTouchStart(e: TouchEvent) {
			if (lockedPane === "left") return;
			if (isEditableTarget(e.target)) return;
			if (e.changedTouches.length === 0) return;

			const firstTouch = e.changedTouches[0];
			const viewportWidth = window.innerWidth;

			if (callbacks.getIsOpen() || firstTouch.clientX >= viewportWidth - edgeActivationWidthPx) {
				handleDragStart({
					refs,
					clientX: firstTouch.clientX,
					clientY: firstTouch.clientY,
					touchId: firstTouch.identifier,
					isMouse: false,
				});
			}
		}

		function onTouchMove(e: TouchEvent) {
			if (lockedPane === "left") return;
			if (!draggingRef.current || draggingRef.current.isMouse) return;

			const trackedId = draggingRef.current.activeTouchId;
			const changedTouch = findChangedTouch(e.changedTouches, trackedId);
			if (!changedTouch) return;

			handleRightDragMove({
				refs,
				callbacks,
				currentX: changedTouch.clientX,
				preventDefault: () => e.preventDefault(),
				lockPane,
				config,
				edgeActivationWidthPx,
				dragActivationDeltaPx,
			});
		}

		function onTouchEnd(e: TouchEvent) {
			if (lockedPane === "left") return;
			if (!draggingRef.current || draggingRef.current.isMouse) return;

			const trackedId = draggingRef.current.activeTouchId;
			if (!hasTrackedTouchEnded(e.changedTouches, trackedId)) return;

			handleRightDragEnd({
				refs,
				rightPaneRef,
				callbacks,
				unlockPane,
				config,
				edgeActivationWidthPx,
			});
		}

		function onTouchCancel() {
			if (lockedPane === "left") return;
			if (!draggingRef.current || draggingRef.current.isMouse) return;
			handleDragCancel({ refs, onDrag: callbacks.onDrag, onDeactivate: unlockPane });
		}

		function onMouseDown(e: MouseEvent) {
			if (lockedPane === "left") return;
			if (isEditableTarget(e.target)) return;
			if (e.button !== 0) return;

			const viewportWidth = window.innerWidth;

			if (callbacks.getIsOpen() || e.clientX >= viewportWidth - edgeActivationWidthPx) {
				handleDragStart({
					refs,
					clientX: e.clientX,
					clientY: e.clientY,
					touchId: null,
					isMouse: true,
				});
			}
		}

		function onMouseMove(e: MouseEvent) {
			if (lockedPane === "left") return;
			if (!draggingRef.current || !draggingRef.current.isMouse) return;

			handleRightDragMove({
				refs,
				callbacks,
				currentX: e.clientX,
				preventDefault: () => e.preventDefault(),
				lockPane,
				config,
				edgeActivationWidthPx,
				dragActivationDeltaPx,
			});
		}

		function onMouseUp() {
			if (lockedPane === "left") return;
			if (!draggingRef.current || !draggingRef.current.isMouse) return;

			handleRightDragEnd({
				refs,
				rightPaneRef,
				callbacks,
				unlockPane,
				config,
				edgeActivationWidthPx,
			});
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
	}, [
		isSmallScreen,
		isRightOpen,
		openRight,
		closeRight,
		lockedPane,
		setLockedPane,
		rightPaneRef,
		config,
		edgeActivationWidthPx,
		dragActivationDeltaPx,
	]);

	return {
		isRightOpen,
		openRight,
		closeRight,
		setLockedPane,
		rightPaneRef,
	};
}
