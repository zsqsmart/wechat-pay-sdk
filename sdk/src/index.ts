import { createDecipheriv, createSign, createVerify } from 'node:crypto';
import axios, { AxiosRequestConfig } from 'axios';
import { Certificate } from '@fidm/x509';

// 微信的交易状态
export const enum WechatTradeStateEnum {
  SUCCESS = 'SUCCESS', // 支付成功
  REFUND = 'REFUND', // 转入退款
  NOT_PAY = 'NOTPAY', // 未支付
  CLOSED = 'CLOSED', // 已关闭
  REVOKED = 'REVOKED', // 已撤销（付款码支付）
  USER_PAYING = 'USERPAYING', // 用户支付中（付款码支付）
  PAY_ERROR = 'PAYERROR', // 支付失败(其他原因，如银行返回失败)
}

export interface Options {
  // 公众号 id
  appid: string;
  // 发起请求的商户（包括直连商户、服务商或渠道商）的商户号
  mchid: string;
  // 商户API证书序列号serial_no，用于声明所使用的证书
  serialNo?: string;
  // 私钥
  privateKey: Buffer;
  // 公钥
  publicKey: Buffer;
  // 微信 api v3 秘钥
  secretKey: string;
  //【通知地址】 异步接收微信支付结果通知的回调地址，通知URL必须为外网可访问的URL，不能携带参数。 公网域名必须为HTTPS，如果是走专线接入，使用专线NAT IP或者私有回调域名可使用HTTP
  notifyUrl: string;
}

interface EncryptCertificate {
  // 【加密证书的算法】 对开启结果数据进行加密的加密算法，目前只支持AEAD_AES_256_GCM。
  algorithm: string;
  // 随机串
  nonce: string;
  // 【加密证书的附加数据】 加密证书的附加数据，固定为“certificate"。
  associated_data?: string;
  // 【加密后的证书内容】 使用API KEY和上述参数，可以解密出平台证书的明文。证书明文为PEM格式。（注意：更换证书时会出现PEM格式中的证书失效时间与接口返回的证书弃用时间不一致的情况）
  ciphertext: string;
}

interface WxCertificate {
  serial_no: string;
  effective_time: string;
  expire_time: string;
  encrypt_certificate: EncryptCertificate;
}

// 签名所需参数
interface SignParams {
  // HTTP请求的方法（GET，POST，PUT）等
  method: string;
  // 请求的绝对URL，并去除域名部分得到参与签名的URL。如果请求中有查询参数，URL末尾应附加有'?'和对应的查询字符串。
  url: string;
  // 取发起请求时的系统当前时间戳，即格林威治时间1970年01月01日00时00分00秒(北京时间1970年01月01日08时00分00秒)起至现在的总秒数，作为请求时间戳
  timestamp: number;
  // 请求随机串
  nonceStr: string;
  // 请求中的请求报文主体（request body）
  body: Record<string, any>;
}

// 从PEM公钥中提取证书序列号
const getSerialNo = (publicKey: Buffer) => {
  // openssl x509 -in 1900009191_20180326_cert.pem -noout -serial
  return Certificate.fromPEM(publicKey).serialNumber.toUpperCase();
};

const axiosInstance = axios.create({
  baseURL: 'https://api.mch.weixin.qq.com',
  headers: {
    Accept: 'application/json',
    'Content-Type': 'application/json;',
  },
});

// 生成随机串
const genNonceStr = () => {
  return Math.random().toString(36).substring(2, 17);
};

const WX_PUBLIC_KEYS_DIC: Record<string, string> = {};

export default class WechatPay {
  options: Options;

  constructor(options: Options) {
    this.options = { ...options };
    this.options.serialNo = options.serialNo || getSerialNo(options.publicKey);
  }

  async request<T>(config: AxiosRequestConfig) {
    const timestamp = Math.floor(Date.now() / 1000);
    const nonceStr = genNonceStr();
    const signature = this.sign({
      timestamp,
      nonceStr,
      body: config.data,
      url: config.url,
      method: config.method,
    });

    const result = await axiosInstance<T>({
      ...config,
      headers: {
        ...config.headers,
        Authorization: `WECHATPAY2-SHA256-RSA2048 mchid="${this.options.mchid}",nonce_str="${nonceStr}",signature="${signature}",timestamp="${timestamp}",serial_no="${this.options.serialNo}"`,
      },
    });

    return result;
  }

  /**
   * native 交易
   * @param data 请求数据
   * @returns 二维码链接
   */
  async nativeTransaction(data: {
    // 【商品描述】 商品描述
    description: string;
    // 【商户订单号】 商户系统内部订单号，只能是数字、大小写字母_-*且在同一个商户号下唯一
    outTradeNo: string;
    // 【交易结束时间】 订单失效时间，遵循rfc3339标准格式，格式为yyyy-MM-DDTHH:mm:ss+TIMEZONE，yyyy-MM-DD表示年月日，T出现在字符串中，表示time元素的开头，HH:mm:ss表示时分秒，TIMEZONE表示时区（+08:00表示东八区时间，领先UTC8小时，即北京时间）。例如：2015-05-20T13:29:35+08:00表示，北京时间2015年5月20日13点29分35秒。
    timeExpire?: string;
    // 【订单金额】 订单金额
    amount: number;
  }) {
    const config = {
      method: 'POST',
      url: '/v3/pay/transactions/native',
      data: {
        appid: this.options.appid,
        mchid: this.options.mchid,
        description: data.description,
        out_trade_no: data.outTradeNo,
        time_expire: data.timeExpire,
        notify_url: this.options.notifyUrl,
        amount: {
          total: data.amount,
        },
      },
    };

    const result = await this.request<{ code_url: string }>(config);
    return result.data;
  }

