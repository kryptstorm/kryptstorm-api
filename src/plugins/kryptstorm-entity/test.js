// External modules
import Seneca from "seneca";
import Bluebird from "bluebird";
import { expect } from "chai";

// Internal modules
import XEntity from ".";

// Defined function - what will return test app instance
const App = fn =>
  Seneca({
    log: "test",
    debug: { undead: true }
  }).test(fn);

// Defined basic test
describe("XEntity - Basic", function() {
  let id;
  // Init test app
  const app = App();
  // Use memory store
  app.use("basic");
  // Use seneca-entity
  app.use("entity");

  // Register XEntity
  app.use(XEntity);

  // Before hook for test, all thing you need will be prepare at there
  before(done => {
    // App is ready to test
    app.ready(() => done());
  });

  it("Create", function(done) {
    let dog = app.make$("dogs");
    dog.name = "Mihoo";
    dog.createdAt = new Date();
    dog.status = 1; // LIVE
    dog
      .asyncSave$({ fields$: ["name", "createdAt", "status"] })
      .then(savedDog => {
        // By default, result of asyncSave$ will be convert to object
        expect(savedDog).to.be.an("object");

        // All properties has been saved
        expect(savedDog.name).to.be.equal(dog.name);
        expect(savedDog.createdAt.toString()).to.be.equal(
          dog.createdAt.toString()
        );
        expect(savedDog.status).to.be.equal(dog.status);

        // Id must be auto created
        expect(savedDog.id).to.be.exist;

        // Store id
        id = savedDog.id;
        // Test is successful
        done();
      })
      .catch(done);
  });

  it("Read one row", function(done) {
    let dog = app.make$("dogs");
    dog
      .asyncLoad$({ id })
      .then(loadedDog => {
        // By default, result of asyncLoad$ will be convert to object
        expect(loadedDog).to.be.an("object");

        // All properties has been loaded
        expect(savedDog.name).to.be.exist;
        expect(savedDog.createdAt).to.be.exist;
        expect(savedDog.status).to.be.exist;

        // Test is successful
        done();
      })
      .catch(done);
  });

  it("Read many row", function(done) {
    let dog = app.make$("dogs");
    dog
      .asyncList$({ id })
      .then(loadedDogs => {
        // By default, result of asyncList$ will be convert to array of object
        expect(loadedDogs).to.be.an("array");
        expect(loadedDogs[0]).to.be.an("object");

        // All properties has been loaded
        expect(loadedDogs[0].name).to.be.exist;
        expect(loadedDogs[0].createdAt).to.be.exist;
        expect(loadedDogs[0].status).to.be.exist;

        // Test is successful
        done();
      })
      .catch(done);
  });

  it("Delete", function(done) {
    let dog = app.make$("dogs");
    dog
      .asyncRemove$({ id }) // The second params will make asyncLoad$ return entity instead of object
      .then(removedDog => {
        // By default, result of asyncRemove$ will be convert to object
        expect(removedDog).to.be.an("object");

        // Delete the right entity
        expect(removedDog.id).to.be.equal(id);

        // Test is successful
        done();
      })
      .catch(done);
  });
});
