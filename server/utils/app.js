const express = require('express'); // Backend App (server)
const cors = require('cors'); // HTTP headers (enable requests)
const fetch = require('node-fetch'); // Required for making API calls
const { ORIGIN } = require('../constants'); // Ensure this constant is defined

// initialize app
const app = express();
const { ORIGIN, API_KEY, ACCOUNT_ID } = process.env;

// middlewares
app.use(cors({ origin: ORIGIN }));
app.use(express.json({ extended: true })); // body parser
app.use(express.urlencoded({ extended: false })); // url parser

// Function to call the Llama-3 model
async function run(model, input) {
    const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/ai/run/${model}`,
        {
            headers: { Authorization: 'Bearer ${API_KEY}' },
            method: "POST",
            body: JSON.stringify(input),
        }
    );
    const result = await response.json();
    return result;
}

// API route for story generation
app.post('/api/study-aid', async (req, res) => {
    try {
        const input = {
            messages: [
                {
                    role: "system",
                    content: "You are a friendly assistant that helps students get better at grades and improve themselves. Your name is LockedIn AI. ",
                },
                {
                    role: "user",
                    content: req.body.content || "How do I study for an English test?", // Default prompt
                },
            ],
        };

        const result = await run("@cf/meta/llama-3-8b-instruct", input);
        res.json(result); // Send the generated story back to the client
    } catch (error) {
        console.error("Error during API call:", error);
        res.status(500).json({ error: "An error occurred while generating the story." });
    }
});

// Error handling
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).send();
    next();
});

module.exports = app;
