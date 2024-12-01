const router = require('express').Router();
const { register, login, changePassword } = require('../controllers/user.controller');

router.post('/register', register);
router.post('/login', login);
router.post('/change-password', changePassword);

module.exports = router;