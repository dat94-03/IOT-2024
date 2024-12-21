const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authentication');

const {
    addDeviceMapping,
    getAllMappings,
    updateMapping,
    removeDeviceMapping
} = require('../controllers/device_mapping.controller');

// Thêm middleware xác thực cho tất cả các routes
router.use(authMiddleware);

router.post('/add', addDeviceMapping);
router.get('/all', getAllMappings);
router.put('/update', updateMapping);
router.delete('/remove/:deviceId', removeDeviceMapping);

module.exports = router; 