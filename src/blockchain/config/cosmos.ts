import { NamespaceConfig } from "../../helpers";

export const CosmosConfig: NamespaceConfig = {
  "cosmoshub-3": {
    name: "Cosmos Hub",
    chainId: "cosmos:cosmoshub-3",
    rpcUrl: "cosmoshub.validator.network",
    derivationPath: "m/44'/118'/0'/0/0",
    nativeAsset: {
      symbol: "ATOM",
      name: "Atoms",
      decimals: "18",
    },
  },
};
