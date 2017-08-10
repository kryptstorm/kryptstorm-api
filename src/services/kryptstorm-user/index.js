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

  // Create new user
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
    entity.firstName = _.upperFirst(_.toLower(entity.firstName));
    entity.lastName = _.upperFirst(_.toLower(entity.lastName));

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

  // Find a user by id
  this.add("x_user:find_by_id", function(args, done) {
    const { params } = args;
    const entity = this.make$.apply(null, options.entity);

    // Validation has been failed
    if (!Validator.validate("XUser.OnFindById", params)) {
      return done(null, {
        errorCode$: "VALIDATION_FAILED",
        errors$: Validator.errors
      });
    }

    entity
      .asyncLoad$(_.assign({}, params, { fields$: PUBLIC_FIELDS }))
      .then(attributes => done(null, { data$: attributes }))
      .catch(done);
  });

  this.add("x_user:find_all", function(args, done) {
    const { query } = args;
    const entity = this.make$.apply(null, options.entity);

    // Validation has been failed
    if (!Validator.validate("XUser.OnFindAll", query)) {
      return done(null, {
        errorCode$: "VALIDATION_FAILED",
        errors$: Validator.errors
      });
    }

    entity
      .asyncList$(_.assign({}, query, { fields$: PUBLIC_FIELDS }))
      .then(entities => done(null, { data$: entities }))
      .catch(done);
  });

  this.add("x_user:update_by_id", function(args, done) {
    const { params, body } = args;
    const entity = this.make$.apply(null, options.entity);

    // Add creattion datetime
    body.updatedAt = new Date();

    // Validation has been failed
    if (!Validator.validate("XUser.OnFindById", params)) {
      return done(null, {
        errorCode$: "VALIDATION_FAILED",
        errors$: Validator.errors
      });
    }
    if (!Validator.validate("XUser.OnUpdate", body)) {
      return done(null, {
        errorCode$: "VALIDATION_FAILED",
        errors$: Validator.errors
      });
    }

    entity
      .asyncLoad$(_.assign({}, params, { fields$: PUBLIC_FIELDS }), true)
      .then(entity => {
        // Set attributes
        // After validation, body is clean because of options "removeAdditional"
        _.assign(entity, body);

        // Format some fields
        entity.firstName = _.upperFirst(_.toLower(entity.firstName));
        entity.lastName = _.upperFirst(_.toLower(entity.lastName));

        // Save attributes
        return entity.asyncSave$({ fields$: PUBLIC_FIELDS });
      })
      .then(attributes => done(null, { data$: attributes }))
      .catch(done);
  });

  // You must return service name, it must is the name you registered on init function
  return { name: "XUser" };
}
