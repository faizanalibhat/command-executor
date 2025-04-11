const mongoose = require("mongoose");


const resultSchema = new mongoose.Schema({
    any: {}
}, { strict: false });

const Result = mongoose.model("result", resultSchema);


module.exports = Result;