require('dotenv').config();
const { WebpayPlus, Options, IntegrationApiKeys, IntegrationCommerceCodes, Environment } = require('transbank-sdk');

function getTransaction() {
  const env = process.env.WEBPAY_ENV || 'integration';

  if (env === 'production') {
    const options = new Options(
      process.env.WEBPAY_COMMERCE_CODE,
      process.env.WEBPAY_API_KEY,
      Environment.Production
    );
    return new WebpayPlus.Transaction(options);
  }

  return WebpayPlus.Transaction.buildForIntegration(
    process.env.WEBPAY_COMMERCE_CODE || IntegrationCommerceCodes.WEBPAY_PLUS,
    process.env.WEBPAY_API_KEY || IntegrationApiKeys.WEBPAY
  );
}

module.exports = { getTransaction };
