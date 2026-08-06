var express = require('express');
var router = express.Router();
var nutritionController = require('../controllers/nutritionController');
var asyncHandler = require('../utils/asyncHandler');

router.get('/nutrition', function(req, res) {
    res.render('nutrition', { title: 'Food & Nutrition' });
});

router.get('/api/nutrition', asyncHandler(nutritionController.getFoods));

module.exports = router;