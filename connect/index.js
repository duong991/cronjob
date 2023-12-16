"use strict";
var es = require("@elastic/elasticsearch");
require("dotenv").config();

var client = (module.exports.client = new es.Client({
    node: process.env.ES_HOST,
    auth: {
        username: process.env.ES_USERNAME,
        password: process.env.ES_PASSWORD,
    },
    tls: { rejectUnauthorized: false, ca: [] },
}));

module.exports.ES_SUSPICIOUS = "edr.suspicious";
module.exports.ES_PROCESS_EVENT = "edr.process-events";
module.exports.ES_LOGON_EVENT = "edr.logon-events";
module.exports.ES_HUNTING = "edr.hunting";
module.exports.ES_ATTACK_MAP = "edr.attack-map";
