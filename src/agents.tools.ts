import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import fetchApi from "./fetchApi";
import { objectToFormData, textResponse } from "./utils";

export default function agentsToolsRegisterer(mcpServer: McpServer) {
    const agentSchecma = z.object({
        id: z.string().uuid(),
        agentName: z.string(),
        avatar: z.string().optional().nullable(),
        description: z.string(),
        systemInstructions: z.string().optional().nullable(),
        greetingMessage: z.string().optional().nullable(),
        dontKnowResponse: z.string().optional().nullable(),
        responseSyntax: z.enum(["markdown"]),
        createdAt: z.string(),
        userEmail: z.string().email(),
        datasetId: z.string().uuid().nullable(),
        isPublished: z.boolean()
    })

    mcpServer.registerTool(
        "list-agents",
        {
            title: "List Agents",
            description: "List all agents of the user in Mecha Agent platform",
            outputSchema: {
                agents: z.array(agentSchecma).nullable(),
                error: z.string().nullable()
            },
        },
        async () => {
            const { success, result, error } = await fetchApi.get("agents")
            return {
                structuredContent: {
                    error: success ? null : `Error(${error?.status}): ${error?.message}`,
                    agents: success ? result : null,
                },
                content: [],
                isError: !success,
            }
        }
    )

    mcpServer.registerTool(
        "create-agent",
        {
            title: "Create an agent",
            description: "Create a new agent",
            inputSchema: {
                agentName: agentSchecma.shape.agentName,
                description: agentSchecma.shape.description,
                systemInstructions: agentSchecma.shape.systemInstructions,
                greetingMessage: agentSchecma.shape.greetingMessage,
                dontKnowResponse: agentSchecma.shape.dontKnowResponse,
                responseSyntax: agentSchecma.shape.responseSyntax,
            }
        },
        async (agent) => {
            const response = await fetchApi.post("agents", objectToFormData(agent));
            return textResponse(response);
        }
    )

    mcpServer.registerTool(
        "get-agent",
        {
            title: "Get an agent",
            description: "Get a single agent by id",
            inputSchema: { agentId: z.string() },
            outputSchema: {
                agent: agentSchecma.nullable(),
                error: z.string().nullable(),
            }
        },
        async ({ agentId }) => {
            const { success, result, error } = await fetchApi.get("agents/" + agentId)
            return {
                content: [],
                structuredContent: {
                    error: success ? null : `Error(${error?.status}): ${error?.message}`,
                    agent: success ? result : null,
                },
                isError: !success,
            }
        }
    )

    mcpServer.registerTool(
        "update-agent",
        {
            title: "Update an agent",
            description: "Update one or more fields of an agent",
            inputSchema: {
                agentId: z.string(),
                updateData: z.object({
                    agentName: z.string().optional(),
                    description: z.string().optional(),
                    systemInstructions: z.string().optional(),
                    greetingMessage: z.string().optional(),
                    dontKnowResponse: z.string().optional(),
                    responseSyntax: z.string().optional(),
                })
            }
        },
        async ({ agentId, updateData }) => {
            const response = await fetchApi.patch("agents/" + agentId, objectToFormData(updateData))
            return textResponse(response)
        }
    )

    mcpServer.registerTool(
        "delete-agent",
        {
            title: "Delete an agent",
            description: "Delete an agent from user's account",
            inputSchema: { agentId: z.string() }
        },
        async ({ agentId }) => {
            const response = await fetchApi.delete("agents/" + agentId)
            return textResponse(response)
        }
    )

    mcpServer.registerTool(
        "publish-agent",
        {
            title: "Publish an agent",
            description: "Publish an agent to the public",
            inputSchema: { agentId: z.string() }
        },
        async ({ agentId }) => {
            const response = await fetchApi.post(`agents/${agentId}/publish`)
            return textResponse(response)
        }
    )

    mcpServer.registerTool(
        "unpublish-agent",
        {
            title: "Unpublish an agent",
            description: "Unpublish an agent from the public",
            inputSchema: { agentId: z.string() }
        },
        async ({ agentId }) => {
            const response = await fetchApi.post(`agents/${agentId}/unpublish`)
            return textResponse(response)
        }
    )

    mcpServer.registerTool(
        "link-agent-with-dataset",
        {
            title: "Link agent with dataset",
            description: "Associate an agent with a dataset, allowing the agent to access and use the dataset.",
            inputSchema: {
                agentId: z.string().uuid(),
                datasetId: z.string().uuid()
            }
        },
        async ({ agentId, datasetId }) => {
            const searchParams = new URLSearchParams([
                ["datasetId", datasetId],
                ["action", "associate"]
            ])
            const response = await fetchApi.patch(`agents/${agentId}/dataset?` + searchParams.toString())
            return textResponse(response)
        }
    )

    mcpServer.registerTool(
        "unlink-agent-from-dataset",
        {
            title: "Unlink agent from dataset",
            description: "Disassociate an agent from a dataset, removing the agent's access to the dataset.",
            inputSchema: {
                agentId: z.string().uuid(),
                datasetId: z.string().uuid()
            }
        },
        async ({ agentId, datasetId }) => {
            const searchParams = new URLSearchParams([
                ["datasetId", datasetId],
                ["action", "unassociate"]
            ])
            const response = await fetchApi.patch(`agents/${agentId}/dataset?` + searchParams.toString())
            return textResponse(response)
        }
    )
};
