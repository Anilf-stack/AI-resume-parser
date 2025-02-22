const mongoose = require("mongoose");

const ResumeSchema = new mongoose.Schema({
  email: { type: String, required: true,  unique: true },
  skills: [String],
  jobPreferences: String,
});

module.exports = mongoose.model("Resume", ResumeSchema);
