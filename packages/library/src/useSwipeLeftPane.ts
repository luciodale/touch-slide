import { useEffect, useMemo, useRef } from "react";
import { useSwipePaneContext } from "./SwipePaneProvider";
import {
	type DragRefs,
	type DragState,
	LEFT_DRAG_ACTIVATION_DELTA_PX,
	LEFT_EDGE_ACTIVATION_REGION_PX,
	LEFT_PANE_WIDTH_PX,
	LEFT_TRANSITION_CLOSE_MS,
	LEFT_TRANSITION_OPEN_MS,
	type LeftPaneCallbacks,
	type PaneConfig,
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

type HandleLeftDragMoveProps = {
	refs: DragRefs;
	callbacks: LeftPaneCallbacks;
	currentX: number;
	preventDefault: () => void;
	lockPane: () => void;
	config: PaneConfig;
	edgeActivationWidthPx: number;
	dragActivationDeltaPx: number;
};

const handleLeftDragMove = ({
	refs,
	callbacks,
	currentX,
	preventDefault,
	lockPane,
	config,
	edgeActivationWidthPx,
	dragActivationDeltaPx,
}: HandleLeftDragMoveProps) => {
	if (!refs.draggingRef.current) return;

	const swipingDistanceFromInitialDrag = currentX - refs.draggingRef.current.startX;

	if (
		!refs.draggingRef.current.isActivated &&
		Math.abs(swipingDistanceFromInitialDrag) >= dragActivationDeltaPx
	) {
		refs.draggingRef.current.isActivated = true;
		lockPane();
	}

	if (!refs.draggingRef.current.isActivated) return;

	refs.prevXRef.current = refs.currentXRef.current;
	refs.currentXRef.current = currentX;

	const leftOpen = callbacks.getIsOpen();

	let isValidGesture = false;

	if (leftOpen) {
		isValidGesture = true;
	} else if (refs.draggingRef.current.startX <= edgeActivationWidthPx) {
		isValidGesture = true;
	}

	if (!isValidGesture) {
		refs.draggingRef.current = null;
		callbacks.onDrag?.(null);
		return;
	}

	preventDefault();

	const paneWidthPx = config.widthPx;

	if (leftOpen) {
		const translateX = Math.min(
			0,
			Math.max(-paneWidthPx, swipingDistanceFromInitialDrag + dragActivationDeltaPx),
		);
		callbacks.onDrag?.(translateX);
	} else if (refs.draggingRef.current.startX <= edgeActivationWidthPx) {
		const translateX = Math.min(
			0,
			Math.max(-paneWidthPx, -paneWidthPx + swipingDistanceFromInitialDrag - dragActivationDeltaPx),
		);
		callbacks.onDrag?.(translateX);
	}
};

type HandleLeftDragEndProps = {
	refs: DragRefs;
	leftPaneRef: React.RefObject<HTMLDivElement | null>;
	callbacks: LeftPaneCallbacks;
	unlockPane: () => void;
	config: PaneConfig;
	edgeActivationWidthPx: number;
};

const handleLeftDragEnd = ({
	refs,
	leftPaneRef,
	callbacks,
	unlockPane,
	config,
	edgeActivationWidthPx,
}: HandleLeftDragEndProps) => {
	if (!refs.draggingRef.current) return;

	const currentX = refs.currentXRef.current ?? refs.draggingRef.current.startX;
	const prevX = refs.prevXRef.current ?? refs.draggingRef.current.startX;
	const startX = refs.draggingRef.current.startX;
	const leftOpen = callbacks.getIsOpen();

	refs.draggingRef.current = null;
	refs.currentXRef.current = null;
	refs.prevXRef.current = null;

	const swipedRight = currentX >= prevX;
	const swipedLeft = currentX < prevX;

	const lessThanEdgeSwipeThreshold = startX <= edgeActivationWidthPx;

	let shouldUnlock = false;

	if (leftOpen) {
		if (swipedLeft) {
			applyClosePaneStyles({
				ref: leftPaneRef,
				config,
				side: "left",
				afterApply: callbacks.closePane,
			});
			shouldUnlock = true; // Pane closed, unlock
		} else {
			applyOpenPaneStyles({ ref: leftPaneRef, config, afterApply: callbacks.openPane });
			// Pane stays open, keep locked
		}
		callbacks.onDrag?.(null);
	} else if (lessThanEdgeSwipeThreshold && swipedRight) {
		applyOpenPaneStyles({ ref: leftPaneRef, config, afterApply: callbacks.openPane });
		// Pane opened, keep locked
		callbacks.onDrag?.(null);
	} else {
		shouldUnlock = true; // Gesture ended without opening
		applyClosePaneStyles({
			ref: leftPaneRef,
			config,
			side: "left",
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

export function useSwipeLeftPane(options?: PaneOptions) {
	const isSmallScreen = useMediaQuery("small");
	const { lockedPane, setLockedPane, isLeftOpen, openLeft, closeLeft, leftPaneRef } =
		useSwipePaneContext();

	const draggingRef = useRef<DragState | null>(null);
	const currentXRef = useRef<number | null>(null);
	const prevXRef = useRef<number | null>(null);

	const config: PaneConfig = useMemo(
		() => ({
			widthPx: options?.paneWidthPx ?? LEFT_PANE_WIDTH_PX,
			transitionMsOpen: options?.transitionMs ?? LEFT_TRANSITION_OPEN_MS,
			transitionMsClose: options?.transitionMs ?? LEFT_TRANSITION_CLOSE_MS,
		}),
		[options?.paneWidthPx, options?.transitionMs],
	);
	const edgeActivationWidthPx = options?.edgeActivationWidthPx ?? LEFT_EDGE_ACTIVATION_REGION_PX;
	const dragActivationDeltaPx = options?.dragActivationDeltaPx ?? LEFT_DRAG_ACTIVATION_DELTA_PX;

	useEffect(() => {
		if (!isSmallScreen) return;
		if (lockedPane === "right") return;

		const callbacks: LeftPaneCallbacks = {
			getIsOpen: () => isLeftOpen,
			openPane: openLeft,
			closePane: closeLeft,
			onDrag: (px) => applyDragPaneStyles({ ref: leftPaneRef, config, translateX: px }),
		};

		const refs: DragRefs = {
			draggingRef,
			currentXRef,
			prevXRef,
		};

		const lockPane = () => setLockedPane("left");
		const unlockPane = () => setLockedPane(null);

		function onTouchStart(e: TouchEvent) {
			if (lockedPane === "right") return;
			if (isEditableTarget(e.target)) return;
			if (e.changedTouches.length === 0) return;

			const firstTouch = e.changedTouches[0];

			if (callbacks.getIsOpen() || firstTouch.clientX <= edgeActivationWidthPx) {
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
			if (lockedPane === "right") return;
			if (!draggingRef.current || draggingRef.current.isMouse) return;

			const trackedId = draggingRef.current.activeTouchId;
			const changedTouch = findChangedTouch(e.changedTouches, trackedId);
			if (!changedTouch) return;

			handleLeftDragMove({
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
			if (lockedPane === "right") return;
			if (!draggingRef.current || draggingRef.current.isMouse) return;

			const trackedId = draggingRef.current.activeTouchId;
			if (!hasTrackedTouchEnded(e.changedTouches, trackedId)) return;

			handleLeftDragEnd({
				refs,
				leftPaneRef,
				callbacks,
				unlockPane,
				config,
				edgeActivationWidthPx,
			});
		}

		function onTouchCancel() {
			if (lockedPane === "right") return;
			if (!draggingRef.current || draggingRef.current.isMouse) return;
			handleDragCancel({ refs, onDrag: callbacks.onDrag, onDeactivate: unlockPane });
		}

		function onMouseDown(e: MouseEvent) {
			if (lockedPane === "right") return;
			if (isEditableTarget(e.target)) return;
			if (e.button !== 0) return;

			if (callbacks.getIsOpen() || e.clientX <= edgeActivationWidthPx) {
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
			if (lockedPane === "right") return;
			if (!draggingRef.current || !draggingRef.current.isMouse) return;

			handleLeftDragMove({
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
			if (lockedPane === "right") return;
			if (!draggingRef.current || !draggingRef.current.isMouse) return;

			handleLeftDragEnd({
				refs,
				leftPaneRef,
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
		isLeftOpen,
		openLeft,
		closeLeft,
		lockedPane,
		setLockedPane,
		leftPaneRef,
		config,
		edgeActivationWidthPx,
		dragActivationDeltaPx,
	]);

	return {
		isLeftOpen,
		openLeft,
		closeLeft,
		leftPaneRef,
		setLockedPane,
	};
}
