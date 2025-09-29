const validUrl = require('valid-url');
const crypto = require('crypto');

function isValidUrl(url) {
  return validUrl.isWebUri(url);
}

function generateShortUrl(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  const bytes = crypto.randomBytes(length);
  for (let i = 0; i < length; i++) {
    result += chars[bytes[i] % chars.length];
  }
  return result;
}

function generateSecret() {
  return crypto.randomBytes(8).toString('hex'); 
}

module.exports = { isValidUrl, generateShortUrl, generateSecret };