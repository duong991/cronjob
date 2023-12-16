"use strict";
const { ES_PROCESS_EVENT } = require("../connect");
const { searchES } = require("../utils/searchES");
const {
    queryProcessEventByParentProcessId,
    queryProcessEvent,
} = require("./query");

const buildAllTree = (module.exports.buildAllTree = async function (
    deviceId,
    parentProcessId,
    image,
    originalFileName,
    timeStarted,
    timeEnded,
    listSuspicious,
    _id,
) {
    const listSuspiciousProcessId = listSuspicious.map((item) => {
        return item.processId;
    });

    const listSuspiciousOriginalFileName = listSuspicious.map(
        (item) => item.originalFileName,
    );
    const idRoot =
        listSuspiciousProcessId.includes(parentProcessId) &&
        listSuspiciousOriginalFileName.includes(originalFileName || image);
    const tree = {
        image: image,
        originalFileName: originalFileName || image,
        processId: parentProcessId,
        isRoot: idRoot,
        _id: _id,
        children: [],
    };

    const body = queryProcessEventByParentProcessId(
        deviceId,
        parentProcessId,
        image,
        timeStarted,
        timeEnded,
        listSuspiciousProcessId,
    );

    let _all;
    try {
        const data = await searchES(ES_PROCESS_EVENT, body);

        if (!data || !data?._all) {
            let body2 = queryProcessEvent(
                deviceId,
                parentProcessId,
                image,
                timeStarted,
                timeEnded,
            );

            const data2 = await searchES(ES_PROCESS_EVENT, body2);

            if (!data2) {
                throw new Error("data2 is null");
            }
            const { _source } = data2;
            const idRoot =
                listSuspiciousProcessId.includes(_source.log.ProcessId) &&
                listSuspiciousOriginalFileName.includes(
                    _source.log.OriginalFileName,
                );
            return {
                tree: {
                    image: _source.log.Image,
                    originalFileName: _source.log.OriginalFileName,
                    processId: _source.log.ProcessId,
                    isRoot: idRoot,
                    _id: _id,
                    children: [],
                },
            };
        }
        _all = data._all;
    } catch (error) {
        console.log("error", error);
        return {
            tree: null,
        };
    }

    for (let i = 0; i < _all.length; i++) {
        const { _source, _id } = _all[i];
        const { Image, ProcessId, OriginalFileName } = _source.log;

        const childData = await buildAllTree(
            deviceId,
            ProcessId,
            Image,
            OriginalFileName,
            timeStarted,
            timeEnded,
            listSuspicious,
            _id,
        );

        tree.children.push(childData?.tree);
    }

    return {
        tree,
    };
});
