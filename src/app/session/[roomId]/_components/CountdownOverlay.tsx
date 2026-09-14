export function CountdownOverlay({ secondsLeft }: { secondsLeft: number }) {
  return <p className="text-6xl font-bold">{secondsLeft === 0 ? "📸" : secondsLeft}</p>;
}
