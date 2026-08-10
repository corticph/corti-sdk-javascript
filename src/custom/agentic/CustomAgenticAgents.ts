/**
 * Custom Agents client under client.agentic.agents.
 *
 * Extends the auto-generated AgentsClient with helper methods.
 */

import { AgentsClient } from "../../api/resources/agentic/resources/agents/client/Client.js";
import type { A2AClient } from "../../api/resources/agentic/resources/agents/resources/a2A/client/Client.js";
import type * as Corti from "../../api/index.js";
import * as core from "../../core/index.js";

export class CustomAgenticAgents extends AgentsClient {
    /**
     * Alias for Fern's camelCased `a2A` group (OpenAPI path `/a2a`). Prefer this over `a2A`.
     */
    public get a2a(): A2AClient {
        return this.a2A;
    }

    /**
     * Returns the URL for the agent card JSON file.
     *
     * @param {Corti.CommonAgentIdValue} agentId - The ID of the agent
     * @returns {Promise<URL>} A Promise that resolves to the URL for the agent card
     *
     * @example
     *     const url = await client.agentic.agents.getCardUrl("agt.0192f4c8-2c5a-7b3e-9f1a-3c8d6e2b7a40");
     */
    public getCardUrl = async (agentId: Corti.CommonAgentIdValue): Promise<URL> => {
        const base =
            (await core.Supplier.get(this._options.baseUrl)) ??
            (await core.Supplier.get(this._options.environment)).base;
        return new URL(
            core.url.join(
                base,
                `agentic/agents/${core.url.encodePathParam(agentId)}/.well-known/agent-card.json`,
            ),
        );
    };
}
