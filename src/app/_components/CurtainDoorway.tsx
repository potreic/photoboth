export function CurtainDoorway({ closing, onClosed }: { closing: boolean; onClosed: () => void }) {
  return (
    <div className="relative h-full w-[44%] overflow-hidden bg-black">
      <div
        onTransitionEnd={(e) => {
          // Tailwind's translate-x-* utilities animate the `translate` property, not `transform`.
          if (e.propertyName === "translate" && closing) onClosed();
        }}
        className={`absolute inset-y-0 left-0 w-1/2 bg-velvet-red shadow-[inset_-8px_0_16px_rgba(0,0,0,0.5)] transition-transform duration-1000 ease-in-out ${
          closing ? "translate-x-0" : "-translate-x-[32%]"
        }`}
      />
      <div
        className={`absolute inset-y-0 right-0 w-1/2 bg-velvet-red shadow-[inset_8px_0_16px_rgba(0,0,0,0.5)] transition-transform duration-1000 ease-in-out ${
          closing ? "translate-x-0" : "translate-x-[32%]"
        }`}
      />
    </div>
  );
}
