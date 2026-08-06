var express = require('express');
var router = express.Router();
var outdoorController = require('../controllers/outdoorController');
var asyncHandler = require('../utils/asyncHandler');

router.get('/outdoor-training', function(req, res) {
    res.render('outdoor', { title: 'Outdoor Training & Facilities' });
});

router.get('/api/weather', asyncHandler(outdoorController.getWeather));
router.get('/api/facilities', asyncHandler(outdoorController.getFacilities));
router.get('/api/outdoor-training', asyncHandler(outdoorController.getOutdoorTraining));

module.exports = router;