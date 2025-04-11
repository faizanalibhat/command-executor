const express = require("express");
const router = express.Router();

const controller = require("../controllers/handler.controller")

router.get("/results", controller.getResults);
router.post("/commands", controller.storeCommands);

module.exports = router;