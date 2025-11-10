import type { ReactNode } from "react";
import { ToggleRight } from "../ToggleRight";
import {
	DEFAULT_SIDEBAR_BACKGROUND_COLOR,
	type SwipeBarProps,
	type TRightSwipeBar,
	rightSwipeBarAbsoluteStyle,
	swipeBarStyle,
	useMergedOptions,
} from "../swipePaneShared";
import { useSwipePaneContext } from "../useSwipePaneContext";
import { useSwipeRightPane } from "../useSwipeRightPane";
import { Overlay } from "./Overlay";

export function SidebarRight({
	className,
	children,
	...currentOptions
}: SwipeBarProps &
	TRightSwipeBar & {
		className?: string;
		children?: ReactNode;
	}) {
	const { globalOptions, isRightOpen, closePane, rightPaneRef } = useSwipePaneContext();

	const options = useMergedOptions<"right">(currentOptions, globalOptions);
	useSwipeRightPane(options);

	return (
		<>
			{options.showOverlay && (
				<Overlay
					isCollapsed={!isRightOpen}
					setCollapsed={() => closePane("right", options)}
					closeSidebarOnClick={options.closeSidebarOnOverlayClick}
					transitionMs={options.transitionMs}
				/>
			)}

			<ToggleRight
				options={options}
				showToggle={options.showToggle}
				ToggleComponent={options.ToggleComponent}
			/>

			<div
				ref={rightPaneRef}
				style={{
					...swipeBarStyle,
					...(options.isAbsolute ? rightSwipeBarAbsoluteStyle : {}),
					...(!className ? { backgroundColor: DEFAULT_SIDEBAR_BACKGROUND_COLOR } : {}),
				}}
				className={className}
			>
				{children}
			</div>
		</>
	);
}
