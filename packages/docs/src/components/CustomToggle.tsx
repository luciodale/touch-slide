export function CustomToggle() {
  return (
    <div
      className="rounded-full
      bg-white/10 backdrop-blur-xl border border-white/20 text-white
				shadow-[0_10px_30px_rgba(0,0,0,0.35)] hover:bg-white/15
				w-10 h-10 flex items-center justify-center
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
          d="M9 6l6 6-6 6"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
