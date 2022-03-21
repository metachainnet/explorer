import { SupplyCard } from "components/SupplyCard";
import { TopAccountsCard } from "components/TopAccountsCard";

export function SupplyPage() {
  return (
    <div className="container mt-4">
      <SupplyCard />
      <TopAccountsCard />
    </div>
  );
}
