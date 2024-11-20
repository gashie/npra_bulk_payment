const express = require("express");
const router = express.Router();

const requestController = require("../controllers/request");

router.post("/ne", requestController.sendRequest);

module.exports = router;
