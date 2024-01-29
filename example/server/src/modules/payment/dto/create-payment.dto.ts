export class CreatePaymentDto {}

// 微信 native 支付结果通知
// https://pay.weixin.qq.com/docs/merchant/apis/native-payment/payment-notice.html
export class WechatPayNativeNoticeDto {
  id: string;
  // 通知创建的时间，遵循rfc3339标准格式，格式为yyyy-MM-DDTHH:mm:ss+TIMEZONE，yyyy-MM-DD表示年月日，T出现在字符串中，表示time元素的开头，HH:mm:ss.表示时分秒，TIMEZONE表示时区（+08:00表示东八区时间，领先UTC 8小时，即北京时间）。例如：2015-05-20T13:29:35+08:00表示北京时间2015年05月20日13点29分35秒
  create_time: string;
  // 通知的类型，支付成功通知的类型为TRANSACTION.SUCCESS。
  event_type: string;
  // 通知的资源数据类型，支付成功通知为encrypt-resource。
  resource_type: string;
  // 通知资源数据。
  resource: {
    // 对开启结果数据进行加密的加密算法，目前只支持AEAD_AES_256_GCM
    algorithm: string;
    // Base64编码后的开启/停用结果数据密文。
    ciphertext: string;
    // 附加数据。
    associated_data?: string;
    // 原始回调类型，为transaction。
    original_type: string;
    // 加密使用的随机串。
    nonce: string;
  };
  // 回调摘要
  summary: string;
}

export class WechatPayNativeNoticeHeaders {
  'wechatpay-nonce': string;
  'wechatpay-signature': string;
  'wechatpay-timestamp': string;
  'wechatpay-serial': string;
}
