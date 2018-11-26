/**
 * This CloudWatch Log Group Creation triggered Lambda allows you to
 * subscribe to Lambda@Edge log groups as your lambda executes in
 * new regions.
 */

const AWS = require('aws-sdk');

const LOG_GROUP_META_DATA = {
  /*
    Specify your log group information here.

    Example:
    '/aws/lambda/us-east-1.example_function': {
      destinationArn: '<firehose or lambda arn>',
      filterNameSuffix: '<suffix for your filter name>',
      filterPattern: '<filter pattern>'

    }
  */
};

const ROLE_ARN = '<Your subscription role ARN>';

function getCloudWatchEventDetail(event) {
  const message = JSON.parse(event.Records[0].Sns.Message);
  return message.detail;
}

function hasSubscriptionFilter(client, logGroupName) {
  const params = {
    logGroupName
  };
  return new Promise((resolve, reject) => {
    client.describeSubscriptionFilters(params, (err, data) => {
      if (err) {
        console.log('Error while listing the subscription filters for stream %s. %s, %s', logGroupName, err, err.stack);
        reject(err);
      } else if (data.subscriptionFilters.length > 0) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
}

function putFilterOnLogGroup(client, region, logGroupName) {
  const logGroupData = LOG_GROUP_META_DATA[logGroupName];
  const { destinationArn, filterNameSuffix, filterPattern } = logGroupData;

  const filterName = region.concat('-', filterNameSuffix);

  const params = {
    destinationArn,
    filterName,
    filterPattern,
    logGroupName
  };

  if (!destinationArn.includes('lambda')) {
    params.ROLE_ARN = ROLE_ARN;
  }

  return new Promise((resolve, reject) => {
    client.putSubscriptionFilter(params, (err, data) => {
      if (err) {
        console.log('Error while attaching subscription filters to %s. %s, %s', logGroupName, err, err.stack);
        reject(err);
      } else {
        resolve(data);
      }
    });
  });
}

exports.handler = (event, context, callback) => {
  console.log('Event: ', JSON.stringify(event));
  const eventDetail = getCloudWatchEventDetail(event);
  const region = eventDetail.awsRegion;
  const { logGroupName } = eventDetail.requestParameters;
  const options = {
    region
  };
  const cloudwatchlogs = new AWS.CloudWatchLogs(options);
  const hasFilter = hasSubscriptionFilter(cloudwatchlogs, logGroupName);

  hasFilter.then((filter) => {
    if (!filter) {
      const putFilter = putFilterOnLogGroup(cloudwatchlogs, region, logGroupName);
      putFilter.then((response) => {
        callback(null, response);
      }).catch((errors) => {
        callback(errors, null);
      });
    } else {
      callback(`Filter is already in place for ${logGroupName} in ${region}. Please check its correct.`, null);
    }
  }).catch((errors) => {
    callback(errors, null);
  });
};
