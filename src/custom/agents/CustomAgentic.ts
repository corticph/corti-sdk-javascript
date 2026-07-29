/**
 * Custom implementation of the Agentic client (src/api/resources/agentic/client/Client.ts).
 * Extends the auto-generated AgenticClient with helper methods for Agents API v2.
 */

import { AgenticClient } from "../../api/resources/agentic/client/Client.js";
import * as core from "../../core/index.js";

export class CustomAgentic extends AgenticClient {
    /**
     * Returns the URL for the agent card JSON file (A2A well-known path).
     *
     * @param {string} agentId - The ID of the agent
     * @returns {Promise<URL>} A Promise that resolves to the URL for the agent card
     *
     * @example
     *     const url = await client.agentic.getCardUrl("agent-123");
     */
    public getCardUrl = async (agentId: string): Promise<URL> => {
        const encodedAgentId = encodeURIComponent(agentId);

        return new URL(
            `/v2/agentic/agents/${encodedAgentId}/.well-known/agent-card.json`,
            (await core.Supplier.get(this._options.environment)).agents,
        );
    };
}
