const mongoose = require('mongoose');
const MUSCLE_GROUPS = [
    'chest',
    'back',
    'shoulders',
    'arms',
    'legs',
    'core',
    'full_body',
    'cardio'
];

const EQUIPMENT_TYPES = [
    'bodyweight',
    'dumbbell',
    'barbell',
    'kettlebell',
    'machine',
    'cable',
    'resistance_band',
    'other'
];

const exerciseSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'Exercise name is required.'],
            trim: true,
            minlength: [2, 'Exercise name must be at least 2 characters.'],
            maxlength: [100, 'Exercise name must be at most 100 characters.']
        },
        muscleGroup: {
            type: String,
            required: [true, 'muscleGroup is required.'],
            enum: {
                values: MUSCLE_GROUPS,
                message: `muscleGroup must be one of: ${MUSCLE_GROUPS.join(', ')}.`
            }
        },
        equipment: {
            type: String,
            required: [true, 'equipment is required.'],
            enum: {
                values: EQUIPMENT_TYPES,
                message: `equipment must be one of: ${EQUIPMENT_TYPES.join(', ')}.`
            }
        }
    },
    { timestamps: true, collection: 'exercises' }
);

exerciseSchema.index({ muscleGroup: 1 });
exerciseSchema.index({ name: 1 });

module.exports = mongoose.model('Exercise', exerciseSchema);
module.exports.MUSCLE_GROUPS = MUSCLE_GROUPS;
module.exports.EQUIPMENT_TYPES = EQUIPMENT_TYPES;