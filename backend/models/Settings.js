import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema({
  startDate: {
    type: String,
    required: true
  }
});

export default mongoose.model("Settings", settingsSchema);
