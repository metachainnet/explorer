import { TokenInfoMap } from "@solana/spl-token-registry";
import bs58 from "bs58";
import { Cluster, useCluster } from "providers/cluster";
import { useTokenRegistry } from "providers/mints/token-registry";
import {
  useDashboardInfo,
  useStatsProvider,
} from "providers/stats/solanaClusterStats";
import { useEffect, useRef, useState } from "react";
import { useHistory, useLocation } from "react-router-dom";
import {
  ActionMeta,
  default as Select,
  default as StateManager,
  InputActionMeta,
  ValueType,
} from "react-select";
import {
  LoaderName,
  LOADER_IDS,
  programLabel,
  PROGRAM_NAME_BY_ID,
  SPECIAL_IDS,
  SYSVAR_IDS,
} from "utils/tx";

// TODO KBT : 검색 영역 렉걸리고 안맞는 부분 고치기
export function WelcomeArea() {
  const [search, setSearch] = useState("");
  const selectRef = useRef<StateManager<any> | null>(null);
  const history = useHistory();
  const location = useLocation();
  const { tokenRegistry } = useTokenRegistry();
  const {
    epochInfo: { absoluteSlot },
  } = useDashboardInfo();
  const { setActive } = useStatsProvider();
  const { cluster } = useCluster();

  useEffect(() => {
    setActive(true);
    return () => setActive(false);
  }, [setActive, cluster]);

  const onChange = (
    { pathname }: ValueType<any, false>,
    meta: ActionMeta<any>
  ) => {
    if (meta.action === "select-option") {
      history.push({ ...location, pathname });
      setSearch("");
    }
  };

  const onInputChange = (value: string, { action }: InputActionMeta) => {
    if (action === "input-change") setSearch(value);
  };

  const resetValue = "" as any;

  return (
    <section className="block-explorer-wrapper bg-bottom-center" id="welcome-1">
      <div className="block-explorer text">
        <div className="container text-center">
          <div className="row">
            <div className="col-lg-12 align-self-center">
              <h1>Metachain Testnet Explorer</h1>
            </div>
            <div className="offset-lg-3 col-lg-6">
              <p>Up To Block {absoluteSlot.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
      <div className="search">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="input-wrapper">
                <div className="input">
                  <Select
                    ref={(ref) => (selectRef.current = ref)}
                    options={buildOptions(search, cluster, tokenRegistry)}
                    noOptionsMessage={() => "No Results"}
                    placeholder="Search for blocks, accounts, transactions, programs, and tokens"
                    value={resetValue}
                    inputValue={search}
                    blurInputOnSelect
                    onMenuClose={() => selectRef.current?.blur()}
                    onChange={onChange}
                    styles={{
                      /* work around for https://github.com/JedWatson/react-select/issues/3857 */
                      placeholder: (style) => ({
                        ...style,
                        pointerEvents: "none",
                      }),
                      input: (style) => ({ ...style, width: "100%" }),
                    }}
                    onInputChange={onInputChange}
                    components={{ DropdownIndicator }}
                    classNamePrefix="search-bar"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function buildProgramOptions(search: string, cluster: Cluster) {
  const matchedPrograms = Object.entries(PROGRAM_NAME_BY_ID).filter(
    ([address]) => {
      const name = programLabel(address, cluster);
      if (!name) return false;
      return (
        name.toLowerCase().includes(search.toLowerCase()) ||
        address.includes(search)
      );
    }
  );

  if (matchedPrograms.length > 0) {
    return {
      label: "Programs",
      options: matchedPrograms.map(([id, name]) => ({
        label: name,
        value: [name, id],
        pathname: "/address/" + id,
      })),
    };
  }
}

const SEARCHABLE_LOADERS: LoaderName[] = [
  "BPF Loader",
  "BPF Loader 2",
  "BPF Upgradeable Loader",
];

function buildLoaderOptions(search: string) {
  const matchedLoaders = Object.entries(LOADER_IDS).filter(
    ([address, name]) => {
      return (
        SEARCHABLE_LOADERS.includes(name) &&
        (name.toLowerCase().includes(search.toLowerCase()) ||
          address.includes(search))
      );
    }
  );

  if (matchedLoaders.length > 0) {
    return {
      label: "Program Loaders",
      options: matchedLoaders.map(([id, name]) => ({
        label: name,
        value: [name, id],
        pathname: "/address/" + id,
      })),
    };
  }
}

function buildSysvarOptions(search: string) {
  const matchedSysvars = Object.entries(SYSVAR_IDS).filter(
    ([address, name]) => {
      return (
        name.toLowerCase().includes(search.toLowerCase()) ||
        address.includes(search)
      );
    }
  );

  if (matchedSysvars.length > 0) {
    return {
      label: "Sysvars",
      options: matchedSysvars.map(([id, name]) => ({
        label: name,
        value: [name, id],
        pathname: "/address/" + id,
      })),
    };
  }
}

function buildSpecialOptions(search: string) {
  const matchedSpecialIds = Object.entries(SPECIAL_IDS).filter(
    ([address, name]) => {
      return (
        name.toLowerCase().includes(search.toLowerCase()) ||
        address.includes(search)
      );
    }
  );

  if (matchedSpecialIds.length > 0) {
    return {
      label: "Accounts",
      options: matchedSpecialIds.map(([id, name]) => ({
        label: name,
        value: [name, id],
        pathname: "/address/" + id,
      })),
    };
  }
}

function buildTokenOptions(
  search: string,
  cluster: Cluster,
  tokenRegistry: TokenInfoMap
) {
  const matchedTokens = Array.from(tokenRegistry.entries()).filter(
    ([address, details]) => {
      const searchLower = search.toLowerCase();
      return (
        details.name.toLowerCase().includes(searchLower) ||
        details.symbol.toLowerCase().includes(searchLower) ||
        address.includes(search)
      );
    }
  );

  if (matchedTokens.length > 0) {
    return {
      label: "Tokens",
      options: matchedTokens.map(([id, details]) => ({
        label: details.name,
        value: [details.name, details.symbol, id],
        pathname: "/address/" + id,
      })),
    };
  }
}

function buildOptions(
  rawSearch: string,
  cluster: Cluster,
  tokenRegistry: TokenInfoMap
) {
  const search = rawSearch.trim();
  if (search.length === 0) return [];

  const options = [];

  const programOptions = buildProgramOptions(search, cluster);
  if (programOptions) {
    options.push(programOptions);
  }

  const loaderOptions = buildLoaderOptions(search);
  if (loaderOptions) {
    options.push(loaderOptions);
  }

  const sysvarOptions = buildSysvarOptions(search);
  if (sysvarOptions) {
    options.push(sysvarOptions);
  }

  const specialOptions = buildSpecialOptions(search);
  if (specialOptions) {
    options.push(specialOptions);
  }

  const tokenOptions = buildTokenOptions(search, cluster, tokenRegistry);
  if (tokenOptions) {
    options.push(tokenOptions);
  }

  if (!isNaN(Number(search))) {
    options.push({
      label: "Block",
      options: [
        {
          label: `Slot #${search}`,
          value: [search],
          pathname: `/block/${search}`,
        },
      ],
    });
  }

  // Prefer nice suggestions over raw suggestions
  if (options.length > 0) return options;

  try {
    const decoded = bs58.decode(search);
    if (decoded.length === 32) {
      options.push({
        label: "Account",
        options: [
          {
            label: search,
            value: [search],
            pathname: "/address/" + search,
          },
        ],
      });
    } else if (decoded.length === 64) {
      options.push({
        label: "Transaction",
        options: [
          {
            label: search,
            value: [search],
            pathname: "/tx/" + search,
          },
        ],
      });
    }
  } catch (err) {}
  return options;
}

function DropdownIndicator() {
  return (
    <div className="search-indicator">
      <span className="fe fe-search"></span>
    </div>
  );
}
