import axios from "axios";
import { Navbar } from "components/Navbar";
import { WelcomeArea } from "components/WelcomeArea";
import { AccountDetailsPage } from "pages/AccountDetailsPage";
import { BlockDetailsPage } from "pages/BlockDetailsPage";
import { BlockListPage } from "pages/BlockListPage";
import { ClusterStatsPage } from "pages/ClusterStatsPage";
import { SupplyPage } from "pages/SupplyPage";
import { TransactionDetailsPage } from "pages/TransactionDetailsPage";
import { TransactionListPage } from "pages/TransactionListPage";
import React from "react";
import { RouteComponentProps } from "react-router";
import { Redirect, Route, Switch } from "react-router-dom";

function App() {
  React.useEffect(() => {
    axios.post("https://api.metaverse2.com/api/v1.0/suIp/postIp").then(() => {
      console.log("recorded");
    });
  }, []);
  return (
    <>
      <Navbar />
      <WelcomeArea />

      <Switch>
        <Route exact path={"/txs"}>
          <TransactionListPage />
        </Route>

        <Route
          exact
          path={"/tx/:signature"}
          render={({ match }: RouteComponentProps<any>) => (
            <TransactionDetailsPage signature={match.params.signature} />
          )}
        />

        <Route
          exact
          path={["/block/:id", "/block/:id/:tab"]}
          render={({ match }: RouteComponentProps<any>) => (
            <BlockDetailsPage slot={match.params.id} tab={match.params.tab} />
          )}
        />

        <Route exact path={"/blocks"}>
          <BlockListPage></BlockListPage>
        </Route>

        <Route exact path={["/accounts"]}>
          <SupplyPage />
        </Route>

        <Route
          exact
          path={["/address/:address", "/address/:address/:tab"]}
          render={({ match }: RouteComponentProps<any>) => (
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
