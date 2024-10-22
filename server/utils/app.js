// Existing imports...
const express = require('express');
const cors = require('cors'); 
const fetch = require('node-fetch');
const path = require('path');
const { ORIGIN } = require('../constants'); 
const { MongoClient } = require('mongodb');
const fs = require('fs');

// Initialize app
const app = express();
const { API_KEY, ACCOUNT_ID, MONGO_URI } = process.env;

// Middlewares
app.use(cors({ origin: ORIGIN }));
app.use(express.json({ extended: true }));
app.use(express.urlencoded({ extended: false })); 

async function run(model, input) {
    const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/${model}`,
        {
            headers: { Authorization: `Bearer ${API_KEY}` },
            method: "POST",
            body: JSON.stringify(input),
        }
    );
    const result = await response.json();
    return result;
}

MongoClient.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then((client) => {
        db = client.db('congress24');
        console.log("Connected to MongoDB");
    })
    .catch((error) => console.error("Error connecting to MongoDB:", error));

// API route for response generation
app.post('/api/study-aid', async (req, res) => {
    console.log(req.body);
    console.log(req.body.question);
    try {
        const input = {
            messages: [
                {
                    role: "system",
                    content: "You are a friendly assistant that helps students get better at grades and improve themselves.",
                },
                {
                    role: "user",
                    content: req.body.question || "How do I study for an English test?", // Default prompt
                },
            ],
            max_tokens: 2048
        };

        const result = await run("@cf/meta/llama-3-8b-instruct", input);
        res.json(result); // Send the generated story back to the client
    } catch (error) {
        console.error("Error during API call:", error);
        res.status(500).json({ error: "An error occurred while generating the response." });
    }
});

// API route for trend analysis
app.post('/trendanalyze', async (req, res) => {
    const { dates, grades, subject } = req.body;

    // Check for required fields
    if (!dates || !grades || !subject) {
        return res.status(400).json({ error: "Dates, grades, and subject are required." });
    }

    const input = { dates, grades };

    try {
        // Call the Flask server to analyze trends
        const flaskResponse = await fetch('http://127.0.0.1:5000/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input),
        });

        if (!flaskResponse.ok) {
            const errorData = await flaskResponse.json();
            return res.status(500).json({ error: errorData.error });
        }

        const result = await flaskResponse.json();
        const plotUrl = `http://127.0.0.1:5000/static/${result.plot}`; // Construct plot URL

        // Fetch the image buffer from the absolute URL
        const imageBuffer = await fetch(plotUrl).then(res => {
            if (!res.ok) throw new Error('Failed to fetch the image.');
            return res.buffer();
        });

        const imagePath = path.join(__dirname, '../../analyze/static', 'grade_trend_plot.png');

        // Save the image to the server
        fs.writeFileSync(imagePath, imageBuffer); // Save the image buffer

        // Prepare question for study aid
        const questionForStudyAid = `What can you say about the grades for ${subject} based on the following data: Dates - ${dates}, Grades - ${grades}?`;
        
        // Generate study aid response
        const studyAidInput = {
            messages: [
                {
                    role: "system",
                    content: "You are a friendly assistant that given a group of dates, the overall grade for that class on that given date(not the test grade, overall class grade), and a subject, will give a detailed study plan and will NOT ask follow up questions to the user.",
                },
                { role: "user", content: questionForStudyAid },
            ],
            max_tokens: 2048,
        };

        const studyAidResult = await run("@cf/meta/llama-3-8b-instruct", studyAidInput); // Define studyAidResult here

        // Send back the analysis and the response from study aid
        res.json({
            message: 'Grade data updated successfully',
            analysis: result, // Analysis data from Flask
            plot: plotUrl, // Include the plot URL in the response
            studyAid: studyAidResult // Include the response from study-aid
        });

    } catch (error) {
        console.error("Error during trend analysis:", error);
        if (!res.headersSent) { // Check if headers are already sent
            res.status(500).json({ error: "An error occurred while analyzing trends." });
        }
    }
});


// Error handling
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send();
    next();
});

module.exports = app;
