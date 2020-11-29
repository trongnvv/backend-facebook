// /* eslint-disable prettier/prettier */
module.exports = {
  REDIS: {
    HOST: process.env.REDIS_HOST || '127.0.0.1',
    PORT: process.env.REDIS_PORT || '6379',
    PASSWORD: process.env.REDIS_PASSWORD || '',
  },
  MONGO_URI: process.env.MONGO_URI || '',
  FACEBOOK: {
    HOST: 'https://graph.facebook.com',
    APP_ID: process.env.FB_APP_ID,
    APP_SECRET: process.env.FB_APP_SECRET,
    VERIFY_TOKEN_WEBHOOKS: process.env.FB_VERIFY_TOKEN_WEBHOOKS || 'trongnv',
    URL_REDIRECT: process.env.FB_URL_REDIRECT,
  },
};
