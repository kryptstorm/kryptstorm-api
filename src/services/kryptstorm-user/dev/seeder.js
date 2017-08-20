/** Ensure you only run this file on development mode */
if (process.env.NODE_ENV !== "development") {
  console.log(`Cannot run this file at env: ${process.env.NODE_ENV}`);
  process.exit(0);
}

// External modules
import Faker from "faker";
import Seneca from "seneca";
import Bluebird from "bluebird";
import XService from "kryptstorm-service";
import XEntity from "kryptstorm-entity";
import Bcrypt from "bcrypt";
import _ from "lodash";

// Internal modules
import {
  PUBLIC_FIELDS,
  STATUS_NEW,
  STATUS_ACTIVE,
  STATUS_LOCKED
} from "../schema";

// Status list
const statuses = [STATUS_NEW, STATUS_ACTIVE, STATUS_LOCKED];
// Defined faker function
const faker = (num = 249, overwriteAttributes) => {
  let result = [],
    usernames = [],
    emails = [];

  while (num > 0) {
    let user = {
      username: _.toLower(Faker.internet.userName()),
      email: _.toLower(Faker.internet.email()),
      password: Bcrypt.hashSync("123456", 12),
      firstName: Faker.name.firstName(),
      lastName: Faker.name.lastName(),
      status: statuses[Math.floor(Math.random() * statuses.length)],
      createdAt: Faker.date.past(),
      updatedAt: Faker.date.recent()
    };

    // Make sure username and email is exist
    if (
      _.includes(usernames, user.username) ||
      _.includes(emails, user.email)
    ) {
      return false;
    }

    // Overwrite attributes by attrbites provide by user
    _.assign(user, overwriteAttributes);

    // Store user
    result.push(user);

    // Finish 1 user
    num--;
  }

  return result;
};

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

app.ready(() => {
  app
    .make$("mongo", "kryptstorm", "user")
    .asyncNative$()
    .then(conn => {
      const kryptstorm_users = conn.collection("kryptstorm_users");
      return kryptstorm_users.insertMany(faker());
    })
    .then(r => {
      console.log(`Insert ${r.insertedCount} documents.`);
      process.exit(0);
    })
    .catch(err => {
      console.log(err.message);
      process.exit(1);
    });
});
