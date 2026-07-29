var express = require('express');
var router = express.Router();
var workoutController = require('../controllers/workoutController');

router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/calculate-workout', workoutController.calculateWorkout);

router.get('/training-terms', function(req, res, next) {
  res.render('training-terms', { title: 'Training Terms' });
});

module.exports = router;