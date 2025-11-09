import {
	LEFT_PANE_WIDTH_PX,
	LEFT_TRANSITION_CLOSE_MS,
	LEFT_TRANSITION_OPEN_MS,
	applyClosePaneStyles,
} from "../swipePaneShared";
import { useSwipeLeftPane } from "../useSwipeLeftPane";
import { cn } from "../utils";
import { Overlay } from "./Overlay";

type SidebarProps = {
	className?: string;
	transitionMs?: number;
	paneWidthPx?: number;
	isAbsolute?: boolean;
	edgeActivationWidthPx?: number;
	dragActivationDeltaPx?: number;
};

export function SidebarLeft({
	className,
	transitionMs,
	paneWidthPx,
	isAbsolute,
	edgeActivationWidthPx,
	dragActivationDeltaPx,
}: SidebarProps) {
	const { isLeftOpen, closeLeft, leftPaneRef, setLockedPane } = useSwipeLeftPane({
		transitionMs,
		paneWidthPx,
		edgeActivationWidthPx,
		dragActivationDeltaPx,
	});

	const config = {
		widthPx: paneWidthPx ?? LEFT_PANE_WIDTH_PX,
		transitionMsOpen: transitionMs ?? LEFT_TRANSITION_OPEN_MS,
		transitionMsClose: transitionMs ?? LEFT_TRANSITION_CLOSE_MS,
	};

	function collapseAndUnlockPane() {
		applyClosePaneStyles({
			ref: leftPaneRef,
			config,
			side: "left",
			afterApply: () => {
				closeLeft();
				setLockedPane(null);
			},
		});
	}

	return (
		<>
			{/*  overlay */}

			<Overlay
				isCollapsed={!isLeftOpen}
				setCollapsed={collapseAndUnlockPane}
				closeSidebarOnClick={false}
			/>

			<div
				ref={leftPaneRef}
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
