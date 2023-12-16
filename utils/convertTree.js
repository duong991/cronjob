module.exports.convertToChildrenTree = function convertToTreeFormat(data) {
    if (!data || !data.dataToBuildTree || !data.parent) {
        return null;
    }

    var tree = {
        _id: "",
        image: "",
        originalFileName: "",
        processId: "",
        children: [],
    };

    let flag = true;
    while (flag) {
        if (data.dataToBuildTree) {
            tree._id = data.dataToBuildTree._id;
            tree.originalFileName = data.dataToBuildTree.originalFileName;
            tree.processId = data.dataToBuildTree.processId;
            tree.image = data.dataToBuildTree.image;
        }
        if (data.parent && data.parent.length > 0) {
            tree = {
                _id: data.parent[0].dataToBuildTree._id,
                originalFileName:
                    data.parent[0].dataToBuildTree.originalFileName,
                processId: data.parent[0].dataToBuildTree.processId,
                image: data.parent[0].dataToBuildTree.image,
                children: [tree],
            };
            data = data.parent[0];
        } else {
            flag = false;
        }
    }
    return tree;
};
