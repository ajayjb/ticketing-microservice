import { OrderStatus } from "@ajayjbtickets/common";
import { Document, Model, Schema, Types, model } from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

export const DOCUMENT_NAME = "Order";
export const COLLECTION_NAME = "orders";

export interface OrderAttr {
  id: string;
  status: string;
  userId: string;
  price: number;
}

export interface OrderDoc extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  status: OrderStatus;
  isDeleted: boolean;
  price: number;
  version: number;
}

export interface OrderModel extends Model<OrderDoc> {
  build: (attr: OrderAttr) => OrderDoc;
}

const schema = new Schema<OrderDoc, OrderModel>(
  {
    userId: { type: Schema.Types.ObjectId, required: true },
    status: {
      type: Schema.Types.String,
      required: true,
      enum: Object.values(OrderStatus),
      default: OrderStatus.Created,
    },
    isDeleted: { type: Schema.Types.Boolean, default: false },
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

schema.statics.build = (attr: OrderAttr) =>
  new Order({
    _id: attr.id,
    status: attr.status,
    userId: attr.userId,
    price: attr.price,
  });

const Order = model<OrderDoc, OrderModel>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME
);

export default Order;
