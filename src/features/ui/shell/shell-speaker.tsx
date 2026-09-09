/**
 * @file shell-speaker.tsx
 * @description Renders the speaker grill dot pattern on the GameBoy shell.
 *   A grid of small circular holes.
 */

export function ShellSpeaker() {
  return (
    <div className="flex flex-col gap-1 items-end">
      {Array.from({ length: 6 }).map((_, row) => (
        <div key={row} className="flex gap-1">
          {Array.from({ length: 6 }).map((_, col) => (
            <div
              key={col}
              className="w-1 h-1 rounded-full bg-shell-dark"
            />
          ))}
        </div>
      ))}
    </div>
  );
}