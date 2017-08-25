// External modules
import _ from "lodash";
import Bcrypt from "bcrypt";

// Internal modules
import Validator, { PUBLIC_FIELDS } from "./schema";

// Default options of this plugin
const defaultOptions = {
  entity: ["mongo", "kryptstorm", "users"]
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
    const { attributes } = args;
    const entity = this.make$.apply(null, options.entity);

    // Add creattion datetime
    attributes.createdAt = new Date();

    // Validation has been failed
    if (!Validator.validate("XUser.OnCreate", attributes)) {
      return done(null, {
        errorCode$: "VALIDATION_FAILED",
        errors$: Validator.errors,
        message$: Validator.errorsText()
      });
    }

    // Set attributes
    // After validation, attributes is clean because of options "removeAdditional"
    _.assign(entity, attributes);

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
        errors$: Validator.errors,
        message$: Validator.errorsText()
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

    // Convert some fields to right data type
    if (!_.isUndefined(query.status)) {
      query.status = Number(query.status);
    }

    // Validation has been failed
    if (!Validator.validate("XUser.OnFindAll", query)) {
      return done(null, {
        errorCode$: "VALIDATION_FAILED",
        errors$: Validator.errors,
        message$: Validator.errorsText()
      });
    }

    entity
      .asyncList$(_.assign({}, query, { fields$: PUBLIC_FIELDS }))
      .then(entities => done(null, { data$: entities }))
      .catch(done);
  });

  this.add("x_user:update_by_id", function(args, done) {
    const { params, attributes } = args;
    const entity = this.make$.apply(null, options.entity);

    // Add creattion datetime
    attributes.updatedAt = new Date();

    // Validation has been failed
    if (!Validator.validate("XUser.OnFindById", params)) {
      return done(null, {
        errorCode$: "VALIDATION_FAILED",
        errors$: Validator.errors,
        message$: Validator.errorsText()
      });
    }
    if (!Validator.validate("XUser.OnUpdate", attributes)) {
      return done(null, {
        errorCode$: "VALIDATION_FAILED",
        errors$: Validator.errors,
        message$: Validator.errorsText()
      });
    }

    entity
      .asyncLoad$(_.assign({}, params, { fields$: PUBLIC_FIELDS }), true)
      .then(entity => {
        // Set attributes
        // After validation, attributes is clean because of options "removeAdditional"
        _.assign(entity, attributes);

        // Format some fields
        entity.firstName = _.upperFirst(_.toLower(entity.firstName));
        entity.lastName = _.upperFirst(_.toLower(entity.lastName));

        // Save attributes
        return entity.asyncSave$({ fields$: PUBLIC_FIELDS });
      })
      .then(attributes => done(null, { data$: attributes }))
      .catch(done);
  });

  this.add("x_user:delete_by_id", function(args, done) {
    const { params } = args;
    const entity = this.make$.apply(null, options.entity);

    // Validation has been failed
    if (!Validator.validate("XUser.OnDetele", params)) {
      return done(null, {
        errorCode$: "VALIDATION_FAILED",
        errors$: Validator.errors,
        message$: Validator.errorsText()
      });
    }

    entity
      .asyncRemove$(_.assign({}, params, { fields$: PUBLIC_FIELDS }), true)
      .then(attributes => done(null, { data$: attributes }))
      .catch(done);
  });

  // You must return service name, it must is the name you registered on init function
  return { name: "XUser" };
}
