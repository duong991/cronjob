"use strict";
var { buildTree } = require("./services/recursive");
var { buildAllTree } = require("./services/buildAllTree");
var { convertToNode } = require("./utils/convertToNode");
var { getProcessInfoBefore, returnWithSuspiciousNode } = require("./utils");
var { getAllDataFromHunterES } = require("./services/hunterES");
var { addDataToAttackES } = require("./services/attackES");

class App {
    listId = [];
    async getIdFromHunterES() {
        try {
            const result = await getAllDataFromHunterES();
            this.listId = result.map((item) => item._id);
        } catch (error) {
            handleError("getIdFromHunterES", error);
        }
    }

    async buildTree(suspiciousId) {
        try {
            const result = await buildTree(suspiciousId);
            return result;
        } catch (error) {
            handleError("buildTree", error);
        }
    }

    async buildAllTree(
        deviceId,
        parentProcessId,
        image,
        originalFileName,
        timeStarted,
        timeEnded,
        listSuspicious,
        _id,
    ) {
        try {
            const result = await buildAllTree(
                deviceId,
                parentProcessId,
                image,
                originalFileName,
                timeStarted,
                timeEnded,
                listSuspicious,
                _id,
            );
            return result;
        } catch (error) {
            handleError("buildAllTree", error);
        }
    }

    getProcessInfoBefore(treeToBuild, processId) {
        try {
            const result = getProcessInfoBefore(treeToBuild, processId);
            return result;
        } catch (error) {
            console.log(
                "🚀 ~ file: index.js:26 ~ App ~ buildTree ~ error:",
                error,
            );
        }
    }

    async returnWithSuspiciousNode(
        tree,
        originalFileName,
        processId,
        suspicious,
    ) {
        try {
            const result = await returnWithSuspiciousNode(
                tree,
                originalFileName,
                processId,
                suspicious,
            );
            return result;
        } catch (error) {
            console.log(
                "🚀 ~ file: index.js:26 ~ App ~ buildTree ~ error:",
                error,
            );
        }
    }

    convertToNode(data, suspiciousProcessId, suspiciousId) {
        try {
            const result = convertToNode(
                data,
                suspiciousProcessId,
                suspiciousId,
            );
            return result;
        } catch (error) {
            console.log(
                "🚀 ~ file: index.js:26 ~ App ~ buildTree ~ error:",
                error,
            );
        }
    }

    async final(suspiciousId) {
        try {
            const result = await this.buildTree(suspiciousId);
            //==========================================================================
            /**
             *  @description: variable to build tree
             * */

            const { deviceId, listSuspicious, timeStarted, timeEnded } = result;
            const parentProcessId = result.listSuspicious[0].processId;
            const image = result.dataToBuildNode.originalFileName;
            const originalFileName = result.dataToBuildNode.originalFileName;
            //==========================================================================
            /**
             * @description: variable to return tree
             * */
            const suspicious = result.suspicious;
            const treeToBuild = result.dataToBuildNode;
            /**
             * @description: getProcessInfoBefore is used to get processInfoBefore suspicious
             * */
            const processInfoBefore = this.getProcessInfoBefore(
                treeToBuild,
                suspicious.processId,
            );
            //==========================================================================
            const data = await this.buildAllTree(
                deviceId,
                parentProcessId,
                image,
                originalFileName,
                timeStarted,
                timeEnded,
                listSuspicious,
                result.dataToBuildNode._id,
            );
            /**
             * @description: returnAllTree is a function add to object data.tree item of suspicious
             * */

            const resultWithSuspiciousNode =
                await this.returnWithSuspiciousNode(
                    data.tree,
                    processInfoBefore.originalFileName,
                    processInfoBefore.processId,
                    suspicious,
                );

            return resultWithSuspiciousNode;

            // const { nodes, edges } = this.convertToNode(
            //     resultWithSuspiciousNode,
            //     suspicious.processId,
            //     suspiciousId,
            // );
            // const final = {
            //     suspiciousId,
            //     nodes,
            //     edges,
            // };
            // return final;
        } catch (error) {
            handleError("final", error);
        }
    }

    async main() {
        try {
            await this.getIdFromHunterES();

            for (let i = 0; i < this.listId.length; i++) {
                const final = await this.final(this.listId[i]);
                console.log(
                    "🚀 ~ file: app.js:171 ~ App ~ main ~ final:",
                    JSON.stringify(final),
                );

                // await addDataToAttackES(final);
            }
        } catch (error) {
            handleError("main", error);
        }
    }
}

function handleError(methodName, error) {
    console.log(`Error in ${methodName}:`, error);
}

module.exports = {
    App,
};
