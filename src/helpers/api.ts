import axios, { AxiosInstance } from "axios";
import { JsonRpcRequest, payloadId } from "rpc-json-utils";

import { AssetMetadata, GasPrices, ParsedTx } from "./types";
import { getChainConfig } from "./chains";

const api: AxiosInstance = axios.create({
  baseURL: "https://ethereum-api.xyz",
  timeout: 30000, // 30 secs
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export const apiSendTransaction = async (txParams: any, chainId: string): Promise<number> => {
  const { rpcUrl } = getChainConfig(chainId);

  if (!rpcUrl && typeof rpcUrl !== "string") {
    throw new Error("Invalid or missing rpc url");
  }

  const response = await axios.post(rpcUrl, {
    jsonrpc: "2.0",
    id: payloadId(),
    method: "eth_sendTransaction",
    params: [txParams],
  });

  const result = response.data.result;
  return result;
};

export async function apiGetAccountAssets(
  address: string,
  chainId: string,
): Promise<AssetMetadata[]> {
  const response = await api.get(`/account-assets?address=${address}&chainId=${chainId}`);
  const { result } = response.data;
  return result;
}

export async function apiGetAccountTransactions(
  address: string,
  chainId: string,
): Promise<ParsedTx[]> {
  const response = await api.get(`/account-transactions?address=${address}&chainId=${chainId}`);
  const { result } = response.data;
  return result;
}

export const apiGetAccountNonce = async (address: string, chainId: string): Promise<string> => {
  const response = await api.get(`/account-nonce?address=${address}&chainId=${chainId}`);
  const { result } = response.data;
  return result;
};

export const apiGetGasPrices = async (): Promise<GasPrices> => {
  const response = await api.get(`/gas-prices`);
  const { result } = response.data;
  return result;
};

export const apiGetBlockNumber = async (chainId: string): Promise<GasPrices> => {
  const response = await api.get(`/block-number?chainId=${chainId}`);
  const { result } = response.data;
  return result;
};

export const apiGetCustomRequest = async (
  chainId: string,
  customRpc: Partial<JsonRpcRequest>,
): Promise<any> => {
  const response = await api.post(`config-request?chainId=${chainId}`, customRpc);
  const { result } = response.data;
  return result;
};
