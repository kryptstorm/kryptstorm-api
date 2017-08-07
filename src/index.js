// External modules
import Seneca from "seneca";

// Create app instance
const app = Seneca({
  debug: { undead: process.env.NODE_ENV !== "production" }
});

// Export app
export default app;
