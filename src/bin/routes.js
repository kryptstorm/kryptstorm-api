export default {
  "/users": { get: "x_user:find_all", post: "x_user:create" },
  "/users/:id": {
    get: "x_user:find_by_id",
    post: "x_user:update_by_id",
    delete: "x_user:delete_by_id"
  }
};
