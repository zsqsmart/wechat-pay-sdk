import mongoose, { Schema, model } from 'mongoose';
import { WechatTradeStateEnum } from 'wx-node-sdk';

const OrderSchema = new Schema(
  {
    //产品ID 产品外键 存放的是产品的主键，
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    amount: { type: Number, required: true }, // 订单总金额
    codeUrl: { type: String }, // 支付的二维码
    status: { type: String, default: WechatTradeStateEnum.NOT_PAY }, // 订单状态
    transactionId: String, // 微信支付系统生成的订单号
  },
  { timestamps: true },
);
OrderSchema.virtual('id').get(function () {
  return this._id.toHexString();
});
OrderSchema.set('toJSON', {
  virtuals: true,
});
OrderSchema.set('toObject', {
  virtuals: true,
});

export interface IOrder {
  id: string;
  product: string;
  amount: number;
  codeUrl: string;
  status: WechatTradeStateEnum;
}

const Order = model<IOrder>('Order', OrderSchema);
export { Order };
