/**
 * @file scanline-overlay.tsx
 * @description CSS overlay that adds horizontal scanline effect
 *   over the GameBoy screen for retro authenticity.
 */

export function ScanlineOverlay() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-10"
      style={{
        background:
          'repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.08) 1px, rgba(0,0,0,0.08) 2px)',
      }}
      aria-hidden="true"
    />
  );
}