import { Document, Model, Schema, model, Types } from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

import Order from "@/database/models/Order.model";
import { OrderStatus, TicketUpdatedEvent } from "@ajayjbtickets/common";

export const DOCUMENT_NAME = "Ticket";
export const COLLECTION_NAME = "tickets";

export interface TicketAttr {
  id: string;
  name: string;
  slug: string;
  price: number;
}

export interface TicketDoc extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  price: number;
  isReserved: (userId: Types.ObjectId) => Promise<boolean>;
  version: number;
}

export interface TicketModel extends Model<TicketDoc> {
  build: (attr: TicketAttr) => TicketDoc;
  findByEvent: (data: TicketUpdatedEvent["data"]) => Promise<TicketDoc | null>;
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

schema.plugin(updateIfCurrentPlugin as any);
schema.set("versionKey", "version");

schema.statics.build = (attr: TicketAttr) =>
  new Ticket({
    _id: attr.id,
    name: attr.name,
    slug: attr.slug,
    price: attr.price,
  });

schema.statics.findByEvent = async function (data: TicketUpdatedEvent["data"]) {
  const ticket = await this.findOne({
    _id: new Types.ObjectId(data.id),
    version: data.version - 1,
  });

  return ticket;
};

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
