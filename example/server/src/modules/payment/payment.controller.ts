import { Controller, Post, Body, Headers } from '@nestjs/common';
import { PaymentService } from './payment.service';
import {
  WechatPayNativeNoticeDto,
  WechatPayNativeNoticeHeaders,
} from './dto/create-payment.dto';
import { wechatPay } from 'src/utils/wechat-pay';
import { logger } from 'src/utils/services/logger';
import { Order } from 'src/utils/services/mongo/models/order';
import { WechatTradeStateEnum } from '@pay/wechat';

interface WechatTradeInfo {
  appid: string;
  mchid: string;
  out_trade_no: string;
  trade_state: WechatTradeStateEnum;
  // 微信支付系统生成的订单号
  transaction_id: string;
}

@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  @Post('/native/notice')
  async handleCallback(
    @Body() noticeDto: WechatPayNativeNoticeDto,
    @Headers() headers: WechatPayNativeNoticeHeaders,
  ) {
    try {
      const timestamp = +headers['wechatpay-timestamp'];
      const nonceStr = headers['wechatpay-nonce'];
      // 证书编号
      const serialNo = headers['wechatpay-serial'];
      const signature = headers['wechatpay-signature'];
      // 验证签名
      const isValid = await wechatPay.verifySignature({
        timestamp,
        nonceStr,
        body: noticeDto,
        signature,
        serialNo,
      });
      // 解密
      if (!isValid) {
        return {
          code: 'FAIL',
          message: '签名验证失败',
        };
      }
      const tradeInfo: WechatTradeInfo = JSON.parse(
        wechatPay.decrypt({
          ...noticeDto.resource,
        }),
      );

      // 更新订单状态
      await Order.findByIdAndUpdate(tradeInfo.out_trade_no, {
        status: tradeInfo.trade_state,
        transactionId: tradeInfo.transaction_id,
      });

      return {
        code: 'SUCCESS',
      };
    } catch (err) {
      const msg = `支付失败: ${err.message}`;
      logger.error(msg);
      return {
        code: 'FAIL',
        message: msg,
      };
    }
  }
}
