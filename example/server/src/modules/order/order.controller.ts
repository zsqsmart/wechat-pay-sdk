import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { WechatTradeStateEnum } from 'wx-node-sdk';
import { wechatPay } from 'src/utils/wechat-pay';

@Controller('order')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  create(@Body() createOrderDto: CreateOrderDto) {
    return this.orderService.create(createOrderDto);
  }

  @Get()
  findAll() {
    return this.orderService.findAll();
  }

  /**
   * 查询订单状态
   * @param id 订单 ID
   * @returns 订单状态
   */
  @Get(':id/status')
  async getOrderStatus(@Param('id') id: string) {
    const order = await this.orderService.findOne(id);
    // 未支付状态,主动请求微信查询一下
    if (order.status === WechatTradeStateEnum.NOT_PAY) {
      const { data: trade } = await wechatPay.queryTrade(order.id);
      order.status = trade.trade_state;
      await order.save();
    }
    return { status: order.status }; // 返回订单状态
  }

  /**
   * 关闭订单
   * @param id 订单 ID
   */
  @Patch(':id/close')
  async closeOrder(@Param('id') id: string) {
    const order = await this.orderService.findOne(id);

    if (!order) {
      throw new NotFoundException('订单不存在');
    }
    await wechatPay.closeTrade(order.id);
    const { data: trade } = await wechatPay.queryTrade(order.id);
    const newStatus = trade.trade_state;
    order.status = newStatus;
    await order.save();
    if (newStatus === WechatTradeStateEnum.CLOSED) {
      return {
        message: '关闭成功',
      };
    }
    throw new HttpException('订单关闭失败', HttpStatus.NOT_ACCEPTABLE);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.orderService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
    return this.orderService.update(id, updateOrderDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.orderService.remove(id);
  }
}
