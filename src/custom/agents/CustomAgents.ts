/**
 * This file is the custom implementation of the Agents client (src/api/resources/agents/client/Client.ts)
 *
 * It extends the auto-generated Agents class and adds custom helper methods.
 *
 * All the patches marked with `// Patch: ...` comments.
 */

import { AgentsClient } from "../../api/resources/agents/client/Client.js";
import * as core from "../../core/index.js";

export class CustomAgents extends AgentsClient {
    /**
     * Patch: added helper method to get agent card URL
     *
     * Returns the URL for the agent card JSON file.
     *
     * @param {string} agentId - The ID of the agent
     * @returns {Promise<URL>} The URL for the agent card
     *
     * @example
     *     const url = await client.agents.getAgentCardUrl("agent-123");
     */
    public getCardUrl = async (agentId: string): Promise<URL> => {
        const encodedAgentId = encodeURIComponent(agentId);
        return new URL(
            `/agents/${encodedAgentId}/agent-card.json`,
            (await core.Supplier.get(this._options.environment)).agents,
        );
    };
}
