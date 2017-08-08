// External modules
import Bluebird from "bluebird";
import _ from "lodash";

// Default options of this plugin
const defaultOptions = {
  limit$: 20, // Default limit of entity result (use for asyncList$)
  fields$: ["id"] // Default return fields
};

export default function XEntity(options) {
  // Merge the options of user with plugin options
  // User's options have more important than plugin options
  const _limit =
    _.isNumber(options.limit$) && options.limit$ > 0
      ? options.limit$
      : defaultOptions.limit$;
  const _fields =
    _.isArray(options.fields$) && !_.isEmpty(options.fields$)
      ? options.fields$
      : defaultOptions.fields$;

  // Retrive Seneca Enitty
  const Entity = this.private$.exports.Entity.prototype;

  /**
	 * Assume you have an entity, let enity = this.make$("dog");
	 * enity.fields$ is a FUNCTION return what should be saved to entity
	 * 
	 * @param {object} opts 
	 * - opts.fields$ <Array> what fields should be return after saved
	 * @param {bool} returnEntity Return enitty instance instead of entity object
	 */
  Entity.asyncSave$ = function asyncSave$(opts = {}, returnEntity = false) {
    // Resolve options
    if (!_.isArray(opts.fields$) || _.isEmpty(opts.fields$)) opts.fields$ = [];

    // Create async method for seneca.entity.save$
    const _asyncSave$ = Bluebird.promisify(Entity.save$, {
      context: this
    });

    // Return entity instance instead of entity object
    if (returnEntity) {
      return _asyncSave$();
    }

    // Save and return entity object
    return _asyncSave$().then(ent =>
      Bluebird.resolve(_formatEntity(ent, [..._fields, ...opts.fields$]))
    );
  };

  Entity.asyncLoad$ = function asyncLoad$(query = {}, returnEntity = false) {
    // Resolve query
    if (!_.isObject(query)) query = {};
    if (!_.isArray(query.fields$) || _.isEmpty(query.fields$)) {
      query.fields$ = _fields;
    }

    // Create async method for seneca.entity.load$
    const _asyncLoad$ = Bluebird.promisify(Entity.load$, {
      context: this
    });

    // Return entity instance instead of entity object
    if (returnEntity) return _asyncLoad$(query);

    // Return entity object
    return _asyncLoad$(query).then(ent => Bluebird.resolve(_formatEntity(ent)));
  };

  this.add("init:XEntity", function initXEntity(args, done) {
    return done();
  });

  return { name: "XEntity" };
}

const _formatEntity = (ent, fields$) => {
  let result = {},
    attributes;

  // Invalid entity
  if (!_.isObject(ent) || _.isEmpty(ent)) return result;

  // ent is seneca entity
  if (typeof ent.data$ === "function") {
    attributes = ent.data$();
  } else {
    // Result of remove function is a mongo object, convert it to entity-like
    attributes = _.merge(ent, { id: ent._id.toString() });
  }

  // Only return fields has been defined on fields$ if fields$ is defined
  const _attributes = _.isArray(fields$)
    ? _.pick(attributes, fields$)
    : attributes;
  // Only get public propeties
  _.each(
    _attributes,
    (v, c) => (!_.includes(c, "$") ? (result[c] = v) : result)
  );

  return result;
};
