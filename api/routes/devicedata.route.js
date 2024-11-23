const router = require('express').Router();

const { getDeviceData, addData } = require('../controllers/devicedata.controller');

router.post("/", getDeviceData);
router.post("/add", addData);

module.exports = router;