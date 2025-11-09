import { cn } from "../utils";
import { Overlay } from "./Overlay";

import {
	RIGHT_PANE_WIDTH_PX,
	RIGHT_TRANSITION_CLOSE_MS,
	RIGHT_TRANSITION_OPEN_MS,
	applyClosePaneStyles,
} from "../swipePaneShared";
import { useSwipeRightPane } from "../useSwipeRightPane";
type SidebarProps = {
	className?: string;
	transitionMs?: number;
	paneWidthPx?: number;
	isAbsolute?: boolean;
	edgeActivationWidthPx?: number;
	dragActivationDeltaPx?: number;
};

export function SidebarRight({
	className,
	transitionMs,
	paneWidthPx,
	isAbsolute,
	edgeActivationWidthPx,
	dragActivationDeltaPx,
}: SidebarProps) {
	const { isRightOpen, closeRight, setLockedPane, rightPaneRef } = useSwipeRightPane({
		transitionMs,
		paneWidthPx,
		edgeActivationWidthPx,
		dragActivationDeltaPx,
	});

	const config = {
		widthPx: paneWidthPx ?? RIGHT_PANE_WIDTH_PX,
		transitionMsOpen: transitionMs ?? RIGHT_TRANSITION_OPEN_MS,
		transitionMsClose: transitionMs ?? RIGHT_TRANSITION_CLOSE_MS,
	};

	function collapseAndUnlockPane() {
		applyClosePaneStyles({
			ref: rightPaneRef,
			config,
			side: "right",
			afterApply: () => {
				closeRight();
				setLockedPane(null);
			},
		});
	}

	return (
		<>
			{/*  overlay */}
			<Overlay isCollapsed={!isRightOpen} setCollapsed={collapseAndUnlockPane} />

			<div
				ref={rightPaneRef}
				style={{
					willChange: "transform",
				}}
				className={cn(
					"z-30 top-0 bottom-0 active w-0 shrink-0 transform overflow-x-hidden bg-yellow-300",
					isAbsolute && "fixed left-0 top-0 bottom-0",
					className,
				)}
			>
				<div className="flex items-center w-full justify-between gap-4 p-2 h-14">
					<button type="button" onClick={collapseAndUnlockPane}>
						toggle
					</button>
				</div>
			</div>
		</>
	);
}
