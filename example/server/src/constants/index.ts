import 'dotenv/config';

export const APP_CONFIGS = {
  dbUrl: process.env.DATABASE_URL,
  apiPrefix: process.env.API_PREFIX,
  port: +process.env.PORT,
  wechatAppId: process.env.WECHAT_APP_ID,
  wechatMchId: process.env.WECHAT_MCH_ID,
  wechatNotifyUrl: process.env.WECHAT_NOTIFY_URL,
  secretKey: process.env.SECRET_KEY,
};
