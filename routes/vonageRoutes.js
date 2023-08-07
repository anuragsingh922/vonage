const express = require("express");
const router = express();
const axios = require("axios");
const path = require('path');
const fs = require("fs");
const FormData = require("form-data");

const controller = require("../controller");

router.get('/voice/call', controller.makeOutboundCall);
router.get("/voice/answer", controller.answerCall);
router.post("/voice/event", controller.handleEvents);

module.exports = router;