const router = require('express').Router();
const { getByRoom, getDeviceSensorData } = require('../controllers/device.controller');

router.get("/room/:roomId", getByRoom);
router.get("/sensor/:roomId", getDeviceSensorData);

module.exports = router;