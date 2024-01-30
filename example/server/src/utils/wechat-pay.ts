import WechatPay from 'wx-node-sdk';
import { APP_CONFIGS } from 'src/constants';
import fse from 'fs-extra';

export const wechatPay = new WechatPay({
  mchid: APP_CONFIGS.wechatMchId,
  appid: APP_CONFIGS.wechatAppId,
  publicKey: fse.readFileSync('./cert/apiclient_cert.pem'),
  privateKey: fse.readFileSync('./cert/apiclient_key.pem'),
  secretKey: APP_CONFIGS.secretKey,
  notifyUrl: APP_CONFIGS.wechatNotifyUrl,
});
