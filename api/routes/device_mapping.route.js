const router = require('express').Router();
const { addDeviceMapping, getAllMappings } = require('../controllers/device_mapping.controller');

router.post('/add', addDeviceMapping);
router.get('/all', getAllMappings);

module.exports = router; 