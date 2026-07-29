const { validateWorkoutInput } = require('../utils/workoutValidation');
const { calculateVolume, categorizeLoad, minRequiredMinutes } = require('../utils/workoutCalculations');

function calculateWorkout(req, res) {
    const { errors, values } = validateWorkoutInput(req.body);
    const { setsNum, repsNum, weightNum, durationNum } = values;

    if (errors.length === 0) {
        const totalReps = setsNum * repsNum;
        const minMinutes = minRequiredMinutes(totalReps);
        if (durationNum < minMinutes) {
            errors.push(`Duration is too short for ${totalReps} total reps. Minimum realistic duration is about ${minMinutes.toFixed(1)} minutes.`);
        }
        if (weightNum > 500) errors.push('Weight value seems unrealistic (over 500 kg). Please check your input.');
        if (repsNum > 100) errors.push('Repetitions value seems unrealistic (over 100 per set). Please check your input.');
    }

    if (errors.length > 0) {
        return res.render('index', { title: 'Express', error: errors.join(' ') });
    }

    const totalVolume = calculateVolume(setsNum, repsNum, weightNum);
    res.render('index', {
        title: 'Express',
        result: {
            exercise: req.body.exercise,
            totalVolume: totalVolume.toFixed(2),
            volumePerMinute: (totalVolume / durationNum).toFixed(2),
            loadCategory: categorizeLoad(totalVolume)
        }
    });
}

module.exports = { calculateWorkout };