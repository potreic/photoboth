import { BoothLeftPanel } from "./BoothLeftPanel";
import { CurtainDoorway } from "./CurtainDoorway";
import { BoothRightPanel } from "./BoothRightPanel";

export function CoinBooth({
  closing,
  onInsertCoin,
  onCurtainClosed,
}: {
  closing: boolean;
  onInsertCoin: () => void;
  onCurtainClosed: () => void;
}) {
  return (
    <div className="mx-auto flex aspect-[4/5] w-full max-w-md overflow-hidden rounded-lg border-4 border-black/40 shadow-2xl">
      <BoothLeftPanel disabled={closing} onInsertCoin={onInsertCoin} />
      <CurtainDoorway closing={closing} onClosed={onCurtainClosed} />
      <BoothRightPanel />
    </div>
  );
}
