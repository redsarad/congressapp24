import matplotlib
matplotlib.use('Agg')  # Use non-GUI backend
import matplotlib.pyplot as plt
import numpy as np
import os
from datetime import datetime
from flask import Flask, request, jsonify

# Initialize Flask app
app = Flask(__name__)

# Ensure the static directory exists
static_dir = 'static'
if not os.path.exists(static_dir):
    os.makedirs(static_dir)

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        data = request.get_json()

        # Assume the following keys are present in the data
        dates = data['dates']  # list of dates
        grades = data['grades']  # list of grades
        subject = data.get('subject', 'Subject')  # Default subject if not provided

        # Convert date strings to datetime objects
        date_objects = [datetime.strptime(date, "%Y-%m-%d") for date in dates]

        # Calculate the difference in days from the first date
        reference_date = date_objects[0]
        X = np.array([(date - reference_date).days for date in date_objects]).reshape(-1, 1)
        y = np.array(grades)

        # Perform linear regression
        model = LinearRegression()
        model.fit(X, y)

        # Extract model parameters
        slope = model.coef_[0]
        intercept = model.intercept_
        score = model.score(X, y)

        # Determine the analysis message based on the slope
        if slope > 1:
            analysis_message = "Huge overall increase!"
        elif 0 < slope <= 1:
            analysis_message = "Steady overall increase"
        elif -1 <= slope < 0:
            analysis_message = "Steady overall decrease"
        elif slope < -1:
            analysis_message = "Huge overall decrease"
        else:
            analysis_message = "No change so far"

        # Create the plot
        plt.figure(figsize=(10, 5))
        plt.plot(dates, grades, marker='o', linestyle='-', color='b')
        plt.title(f'Grade Trend for {subject}')
        plt.xlabel('Date')
        plt.ylabel('Grades')
        plt.xticks(rotation=45)
        plt.tight_layout()

        # Generate a unique filename for the plot
        plot_filename = f'plot_{datetime.now().strftime("%Y%m%d_%H%M%S")}.png'
        plot_path = os.path.join(app.static_folder, plot_filename)  # Correct path to save
        plt.savefig(plot_path)
        plt.close()

        # Prepare the output data
        output_data = {
            "slope": slope,
            "intercept": intercept,
            "score": score,
            "analysis": analysis_message,  # Changed key to 'analysis'
            "plot": f'/static/{plot_filename}'  # URL path to the plot for frontend use
        }

        return jsonify(output_data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
