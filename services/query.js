"use strict";
var querySuspicious = function (deviceId, created) {
    var body = {
        query: {
            bool: {
                must: [
                    {
                        term: {
                            deviceid: deviceId,
                        },
                    },
                    {
                        term: {
                            created: created,
                        },
                    },
                ],
            },
        },
    };
    return body;
};

var querySuspiciousById = function (_id) {
    var body = {
        query: {
            term: {
                _id: _id,
            },
        },
    };
    return body;
};

var queryProcessEvent = function (
    deviceId,
    processId,
    image,
    timeStart,
    timeEnd,
) {
    var body = {
        query: {
            bool: {
                filter: [
                    {
                        range: {
                            created: {
                                gte: timeStart,
                                lte: timeEnd,
                            },
                        },
                    },
                ],
                must: [
                    {
                        term: {
                            deviceid: deviceId,
                        },
                    },
                    {
                        term: {
                            "log.ProcessId": processId,
                        },
                    },
                    {
                        term: {
                            "log.Image.keyword": image,
                        },
                    },
                ],
            },
        },
        sort: [
            {
                created: {
                    order: "desc",
                },
            },
        ],
        size: 114,
    };
    return body;
};

var queryProcessEventByParentProcessId = function (
    deviceId,
    processId,
    image,
    timeStarted,
    timeEnded,
    listSuspiciousProcessIds,
) {
    var body = {
        query: {
            bool: {
                filter: [
                    {
                        range: {
                            created: {
                                gte: timeStarted,
                                lte: timeEnded,
                            },
                        },
                    },
                ],
                must: [
                    {
                        term: {
                            deviceid: deviceId,
                        },
                    },
                    {
                        term: {
                            "log.ParentProcessId": processId,
                        },
                    },
                    {
                        term: {
                            "log.ParentImage.keyword": image,
                        },
                    },
                ],
                must_not: [
                    {
                        term: {
                            "log.OriginalFileName.keyword": "-",
                        },
                    },
                ],
                should: [
                    {
                        terms: {
                            "log.ProcessId": [...listSuspiciousProcessIds],
                        },
                    },
                ],
            },
        },
        size: 5,
    };
    return body;
};

var queryToRetrieveNearestRecordsInLogonES = function (time, deviceId) {
    var body = {
        sort: [
            {
                created: {
                    order: "desc",
                },
            },
        ],
        query: {
            bool: {
                filter: [
                    {
                        range: {
                            created: {
                                lt: time,
                            },
                        },
                    },
                ],
                must: [
                    {
                        term: {
                            deviceid: deviceId,
                        },
                    },
                    {
                        term: {
                            "log.EventID": 4624,
                        },
                    },
                    {
                        term: {
                            "log.LogonType": 2,
                        },
                    },
                    {
                        term: {
                            "log.Image": "svchost.exe",
                        },
                    },
                ],
            },
        },
    };
    return body;
};

var queryToRetrieveFirstRecordInArrayAboveLogonES = function (
    processId,
    deviceId,
) {
    var body = {
        sort: [
            {
                created: {
                    order: "asc",
                },
            },
        ],
        query: {
            bool: {
                must: [
                    {
                        term: {
                            deviceid: deviceId,
                        },
                    },
                    {
                        term: {
                            "log.EventID": 4624,
                        },
                    },
                    {
                        term: {
                            "log.LogonType": 2,
                        },
                    },
                    {
                        term: {
                            "log.Image": "svchost.exe",
                        },
                    },
                    {
                        term: {
                            "log.ProcessId": processId,
                        },
                    },
                ],
            },
        },
        size: 1,
    };

    return body;
};

var queryGetAllDataFromHunterES = function () {
    const body = {
        query: {
            match_all: {},
        },
    };

    return body;
};

var queryAddItemToAttackES = function (data) {
    const body = data;

    return body;
};
module.exports.querySuspicious = querySuspicious;
module.exports.queryProcessEvent = queryProcessEvent;
module.exports.queryProcessEventByParentProcessId =
    queryProcessEventByParentProcessId;
module.exports.queryToRetrieveNearestRecordsInLogonES =
    queryToRetrieveNearestRecordsInLogonES;

module.exports.queryToRetrieveFirstRecordInArrayAboveLogonES =
    queryToRetrieveFirstRecordInArrayAboveLogonES;
module.exports.querySuspiciousById = querySuspiciousById;
module.exports.queryGetAllDataFromHunterES = queryGetAllDataFromHunterES;
module.exports.queryAddItemToAttackES = queryAddItemToAttackES;
