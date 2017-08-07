// External modules
import _ from "lodash";
import Bluebird from "bluebird";
import Axios from "axios";

// Default options of this plugin
const defaultOptions = {
  maps: {},
  allowMethods: ["POST", "GET", "PUT", "DELETE"] // CRUD - POST, GET, PUT, DELETE
};

// Seneca plugin
export default function XService(options) {
  // Merge the options of user with plugin options
  // User's options have more important than plugin options
  // We don't want modify "defaultOptions",
  // so write  _.assign({}, defaultOptions.maps, options.maps) instead of  _.assign(defaultOptions.maps, options.maps)
  const _maps = _.isObject(options.maps)
    ? _.assign({}, defaultOptions.maps, options.maps)
    : {};
  const _allowMethods = _.isArray(options.allowMethods)
    ? _.uniq([...defaultOptions.allowMethods, ...options.allowMethods])
    : defaultOptions.allowMethods;

  // Make seneca.act return a promise
  const act = Bluebird.promisify(this.act, { context: this });

  // XService method
  const XService$ = {
    act: (pattern, patternParams) => {
      const _externalPattern = _maps[pattern];
      // Because the map only receive a string as a key
      // So, if the pattern is not a string, it is original seneca pattern (use object)
      // Just return the original action, simple!!! :)
      if (!_.isString(pattern) || !_externalPattern) {
        return act(pattern, patternParams);
      }

      // We need to call an external service
      const {
        method = "GET",
        url,
        mapper,
        query,
        params,
        data
      } = _externalPattern;
      // Only handle allow method
      if (!_.includes(_allowMethods, method)) {
        return Bluebird.reject(
          new Error(
            `The method ${method} is not allow. Only accept: ` +
              _allowMethods.join(",")
          )
        );
      }

      // Tranform response to our format
      let transformResponse = [];
      if (_.isFunction(mapper)) {
        transformResponse.push(mapper);
      }

      if (method === "GET") {
        return Axios.get(url, { transformResponse }).then(({ data }) =>
          Bluebird.resolve(data)
        );
      }
    }
  };

  // Inject our method to seneca
  this.decorate("XService$", XService$);

  // Init function
  this.add("init:XService", function initServices(args, done) {
    return done();
  });

  // You must return service name, it must is the name you registered on init function
  return { name: "XService" };
}
