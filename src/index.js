// External modules
import Seneca from "seneca";
import Bluebird from "bluebird";

// Internal modules
import XService from "./plugins/kryptstorm-service";
import XEntity from "./plugins/kryptstorm-entity";

import XUser from "./services/kryptstorm-user";

// Create app instance
const app = Seneca({
  debug: { undead: process.env.NODE_ENV !== "production" }
});

// @see http://senecajs.org/docs/tutorials/how-to-write-a-plugin.html
app.use("mongo-store", {
  name: process.env.MONGO_DATABASE,
  host: process.env.MONGO_HOST,
  port: process.env.MONGO_PORT,
  options: {
    promiseLibrary: Bluebird
  },
  map: {
    "mongo/-/-": "*"
  }
});
app.use("entity");

// Kryptstorm plugins
app.use(XService);
app.use(XEntity);

app.use(XUser);

// Export app
export default app;
