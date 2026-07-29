function validateWorkoutInput({ exercise, sets, reps, weight, duration }) {
    const errors = [];
    const setsNum = Number(sets);
    const repsNum = Number(reps);
    const weightNum = Number(weight);
    const durationNum = Number(duration);

    if (!exercise || exercise.trim() === '') errors.push('Exercise name is required.');
    if (!sets || isNaN(setsNum)) errors.push('Sets must be a number.');
    else if (setsNum <= 0) errors.push('Sets must be greater than zero.');
    return { errors, values: { setsNum, repsNum, weightNum, durationNum } };
}

module.exports = { validateWorkoutInput };