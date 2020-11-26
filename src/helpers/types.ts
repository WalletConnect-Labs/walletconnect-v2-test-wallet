import { JsonRpcRequest } from "rpc-json-utils";

import { AppState } from "../App";

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
