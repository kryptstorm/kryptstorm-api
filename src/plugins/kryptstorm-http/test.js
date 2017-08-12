// External modules
import Seneca from "seneca";
import Faker from "faker";
import Chai, { expect } from "chai";
import ChaiHttp from "chai-http";

// Internal modules
import XHttp from ".";

// Defined function - what will return test app instance
const App = fn =>
  Seneca({
    timeout: 10000,
    log: "test",
    debug: { undead: true }
  }).test(fn);

describe("XHttp - Basic", function() {
  // Fake data
  const params = { id: Faker.random.uuid() };
  const body = {
    username: Faker.internet.userName(),
    email: Faker.internet.email()
  };
  const anotherBody = {
    username: Faker.internet.userName(),
    email: Faker.internet.email()
  };

  // Setup chai-http to test http connect
  Chai.use(ChaiHttp, {
    routes: {
      "/test": { get: "x_http:get", post: "x_http:post" },
      "/test/:id": { put: "x_http:put", delete: "x_http:delete" }
    }
  });
  // Set base url
  const chai = Chai.request("http://localhost:9999");

  // Init test app
  const app = App();

  // Register XHttp
  app.use(XHttp);

  before(done => {
    app.add("x_http:get", function(args, done) {
      const { body } = args;
      return done(null, { data$: { body } });
    });
    app.add("x_http:post", function(args, done) {
      const { body } = args;
      return done(null, { data$: { body } });
    });
    app.add("x_http:put", function(args, done) {
      const { params, body } = args;
      return done(null, { data$: { params, body } });
    });
    app.add("x_http:delete", function(args, done) {
      const { params } = args;
      return done(null, { data$: { params } });
    });

    app.ready(() => done());
  });

  it("DEFAULT", function(done) {
    chai
      .get("/")
      .then(function(res) {
        expect(res).to.have.status(200);
        console.log(res);
      })
      .catch(done);
  });
});
