var express = require('express');
var router = express.Router();
var exerciseController = require('../controllers/exerciseController');
var exerciseCrudController = require('../controllers/exerciseCrudController');
var asyncHandler = require('../utils/asyncHandler');

router.get('/exercises', function(req, res) {
    res.render('exercises', { title: 'Exercise Library' });
});

router.get('/api/exercise-search', asyncHandler(exerciseController.getExercises));

router.post('/api/exercises', asyncHandler(exerciseCrudController.createExercise));
router.get('/api/exercises', asyncHandler(exerciseCrudController.listExercises));
router.get('/api/exercises/:id', asyncHandler(exerciseCrudController.getExercise));
router.put('/api/exercises/:id', asyncHandler(exerciseCrudController.updateExercise));
router.delete('/api/exercises/:id', asyncHandler(exerciseCrudController.deleteExercise));

module.exports = router;