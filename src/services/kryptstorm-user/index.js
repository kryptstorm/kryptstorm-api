// External modules
import _ from "lodash";
import Bcrypt from "bcrypt";

// Internal modules
import Validator, { PUBLIC_FIELDS } from "./schema";

// Default options of this plugin
const defaultOptions = {
  entity: ["mongo", "kryptstorm", "user"]
};

// Seneca plugin
export default function XUser(options) {
  // Extend user options with default options
  options = _.merge(defaultOptions, options);

  // Init function
  this.add("init:XUser", function initXUser(args, done) {
    return done();
  });

  this.add("x_user:create", function(args, done) {
    const { body } = args;
    const entity = this.make$.apply(null, options.entity);

    // Add creattion datetime
		body.createdAt = new Date();
		
    // Validation has been failed
    if (!Validator.validate("XUser.OnCreate", body)) {
      return done(null, {
        errorCode$: "VALIDATION_FAILED",
        errors$: Validator.errors
      });
    }

    // Set attributes
    // After validation, body is clean because of options "removeAdditional"
    _.assign(entity, body);

    // Format some fields
    entity.username = _.toLower(entity.username);
    entity.email = _.toLower(entity.email);

    // Hash password
    Bcrypt.hash(entity.password, 9)
      .then(hash => {
        // Hash password is successful
        entity.password = hash;
        // Save attributes
        return entity.asyncSave$({ fields$: PUBLIC_FIELDS });
      })
      .then(attributes => done(null, { data$: attributes }))
      .catch(done);
  });

  // You must return service name, it must is the name you registered on init function
  return { name: "XUser" };
}
