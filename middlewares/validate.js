const e = require("express");
const pick = require("../utils/pick");


const validateWith = function (schema) {
  return async function (req, res, next) {

    // pick the required keys from req object.
    const obj = pick(req, ['body', 'params', 'query']);
    
    const { error, value } = schema.validate(obj);
    
    if (error) {
      return res.status(400).json({ message: "Invalid request", error: error });
    }
    
    next();
  }
}


module.exports = validateWith;