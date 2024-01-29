import { WechatTradeStateEnum } from '@pay/wechat';

export const ORDER_STATUS_DIC = {
  [WechatTradeStateEnum.SUCCESS]: '支付成功',
  [WechatTradeStateEnum.REFUND]: '转入退款',
  [WechatTradeStateEnum.NOT_PAY]: '未支付',
  [WechatTradeStateEnum.CLOSED]: '已关闭',
  [WechatTradeStateEnum.REVOKED]: '已撤销（仅付款码支付会返回）',
  [WechatTradeStateEnum.USER_PAYING]: '用户支付中（仅付款码支付会返回）',
  [WechatTradeStateEnum.PAY_ERROR]: '支付失败（仅付款码支付会返回）',
};
