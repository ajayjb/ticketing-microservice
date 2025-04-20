import { Document, Model, Schema, Types, model } from "mongoose";

import Password from "@/services/password.service";

export const DOCUMENT_NAME = "User";
export const COLLECTION_NAME = "users";

export type UserAttr = {
  first_name: string;
  middle_name?: string;
  last_name?: string;
  email: string;
  password: string;
};

export interface UserDocType extends Document {
  _id: Types.ObjectId;
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
    autoIndex: true,
    toJSON: {
      transform: (doc, ret: Record<string, any>) => {
        ret.id = ret._id;
        delete ret.password;
        delete ret.__v;
        delete ret._id;
        return ret;
      },
    },
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
