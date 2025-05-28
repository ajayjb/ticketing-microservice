import { Document, Model, Query, Schema, Types, model } from "mongoose";
import slugify from "slugify";

export const DOCUMENT_NAME = "Ticket";
export const COLLECTION_NAME = "tickets";

export interface TicketAttr {
  name: string;
  price: number;
  userId: string;
}

export interface TicketDoc extends Document {
  name: string;
  slug: string;
  price: number;
  userId: Types.ObjectId;
  createdAt: string;
  updatedAt: string;
}

export interface TicketModel extends Model<TicketDoc> {
  build: (attr: TicketAttr) => TicketDoc;
}

const schema = new Schema<TicketDoc>(
  {
    name: { type: Schema.Types.String, required: true, unique: true },
    slug: { type: Schema.Types.String, unique: true },
    price: { type: Schema.Types.Number, required: true },
    userId: { type: Schema.Types.ObjectId, required: true },
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

schema.statics.build = (attr: TicketAttr) => new Ticket(attr);

schema.pre("save", function (next) {
  if (this.isDirectModified("name")) {
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
