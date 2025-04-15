import { Document, Model, Schema, model } from "mongoose";
import Password from "../../services/password.js";

export const DOCUMENT_NAME = "User";
export const COLLECTION_NAME = "users";

type UserAttr = {
  first_name: string;
  middle_name?: string;
  last_name?: string;
  email: string;
  password: string;
};

interface UserDocType extends Document {
  first_name: string;
  middle_name?: string;
  last_name?: string;
  email: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

interface UserModel extends Model<UserDocType> {
  build: (attrs: UserAttr) => UserDocType;
}

const schema = new Schema<UserDocType>(
  {
    first_name: {
      type: Schema.Types.String,
      required: true,
    },
    middle_name: {
      type: Schema.Types.String,
    },
    last_name: {
      type: Schema.Types.String,
    },
    email: {
      type: Schema.Types.String,
      required: true,
    },
    password: { type: Schema.Types.String, required: true },
  },
  {
    timestamps: true,
  }
);

schema.statics.build = (attrs: UserAttr) => {
  return new User(attrs);
};

schema.pre("save", async function (next) {
  if (this.isDirectModified("password")) {
    this.set("password", await Password.hashPassword(this.get("password")));
  }
  next();
});

const User = model<UserDocType, UserModel>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME
);

export default User;
