'use client';

/** Subtle animated ambient layer — cinematic depth without distracting motion. */
export function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden>
      {/* Slow drifting lime orb */}
      <div className="ambient-orb absolute -left-[20%] top-[10%] h-[50vmin] w-[50vmin] rounded-full bg-lime/[0.04] blur-[100px]" />
      <div className="ambient-orb-delay absolute -right-[15%] top-[40%] h-[40vmin] w-[40vmin] rounded-full bg-lime/[0.03] blur-[90px]" />
      {/* Perspective grid floor */}
      <div
        className="absolute inset-x-0 bottom-0 h-[45vh] opacity-[0.035]"
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
