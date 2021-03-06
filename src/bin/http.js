// External modules
import XHttp from "kryptstorm-http";

// Internal modules
import app from "..";
import routes from "./routes";

// Register XHttp
app.use(XHttp, { routes, isDebug: process.env.NODE_ENV !== "production" });

app.ready(() => {
  const server = app.export("XHttp/server");
  server.listen(process.env.PORT || 9999, () =>
    console.log("Server is ready to handle connection")
  );
});
