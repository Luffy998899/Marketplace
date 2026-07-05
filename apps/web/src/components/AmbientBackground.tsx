'use client';

/** Subtle animated ambient layer — cinematic depth without distracting motion. */
export function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden overscroll-none" aria-hidden>
      {/* Slow drifting lime orb — scaled down on mobile to prevent overflow */}
      <div className="ambient-orb absolute -left-[25%] top-[8%] h-[35vmin] w-[35vmin] rounded-full bg-lime/[0.04] blur-[80px] sm:-left-[20%] sm:top-[10%] sm:h-[50vmin] sm:w-[50vmin] sm:blur-[100px]" />
      <div className="ambient-orb-delay absolute -right-[20%] top-[35%] h-[30vmin] w-[30vmin] rounded-full bg-lime/[0.03] blur-[70px] sm:-right-[15%] sm:top-[40%] sm:h-[40vmin] sm:w-[40vmin] sm:blur-[90px]" />
      {/* Perspective grid floor — hidden on small screens */}
      <div
        className="absolute inset-x-0 bottom-0 hidden h-[40vh] opacity-[0.035] sm:block sm:h-[45vh]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(209,254,23,0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(209,254,23,0.5) 1px, transparent 1px)
          `,
          backgroundSize: '48px 48px',
          maskImage: 'linear-gradient(to top, black, transparent)',
          transform: 'perspective(500px) rotateX(60deg) translateY(20%)',
          transformOrigin: 'bottom center',
        }}
      />
    </div>
  );
}
