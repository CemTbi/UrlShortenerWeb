export function SiteHeader() {
  return (
    <header className="relative z-10 px-6 sm:px-10 pt-8 pb-4">
      <div className="mx-auto max-w-5xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-aqua/15 ring-1 ring-sky-aqua/40">
            <svg
              width="24"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M10 14L14 10M8.5 17L6.5 19C4.6 20.9 1.6 20.9 -0.3 19V19C-2.2 17.1 -2.2 14.1 -0.3 12.2L4.5 7.4"
                stroke="#72DDF7"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M13.5 6.5L15.5 4.5C17.4 2.6 20.4 2.6 22.3 4.5V4.5C24.2 6.4 24.2 9.4 22.3 11.3L17.5 16.1"
                stroke="#72DDF7"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <span className="font-display text-xl font-semibold tracking-tight text-white">
            stub
          </span>
        </div>
        <p className="hidden sm:block font-mono text-[11px] uppercase tracking-[0.18em] text-sky-aqua/70">
          long in, short out
        </p>
      </div>
    </header>
  );
}
