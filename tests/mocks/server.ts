import { setupServer } from "msw/node";
import { handlers } from "./handlers.js";

/**
 * Setup MSW server for mocking API requests in tests
 * This server runs in Node.js environment (for Vitest)
 */
export const server = setupServer(...handlers);
