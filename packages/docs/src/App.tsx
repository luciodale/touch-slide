import { SidebarLeft, SidebarRight, useSwipePaneContext } from "@luciodale/swipe-pane";
import { useMemo } from "react";
import { cn } from "./utils";

export function App() {
	const { openPane, isLeftOpen, isRightOpen, globalOptions } = useSwipePaneContext();

	// Glass circular toggle for the left pane
	const LeftToggle = useMemo(
		() => (
			<button
				type="button"
				onClick={() => {
					openPane("left");
				}}
				aria-label="Open left panel"
				style={{
					...(isLeftOpen ? { transform: `translateX(${globalOptions.paneWidthPx}px)` } : {}),
				}}
				className={cn(`fixed left-6 top-1/2 z-15 -translate-y-1/2 rounded-full
bg-white/10 backdrop-blur-xl border border-white/20 text-white transition-transform duration-100
				shadow-[0_10px_30px_rgba(0,0,0,0.35)] hover:bg-white/15 active:scale-95
				w-12 h-12 flex items-center justify-center
				ring-1 ring-white/10`)}
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					aria-hidden="true"
				>
					<path
						d="M9 6l6 6-6 6"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</button>
		),
		[openPane, isLeftOpen, globalOptions.paneWidthPx],
	);

	// Glass circular toggle for the right pane
	const RightToggle = useMemo(
		() => (
			<button
				type="button"
				onClick={() => {
					openPane("right");
				}}
				aria-label="Open right panel"
				className="fixed right-6 top-1/2 z-50 -translate-y-1/2 rounded-full
				bg-white/10 backdrop-blur-xl border border-white/20 text-white
				shadow-[0_10px_30px_rgba(0,0,0,0.35)] hover:bg-white/15 active:scale-95
				w-12 h-12 flex items-center justify-center
				ring-1 ring-white/10"
			>
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="18"
					height="18"
					viewBox="0 0 24 24"
					fill="none"
					aria-hidden="true"
				>
					<path
						d="M15 6l-6 6 6 6"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					/>
				</svg>
			</button>
		),
		[openPane],
	);

	return (
		<>
			<div className="flex" style={{ height: "100dvh" }}>
				<div className="relative flex h-full w-full overflow-hidden">
					{/* Ambient gradient background */}
					<div className="pointer-events-none absolute inset-0 -z-10">
						<div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_20%_10%,rgba(88,101,242,0.25),transparent_60%),radial-gradient(900px_500px_at_80%_20%,rgba(16,185,129,0.2),transparent_60%),linear-gradient(180deg,rgba(2,6,23,1),rgba(2,6,23,0.6))]" />
						{/* soft blobs */}
						<div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-emerald-400/20 blur-3xl" />
						<div className="absolute top-1/3 -right-24 h-[28rem] w-[28rem] rounded-full bg-indigo-500/20 blur-3xl" />
						<div className="absolute bottom-[-6rem] left-1/2 -translate-x-1/2 h-[30rem] w-[30rem] rounded-full bg-fuchsia-400/10 blur-3xl" />
					</div>

					{/* Left sidebar with glass content */}
					<SidebarLeft
						paneWidthPx={320}
						ToggleComponent={LeftToggle}
						className={cn(
							"bg-white/10 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.35)] text-white",
							isLeftOpen && "border-r border-white/20",
						)}
					>
						<div
							className={cn(
								"flex h-full flex-col p-4 gap-4 transition-opacity duration-50",
								isLeftOpen ? "opacity-100" : "opacity-0",
							)}
						>
							<div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
								<div className="relative">
									<div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-indigo-400" />
									<div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-emerald-400/30 to-indigo-400/30 blur-md" />
								</div>
								<div className="relative">
									<div className="text-sm/5 text-white/80">Welcome back</div>
									<div className="text-base font-semibold">Liquid Glass UI</div>
								</div>
							</div>

							<nav className="mt-2 flex flex-col gap-2">
								<button
									type="button"
									className="w-full rounded-lg px-3 py-2 text-left text-white/90 hover:bg-white/10 border border-white/10"
								>
									Dashboard
								</button>
								<button
									type="button"
									className="w-full rounded-lg px-3 py-2 text-left text-white/90 hover:bg-white/10 border border-white/10"
								>
									Projects
								</button>
								<button
									type="button"
									className="w-full rounded-lg px-3 py-2 text-left text-white/90 hover:bg-white/10 border border-white/10"
								>
									Analytics
								</button>
								<button
									type="button"
									className="w-full rounded-lg px-3 py-2 text-left text-white/90 hover:bg-white/10 border border-white/10"
								>
									Settings
								</button>
							</nav>

							<div className="mt-auto rounded-xl border border-white/20 bg-white/5 p-4">
								<div className="text-sm text-white/70">Storage</div>
								<div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
									<div className="h-full w-2/3 rounded-full bg-gradient-to-r from-emerald-400 to-indigo-400" />
								</div>
								<div className="mt-2 text-xs text-white/60">66% used • 34 GB free</div>
							</div>
						</div>
					</SidebarLeft>

					<div className="relative flex h-full max-w-full flex-1 flex-col overflow-hidden">
						<div className="h-full relative flex w-full grow overflow-hidden">
							<div className="flex flex-col transition-width relative h-full w-full flex-1 overflow-auto">
								{/* main content */}
								<main className="flex h-full flex-col overflow-y-auto overscroll-contain">
									{/* sticky glass header */}
									<div
										className="sticky top-0 z-10 flex items-center justify-between gap-2 p-4
									bg-white/5 backdrop-blur-xl border-b border-white/10"
									>
										<div className="flex items-center gap-2">
											<div className="h-6 w-6 rounded-full bg-gradient-to-br from-emerald-400 to-indigo-400" />
											<div className="text-white/90 font-medium">Touch Slide</div>
										</div>
										<div className="text-white/70 text-sm">Slick & elegant glass UI</div>
									</div>

									<div className="relative mx-auto grid w-full max-w-5xl flex-1 grid-cols-1 gap-6 p-6 md:grid-cols-2">
										{/* hero card */}
										<section className="col-span-1 md:col-span-2 rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-2xl text-white shadow-[0_20px_50px_rgba(0,0,0,0.35)]">
											<h1 className="text-2xl md:text-3xl font-semibold tracking-tight">
												Liquid Glass Experience
											</h1>
											<p className="mt-2 text-white/80">
												Responsive, swipeable side panes with a modern glassmorphism aesthetic.
											</p>
											<div className="mt-4 flex flex-wrap gap-3">
												<span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm">
													Swipe to open
												</span>
												<span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm">
													Backdrops & blur
												</span>
												<span className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-sm">
													Elegant by default
												</span>
											</div>
										</section>

										{/* content cards */}
										<div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-2xl text-white">
											<div className="text-white/80 text-sm">Overview</div>
											<div className="mt-3 grid grid-cols-3 gap-3 text-center">
												<div className="rounded-xl border border-white/20 bg-white/5 p-3">
													<div className="text-2xl font-semibold">24</div>
													<div className="text-xs text-white/70">Tasks</div>
												</div>
												<div className="rounded-xl border border-white/20 bg-white/5 p-3">
													<div className="text-2xl font-semibold">12</div>
													<div className="text-xs text-white/70">Active</div>
												</div>
												<div className="rounded-xl border border-white/20 bg-white/5 p-3">
													<div className="text-2xl font-semibold">4.9</div>
													<div className="text-xs text-white/70">Rating</div>
												</div>
											</div>
										</div>

										<div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-2xl text-white">
											<div className="text-white/80 text-sm">Activity</div>
											<ul className="mt-3 space-y-2">
												<li className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90">
													New project created
												</li>
												<li className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90">
													Sidebar behavior tuned
												</li>
												<li className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/90">
													Glass theme applied
												</li>
											</ul>
										</div>

										<div className="rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-2xl text-white md:col-span-2">
											<div className="flex flex-wrap items-center justify-between gap-3">
												<div>
													<div className="text-white/80 text-sm">Try the right pane</div>
													<div className="text-white font-medium">Quick Settings</div>
												</div>
												<button
													type="button"
													onClick={() => openPane("right")}
													className="rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15"
												>
													Open Right Pane
												</button>
											</div>
										</div>
									</div>
								</main>
							</div>
						</div>
					</div>

					{/* Right sidebar with glass content */}
					<SidebarRight
						ToggleComponent={RightToggle}
						className="w-80 max-w-[85vw] h-full p-4
						bg-white/10 backdrop-blur-2xl border border-white/20
						shadow-[0_20px_50px_rgba(0,0,0,0.35)] text-white"
					>
						<div className="flex h-full flex-col gap-4">
							<div className="rounded-xl border border-white/20 bg-white/5 p-4">
								<div className="text-sm text-white/70">Quick Settings</div>
								<div className="mt-3 space-y-3">
									<button
										type="button"
										className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-left text-sm hover:bg-white/15"
									>
										Dark Mode
									</button>
									<button
										type="button"
										className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-left text-sm hover:bg-white/15"
									>
										Reduce Motion
									</button>
									<button
										type="button"
										className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-left text-sm hover:bg-white/15"
									>
										High Contrast
									</button>
								</div>
							</div>
							<div className="rounded-xl border border-white/20 bg-white/5 p-4">
								<div className="text-sm text-white/70">Accent</div>
								<div className="mt-3 flex gap-2">
									<div className="h-7 w-7 rounded-full bg-emerald-400" />
									<div className="h-7 w-7 rounded-full bg-indigo-400" />
									<div className="h-7 w-7 rounded-full bg-fuchsia-400" />
									<div className="h-7 w-7 rounded-full bg-amber-400" />
								</div>
							</div>
							<div className="mt-auto rounded-xl border border-white/20 bg-white/5 p-4">
								<div className="text-sm text-white/70">About</div>
								<p className="mt-2 text-sm text-white/80">
									This pane demonstrates swipe interactions with a liquid glass theme.
								</p>
							</div>
						</div>
					</SidebarRight>
				</div>
				{/* Floating toggles (kept outside panes to ensure visibility) */}
				{LeftToggle}
				{RightToggle}
			</div>
		</>
	);
}
