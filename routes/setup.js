const express = require('express');
const router = express.Router();


const requestController = require('../controllers/request');


router.post('/send_request', requestController.sendRequest);


module.exports = router;
