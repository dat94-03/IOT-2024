const router = require('express').Router();
const { addDeviceMapping, getAllMappings, removeDeviceMapping } = require('../controllers/device_mapping.controller');

router.post('/add', addDeviceMapping);
router.get('/all', getAllMappings);
router.delete('/remove/:deviceId',removeDeviceMapping)

module.exports = router; 