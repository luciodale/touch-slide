import type { RefObject } from "react";

export type LeftPaneCallbacks = {
	getIsOpen: () => boolean;
	openPane: () => void;
	closePane: () => void;
	onDrag?: (translateX: number | null) => void;
};

export type RightPaneCallbacks = {
	getIsOpen: () => boolean;
	openPane: () => void;
	closePane: () => void;
	onDrag?: (translateX: number | null) => void;
};

export type DragState = {
	startX: number;
	startY: number;
	activeTouchId: number | null;
	isMouse: boolean;
	isActivated: boolean;
};

export type DragRefs = {
	draggingRef: RefObject<DragState | null>;
	currentXRef: RefObject<number | null>;
	prevXRef: RefObject<number | null>;
};

export const LEFT_TRANSITION_OPEN_MS = 200;
export const LEFT_TRANSITION_CLOSE_MS = 300;
export const RIGHT_TRANSITION_OPEN_MS = 200;
export const RIGHT_TRANSITION_CLOSE_MS = 200;
// Activation regions and deltas (defaults)
export const LEFT_EDGE_ACTIVATION_REGION_PX = 40;
export const LEFT_DRAG_ACTIVATION_DELTA_PX = 20;
export const RIGHT_EDGE_ACTIVATION_REGION_PX = 40;
export const RIGHT_DRAG_ACTIVATION_DELTA_PX = 20;
export const LEFT_PANE_WIDTH_PX = 320;
export const RIGHT_PANE_WIDTH_PX = 352;

export type PaneSide = "left" | "right";

export type PaneConfig = {
	widthPx: number;
	transitionMsOpen: number;
	transitionMsClose: number;
};

type ApplyOpenPaneStylesProps = {
	ref: RefObject<HTMLDivElement | null>;
	config: PaneConfig;
	afterApply: () => void;
};

export const applyOpenPaneStyles = ({ ref, config, afterApply }: ApplyOpenPaneStylesProps) => {
	requestAnimationFrame(() => {
		if (!ref.current) return;
		ref.current.style.transition = `transform ${config.transitionMsOpen}ms ease, width ${config.transitionMsOpen}ms ease`;

		requestAnimationFrame(() => {
			if (!ref.current) return;
			// clearing transform opens to its natural position for left and right
			ref.current.style.transform = "";
			ref.current.style.width = `${config.widthPx}px`;
			afterApply();
		});
	});

	setTimeout(() => {}, 0);
};

type ApplyClosePaneStylesProps = {
	ref: RefObject<HTMLDivElement | null>;
	side: PaneSide;
	config: PaneConfig;
	afterApply: () => void;
};

export const applyClosePaneStyles = ({
	ref,
	config,
	side,
	afterApply,
}: ApplyClosePaneStylesProps) => {
	requestAnimationFrame(() => {
		if (!ref.current) return;
		ref.current.style.transition = `transform ${config.transitionMsClose}ms ease, width ${config.transitionMsClose}ms ease`;

		requestAnimationFrame(() => {
			if (!ref.current) return;
			ref.current.style.transform = side === "left" ? "translateX(-100%)" : "translateX(100%)";
			ref.current.style.width = "0px";
			afterApply();
		});
	});
};

type ApplyDragPaneStylesProps = {
	ref: RefObject<HTMLDivElement | null>;
	config: PaneConfig;
	translateX: number | null;
};

export const applyDragPaneStyles = ({ ref, config, translateX }: ApplyDragPaneStylesProps) => {
	if (!ref.current) return;
	ref.current.style.transition = "none";

	requestAnimationFrame(() => {
		if (!ref.current) return;
		ref.current.style.width = `${config.widthPx}px`;
		if (translateX !== null) {
			ref.current.style.transform = `translateX(${translateX}px)`;
		}
	});
};

type HandleDragStartProps = {
	refs: DragRefs;
	clientX: number;
	clientY: number;
	touchId: number | null;
	isMouse: boolean;
};

export const handleDragStart = ({
	refs,
	clientX,
	clientY,
	touchId,
	isMouse,
}: HandleDragStartProps) => {
	refs.draggingRef.current = {
		startX: clientX,
		startY: clientY,
		activeTouchId: touchId,
		isMouse,
		isActivated: false,
	};
	refs.currentXRef.current = clientX;
	refs.prevXRef.current = clientX;
};

type HandleDragCancelProps = {
	refs: DragRefs;
	onDrag: ((translateX: number | null) => void) | undefined;
	onDeactivate: () => void;
};

export const handleDragCancel = ({ refs, onDrag, onDeactivate }: HandleDragCancelProps) => {
	refs.draggingRef.current = null;
	refs.currentXRef.current = null;
	refs.prevXRef.current = null;
	onDrag?.(null);
	onDeactivate();
};

export const isEditableTarget = (el: EventTarget | null): boolean => {
	if (!(el instanceof Element)) return false;
	const editable = el.closest("input, textarea, [contenteditable='true']");
	return !!editable;
};

export const findChangedTouch = (
	changedTouches: TouchList,
	trackedId: number | null,
): Touch | null => {
	for (let i = 0; i < changedTouches.length; i++) {
		const candidateTouch = changedTouches[i];
		if (trackedId == null || candidateTouch.identifier === trackedId) {
			return candidateTouch;
		}
	}
	return null;
};

export const hasTrackedTouchEnded = (
	changedTouches: TouchList,
	trackedId: number | null,
): boolean => {
	for (let i = 0; i < changedTouches.length; i++) {
		if (changedTouches[i].identifier === trackedId) {
			return true;
		}
	}
	return false;
};
