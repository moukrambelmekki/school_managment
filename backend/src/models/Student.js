const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    first_name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    last_name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    date_birthday: {
      type: Date,
      required: true,
    },
    sexe: {
      type: String,
      enum: ['Male', 'Female'],
      required: true,
    },
    class_info: {
      class_name: {
        type: String,
        required: true,
        trim: true,
      },
      level: {
        type: String,
        enum: ['1st MS', '2nd MS', '3rd MS', '4th MS'],
        required: true,
      },
    },
    registration_date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

studentSchema.index({ first_name: 'text', last_name: 'text', 'class_info.class_name': 'text' });

module.exports = mongoose.model('Student', studentSchema);
