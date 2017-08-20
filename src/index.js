// External modules
import Seneca from "seneca";
import Bluebird from "bluebird";
import XService from "kryptstorm-service";
import XEntity from "kryptstorm-entity";

// Internal modules
import XUser from "./services/kryptstorm-user";

// Create app instance
const app = Seneca({
  debug: { undead: process.env.NODE_ENV !== "production" }
});

// Short syntax to install seneca plugin
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

app.use(XService);
app.use(XEntity);
app.use(XUser);

// Export app
export default app;
