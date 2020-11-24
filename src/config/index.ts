import walletconnectLogo from "./assets/walletconnect-logo.png";
import { SUPPORTED_CHAINS, MAINNET_CHAIN_ID } from "../constants";
import { IAppConfig } from "../helpers/types";
import { getRpcAuthenticators } from "../authenticators";

const appConfig: IAppConfig = {
  name: "WalletConnect",
  logo: walletconnectLogo,
  chainId: MAINNET_CHAIN_ID,
  numberOfAccounts: 3,
  colors: {
    defaultColor: "12, 12, 13",
    backgroundColor: "40, 44, 52",
  },
  chains: SUPPORTED_CHAINS,
  styleOpts: {
    showPasteUri: true,
    showVersion: true,
  },
  authenticators: getRpcAuthenticators(),
  events: {
    init: (state, setState) => Promise.resolve(),
    update: (state, setState) => Promise.resolve(),
  },
};

export function getAppConfig(): IAppConfig {
  return appConfig;
}
