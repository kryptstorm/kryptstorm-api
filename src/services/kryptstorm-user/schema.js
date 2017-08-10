import Ajv from "ajv";

// User statuses
export const STATUS_NEW = 0;
export const STATUS_ACTIVE = 1;
export const STATUS_LOCKED = 2;

// Public field can return to client
export const PUBLIC_FIELDS = [
  "username",
  "email",
  "status",
  "firstName",
  "lastName",
  "createdAt"
];

// Schema on create user
const onCreate = {
  $id: "XUser.OnCreate",
  required: ["username", "email", "password", "status"],
  properties: {
    username: { type: "string", minLength: 3, maxLength: 255 },
    email: { format: "email" },
    password: { type: "string", minLength: 3, maxLength: 255 },
    status: {
      type: "number",
      enum: [STATUS_NEW, STATUS_ACTIVE]
    },
    firstName: { type: "string", maxLength: 255 },
    lastName: { type: "string", maxLength: 255 },
    createdAt: { format: "date-time" }
  }
};

// Schema on update user
const onUpdate = {
  $id: "XUser.OnUpdate",
  required: ["id"],
  properties: {
    id: { type: "string", pattern: "/^[a-fA-F0-9]{24}$/i" },
    password: { type: "string", minLength: 3, maxLength: 255 },
    status: {
      type: "number",
      enum: [STATUS_NEW, STATUS_ACTIVE, STATUS_LOCKED]
    },
    firstName: { type: "string", maxLength: 255 },
    lastName: { type: "string", maxLength: 255 }
  }
};

// Schema on delete user
const onDetele = {
  $id: "XUser.OnDelete",
  required: ["id"],
  properties: {
    id: { type: "string", pattern: "/^[a-fA-F0-9]{24}$/i" }
  }
};

// Export validator
export default new Ajv({
  removeAdditional: "all",
  schemas: [onCreate, onUpdate, onDetele]
});
