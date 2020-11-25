import { ChainID } from "caip";

import * as blockchain from "../blockchain";
import { ChainAuthenticator, ChainConfig, ChainSigner } from "./types";

export function getChainProperty<T>(chainId: string, property: string): T {
  const { namespace, reference } = ChainID.parse(chainId);
  const config = blockchain[property][namespace][reference];

  if (!config) {
    throw new Error(`Invalid or unsupported chainId: ${chainId}`);
  }
  return config;
}

export function getChainConfig(chainId: string): ChainConfig {
  return getChainProperty<ChainConfig>(chainId, "config");
}

export function getChainSigner(chainId: string): ChainSigner {
  return getChainProperty<ChainSigner>(chainId, "signer");
}

export function getChainAuthenticator(chainId: string): ChainAuthenticator {
  return getChainProperty<ChainAuthenticator>(chainId, "authenticator");
}
