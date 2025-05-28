import { Password } from "@ajayjbtickets/common";
import { Document, Model, Schema, Types, model } from "mongoose";

export const DOCUMENT_NAME = "User";
export const COLLECTION_NAME = "users";

export type UserAttr = {
  firstName: string;
  middleName?: string;
  lastName?: string;
  email: string;
  password: string;
};

export interface UserDoc extends Document {
  _id: Types.ObjectId;
  firstName: string;
  middleName?: string;
  lastName?: string;
  email: string;
  password: string;
  createdAt: string;
  updatedAt: string;
}

interface UserModel extends Model<UserDoc> {
  build: (attrs: UserAttr) => UserDoc;
}

const schema = new Schema<UserDoc>(
  {
    firstName: {
      type: Schema.Types.String,
      required: true,
    },
    middleName: {
      type: Schema.Types.String,
    },
    lastName: {
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

schema.statics.build = (attrs: UserAttr) => new User(attrs);

schema.pre("save", async function (next) {
  if (this.isDirectModified("password")) {
    this.set("password", await Password.hashPassword(this.get("password")));
  }
  next();
});

const User = model<UserDoc, UserModel>(DOCUMENT_NAME, schema, COLLECTION_NAME);

export default User;
