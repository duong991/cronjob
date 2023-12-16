"use strict";
var { ES_PROCESS_EVENT, ES_HUNTING, ES_LOGON_EVENT } = require("../connect");
var { searchES } = require("../utils/searchES");
var { checkPathFormat } = require("../utils/checkPathFormat");
var {
    querySuspicious,
    queryProcessEvent,
    queryToRetrieveFirstRecordInArrayAboveLogonES,
    queryToRetrieveNearestRecordsInLogonES,
    querySuspiciousById,
} = require("./query");

var { minusMinutes } = require("../utils/dateUtils");
var { convertToChildrenTree } = require("../utils/convertTree");

/**
 * @description func get information of suspicious process in ES_SUSPICIOUS
 * @param {string} deviceId : eg. deviceId: "45daf4bf-2b28-57c989ae-9944-cbd03f5e"
 * @param {string} created : eg. created: "2023-12-09T05:30:17.760050+00:00"
 *
 * @returns {object} dataSearchProcessEvents : {
 *                                              deviceId: "45daf4bf-2b28-57c989ae-9944-cbd03f5e",
 *                                              parentImage: "C:\\Windows\\System32\\cmd.exe",
 *                                              parentProcessId: "4",
 *                                             }
 * @returns {object} dataToBuildTree : {
 *                                      image: "C:\\Windows\\System32\\cmd.exe",
 *                                      processId: "4",
 *                                     }
 */
var checkSuspicions = (module.exports.checkSuspicions = async function (id) {
    try {
        if (!id) throw new Error("Missing params");
        // var body = querySuspicious(deviceId, created);
        var body = querySuspiciousById(id);
        const { _source, _id } = await searchES(ES_HUNTING, body);

        if (_source === null || !_source) return null;

        var suspiciousData = _source;
        /*===================================*/
        const { deviceid, created } = suspiciousData;
        const { ParentImage, ParentProcessId, Time } =
            suspiciousData.log.Process;
        /*===================================*/

        const dataSearchProcessEvents = {
            deviceId: deviceid,
            parentImage: ParentImage,
            parentProcessId: ParentProcessId,
        };

        const { Image, ProcessId, OriginalFileName } =
            suspiciousData.log.Process;

        const dataToBuildTree = {
            _id,
            image: Image,
            processId: ProcessId,
            originalFileName: OriginalFileName,
        };

        return {
            dataSearchProcessEvents,
            dataToBuildTree,
            created: created,
        };
    } catch (error) {
        console.error(error);
        return null;
    }
});

var getProcessIdFromLogonES = (module.exports.getProcessIdFromLogonES =
    async function (deviceId, time) {
        try {
            if (!deviceId || !time) throw new Error("Missing params");
            var body = queryToRetrieveNearestRecordsInLogonES(time, deviceId);

            const { _source } = await searchES(ES_LOGON_EVENT, body);
            if (_source === null || !_source) throw new Error("No data");
            const { ProcessId } = _source.log;
            return ProcessId;
        } catch (error) {
            console.error(error);
            return null;
        }
    });

var getTimeStartedOfProcessIdFromLogonES =
    (module.exports.getTimeStartedOfProcessIdFromLogonES = async function (
        processId,
        deviceId,
    ) {
        try {
            if (!processId || !deviceId) throw new Error("Missing params");
            var body = queryToRetrieveFirstRecordInArrayAboveLogonES(
                processId,
                deviceId,
            );
            const { _source } = await searchES(ES_LOGON_EVENT, body);
            if (_source === null || !_source) return null;
            const { created } = _source;
            return created;
        } catch (error) {
            console.error(error);
            return null;
        }
    });
/**
 * @description func get information of process in ES_PROCESS_EVENT
 * @param {string} deviceId : eg. deviceId: "45daf4bf-2b28-57c989ae-9944-cbd03f5e"
 * @param {string} processId : eg. processId: "4"
 * @param {string} image : eg. image: "C:\\Windows\\System32\\cmd.exe"
 *
 * @returns {object} dataSearchProcessEvents : {
 *                                              deviceId: "45daf4bf-2b28-57c989ae-9944-cbd03f5e",
 *                                              parentImage: "C:\\Windows\\System32\\cmd.exe",
 *                                              parentProcessId: "4",
 *                                             }
 * @returns {object} dataToBuildTree : {
 *                                      image: "C:\\Windows\\System32\\cmd.exe",
 *                                      processId: "4",
 *                                     }
 */
