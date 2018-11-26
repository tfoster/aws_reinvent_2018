
/**
 * This file provides simple bot filtering capabilities.
 *
 * It attempts to identify many common good bots you'll see in the wild.
 */

const BOT_PATTERN_QUICK = /.*(AdsBot\-Google|Amazon\ Route\ 53|PhantomJS|googlebot|slurp|Yahoo\ Ad\ Monitoring|BingPreview|bingbot|gomezagent|Google\ Page\ Speed\ Insights|Pingdom|yandex|catchpoint|PTST|AppEngine\-Google|googleweblight).*/i;

module.exports = function(userAgent) {
    if (!userAgent){
        // Missing user agent should be considered NOT a bot
        return false;
    }

    return BOT_PATTERN_QUICK.test(userAgent);
}

