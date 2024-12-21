const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authentication');
const deviceMappingController = require('../controllers/device_mapping.controller');

const {
    addDeviceMapping,
    getAllMappings,
    updateDeviceMapping,
    removeDeviceMapping
} = require('../controllers/device_mapping.controller');

// Thêm middleware xác thực cho tất cả các routes
router.use(authMiddleware);

router.post('/add', addDeviceMapping);
router.get('/all', getAllMappings);
router.put('/update/:deviceId', updateDeviceMapping);
router.delete('/remove/:deviceId', removeDeviceMapping);

module.exports = router; 