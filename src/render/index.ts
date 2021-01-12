import { JsonRpcRequest } from "@json-rpc-tools/utils";

import * as eip155 from "./eip155";
import * as cosmos from "./cosmos";
import * as polkadot from "./polkadot";

import { RequestRenderParams } from "../helpers";

export function renderRequest(request: JsonRpcRequest, chainId: string): RequestRenderParams[] {
  const namespace = chainId.split(":")[0];
  switch (namespace) {
    case "eip155":
      return eip155.renderRequest(request);
    case "cosmos":
      return cosmos.renderRequest(request);
    case "polkadot":
      return polkadot.renderRequest(request);
    default:
      throw new Error(`No render handler for namespace ${namespace}`);
  }
}
