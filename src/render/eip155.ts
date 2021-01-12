import { JsonRpcRequest } from "@json-rpc-tools/utils";

import { convertHexToNumber, convertHexToUtf8, RequestRenderParams } from "../helpers";

export function renderRequest(request: JsonRpcRequest): RequestRenderParams[] {
  let params = [{ label: "Method", value: request.method }];

  switch (request.method) {
    case "eth_sendTransaction":
    case "eth_signTransaction":
      params = [
        ...params,
        { label: "From", value: request.params[0].from },
        { label: "To", value: request.params[0].to },
        {
          label: "Gas Limit",
          value: request.params[0].gas
            ? convertHexToNumber(request.params[0].gas)
            : request.params[0].gasLimit
            ? convertHexToNumber(request.params[0].gasLimit)
            : "",
        },
        {
          label: "Gas Price",
          value: convertHexToNumber(request.params[0].gasPrice),
        },
        {
          label: "Nonce",
          value: convertHexToNumber(request.params[0].nonce),
        },
        {
          label: "Value",
          value: request.params[0].value ? convertHexToNumber(request.params[0].value) : "",
        },
        { label: "Data", value: request.params[0].data },
      ];
      break;

    case "eth_sign":
      params = [
        ...params,
        { label: "Address", value: request.params[0] },
        { label: "Message", value: request.params[1] },
      ];
      break;
    case "personal_sign":
      params = [
        ...params,
        { label: "Address", value: request.params[1] },
        {
          label: "Message",
          value: convertHexToUtf8(request.params[0]),
        },
      ];
      break;
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
