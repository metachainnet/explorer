import { SupplyCard } from "components/SupplyCard";
import { TopAccountsCard } from "components/TopAccountsCard";

export function SupplyPage() {
  return (
    <section className="block-explorer-features section bg-bottom">
      <div className="container">
        <SupplyCard />
        <TopAccountsCard />
      </div>
    </section>
  );
}
