const express = require('express');
const router = express.Router();
const {
    addAvailableDevice,
    checkDeviceAvailability
} = require('../controllers/available_device.controller');

router.post('/add', addAvailableDevice);
router.get('/check/:deviceId', checkDeviceAvailability);

module.exports = router; 