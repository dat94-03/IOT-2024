const router = require('express').Router();

const { getByUser, create, update, destroy } = require('../controllers/room.controller');

router.get('/', getByUser);
router.post('/', create);
router.put('/', update);
router.delete('/', destroy);

module.exports = router;