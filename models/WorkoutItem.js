const mongoose = require('mongoose');

const { Schema } = mongoose;

const workoutItemSchema = new Schema(
  {
    workoutId: {
      type: Schema.Types.ObjectId,
      ref: 'Workout',
      required: [true, 'workoutId is required.'],
      validate: {
        validator: async function (value) {
          const query = mongoose.model('Workout').exists({ _id: value });
          if (this.$session()) {
            query.session(this.$session());
          }
          return Boolean(await query);
        },
        message: 'Referenced workout does not exist.'
      }
    },
    exerciseId: {
      type: Schema.Types.ObjectId,
      ref: 'Exercise',
      required: [true, 'exerciseId is required.'],
      validate: {
        validator: async function (value) {
          const query = mongoose.model('Exercise').exists({ _id: value });
          if (this.$session()) {
            query.session(this.$session());
          }
          return Boolean(await query);
        },
        message: 'Referenced exercise does not exist.'
      }
    },
    sets: {
      type: Number,
      required: [true, 'sets is required.'],
      min: [1, 'sets must be a positive whole number.'],
      validate: {
        validator: Number.isInteger,
        message: 'sets must be a whole number.'
      }
    },
    reps: {
      type: Number,
      required: [true, 'reps is required.'],
      min: [1, 'reps must be a positive whole number.'],
      validate: {
        validator: Number.isInteger,
        message: 'reps must be a whole number.'
      }
    },
    weight: {
      type: Number,
      required: [true, 'weight is required.'],
      min: [0.01, 'weight must be greater than zero.']
    }
  },
  { timestamps: true, collection: 'workoutItems' }
);

workoutItemSchema.index({ workoutId: 1 });
workoutItemSchema.index({ exerciseId: 1 });

module.exports = mongoose.model('WorkoutItem', workoutItemSchema);
