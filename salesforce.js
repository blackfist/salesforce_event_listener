let force = require("nforce");
const colors = require("colors");
const EventEmitter = require("events");

const username = process.env.SALESFORCE_USERNAME;
const password = process.env.SALESFORCE_PASSWORD;
const clientId = process.env.SALESFORCE_CLIENT_ID;
const clientSecret = process.env.SALESFORCE_CLIENT_SECRET;
const securityToken = process.env.SALESFORCE_SECURITY_TOKEN;
const verbose = process.env.VERBOSE || false;

if (!username) {
  missing("SALESFORCE_USERNAME");
}
if (!password) {
  missing("SALESFORCE_PASSWORD");
}
if (!clientId) {
  missing("SALESFORCE_CLIENT_ID");
}
if (!clientSecret) {
  missing("SALESFORCE_CLIENT_SECRET");
}
if (!securityToken) {
  missing("SALESFORCE_SECURITY_TOKEN");
}

let org = force.createConnection({
  clientId,
  clientSecret,
  environment: process.env.NODE_ENV == "production" ? "production" : "sandbox",
  redirectUri: "http://localhost:3000/oauth/_callback",
  mode: "single",
  version: "40.0",
  autoRefresh: true
});

let stream = new EventEmitter();

console.log("*** Attempting Salesforce authentication...".green);
org.authenticate({ username, password, securityToken }, (err, oauth) => {
  if (err) {
    console.error("*** Salesforce authentication error:".red);
    console.error(err);
    process.exit(1);
  } else {
    console.log("*** Salesforce authentication successful.");
    console.log("- Instance URL: %s", org.oauth.instance_url);
    // console.log("- OAuth Token: %s", org.oauth.access_token);
    console.log("- OAuth Token: REDACTED");
    org.authenticated = true;
  }
  let client = org.createStreamClient();
  let login_str = client.subscribe({
    topic: "LoginEventStream",
    isEvent: true,
    replayId: -1,
    oauth
  });

  let api_str= client.subscribe({
    topic: "ApiEventStream",
    isEvent: true,
    replayId: -1,
    oauth
  });

  let uri_str= client.subscribe({
    topic: "LightningUriEventStream",
    isEvent: true,
    replayId: -1,
    oauth
  });

  login_str.on("connect", function() {
    console.log("*** Subscribed to Login events...");
  });

  api_str.on("connect", function() {
    console.log("*** Subscribed to API events...");
  });

  uri_str.on("connect", function() {
    console.log("*** Subscribed to URIevents...");
  });

  login_str.on("error", function(error) {
    console.log("*** Login event stream error: " + error);
  });

  api_str.on("error", function(error) {
    console.log("*** API event stream error: " + error);
  });

  uri_str.on("error", function(error) {
    console.log("*** API event stream error: " + error);
  });

  login_str.on("data", function(data) {
    console.log("Received Login event");
    if (verbose) { stream.emit("data", data)} else {
        let output = {payload: {EventDate: data.payload.EventDate,
            Username: data.payload.Username,
            SourceIp: data.payload.SourceIp,
            Application: data.payload.Application
        }};
        stream.emit("data", output);
    }
  });

  api_str.on("data", function(data) {
    console.log("Received API event");
    let output = {payload: {
        EventData: data.payload.EventDate,
        ConnectedAppId: data.payload.ConnectedAppId,
        Query: data.payload.Query,
        SourceIp: data.payload.SourceIp,
        Username: data.payload.Username
    }};
    stream.emit("data", output);
});
  uri_str.on("data", function(data) {
    console.log("Received URIevent");
    let output = {payload: {
        EventData: data.payload.EventDate,
        PageUrl: data.payload.PageUrl,
        RecordId: data.payload.RecordId,
        SourceIp: data.payload.SourceIp,
        Username: data.payload.Username
    }};
    stream.emit("data", output);
});
});

module.exports = { org, stream };
