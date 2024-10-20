const express = require('express'); // Backend App (server)
const cors = require('cors'); // HTTP headers (enable requests)
const fetch = require('node-fetch'); // Required for making API calls
const { ORIGIN } = require('../constants'); // Ensure this constant is defined
const { PythonShell } = require('python-shell');
const path = require('path');

// initialize app
const app = express();
const { API_KEY, ACCOUNT_ID } = process.env;

// middlewares
app.use(cors({ origin: ORIGIN }));
app.use(express.json({ extended: true })); // body parser
app.use(express.urlencoded({ extended: false })); // url parser

// Function to call the Llama-3 model
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
        };

        const result = await run("@cf/meta/llama-3-8b-instruct", input);
        res.json(result); // Send the generated story back to the client
    } catch (error) {
        console.error("Error during API call:", error);
        res.status(500).json({ error: "An error occurred while generating the response." });
    }
});

app.post('/trendanalyze', async (req, res) => {
    try {
        console.log(req.body);
        const { dates, grades } = req.body;

        // Prepare the data for the Flask API
        const input = { dates, grades };

        // Call the Flask server
        const flaskResponse = await fetch('http://127.0.0.1:8080/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input)
        });

        const result = await flaskResponse.json();
        const intercept = result.intercept;
        const slope = result.slope;
        const score = result.score;
        if(slope>0&&slope<1){
            console.log("Steady increase");
        }
        if(slope>1){
            console.log("Huge increase!");
        }
        if(slope>-1&&slope<0){
            console.log("Steady decrease");
        }
        if(slope<-1){
            console.log("Huge decrease");
        }
        if (flaskResponse.ok) {
            res.json(result); // Send the trend data back to the client
        } else {
            console.error("Error from Flask API:", result);
            res.status(500).json({ error: result.error || "Failed to analyze trends." });
        }
    } catch (error) {
        console.error("Error during trend analysis:", error);
        res.status(500).json({ error: "An error occurred while analyzing trends." });
    }
});


// Error handling
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send();
    next();
});
module.exports = app;
