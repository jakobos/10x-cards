import { setupWorker } from "msw/browser";
import { handlers } from "./handlers.js";

/**
 * Setup MSW worker for mocking API requests in the browser
 * This is useful for development and manual testing
 * Start the worker in your app with: worker.start()
 */
export const worker = setupWorker(...handlers);
