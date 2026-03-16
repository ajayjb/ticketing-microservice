import { Document, Model, Query, Schema, Types, model } from "mongoose";
import slugify from "slugify";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

export const DOCUMENT_NAME = "Ticket";
export const COLLECTION_NAME = "tickets";

export interface TicketAttr {
  name: string;
  price: number;
  createdBy: string;
}

export interface TicketDoc extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  price: number;
  createdBy: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  version: number;
  orderId: Types.ObjectId | null;
}

export interface TicketModel extends Model<TicketDoc> {
  build: (attr: TicketAttr) => TicketDoc;
}

const schema = new Schema<TicketDoc, TicketModel>(
  {
    name: { type: Schema.Types.String, required: true, unique: true },
    slug: { type: Schema.Types.String, unique: true },
    price: { type: Schema.Types.Number, required: true },
    createdBy: { type: Schema.Types.ObjectId, required: true },
    isDeleted: { type: Schema.Types.Boolean, default: false },
    orderId: { type: Schema.Types.ObjectId, default: null },
  },
  {
    timestamps: true,
    autoIndex: true,
    toJSON: {
      transform: (doc, ret: Record<string, any>) => {
        ret.id = ret._id;
        delete ret.__v;
        delete ret._id;
        return ret;
      },
    },
  }
);

schema.plugin(updateIfCurrentPlugin as any);
schema.set("versionKey", "version");

schema.statics.build = (attr: TicketAttr) => new Ticket(attr);

schema.pre("save", function (next) {
  if (this.isModified("name")) {
    this.set("slug", slugify(this.get("name"), { lower: true, strict: true }));
  }
  next();
});

function preUpdate(this: Query<any, any>, next: () => void) {
  const update: any = this.getUpdate();

  const nameToSlug = update?.name || update?.$set?.name;

  if (nameToSlug) {
    const slug = slugify(nameToSlug, {
      lower: true,
      strict: true,
    });

    if (update?.$set) {
      update.$set.slug = slug;
    } else {
      update.slug = slug;
    }

    this.setUpdate(update);
  }

  next();
}

schema.pre("findOneAndUpdate", preUpdate);
schema.pre("updateOne", preUpdate);

const Ticket = model<TicketDoc, TicketModel>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME
);

export default Ticket;
