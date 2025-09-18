import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import fetchApi from "./fetchApi";
import { objectToFormData, textResponse } from "./utils";

export default function datasetsToolsRegisterer(mcpServer: McpServer) {
    const datasetSchema = z.object({
        id: z.string().uuid(),
        title: z.string().max(70),
        description: z.string().max(150),
        userEmail: z.string().email(),
        createdAt: z.string(),
        updatedAt: z.string(),
    });

    mcpServer.registerTool(
        "list-datasets",
        {
            title: "List Datasets",
            description: "List all user's datasets",
            outputSchema: {
                datasets: z.array(datasetSchema).nullable(),
                error: z.string().nullable()
            }
        },
        async () => {
            const { success, result, error } = await fetchApi.get("datasets")
            return {
                structuredContent: {
                    datasets: success ? result : null,
                    error: success ? null : `Error(${error?.status}): ${error?.message}`,
                },
                content: [],
                isError: !success,
            }
        }
    )

    mcpServer.registerTool(
        "create-dataset",
        {
            title: "Create a dataset",
            description: "Create a new dataset",
            inputSchema: {
                title: datasetSchema.shape.title,
                description: datasetSchema.shape.description,
            },
            outputSchema: {
                dataset: datasetSchema,
                error: z.string().nullable(),
            }
        },
        async (dataset) => {
            const { success, error, result } = await fetchApi.post("datasets", objectToFormData(dataset))
            return {
                structuredContent: {
                    dataset: success ? result : null,
                    error: success ? null : `Error(${error?.status}): ${error?.message}`,
                },
                content: [],
                isError: !success,
            }
        }
    )

    mcpServer.registerTool(
        "get-dataset",
        {
            title: "Get a dataset",
            description: "Get a dataset by id",
            inputSchema: { datasetId: z.string() },
            outputSchema: {
                dataset: z.object({
                    ...datasetSchema.shape,
                    instructionsCount: z.number(),
                }),
                error: z.string().nullable(),
            }
        },
        async ({ datasetId }) => {
            const { success, result, error } = await fetchApi.get("datasets/" + datasetId)
            return {
                structuredContent: {
                    dataset: success ? result : null,
                    error: success ? null : `Error(${error?.status}): ${error?.message}`,
                },
                content: [],
                isError: !success,
            }
        }
    )

    mcpServer.registerTool(
        "update-dataset",
        {
            title: "Update a dataset",
            description: "Update the name or the description of a dataset",
            inputSchema: {
                datasetId: z.string(),
                updateData: z.object({
                    title: datasetSchema.shape.title,
                    description: datasetSchema.shape.description,
                }).partial()
            }
        },
        async ({ datasetId, updateData }) => {
            const response = await fetchApi.patch("datasets/" + datasetId, objectToFormData(updateData))
            return textResponse(response)
        }
    )

    mcpServer.registerTool(
        "delete-dataset",
        {
            title: "Delete a dataset",
            description: "Delete a dataset",
            inputSchema: { datasetId: z.string() }
        },
        async ({ datasetId }) => {
            const response = await fetchApi.delete("datasets/" + datasetId)
            return textResponse(response)
        }
    )
};


