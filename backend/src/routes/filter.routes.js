const express = require('express');
const router = express.Router();
const filterController = require('../modules/admin/controllers/filter.controller');

router.get('/', filterController.getFilters);

module.exports = router;
