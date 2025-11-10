import type { ReactNode } from "react";
import { ToggleLeft } from "../ToggleLeft";
import {
	DEFAULT_SIDEBAR_BACKGROUND_COLOR,
	type SwipeBarProps,
	type TLeftSwipeBar,
	leftSwipeBarAbsoluteStyle,
	swipeBarStyle,
	useMergedOptions,
} from "../swipePaneShared";
import { useSwipeLeftPane } from "../useSwipeLeftPane";
import { useSwipePaneContext } from "../useSwipePaneContext";
import { Overlay } from "./Overlay";

export function SidebarLeft({
	className,
	children,
	...currentOptions
}: SwipeBarProps &
	TLeftSwipeBar & {
		className?: string;
		children?: ReactNode;
	}) {
	const { globalOptions, isLeftOpen, closePane, leftPaneRef } = useSwipePaneContext();

	const options = useMergedOptions<"left">(currentOptions, globalOptions);
	useSwipeLeftPane(options);

	return (
		<>
			{options.showOverlay && (
				<Overlay
					isCollapsed={!isLeftOpen}
					setCollapsed={() => closePane("left", options)}
					closeSidebarOnClick={options.closeSidebarOnOverlayClick}
					transitionMs={options.transitionMs}
				/>
			)}

			<ToggleLeft
				options={options}
				showToggle={options.showToggle}
				ToggleComponent={options.ToggleComponent}
			/>

			<div
				ref={leftPaneRef}
				style={{
					...swipeBarStyle,
					...(options.isAbsolute ? leftSwipeBarAbsoluteStyle : {}),
					...(!className ? { backgroundColor: DEFAULT_SIDEBAR_BACKGROUND_COLOR } : {}),
				}}
				className={className}
			>
				{children}
			</div>
		</>
	);
}
