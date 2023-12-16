var { queryGetAllDataFromHunterES } = require("./query");
var { ES_HUNTING } = require("../connect");
var { searchES } = require("../utils/searchES");

var getAllDataFromHunterES = (module.exports.getAllDataFromHunterES =
    async function () {
        const body = queryGetAllDataFromHunterES();
        const { _all } = await searchES(ES_HUNTING, body);

        return _all;
    });
