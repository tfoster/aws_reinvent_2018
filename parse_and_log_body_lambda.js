/**
 * This Lambda@Edge will parse application/x-www-form-urlencoded bodies
 * and write them to CloudWatch.
 */

const querystring = require('querystring');

exports.handler = (event, context, callback) => {
  const { request } = event.Records[0].cf;

  if (request.method === 'POST') {
    const body = Buffer
      .from(request.body.data, 'base64')
      .toString();

    const params = querystring.parse(body);

    // Log for later processing
    console.log(JSON.stringify(params));
  }

  return callback(null, request);
};

