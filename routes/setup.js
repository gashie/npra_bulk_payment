const express = require("express");
const router = express.Router();

const requestController = require("../controllers/request");
const requestftcController = require("../controllers/request_ftc");

router.post("/ne", requestController.sendRequest);
router.post("/ft", requestftcController.sendRequest);

module.exports = router;
