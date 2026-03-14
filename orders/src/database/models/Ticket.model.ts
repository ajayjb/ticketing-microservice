import { Document, Model, Schema, model, Types } from "mongoose";
import Order from "./Order.model";
import { OrderStatus } from "@ajayjbtickets/common";

export const DOCUMENT_NAME = "Ticket";
export const COLLECTION_NAME = "tickets";

export interface TicketAttr {
  id: string;
  name: string;
  slug: string;
  price: number;
}

export interface TicketDoc extends Document {
  name: string;
  slug: string;
  price: number;
  isReserved: (userId: Types.ObjectId) => Promise<boolean>;
}

export interface TicketModel extends Model<TicketDoc> {
  build: (attr: TicketAttr) => TicketDoc;
}

const schema = new Schema<TicketDoc, TicketModel>(
  {
    name: { type: Schema.Types.String, required: true, unique: true },
    slug: { type: Schema.Types.String, unique: true },
    price: { type: Schema.Types.Number, required: true },
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

schema.statics.build = (attr: TicketAttr) =>
  new Ticket({
    _id: attr.id,
    name: attr.name,
    slug: attr.slug,
    price: attr.price,
  });
schema.methods.isReserved = async function (userId: Types.ObjectId) {
  return await Order.exists({
    userId: userId,
    ticket: this._id,
    status: {
      $in: [
        OrderStatus.Created,
        OrderStatus.Complete,
        OrderStatus.AwaitingPayment,
      ],
    },
  });
};

const Ticket = model<TicketDoc, TicketModel>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME
);

export default Ticket;
