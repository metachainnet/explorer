import { BigNumber } from "bignumber.js";
import { SolBalance } from "utils";

export function BalanceDelta({
  delta,
  isSol = false,
}: {
  delta: BigNumber;
  isSol?: boolean;
}) {
  let sols;

  if (isSol) {
    sols = <SolBalance lamports={delta.toNumber()} />;
  }

  if (delta.gt(0)) {
    return (
      <span className="badge bg-success">
        +{isSol ? sols : delta.toString()}
      </span>
    );
  } else if (delta.lt(0)) {
    return (
      <span className="badge bg-warning">
        {isSol ? <>-{sols}</> : delta.toString()}
      </span>
    );
  }

  return <span className="badge bg-secondary">0</span>;
}
