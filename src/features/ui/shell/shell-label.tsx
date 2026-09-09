/**
 * @file shell-label.tsx
 * @description Renders the "DOT MATRIX WITH STEREO SOUND" label
 *   at the top of the GameBoy shell.
 */

export function ShellLabel() {
  return (
    <div className="text-center">
      <p className="font-pixel text-[6px] text-bezel tracking-wider uppercase">
        Dot Matrix with Stereo Sound
      </p>
    </div>
  );
}