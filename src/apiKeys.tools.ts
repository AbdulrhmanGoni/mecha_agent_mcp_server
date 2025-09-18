import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import fetchApi from "./fetchApi";
import { textResponse } from "./utils";

export default function apiKeysToolsRegisterer(mcpServer: McpServer) {
    const apiKeyInputSchema = z.object({
        keyName: z.string(),
        permissions: z.array(z.enum(["read", "write", "inference"]))
            .nonempty("Specify at least one permission"),
        maxAgeInDays: z.number(),
    }).strict()

    const apiKeysArraySchema = z.array(z.string().uuid()).nonempty("Provide at least one API key id")

    mcpServer.registerTool(
        "list-api-keys",
        {
            title: "List API Keys",
            description: "List all API keys",
            outputSchema: {
                apiKeys: z.array(
                    z.object({
                        id: z.string().uuid(),
                        keyName: apiKeyInputSchema.shape.keyName,
                        permissions: apiKeyInputSchema.shape.permissions,
                        key: z.string(),
                        expirationDate: z.string(),
                        status: z.enum(["Active", "Inactive"]),
                        userEmail: z.string().email(),
                        createdAt: z.string(),
                    })
                ).nullable(),
                error: z.string().nullable()
            }
        },
        async () => {
            const { success, result, error } = await fetchApi.get("api-keys")
            return {
                structuredContent: {
                    apiKeys: success ? result : null,
                    error: success ? null : `Error(${error?.status}): ${error?.message}`,
                },
                content: [],
                isError: !success,
            }
        }
    )

    mcpServer.registerTool(
        "create-api-key",
        {
            title: "Create an API key",
            description: "Create a new API key",
            inputSchema: { apiKey: apiKeyInputSchema }
        },
        async ({ apiKey }) => {
            const response = await fetchApi.post("api-keys", apiKey)
            return textResponse(response)
        }
    )

    mcpServer.registerTool(
        "activate-api-keys",
        {
            title: "Activate API keys",
            description: "Activate one or more API keys by id",
            inputSchema: { apiKeyIds: apiKeysArraySchema }
        },
        async ({ apiKeyIds }) => {
            const response = await fetchApi.patch("api-keys/activate", apiKeyIds)
            return textResponse(response)
        }
    )

    mcpServer.registerTool(
        "deactivate-api-keys",
        {
            title: "Deactivate API keys",
            description: "Deactivate one or more API keys by id",
            inputSchema: { apiKeyIds: apiKeysArraySchema }
        },
        async ({ apiKeyIds }) => {
            const response = await fetchApi.patch("api-keys/deactivate", apiKeyIds)
            return textResponse(response)
        }
    )

    mcpServer.registerTool(
        "delete-api-keys",
        {
            title: "Delete API keys",
            description: "Delete one or more API keys by id",
            inputSchema: { apiKeyIds: apiKeysArraySchema },
        },
        async ({ apiKeyIds }) => {
            const response = await fetchApi.delete("api-keys", { body: apiKeyIds })
            return textResponse(response)
        }
    )
};


