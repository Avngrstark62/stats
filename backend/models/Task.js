import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

export default mongoose.model("Task", taskSchema);
