var { client } = require("../connect");
var searchES = (module.exports.searchES = async function (index, body) {
    try {
        var result = await client.search({
            index: index,
            body: body,
        });

        if (result.hits.hits.length == 0) {
            return null;
        }
        return {
            _source: result.hits.hits[0]._source || null,
            _id: result.hits.hits[0]._id,
            _all: result.hits.hits,
        };
    } catch (error) {
        return null;
    }
});
