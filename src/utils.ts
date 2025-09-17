import type { CallToolResult } from "@modelcontextprotocol/sdk/types.js";
import type { FetchResult } from "./fetchApi";

export function textResponse({ success, error, result }: FetchResult): CallToolResult {
    return {
        content: [{
            type: "text",
            text: success ? result : `Error(${error?.status}): ${error?.message}`
        }],
        isError: !success,
    }
}
