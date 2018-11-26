/**
 * This Lambda@Edge provides a basic boilerplate for apply the 'bot.js'
 * found in this repository.
 */

const bot = require('bot');

exports.handler = (event, context, callback) => {
  const { headers } = event.Records[0].cf.request;
  const ua = headers['user-agent'][0].value;
  // Perform filtering using User-Agent
  if (bot(ua)) {
    // Handle bot
  }

  // Handle standard traffic
};

