const express = require('express');
const cors = require('cors'); 
const fetch = require('node-fetch');
const path = require('path');
const { ORIGIN } = require('../constants'); 
const { MongoClient } = require('mongodb');
const fs = require('fs');

// initialize app
const app = express();
const { API_KEY, ACCOUNT_ID,MONGO_URI } = process.env;



// middlewares
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
        const { dates, grades, subject } = req.body; // Ensure 'subject' is included

        // Prepare the data for the Flask API
        const input = { dates, grades };

        // Call the Flask server and receive the plot image
        const flaskResponse = await fetch('http://127.0.0.1:5000/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(input)
        });

        // Check if the response is OK
        if (flaskResponse.ok) {
            const result = await flaskResponse.json(); // Get JSON first
            
            // Construct the absolute URL for the plot
            const plotUrl = `http://127.0.0.1:5000/static/${result.plot}`; // Combine base URL and relative path
            
            // Fetch the image buffer from the absolute URL
            const imageBuffer = await fetch(plotUrl).then(res => {
                if (!res.ok) {
                    throw new Error('Failed to fetch the image.');
                }
                return res.buffer(); 
            });

            const imagePath = path.join(__dirname, '../../analyze/static', 'grade_trend_plot.png');

            // Save the image to the server
            fs.writeFileSync(imagePath, imageBuffer); // Save the image buffer
            res.json({
                message: 'Grade data updated successfully',
                analysis: result, // This is your analysis data returned from Flask
                plot: plotUrl // Include the plot URL in the response
            });
        } else {
            const errorData = await flaskResponse.json();
            res.status(500).json({ error: errorData.error });
        }

        // Update the user's grades in MongoDB (assuming userId is defined)
        await db.collection('grades').updateOne(
            { /* Add criteria here when you're ready to use userId */ },
            {
                $set: {
                    [`subjects.${subject}.dates`]: dates,
                    [`subjects.${subject}.grades`]: grades
                }
            },
            { upsert: true }  // Insert the user if it doesn’t exist
        );

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
