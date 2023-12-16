function checkPathFormat(path) {
    var format = /^([A-Z]):\\(\\[^<>:"/\\|?*]*)+\\?$/i;

    if (path.match(format)) {
        return true;
    } else {
        return false;
    }
}

module.exports.checkPathFormat = checkPathFormat;
