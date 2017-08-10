// External modules
import Seneca from "seneca";
import _ from "lodash";
import Bcrypt from "bcrypt";
import Bluebird from "bluebird";
import { expect } from "chai";
import Faker from "faker";

// Internal modules
import XUser from ".";
import { STATUS_ACTIVE } from "./schema";
import XService from "../../plugins/kryptstorm-service";
import XEntity from "../../plugins/kryptstorm-entity";

// Defined function - what will return test app instance
const App = fn =>
  Seneca({
    timeout: 10000,
    log: "test",
    debug: { undead: true }
  }).test(fn);

// Defined basic test
describe("XUser - Basic", function() {
  let userId;
  // Init test app
  const app = App();

  // Register XService
  app.use(XService);
  // Register Mongo store
  app.use("mongo-store", {
    name: process.env.MONGO_DATABASE,
    host: process.env.MONGO_HOST,
    port: process.env.MONGO_PORT,
    options: {
      promiseLibrary: require("bluebird")
    },
    map: {
      "mongo/-/-": "*"
    }
  });
  // Register Entity
  app.use("entity");
  // Register XEntity
  app.use(XEntity);
  // Register XUser
  app.use(XUser, {
    entity: ["mongo", "test", "user"]
  });

  // Before hook for test, all thing you need will be prepare at there
  before(done => {
    // App is ready to test
    app.ready(() => done());
  });

  it("Create", function(done) {
    const body = {
      username: Faker.internet.userName(),
      email: Faker.internet.email(),
      password: Faker.internet.password(),
      firstName: Faker.name.firstName(),
      lastName: Faker.name.lastName(),
      status: STATUS_ACTIVE
    };
    app.XService$
      .act("x_user:create", { body })
      .then(({ errorCode$ = "ERROR_NONE", data$ }) => {
        // If errorCode$ is not equal to ERROR_NONE, that mean we an error :) easy
        expect(errorCode$).to.be.equal("ERROR_NONE");

        // If action has been successful, data$ must be an object
        expect(data$).to.be.an("object");

        // And our data must be exist
        expect(data$.username).to.be.equal(_.toLower(body.username));
        expect(data$.email).to.be.equal(_.toLower(body.email));
        expect(data$.firstName).to.be.equal(body.firstName);
        expect(data$.lastName).to.be.equal(body.lastName);
        expect(data$.status).to.be.equal(body.status);
        expect(data$.createdAt).to.be.exist;

        // Password must not return
        expect(data$.password).to.be.not.exist;

        // Test is successful
        done();
      })
      .catch(done);
  });
});
