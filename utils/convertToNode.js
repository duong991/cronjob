const convertToNode = (module.exports.convertToNode = (
    data,
    suspiciousProcessId,
    suspiciousId,
) => {
    const nodes = [];
    const edges = [];
    const addedIds = new Set();
    const parentId = data.processId;
    const processData = (data, parentId) => {
        const { originalFileName, processId, children, isRoot, _id } = data;

        if (!addedIds.has(processId)) {
            const node = {
                id: processId,
                label: originalFileName,
                isRoot: isRoot,
                _id: _id,
            };
            nodes.push(node);
            addedIds.add(processId);
        }

        if (children.length > 0) {
            children.forEach((child) => {
                if (!addedIds.has(child.processId)) {
                    // check if the child have isSuspicious -> add to nodes
                    let childNode;

                    if (child.processId === suspiciousProcessId) {
                        childNode = {
                            id: child.processId,
                            label: child.originalFileName,
                            isRoot: child.isRoot,
                            isSuspicious: true,
                            _id: suspiciousId,
                        };
                    } else {
                        childNode = {
                            id: child.processId,
                            label: child.originalFileName,
                            isRoot: child.isRoot,
                            _id: child._id,
                        };
                    }
                    nodes.push(childNode);
                    addedIds.add(child.processId);
                }

                const edge = {
                    from: parentId,
                    to: child.processId,
                    arrows: "to",
                    isRoot: isRoot,
                };
                edges.push(edge);

                if (child.children.length > 0) {
                    processData(child, child.processId);
                }
            });
        }
    };

    processData(data, parentId);

    return { nodes, edges };
});
