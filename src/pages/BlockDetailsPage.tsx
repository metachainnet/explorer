import { ErrorCard } from "components/common/ErrorCard";
import { BlockOverviewCard } from "components/block/BlockOverviewCard";

// IE11 doesn't support Number.MAX_SAFE_INTEGER
const MAX_SAFE_INTEGER = 9007199254740991;

type Props = { slot: string; tab?: string };

export function BlockDetailsPage({ slot, tab }: Props) {
  const slotNumber = Number(slot);

  return (
    <section className="block-explorer-section section bg-bottom">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="center-heading">
              <h2 className="section-title">Details for Block</h2>
            </div>
          </div>
        </div>
        {!isNaN(slotNumber) &&
        slotNumber < MAX_SAFE_INTEGER &&
        slotNumber % 1 === 0 ? (
          <BlockOverviewCard slot={slotNumber} tab={tab} />
        ) : (
          <ErrorCard text={`Block ${slot} is not valid`} />
        )}
      </div>
    </section>
  );
}
