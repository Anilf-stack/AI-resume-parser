const express = require("express");
const axios = require("axios");
const dotenv = require("dotenv");
const Resume = require("../models/Resume.js"); // Import Resume model

dotenv.config();
const router = express.Router();

// API to fetch jobs based on user's email
router.get("/:email", async (req, res) => {
  try {
    const { email } = req.params;

    // Find user resume from database
    const userResume = await Resume.findOne({ email });
    if (!userResume) {
      return res.status(404).json({ error: "Resume not found" });
    }

    let { skills, jobPreferences } = userResume;
    if (!skills || skills.length === 0) skills = ["software developer"]; // Default skill

    const query = skills.join(" "); // Convert skills array into a query string
    const location = jobPreferences?.location || "Remote"; // Default location

    // Fetch job listings from Adzuna API
    const response = await axios.get(`https://api.adzuna.com/v1/api/jobs/us/search/1`, {
      params: {
        app_id: process.env.ADZUNA_APP_ID,
        app_key: process.env.ADZUNA_API_KEY,
        what: query,
        where: location,
      },
    });

    // Extract relevant job details
    const jobs =
      response.data?.results?.map((job) => ({
        title: job.title,
        company: job.company.display_name,
        location: job.location.display_name,
        redirect_url: job.redirect_url,
      })) || [];

    res.json({ results: jobs });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch job listings" });
  }
});

module.exports = router;


