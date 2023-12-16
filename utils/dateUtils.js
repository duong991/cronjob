var moment = require("moment");

var minusMinutes = (module.exports.minusMinutes = function (time, timeMinus) {
    return moment(time)
        .subtract(+timeMinus, "minutes")
        .toISOString()
        .replace("Z", "+00:00");
});

var addMinutes = (module.exports.addMinutes = function (time, timeAdd) {
    return moment(time)
        .add(+timeAdd, "minutes")
        .toISOString()
        .replace("Z", "+00:00");
});
