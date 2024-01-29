import { Injectable } from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from 'src/utils/services/mongo/models/order';
import { wechatPay } from 'src/utils/wechat-pay';
import { OrderEntity } from './entities/order.entity';

@Injectable()
export class OrderService {
  async create(createOrderDto: CreateOrderDto) {
    let order = await Order.create({
      ...createOrderDto,
    });
    order = await order.save();
    // FIXME: 类型问题
    const codeUrl = await this.nativeTransaction(
      order as unknown as OrderEntity,
    );
    order.codeUrl = codeUrl;
    await order.save();
    return order;
  }

  async nativeTransaction(order: OrderEntity) {
    const result = await wechatPay.nativeTransaction({
      description: '购买商品',
      outTradeNo: order.id,
      amount: order.amount,
    });

    return result.code_url;
  }

  findAll() {
    return Order.find().populate('product').sort({ _id: -1 });
  }

  findOne(id: string) {
    return Order.findById(id);
  }

  update(id: string, updateOrderDto: UpdateOrderDto) {
    return Order.findByIdAndUpdate(
      id,
      {
        ...updateOrderDto,
      },
      { new: true, runValidators: true },
    );
  }

  remove(id: string) {
    return Order.findByIdAndDelete(id);
  }
}
