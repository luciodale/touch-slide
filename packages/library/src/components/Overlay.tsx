import { overlayIsOpenStyle, overlayStyle } from "../swipePaneShared";

type OverlayProps = {
	isCollapsed: boolean;
	setCollapsed: () => void;
	closeSidebarOnClick?: boolean;
	transitionMs?: number;
};

export function Overlay({
	isCollapsed,
	setCollapsed,
	closeSidebarOnClick = true,
	transitionMs,
}: OverlayProps) {
	return (
		<div
			style={{
				transitionDuration: `${transitionMs}ms`,
				...overlayStyle,
				...(!isCollapsed ? overlayIsOpenStyle : {}),
			}}
			onMouseDown={(e) => {
				if (closeSidebarOnClick) {
					e.stopPropagation();
					setCollapsed();
				}
			}}
		/>
	);
}
