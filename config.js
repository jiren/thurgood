// actionHero Config File
// I will be loded into api.configData

var fs = require('fs');
var cluster = require('cluster');

var configData = {};

/////////////////////////
// General Information //
/////////////////////////

configData.general = {
  apiVersion: "0.0.1",
  serverName: "Thurgood API",
  // id: "myActionHeroServer",                                    // id can be set here, or generated dynamically.  be sure that every server you run as a unique ID (which will happen when genrated dynamically)
  serverToken: process.env.SERVER_TOKEN,                                       // A unique token to your application which servers will use to authenticate to eachother
  welcomeMessage : "Hello! Welcome to the Thurgood!",        // The welcome message seen by TCP and webSocket clients upon connection
  flatFileDirectory: __dirname + "/public/",                      // The directory which will be the root for the /public route
  flatFileNotFoundMessage: "Sorry, that file is not found :(",    // The body message to acompany 404 (file not found) errors regading flat files
  serverErrorMessage: "The server experienced an internal error", // The message to acompany 500 errors (internal server errors)
  defaultChatRoom: "defaultRoom",                                 // the chatRoom that TCP and webSocket clients are joined to when the connect
  defaultLimit: 100,                                              // defaultLimit & defaultOffset are useful for limiting the length of response lists. 
  defaultOffset: 0,
  workers : 5,                                                    // The number of internal "workers" (timers) this node will have.
  developmentMode: true,                                         // watch for changes in actions and tasks, and reload/restart them on the fly
  pidFileDirectory: process.cwd() + "/pids/",                     // the location of the directory to keep pidfiles
  simultaneousActions: 50,                                          // how many pending actions can a single connection be working on 
  apiKey: null,                                                          // set by startup middleware and used by internal calls to create jobs
  skipAuthorization: process.env.SKIP_AUTH || false, // determined if the middleware check for an API Key should be skipped
  scanOnlyProjectName: "Checkmarx Scan Only"
};

/////////////
// logging //
/////////////

configData.logger = {
  transports: []
};

// console logger
if(cluster.isMaster){
  configData.logger.transports.push(function(api, winston){
    return new (winston.transports.Console)({
      colorize: true, 
      level: "debug", 
      timestamp: api.utils.sqlDateTime
    });
  });
}

// file logger
try{ 
  fs.mkdirSync("./log");
}catch(e){
  if(e.code != "EEXIST"){ console.log(e); process.exit(); }
}
configData.logger.transports.push(function(api, winston){
  return new (winston.transports.File)({
    filename: './log/' + api.pids.title + '.log',
    level: "info",
    timestamp: true
  });
});

///////////
// Redis //
///////////

configData.redis = {
  fake: process.env.USE_FAKE_REDIS || true,
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || null,
  options: null,
  DB: 0,
};

//////////
// FAYE //
//////////

configData.faye = {
  mount: "/faye",
  timeout: 45,
  ping: null,
};

/////////////
// SERVERS //
/////////////

configData.servers = {
  "web" : {
    secure: false,                       // HTTP or HTTPS?
    serverOptions: {},                   // passed to https.createServer if secure=ture. Should contain SSL certificates
    port: process.env.PORT || 5000,         // Port or Socket
    bindIP: "0.0.0.0",                   // which IP to listen on (use 0.0.0.0 for all)
    httpHeaders : {},                    // Any additional headers you want actionHero to respond with
    urlPathForActions : "api",           // route which actions will be served from; secondary route against this route will be treated as actions, IE: /api/?action=test == /api/test/
    urlPathForFiles : "public",          // route which static files will be served from; path (relitive to your project root) to server static content from
    rootEndpointType : "file",            // when visiting the root URL, should visitors see "api" or "file"? visitors can always visit /api and /public as normal
    directoryFileType : "index.html",    // the default filetype to server when a user requests a directory
    flatFileCacheDuration : 60,          // the header which will be returend for all flat file served from /public; defiend in seconds
    fingerprintOptions : {               // settings for determining the id of an http(s) requset (browser-fingerprint)
      cookieKey: "sessionID",
      toSetCookie: true,
      onlyStaticElements: false
    },
    formOptions: {                       // options to be applied to incomming file uplaods.  more options and details at https://github.com/felixge/node-formidable
      uploadDir: "/tmp",
      keepExtensions: false,
      maxFieldsSize: 1024 * 1024 * 100
    },
    returnErrorCodes: false              // when enabled, returnErrorCodes will modify the response header for http(s) clients if connection.error is not null.  You can also set connection.responseHttpCode to specify a code per request.
  },
  // "socket" : {
  //   secure: false,                        // TCP or TLS?
  //   serverOptions: {},                    // passed to tls.createServer if secure=ture. Should contain SSL certificates
  //   port: 5000,                           // Port or Socket
  //   bindIP: "0.0.0.0",                    // which IP to listen on (use 0.0.0.0 for all)
  // },
  // "websocket" : {
  // },
};

/////////////
// MONGODB //
/////////////

configData.mongo = {
  serverUri: process.env.MONGODB_SERVER_URI
};

////////////////
// PAPERTRAIL //
////////////////

configData.papertrail = {
  accountsUrl: process.env.PAPERTRAIL_DIST_URL + "/accounts",
  systemsUrl: process.env.PAPERTRAIL_DIST_URL + "/systems",
  auth: {
    username: process.env.PAPERTRAIL_DIST_USERNAME,
    password: process.env.PAPERTRAIL_DIST_PASSWORD
  }
};

//////////////
// RABBITMQ //
//////////////

configData.rabbitmq = {
  url: process.env.RABBITMQ_URL,
  queue: process.env.RABBITMQ_QUEUE
};

//////////////
// GOOGLE //
//////////////

configData.google = {
  redirectUrl : process.env.GOOGLE_REDIRECT_URL || "http://localhost:5000/api/auth/google/return"
}

// set the app's main url from the google redirect url
configData.general.appUrl =  configData.google.redirectUrl.substr(0,configData.google.redirectUrl.indexOf("/api"));
//////////////////////////////////

exports.configData = configData;
