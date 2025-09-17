import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import agentsToolsRegisterer from "./src/agents.tools";

const mcpServer = new McpServer({
    name: "mecha_agent_mcp_server",
    version: "1.0.0",
});

agentsToolsRegisterer(mcpServer)

const transport = new StdioServerTransport();
await mcpServer.connect(transport);
