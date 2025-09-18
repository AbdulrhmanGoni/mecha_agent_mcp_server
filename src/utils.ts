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

export function objectToFormData(object: Record<string, string | undefined | null>): FormData {
    const formData = new FormData();
    for (const [key, value] of Object.entries(object)) {
        if (value != null && value != undefined) {
            formData.append(key, value);
        }
    }
    return formData;
}
