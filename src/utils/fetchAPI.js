'use strict';
const axios = require('axios');

module.exports = module.exports.default = async function fetch(
  url,
  method = 'POST',
  headers,
  data = null,
  params = {},
) {
  try {
    let authorization = '';
    if (headers) {
      headers.hasOwnProperty('authorization') ? authorization = headers.authorization : '';
    }

    if (typeof url === 'object') {
      params = url.hasOwnProperty('params') ? url.params : {};
      data = url.hasOwnProperty('body') ? url.body : null;
      method = url.hasOwnProperty('method') ? url.method : 'POST';
      authorization = url.hasOwnProperty('authorization')
        ? url.authorization
        : (url.headers && url.headers.authorization ? url.headers.authorization : null);
      url = url.hasOwnProperty('url') ? url.url : '/';
    }

    const headerInfos = {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: authorization,
    };
    let options = {
      url,
      method,
      headers: headerInfos,
      params,
      data,
      timeout: 18000,
    };
    let response = await axios(options);
    return response.data;
  } catch (err) {
    throw err;
  }
};
