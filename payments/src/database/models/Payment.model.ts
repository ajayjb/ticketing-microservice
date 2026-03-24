import { Document, Model, Schema, Types, model } from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

export const DOCUMENT_NAME = "Payment";
export const COLLECTION_NAME = "Payments";

export enum PAYMENT_STATUS {
  PENDING = "pending",
  SUCCEEDED = "succeeded",
  FAILED = "failed",
  CANCELLED = "cancelled",
}
export interface PaymentAttr {
  orderId: string;
  intentId: string;
  clientSecret: string | null;
  amount: number;
  currency: string;
  chargeId?: string;
}

export interface PaymentDoc extends Document {
  _id: Types.ObjectId;
  orderId: Types.ObjectId;
  intentId: string;
  clientSecret: string | null;
  chargeId: string;
  status: PAYMENT_STATUS;
  amount: number;
  currency: string;
  isDeleted: boolean;
  version: number;
}

export interface PaymentModel extends Model<PaymentDoc> {
  build: (attr: PaymentAttr) => PaymentDoc;
}

const schema = new Schema<PaymentDoc, PaymentModel>(
  {
    orderId: { type: Schema.Types.ObjectId, required: true },
    intentId: { type: Schema.Types.String, required: true },
    clientSecret: { type: Schema.Types.String, required: true },
    chargeId: { type: Schema.Types.String, default: null },
    status: {
      type: String,
      enum: Object.values(PAYMENT_STATUS),
      default: PAYMENT_STATUS.PENDING,
    },
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

schema.plugin(updateIfCurrentPlugin as any);
schema.set("versionKey", "version");

schema.statics.build = (attr: PaymentAttr) => new Payment(attr);

const Payment = model<PaymentDoc, PaymentModel>(
  DOCUMENT_NAME,
  schema,
  COLLECTION_NAME
);

export default Payment;
