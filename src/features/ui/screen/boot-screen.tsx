/**
 * @file boot-screen.tsx
 * @description Placeholder screen shown when no game is loaded.
 *   Displays a retro-style "Select Game" message on green LCD background.
 */

export function BootScreen() {
  return (
    <div className="flex flex-col items-center justify-center w-[160px] h-[144px] bg-lcd-light">
      <p className="font-pixel text-[8px] text-lcd-darkest text-center leading-relaxed">
        SELECT
        <br />
        GAME
      </p>
    </div>
  );
}