var checkProcessEvents = (module.exports.checkProcessEvents = async function (
    deviceId,
    processId,
    image,
    timeStarted,
    timeEnded,
) {
    try {
        if (!deviceId || !processId || !image)
            throw new Error("Missing params");
        var body = queryProcessEvent(
            deviceId,
            processId,
            image,
            timeStarted,
            timeEnded,
        );
        let _id, _source;
        try {
            const data = await searchES(ES_PROCESS_EVENT, body);
            _id = data._id;
            _source = data._source;
        } catch (error) {
            return {
                dataSearchProcessEvents: null,
                dataToBuildTree: {
                    _id,
                    image: image,
                    processId: processId,
                    originalFileName: image,
                },
            };
        }
        var processEventData = _source;
        /*============================================*/

        const { Image, ProcessId, OriginalFileName } = processEventData.log;
        const dataToBuildTree = {
            _id,
            image: Image,
            processId: ProcessId,
            originalFileName: OriginalFileName,
        };

        /*============================================*/

        const { deviceid } = processEventData;
        const { ParentImage, ParentProcessId } = processEventData.log;
        const dataSearchProcessEvents = {
            deviceId: deviceid,
            parentImage: ParentImage,
            parentProcessId: ParentProcessId,
        };

        /*============================================*/

        return {
            dataSearchProcessEvents,
            dataToBuildTree,
        };
    } catch (error) {
        console.error(error);
        return null;
    }
});

/**
 * @description func recursive to get information of process in ES_PROCESS_EVENT
 *              func end when result from func "checkProcessEvents" return null
 * @param {string} deviceId : eg. deviceId: "45daf4bf-2b28-57c989ae-9944-cbd03f5e"
 * @param {string} created : eg. created: "2023-12-09T05:30:17.760050+00:00"
 * @param {object} dataSearchProcessEvents
 * */
var recursive = (module.exports.recursive = async function (
    deviceId,
    timeStarted,
    created,
    dataSearchProcessEvents,
) {
    try {
        var data;
        if (!dataSearchProcessEvents) throw new Error("Missing params");

        var result = await checkProcessEvents(
            deviceId,
            dataSearchProcessEvents.parentProcessId,
            dataSearchProcessEvents.parentImage,
            timeStarted,
            created,
        );

        if (result === null || !result) return null;
        dataSearchProcessEvents = result.dataSearchProcessEvents;
        if (
            dataSearchProcessEvents &&
            dataSearchProcessEvents.parentProcessId
        ) {
            data = await recursive(
                deviceId,
                timeStarted,
                created,
                dataSearchProcessEvents,
            );
        }

        var newData = {
            dataToBuildTree: result.dataToBuildTree,
            parent: [],
        };

        if (data) {
            newData.parent.push(data);
        }

        return newData;
    } catch (error) {
        console.error(error);
        return null;
    }
});

/**
 * @description func to build tree with data from dataToBuildTree in func "checkSuspicions"
 *             and data from dataToBuildTree in func "recursive"
 * @param {string} deviceId : eg. deviceId: "45daf4bf-2b28-57c989ae-9944-cbd03f5e"
 * @param {string} created : eg. created: "2023-12-09T05:30:17.760050+00:00"
 */
var buildTree = (module.exports.buildTree = async function (_id) {
    let listSuspicious = [];
    try {
        var result = await checkSuspicions(_id);

        const { deviceId } = result.dataSearchProcessEvents;
        const { created } = result;

        if (result === null || !result) return null;
        const processId = await getProcessIdFromLogonES(deviceId, created);
        if (processId === null || !processId)
            throw new Error("No data processId");
        let timeStarted = await getTimeStartedOfProcessIdFromLogonES(
            processId,
            deviceId,
        );
        timeStarted = minusMinutes(timeStarted, 10);

        if (timeStarted === null || !timeStarted)
            throw new Error("No data timeStarted");

        var data = await recursive(
            deviceId,
            timeStarted,
            created,
            result.dataSearchProcessEvents,
        );
        if (data === null || !data) return null;
        var tree = {
            dataToBuildTree: result.dataToBuildTree,
            parent: [],
        };

        if (data) {
            tree.parent.push(data);
        }

        const newTree = convertToChildrenTree(tree);

        const processData = (data) => {
            const { processId, children, originalFileName, image } = data;

            listSuspicious.push({
                processId: processId,
                originalFileName: originalFileName || image,
            });
            if (children.length > 0) {
                children.forEach((child) => {
                    const { processId } = child;
                    processData(child);
                });
            }
        };

        processData(newTree);

        return {
            listSuspicious,
            dataToBuildNode: newTree,
            suspicious: {
                originalFileName: result.dataToBuildTree.originalFileName,
                image: result.dataToBuildTree.image,
                processId: result.dataToBuildTree.processId,
            },
            timeStarted,
            timeEnded: created,
            deviceId: deviceId,
            suspiciousId: _id,
        };
    } catch (error) {
        console.error(error);
        return null;
    }
});
