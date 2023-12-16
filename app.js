"use strict";
var { buildTree } = require("./services/recursive");
var { buildAllTree } = require("./services/buildAllTree");
var { convertToNode } = require("./utils/convertToNode");
var { getProcessInfoBefore, returnAllTree } = require("./utils");
var { getAllDataFromHunterES } = require("./services/hunterES");
var { addDataToAttackES } = require("./services/attackES");

class App {
    listId = [];
    async getIdFromHunterES() {
        try {
            const result = await getAllDataFromHunterES();
            this.listId = result.map((item) => item._id);
        } catch (error) {
            console.log(
                "🚀 ~ file: index.js:15 ~ App ~ getAllDataFromHunterES ~ error:",
                error,
            );
        }
    }

    async buildTree(suspiciousId) {
        try {
            const result = await buildTree(suspiciousId);
            return result;
        } catch (error) {
            console.log(
                "🚀 ~ file: index.js:26 ~ App ~ buildTree ~ error:",
                error,
            );
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
            console.log(
                "🚀 ~ file: index.js:26 ~ App ~ buildTree ~ error:",
                error,
            );
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

    async returnAllTree(tree, originalFileName, processId, suspicious) {
        try {
            const result = await returnAllTree(
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
        const result = await this.buildTree(suspiciousId);
        //==========================================================================
        /**
         *  @description: variable to build tree
         * */

        const deviceId = result.deviceId;
        const parentProcessId = result.listSuspicious[0].processId;
        const image = result.dataToBuildNode.originalFileName;
        const originalFileName = result.dataToBuildNode.originalFileName;
        const timeStarted = result.timeStarted;
        const timeEnded = result.timeEnded;
        const listSuspicious = result.listSuspicious;
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

        const result2 = await this.returnAllTree(
            data.tree,
            processInfoBefore.originalFileName,
            processInfoBefore.processId,
            suspicious,
        );

        const { nodes, edges } = this.convertToNode(
            result2,
            suspicious.processId,
            suspiciousId,
        );
        const final = {
            suspiciousId,
            nodes,
            edges,
        };
        return final;
    }

    async main() {
        try {
            await this.getIdFromHunterES();

            for (let i = 0; i < this.listId.length; i++) {
                const final = await this.final(this.listId[i]);

                await addDataToAttackES(final);
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
