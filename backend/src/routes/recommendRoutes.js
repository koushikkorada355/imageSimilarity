const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { recommend } = require('../controllers/recommendController');

router.post('/', upload.single('image'), recommend);

module.exports = router;
