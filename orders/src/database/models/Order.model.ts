import { OrderStatus } from "@ajayjbtickets/common";
import { Document, Model, Schema, Types, model } from "mongoose";

export const DOCUMENT_NAME = "Order";
export const COLLECTION_NAME = "orders";

export interface OrderAttr {
  userId: string;
  expiresAt: Date;
  ticket: Types.ObjectId;
}

export interface OrderDoc extends Document {
  _id: Types.ObjectId; 
  userId: Types.ObjectId;
  status: OrderStatus;
  expiresAt: Date;
  ticket: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  version: number
}

export interface OrderModel extends Model<OrderDoc> {
  build: (attr: OrderAttr) => OrderDoc;
}

const schema = new Schema<OrderDoc, OrderModel>(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    status: {
      type: Schema.Types.String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
    },
    expiresAt: { type: Schema.Types.Date, required: true },
    ticket: { type: Schema.Types.ObjectId, required: true, ref: "Ticket" },
    isDeleted: { type: Schema.Types.Boolean, default: false },
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

schema.statics.build = (attr: OrderAttr) => new Order(attr);

const Order = model<OrderDoc, OrderModel>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME
);

export default Order;
