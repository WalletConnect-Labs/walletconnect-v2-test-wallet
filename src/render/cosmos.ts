import { JsonRpcRequest } from "@json-rpc-tools/utils";

import { RequestRenderParams } from "../helpers";

export function renderRequest(request: JsonRpcRequest): RequestRenderParams[] {
  let params = [{ label: "Method", value: request.method }];

  switch (request.method) {
    default:
      params = [
        ...params,
        {
          label: "params",
          value: JSON.stringify(request.params, null, "\t"),
        },
      ];
      break;
  }
  return params;
}
