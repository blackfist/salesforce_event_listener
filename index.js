global.exit = function exit(code, msg) {
  console.log(`ERROR: ${msg}`);
  process.exit(code || 1);
};
global.missing = function missing(variable) {
  exit(1, `${variable} environment variable required.`);
};

const dotenv = require("dotenv");
dotenv.config();

let { org, stream } = require("./salesforce");

stream.on("data", event => {
  console.log(event.payload);
});
