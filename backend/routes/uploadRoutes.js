const express = require("express");
const multer = require("multer");
const fs = require("fs");
const dotenv = require("dotenv");
const axios = require("axios");
const Resume = require("../models/Resume.js");
const mammoth = require("mammoth");
const pdfParse = require("pdf-parse");

dotenv.config();

const router = express.Router();
const upload = multer({ dest: "uploads/", limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

router.post("/", upload.single("resume"), async (req, res) => {
  try {
    const email = req.body.email?.trim();
    if (!req.file || !email) {
      return res.status(400).json({ error: "Missing file or email" });
    }

    const filePath = req.file.path;
    let fileData;

    try {
      if (req.file.mimetype === "application/pdf") {
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await pdfParse(dataBuffer);
        fileData = pdfData.text.trim();
      } else {
        const result = await mammoth.extractRawText({ path: filePath });
        fileData = result.value.trim();
      }
      if (!fileData) throw new Error("Empty resume content");
    } catch (readError) {
      return res.status(500).json({ error: "Failed to extract text from resume" });
    }

    let aiResponse;
    try {
      aiResponse = await axios.post(
        `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${process.env.GEMINI_API_KEY}`,
        {
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: `Extract skills and job preferences from this resume. STRICTLY return only a JSON object, with no explanations, no markdown, and no extra text. Example:
                  {
                    "skills": ["React", "Node.js", "MongoDB"],
                    "jobPreferences": "Full-stack Developer"
                  }
                  Resume: ${fileData}`
                }
              ],
            },
          ],
        },
        { headers: { "Content-Type": "application/json" } }
      );
    } catch (apiError) {
      return res.status(500).json({ error: "AI service unavailable" });
    }

    const aiOutput = aiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    const cleanedOutput = aiOutput.replace(/```json/g, "").replace(/```/g, "").trim();
    const jsonStartIndex = cleanedOutput.indexOf("{");
    const jsonEndIndex = cleanedOutput.lastIndexOf("}");

    if (jsonStartIndex === -1 || jsonEndIndex === -1) {
      return res.status(500).json({ error: "Invalid AI response format" });
    }

    const validJson = cleanedOutput.substring(jsonStartIndex, jsonEndIndex + 1);
    let extractedData;

    try {
      extractedData = JSON.parse(validJson);
    } catch (jsonError) {
      return res.status(500).json({ error: "Failed to parse AI response" });
    }

    const skills = extractedData.skills || [];
    const jobPreferences = extractedData.jobPreferences || "Software Engineer";
    
    const newResume = new Resume({ email, skills, jobPreferences });
    await newResume.save();

    fs.unlinkSync(filePath);

    res.status(201).json({ message: "Resume processed successfully!", skills, jobPreferences });
  } catch (error) {
    res.status(500).json({ error: "Failed to process resume" });
  }
});

module.exports = router;
