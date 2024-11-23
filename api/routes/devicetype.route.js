const router = require('express').Router();

const { getAll, create, update } = require('../controllers/devicetype.controller');

router.get("/", getAll);
router.post("/", create);
router.put("/", update);

module.exports = router;