import Logo from "images/logos/M2_logo.png";
import { Link, NavLink } from "react-router-dom";
import { clusterPath } from "utils/url";

export function Navbar() {
  return (
    <header className="header-area">
      <div className="container">
        <div className="row">
          <div className="col-12 position-relative">
            <nav className="main-nav">
              <Link to={clusterPath("/")} className="logo">
                <img
                  src={Logo}
                  className="light-logo"
                  alt="Metachainnet"
                  width="29"
                />
                <img
                  src={Logo}
                  className="dark-logo"
                  alt="Metachainnet"
                  width="29"
                />
              </Link>

              <ul className="nav">
                <li>
                  <NavLink to={clusterPath("/")} exact>
                    Home
                  </NavLink>
                </li>
                <li>
                  <NavLink to={clusterPath("/blocks")}>Blocks</NavLink>
                </li>
                <li>
                  <NavLink to={clusterPath("/txs")}>Transactions</NavLink>
                </li>
                <li>
                  <NavLink className="btn-nav-box" to={"#"}>
                    Testnet
                  </NavLink>
                </li>
              </ul>
              <Link className="menu-trigger" to="">
                <span>Menu</span>
              </Link>
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}
