// branch.merge: one positional SDK operation.
import { checkedMessage } from "../client.js";
export function merge(client, a, b, name, message) {
  return client.call("branch.merge", { branch: a, with: b, name, message: checkedMessage(message) });
}
