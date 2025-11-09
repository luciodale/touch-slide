import { cn } from "../utils";

type OverlayProps = {
	isCollapsed: boolean;
	setCollapsed: () => void;
	closeSidebarOnClick?: boolean;
};

export function Overlay({ isCollapsed, setCollapsed, closeSidebarOnClick = true }: OverlayProps) {
	return (
		<div
			className={cn(
				"fixed z-20 top-0 left-0 w-full h-full bg-blue-100 transition-opacity duration-200 pointer-events-none",
				!isCollapsed ? "opacity-50 pointer-events-auto" : "opacity-0",
			)}
			onMouseDown={(e) => {
				if (closeSidebarOnClick) {
					e.stopPropagation();
					setCollapsed();
				}
			}}
		/>
	);
}
