import { Navbar } from "components/Navbar";
import { WelcomeArea } from "components/WelcomeArea";
import { AccountDetailsPage } from "pages/AccountDetailsPage";
import { BlockDetailsPage } from "pages/BlockDetailsPage";
import { ClusterStatsPage } from "pages/ClusterStatsPage";
import { TransactionInspectorPage } from "pages/inspector/InspectorPage";
import { SupplyPage } from "pages/SupplyPage";
import { TransactionDetailsPage } from "pages/TransactionDetailsPage";
import { Redirect, Route, Switch } from "react-router-dom";

const ADDRESS_ALIASES = ["account", "accounts", "addresses"];
const TX_ALIASES = ["txs", "txn", "txns", "transaction", "transactions"];

function App() {
  return (
    <>
      {/* <ClusterModal /> */}
      {/* <Loading /> */}
      <Navbar />

      {/* 두 개 사용처 확인 */}
      {/* <MessageBanner /> */}
      {/* <ClusterStatusBanner /> */}

      <WelcomeArea />

      <Switch>
        <Route exact path={["/supply", "/accounts", "accounts/top"]}>
          <SupplyPage />
        </Route>

        <Route
          exact
          path={TX_ALIASES.map((tx) => `/${tx}/:signature`)}
          render={({ match, location }) => {
            let pathname = `/tx/${match.params.signature}`;
            return <Redirect to={{ ...location, pathname }} />;
          }}
        />

        <Route
          exact
          path={["/tx/inspector", "/tx/:signature/inspect"]}
          render={({ match }) => (
            <TransactionInspectorPage signature={match.params.signature} />
          )}
        />

        <Route
          exact
          path={"/tx/:signature"}
          render={({ match }) => (
            <TransactionDetailsPage signature={match.params.signature} />
          )}
        />

        <Route
          exact
          path={["/block/:id", "/block/:id/:tab"]}
          render={({ match }) => (
            <BlockDetailsPage slot={match.params.id} tab={match.params.tab} />
          )}
        />

        <Route
          exact
          path={[
            ...ADDRESS_ALIASES.map((path) => `/${path}/:address`),
            ...ADDRESS_ALIASES.map((path) => `/${path}/:address/:tab`),
          ]}
          render={({ match, location }) => {
            let pathname = `/address/${match.params.address}`;
            if (match.params.tab) {
              pathname += `/${match.params.tab}`;
            }
            return <Redirect to={{ ...location, pathname }} />;
          }}
        />

        <Route
          exact
          path={["/address/:address", "/address/:address/:tab"]}
          render={({ match }) => (
            <AccountDetailsPage
              address={match.params.address}
              tab={match.params.tab}
            />
          )}
        />

        <Route exact path="/">
          <ClusterStatsPage />
        </Route>

        <Route
          render={({ location }) => (
            <Redirect to={{ ...location, pathname: "/" }} />
          )}
        />
      </Switch>

      <footer id="contact">
        <div className="footer-bottom slim">
          <div className="container">
            <div className="row">
              <div className="col-lg-12">
                <p className="copyright">2022 © Metachain</p>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;
