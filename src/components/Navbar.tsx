import Logo from "images/logos/M2_logo.png";
import { Link, NavLink } from "react-router-dom";
import { clusterPath } from "utils/url";

export function Navbar() {
  // TODO KBT : Cluster Modal 연결
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

              {/* <div className="lang">
                <div className="selected">
                  <img src={LanguageIcon_EN} alt="Change Language To EN" />
                  <i className="fa fa-angle-down"></i>
                </div>
                <ul className="flag-list">
                  <li>
                    <Link to={clusterPath("/")}>
                      <img src={LanguageIcon_EN} alt="Change Language To EN" />
                      <span>EN</span>
                    </Link>
                  </li>
                  <li>
                    <Link to={clusterPath("/")}>
                      <img src={LanguageIcon_RU} alt="Change Language To RU" />
                      <span>RU</span>
                    </Link>
                  </li>
                  <li>
                    <Link to={clusterPath("/")}>
                      <img src={LanguageIcon_BR} alt="Change Language To BR" />
                      <span>BR</span>
                    </Link>
                  </li>
                </ul>
              </div> */}

              <ul className="nav">
                <li>
                  <NavLink to={clusterPath("/")} exact>
                    Home
                  </NavLink>
                  {/* <a href="blue-block-explorer.html">BLOCKCHAIN HOME</a> */}
                </li>
                <li>
                  <NavLink to={clusterPath("/supply")}>Blocks</NavLink>
                </li>
                <li>
                  <NavLink to={clusterPath("/tx/inspector")}>
                    Transactions
                  </NavLink>
                </li>
                <li>
                  <NavLink
                    className="btn-nav-box"
                    to={clusterPath("/tx/inspector")}
                  >
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
