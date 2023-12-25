const getProcessInfoBefore = (data, processIdToSearch) => {
    const processData = (data, processIdToSearch) => {
        const { originalFileName, processId, children } = data;

        if (children[0].processId === processIdToSearch) {
            return {
                originalFileName: originalFileName,
                processId: processId,
            };
        }
        let result = null;
        if (children.length > 0) {
            children.forEach((child) => {
                if (child.children.length > 0) {
                    const recursiveResult = processData(
                        child,
                        processIdToSearch,
                    );
                    if (recursiveResult) {
                        result = recursiveResult;
                    }
                }
            });
        }
        return result;
    };
    const result = processData(data, processIdToSearch);

    return result;
};

const returnWithSuspiciousNode = function (
    data,
    ParentOriginalFileName,
    ParentProcessId,
    childrenToAdd,
) {
    try {
        const processData = (data, ParentOriginalFileName, ParentProcessId) => {
            const { originalFileName, processId, children } = data;

            if (
                ParentOriginalFileName === originalFileName &&
                ParentProcessId === processId
            ) {
                data.children = [
                    {
                        ...childrenToAdd,
                        isRoot: true,
                        children: [],
                    },
                ];
            }
            if (children.length > 0) {
                children.forEach((child) => {
                    processData(child, ParentOriginalFileName, ParentProcessId);
                });
            }
        };

        processData(data, ParentOriginalFileName, ParentProcessId);
        return data;
    } catch (error) {
        console.log("error", error);
    }
};

// const changeIsRootOfSuspicious = function (data, listSuspiciousProcessIds) {
//     const processData = (data, listSuspiciousProcessIds) => {
//         const { originalFileName, processId, children } = data;
//         if (listSuspiciousProcessIds.includes(processId)) {
//             data.isRoot = true;
//         }
//         if (children.length > 0) {
//             children.forEach((child) => {
//                 if (child.children.length > 0) {
//                     processData(child, listSuspiciousProcessIds);
//                 }
//             });
//         }
//     };
//     processData(data, listSuspiciousProcessIds);
//     return data;
// };

module.exports = {
    getProcessInfoBefore,
    returnWithSuspiciousNode,
};
