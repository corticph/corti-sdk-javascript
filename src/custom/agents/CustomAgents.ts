/**
 * This file is the custom implementation of the Agents client (src/api/resources/agents/client/Client.ts)
 *
 * It extends the auto-generated Agents class and adds custom helper methods.
 *
 * @deprecated Migrate to the Agentic API v2. See https://docs.corti.ai/agentic/guides/migrate-v1-to-v2
 */

import { AgentsClient } from "../../api/resources/agents/client/Client.js";
import * as core from "../../core/index.js";

/** @deprecated Migrate to the Agentic API v2. See https://docs.corti.ai/agentic/guides/migrate-v1-to-v2 */
export class CustomAgents extends AgentsClient {
    /**
     * Returns the URL for the agent card JSON file.
     *
     * @param {string} agentId - The ID of the agent
     * @returns {Promise<URL>} A Promise that resolves to the URL for the agent card
     *
     * @deprecated Migrate to the Agentic API v2. See https://docs.corti.ai/agentic/guides/migrate-v1-to-v2
     *
     * @example
     *     const url = await client.agents.getCardUrl("agent-123");
     */
    public getCardUrl = async (agentId: string): Promise<URL> => {
        const encodedAgentId = encodeURIComponent(agentId);
        return new URL(
            `/agents/${encodedAgentId}/agent-card.json`,
            (await core.Supplier.get(this._options.environment)).agents,
        );
    };
}
