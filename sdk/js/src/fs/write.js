// fs.write: one positional SDK operation.
import { checkedMessage } from "../client.js";
export function write(client, branch, path, content, message) {
  return client.call("fs.write", { branch, path, ...(typeof content === "string" ? { content } : { bytes: content }), message: checkedMessage(message) });
}
