// fs.apply: one positional SDK operation.
import { checkedMessage } from "../client.js";
export function apply(client, branch, changes, message) {
  return client.call("fs.apply", { branch, changes, message: checkedMessage(message) });
}
