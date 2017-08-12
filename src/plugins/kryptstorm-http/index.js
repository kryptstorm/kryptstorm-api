// Default options of this plugin
const defaultOptions = {
  routes: { "/": "x_http:index" }
};

// Seneca plugin
export default function XHttp(options) {
  // Extend user options with default options
  options = _.merge(defaultOptions, options);

  // Init function
  this.add("init:XHttp", function initXHttp(args, done) {
    return done();
  });

  // Default pattern for index route
  this.add("x_http:index", function(args, done) {
    done(null, { data$: { Hello: "World!" } });
  });

  // You must return service name, it must is the name you registered on init function
  return { name: "XHttp" };
}