  /**
   * 向微信发送请求的签名
   * https://pay.weixin.qq.com/docs/merchant/development/interface-rules/signature-generation.html
   */
  sign({ method, url, timestamp, nonceStr, body }: SignParams) {
    const upperMethod = method.toUpperCase();
    const bodyStr = upperMethod !== 'GET' && body ? JSON.stringify(body) : '';
    // 待签名的串
    const toSignatureStr = [
      upperMethod,
      url,
      timestamp,
      nonceStr,
      bodyStr,
      '',
    ].join('\n');
    const signature = createSign('RSA-SHA256')
      .update(toSignatureStr)
      .sign(this.options.privateKey, 'base64');

    return signature;
  }

  /**
   * 从微信接收消息,验证签名
   * https://pay.weixin.qq.com/docs/merchant/development/interface-rules/signature-verification.html
   */
  async verifySignature({
    timestamp,
    nonceStr,
    body,
    signature,
    serialNo,
  }: {
    timestamp: number;
    nonceStr: string;
    body: Record<string, any>;
    // wx 签名
    signature: string;
    // 证书编号
    serialNo: string;
  }) {
    const wxPublicKey = await this.getWechatPayPublicKey(serialNo);
    const toVerifyStr = [timestamp, nonceStr, JSON.stringify(body), ''].join(
      '\n',
    );

    const verify = createVerify('RSA-SHA256');
    verify.update(toVerifyStr);
    return verify.verify(wxPublicKey, signature, 'base64');
  }

  /**
   * 获取微信接口的 publicKey
   * 下载微信平台证书
   * https://pay.weixin.qq.com/docs/merchant/apis/platform-certificate/api-v3-get-certificates/get.html
   */
  async getWechatPayPublicKey(serialNo = '') {
    if (WX_PUBLIC_KEYS_DIC[serialNo]) return WX_PUBLIC_KEYS_DIC[serialNo];

    // 下载平台证书
    const result = await this.request<{ data: WxCertificate[] }>({
      method: 'GET',
      url: '/v3/certificates',
    });

    result.data.data.forEach((item) => {
      // 解密证书
      const certificate = this.decrypt(item.encrypt_certificate);
      // 读取 publicKey
      const publicKey = Certificate.fromPEM(
        Buffer.from(certificate),
      ).publicKey.toPEM();
      WX_PUBLIC_KEYS_DIC[item.serial_no] = publicKey;
    });
  }

  /**
   * 解密微信平台的证书信息
   * @param encryptCertificate 加密信息
   */
  decrypt(encryptCertificate: EncryptCertificate): string {
    const { ciphertext, nonce, associated_data } = encryptCertificate;
    const decipher = createDecipheriv(
      'aes-256-gcm',
      this.options.secretKey,
      nonce,
    );
    const encryptedBuffer = Buffer.from(ciphertext, 'base64');
    // encryptedBuffer分为两部分,最后 16 个字节为认证标签
    const authTag = encryptedBuffer.subarray(encryptedBuffer.length - 16);
    //  加密数据
    const encryptedData = encryptedBuffer.subarray(
      0,
      encryptedBuffer.length - 16,
    );
    decipher.setAuthTag(authTag);
    // 附加认证数据,是加密中使用的数据,但不会被加密
    associated_data && decipher.setAAD(Buffer.from(associated_data));
    // 解密
    const decrypted = Buffer.concat([
      decipher.update(encryptedData),
      // final 也会有一部分数据,所以 concat 到一起
      decipher.final(),
    ]);
    return decrypted.toString('utf8');
  }

  /**
   * 查询订单状态
   * @param tradeNo 商户侧的订单编号
   */
  async queryTrade(tradeNo: string) {
    return this.request<{
      trade_state: WechatTradeStateEnum;
      trade_state_desc: string;
    }>({
      method: 'GET',
      url: `/v3/pay/transactions/out-trade-no/${tradeNo}?mchid=${this.options.mchid}`,
    });
  }

  /**
   * 关闭交易
   * https://pay.weixin.qq.com/docs/merchant/apis/native-payment/close-order.html
   * @param tradeNo  商户系统内部订单号
   */
  async closeTrade(tradeNo: string) {
    return this.request<{
      trade_state: WechatTradeStateEnum;
      trade_state_desc: string;
    }>({
      method: 'POST',
      url: `/v3/pay/transactions/out-trade-no/${tradeNo}/close`,
      data: {
        mchid: this.options.mchid,
      },
    });
  }
}
