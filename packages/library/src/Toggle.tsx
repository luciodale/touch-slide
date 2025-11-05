import { cn } from "./utils";

type ToggleProps = {
	isCollapsed: boolean;
	setIsCollapsed: (isCollapsed: boolean) => void;
	side: "left" | "right";
};

export function Toggle({ isCollapsed, setIsCollapsed, side }: ToggleProps) {
	const style = {
		transition: "transform 0.3s ease, opacity 0.2s ease",
		rotationTopIndicator: side === "left" ? "rotate(-15deg)" : "rotate(15deg)",
		rotationBottomIndicator: side === "left" ? "rotate(15deg)" : "rotate(-15deg)",
	};

	return (
		// 1px wide container
		<div
			className={cn(
				"z-20 fixed top-1/2 -translate-y-1/2 flex w-px items-center justify-center",
				side === "left" ? "left-0" : "right-0",
			)}
		>
			<button
				type="button"
				onClick={() => {
					console.log("clicked");
					setIsCollapsed(!isCollapsed);
				}}
				className={cn(
					"fixed top-1/2 -translate-y-1/2 cursor-pointer",
					side === "left" ? "ml-12" : "mr-12",
				)}
			>
				<div
					className="relative flex h-[72px] w-8 items-center justify-center hover:opacity-100 opacity-50"
					style={{ transition: style.transition }}
				>
					<div className="sm:hidden absolute top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-gray-200" />

					<div className="flex h-6 w-6 flex-col items-center">
						{/* Top bar */}
						<div
							className="h-3 w-1 rounded-full bg-white"
							style={{
								transition: style.transition,
								transform: `translateY(0.15rem) ${style.rotationTopIndicator} translateZ(0px)`,
							}}
						/>
						{/* Bottom bar */}
						<div
							className="h-3 w-1 rounded-full bg-white"
							style={{
								transition: style.transition,
								transform: `translateY(-0.15rem) ${style.rotationBottomIndicator} translateZ(0px)`,
							}}
						/>
					</div>
				</div>
			</button>
		</div>
	);
}
