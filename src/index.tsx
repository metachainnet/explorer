import { MintsProvider } from "providers/mints";
import { StatsProvider } from "providers/stats";
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter as Router } from "react-router-dom";
import App from "./App";
import "./css/bootstrap.min.css";
import "./css/font-awesome.min.css";
import { AccountsProvider } from "./providers/accounts";
import { BlockProvider } from "./providers/block";
import { ClusterProvider } from "./providers/cluster";
import { RichListProvider } from "./providers/richList";
import { SupplyProvider } from "./providers/supply";
import { TransactionsProvider } from "./providers/transactions";
import "./scss/blue.scss";

// TODO KBT : Sentry 수정
// if (process.env.NODE_ENV === "production") {
//   Sentry.init({
//     dsn: "https://5efdc15b4828434fbe949b5daed472be@o434108.ingest.sentry.io/5390542",
//   });
// }

ReactDOM.render(
  <Router>
    <ClusterProvider>
      <StatsProvider>
        <SupplyProvider>
          <RichListProvider>
            <AccountsProvider>
              <BlockProvider>
                <MintsProvider>
                  <TransactionsProvider>
                    <App />
                  </TransactionsProvider>
                </MintsProvider>
              </BlockProvider>
            </AccountsProvider>
          </RichListProvider>
        </SupplyProvider>
      </StatsProvider>
    </ClusterProvider>
  </Router>,
  document.getElementById("root")
);
