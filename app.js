const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const errorHandler = require("./middlewares/errorHandler");
const routes = require("./routes/index");

const timeoutId = setTimeout(() => {
  console.log("EXITING - NO COMMANDS RECIEVED.");
  process.exit(0);
}, 1000*60*5);


const PORT = process.env.CMDEXEC_PORT || 80;

const app = express();

app.use(bodyParser.json({ limit: '50mb'}));


// check for request on /urls
app.use(async (req, res, next) => {
    const path = req.path;
    console.log("[+] REQUST ON : " + path);
    if (path == "/commands") {
      // clear the timeout
      clearTimeout(timeoutId);
    }
    return next();
});

app.use("/", routes);

// status endpoint
app.get("/status", (req, res) => {
  return res.json({ status: "live" });
});


app.use("*", (req, res) => {
  return res.json({message: "route not found."});
});


app.use(errorHandler);


mongoose.connect(process.env.CMDEXEC_MONGODB_URL)
.then(() => {
    console.log("MONGODB CONNECTED");
})
.catch((error) => {
    console.log("[-] FAILED TO CONNECT MONGODB : ", error);
});


app.listen(PORT, () => {
  console.log("[+] COMMAND EXECUTOR IS RUNNING ON PORT : " + PORT);
});
