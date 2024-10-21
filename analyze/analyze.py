from flask import Flask, request, jsonify
from sklearn.linear_model import LinearRegression
import numpy as np
from datetime import datetime

app = Flask(__name__)

@app.route('/analyze', methods=['POST'])
def analyze_trends():
    try:
        input_data = request.get_json()

        # Convert dates and grades
        dates = input_data['dates']
        grades = np.array(input_data['grades'])

        # Convert date strings to datetime objects
        date_objects = [datetime.strptime(date, "%Y-%m-%d") for date in dates]

        # Calculate the difference in days from the first date
        reference_date = date_objects[0]
        X = np.array([(date - reference_date).days for date in date_objects]).reshape(-1, 1)
        y = np.array(grades)

        model = LinearRegression()
        model.fit(X, y)

        slope = model.coef_[0]
        intercept = model.intercept_
        score = model.score(X, y)

        # Determine the analysis message based on the slope
        if slope > 1:
            analyze = "Huge overall increase!"
        elif 0 < slope <= 1:
            analyze = "Steady overall increase"
        elif -1 <= slope < 0:
            analyze = "Steady overall decrease"
        elif slope < -1:
            analyze = "Huge overall decrease"
        else:
            analyze = "No change so far"

        output_data = {
            "slope": slope,
            "intercept": intercept,
            "score": score,
            "analyze": analyze
        }
        return jsonify(output_data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)
