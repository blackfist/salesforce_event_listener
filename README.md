# API Stream display

This is a javascript app that connects to the platform events API and displays whatever events are generated after you subscribe.

## How to use

You need to set some environment variables. There is a file called `.env_sample` that contains environment variables. Change those to reflect
your environment.

You'll need to install the `nforce` library too with `npm install nforce`

Then you can run `node index.js`

## What is it doing

There's a library called `salesforce.js` which has the necessary code to authenticate to Salesforce with your username and password

```
let org = force.createConnection({
  clientId,
  clientSecret,
  environment: process.env.NODE_ENV == "production" ? "production" : "sandbox",
  redirectUri: "http://localhost:3000/oauth/_callback",
  mode: "single",
  version: "40.0",
  autoRefresh: true
});

org.authenticate({ username, password, securityToken }, (err, oauth) => { ...
```

After authenticating an objected called `oauth` contains the secret that is used for all other API calls. Then the code uses nforce's platform api client
to connect to the platform events API. Note that you have to specify `isEvent: true,` and `replayId: -1` for this to work.

Some functions are the attached to the subscription.
