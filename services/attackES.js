var { queryAddItemToAttackES } = require("./query");
var { ES_ATTACK_MAP } = require("../connect");
var { client } = require("../connect");

var addDataToAttackES = (module.exports.addDataToAttackES = async function (
    data,
) {
    const body = queryAddItemToAttackES(data);
    try {
        await client.index({
            index: ES_ATTACK_MAP,
            body: body,
        });
    } catch (error) {
        console.log("🚀 ~ file: attackES.js:15 ~ error:", error);
    }
});
