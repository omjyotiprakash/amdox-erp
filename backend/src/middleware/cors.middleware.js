const cors = require("cors");
const corsOptions = require("../config/cors");

module.exports = cors(corsOptions);
