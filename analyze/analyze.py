import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
import os
from datetime import datetime
from flask import Flask, request, jsonify
from sklearn.linear_model import LinearRegression

app = Flask(__name__)

@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        data = request.get_json()

        # Assume the following keys are present in the data
        dates = data['dates']  # list of dates
        grades = data['grades']  # list of grades
        subject = data.get('subject', '')
        print("Subject: ", subject)

        # Convert date strings to datetime objects
        date_objects = [datetime.strptime(date, "%Y-%m-%d") for date in dates]

        # Convert dates to ordinal values for regression
        X = np.array([date.toordinal() for date in date_objects]).reshape(-1, 1)
        y = np.array(grades)

        # Fit the linear regression model
        model = LinearRegression()
        model.fit(X, y)

        slope = model.coef_[0]
        intercept = model.intercept_
        score = model.score(X, y)

        # Determine the analysis message based on the slope
        if slope > 0.25:
            analyze = "Huge overall increase!"
        elif 0 < slope <= 0.25:
            analyze = "Steady overall increase"
        elif -0.25 <= slope < 0:
            analyze = "Steady overall decrease"
        elif slope < -0.25:
            analyze = "Huge overall decrease"
        else:
            analyze = "No change so far"

        # Create the plot
        plt.figure(figsize=(10, 5))
        plt.plot(date_objects, grades, marker='o')  # Use datetime objects for plotting
        plt.title(f'Grade Trend Analysis')
        plt.xlabel('Date')
        plt.ylabel('Grades')
        plt.xticks(rotation=45)
        plt.tight_layout()
        # Removed legend as per your request

        # Generate a unique filename for the plot
        plot_filename = f'plot_{datetime.now().strftime("%Y%m%d_%H%M%S")}.png'
        plot_path = os.path.join('static', plot_filename)  # Ensure 'static' directory exists

        # Save the plot
        plt.savefig(plot_path)
        plt.close()  # Close the figure to free up memory

        # Prepare the output data
        output_data = {
            "slope": slope,
            "intercept": intercept,
            "score": score,
            "analyze": analyze,
            "plot": f'/{plot_filename}'  # Include the path to the plot for frontend use
        }

        return jsonify(output_data)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
