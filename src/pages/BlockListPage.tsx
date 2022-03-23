import { SupplyCard } from "components/SupplyCard";
import { TopAccountsCard } from "components/TopAccountsCard";

export function BlockListPage() {
  return (
    <section className="block-explorer-features section bg-bottom">
      <div className="container">
        <SupplyCard />
        <TopAccountsCard />
      </div>
    </section>
  );
}
