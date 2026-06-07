// CRT / VHS aesthetic overlay — scanlines, vignette, chromatic fringing
export default function CRTOverlay() {
  return (
    <>
      {/* Scanlines */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 50,
          pointerEvents: 'none',
          backgroundImage:
            'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.18) 2px, rgba(0,0,0,0.18) 4px)',
        }}
      />
      {/* Vignette */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 51,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.75) 100%)',
        }}
      />
      {/* VHS noise grain (CSS animation) */}
      <style>{`
        @keyframes grain {
          0%,100% { transform: translate(0,0) }
          10% { transform: translate(-1%,-1%) }
          20% { transform: translate(1%,0) }
          30% { transform: translate(0,1%) }
          40% { transform: translate(-1%,0) }
          50% { transform: translate(1%,-1%) }
          60% { transform: translate(0,0) }
          70% { transform: translate(-1%,1%) }
          80% { transform: translate(1%,0) }
          90% { transform: translate(0,-1%) }
        }
        .crt-grain::before {
          content: '';
          position: fixed;
          inset: -50%;
          width: 200%;
          height: 200%;
          opacity: 0.04;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E");
          animation: grain 0.15s steps(1) infinite;
          pointer-events: none;
          z-index: 52;
        }
      `}</style>
      <div className="crt-grain" style={{ position: 'fixed', inset: 0, zIndex: 52, pointerEvents: 'none' }} />
    </>
  );
}
