const mongoose = require('mongoose');

const workoutSchema = new mongoose.Schema(
    {
        date: {
            type: Date,
            required: [true, 'date is required.'],
            validate: {
                validator: (value) => value instanceof Date && !Number.isNaN(value.getTime()),
                message: 'date must be a valid date.'
            }
        },
        duration: {
            type: Number,
            required: [true, 'duration is required.'],
            min: [1, 'duration must be a positive number of minutes.']
        },
        notes: {
            type: String,
            trim: true,
            maxlength: [1000, 'notes must be at most 1000 characters.'],
            default: ''
        }
    },
    { timestamps: true, collection: 'workouts' }
);

workoutSchema.index({ date: -1 });

module.exports = mongoose.model('Workout', workoutSchema);