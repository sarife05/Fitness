const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema(
    {
        date: {
            type: Date,
            required: [true, 'date is required.'],
            validate: {
                validator: (value) => value instanceof Date && !Number.isNaN(value.getTime()),
                message: 'date must be a valid date.'
            }
        },
        bodyWeight: {
            type: Number,
            required: [true, 'bodyWeight is required.'],
            min: [1, 'bodyWeight must be a positive number (kg).']
        },
        target: {
            type: Number,
            min: [1, 'target must be a positive number (kg) when provided.']
        },
        notes: {
            type: String,
            trim: true,
            maxlength: [1000, 'notes must be at most 1000 characters.'],
            default: ''
        }
    },
    { timestamps: true, collection: 'progress' }
);

progressSchema.index({ date: -1 });

module.exports = mongoose.model('Progress', progressSchema);