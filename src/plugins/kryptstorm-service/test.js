// System modules
import Querystring from "querystring";

// External modules
import Seneca from "seneca";
import _ from "lodash";
import Bluebird from "bluebird";
import { expect } from "chai";

// Internal modules
import XService from ".";

// Defined function - what will return test app instance
const App = fn =>
  Seneca({
    log: "test",
    debug: { undead: true }
  }).test(fn);

// Defined basic test
describe("XService - Basic", function() {
  // Init test app
  const app = App();

  // Register XService
  app.use(XService, {
    maps: {
      "faker:name, properties:firstName": {
        // Required fields
        method: "GET", // Method will be call - default is "get"
        url: "http://faker.hook.io", // Uri to external service
        mapper: data => ({ data$: { firstName: data } }), // Map the result, because may be we will call an service is not belog to kryptstorm
        // Optional fields
        query: Querystring.stringify({ property: "name.firstName" }), // the sevice query
        params: {}, // The service method parameters
        data: {} // The request data (for create, update and patch)
      }
    }
  });

  // Before hook for test, all thing you need will be prepare at there
  before(done => {
    // App is ready to test
    app.ready(() => done());
  });

  it("Faker - Get firstName", function(done) {
    app.XService$
      .act("faker:name, properties:firstName")
      .then(({ errorCode$ = "ERROR_NONE", data$ }) => {
        // If errorCode$ is not equal to ERROR_NONE, that mean we an error :) easy
        expect(errorCode$).to.be.equal("ERROR_NONE");
        // If action has been successful, data$ must be an object
        expect(data$).to.be.an("object");
        // And our data must be exist
        expect(data$.firstName).to.be.exist;
        // Test is successful
        done();
      })
      .catch(done);
  });
});
