import Store from "@pedrouid/iso-store";
import { JsonRpcRequest } from "rpc-json-utils";
import { IJsonRpcSigner } from "rpc-json-signer";
import { IJsonRpcAuthenticator } from "rpc-json-auth";

import { AppState } from "../App";

export interface KeyringOptions {
  store: Store;
  mnemonic?: string;
}

export interface KeyPair {
  privateKey: string;
  publicKey: string;
}

export interface AssetMetadata {
  symbol: string;
  name: string;
  decimals: string;
}

export interface ChainConfig {
  name: string;
  chainId: string;
  rpcUrl: string;
  derivationPath: string;
  nativeAsset: AssetMetadata;
}

export type ChainSigner = IJsonRpcSigner;

export type ChainAuthenticator = IJsonRpcAuthenticator;

export interface NamespaceConfig {
  [reference: string]: ChainConfig;
}

export interface TxData {
  from: string;
  to: string;
  nonce: string;
  gasPrice: string;
  gasLimit: string;
  value: string;
  data: string;
}

export interface BlockScoutTx {
  value: string;
  txreceipt_status: string;
  transactionIndex: string;
  to: string;
  timeStamp: string;
  nonce: string;
  isError: string;
  input: string;
  hash: string;
  gasUsed: string;
  gasPrice: string;
  gas: string;
  from: string;
  cumulativeGasUsed: string;
  contractAddress: string;
  confirmations: string;
  blockNumber: string;
  blockHash: string;
}

export interface BlockScoutTokenTx {
  value: string;
  transactionIndex: string;
  tokenSymbol: string;
  tokenName: string;
  tokenDecimal: string;
  to: string;
  timeStamp: string;
  nonce: string;
  input: string;
  hash: string;
  gasUsed: string;
  gasPrice: string;
  gas: string;
  from: string;
  cumulativeGasUsed: string;
  contractAddress: string;
  confirmations: string;
  blockNumber: string;
  blockHash: string;
}

export interface ParsedTx {
  timestamp: string;
  hash: string;
  from: string;
  to: string;
  nonce: string;
  gasPrice: string;
  gasUsed: string;
  fee: string;
  value: string;
  input: string;
  error: boolean;
  asset: AssetMetadata;
  operations: TxOperation[];
}

export interface TxOperation {
  asset: AssetMetadata;
  value: string;
  from: string;
  to: string;
  functionName: string;
}

export interface GasPricesResponse {
  fastWait: number;
  avgWait: number;
  blockNum: number;
  fast: number;
  fastest: number;
  fastestWait: number;
  safeLow: number;
  safeLowWait: number;
  speed: number;
  block_time: number;
  average: number;
}

export interface GasPrice {
  time: number;
  price: number;
}

export interface GasPrices {
  timestamp: number;
  slow: GasPrice;
  average: GasPrice;
  fast: GasPrice;
}

export interface MethodArgument {
  type: string;
}

export interface Method {
  signature: string;
  name: string;
  args: MethodArgument[];
}

export interface RequestRenderParams {
  label: string;
  value: string;
}

export interface RpcAuthenticator {
  filter: (payload: JsonRpcRequest) => boolean;
  router: (payload: JsonRpcRequest, state: AppState, setState: any) => Promise<void>;
  render: (payload: JsonRpcRequest) => RequestRenderParams[];
  signer: (payload: JsonRpcRequest, state: AppState, setState: any) => Promise<void>;
}

export interface AppEvents {
  init: (state: AppState, setState: any) => Promise<void>;
  update: (state: AppState, setState: any) => Promise<void>;
}
