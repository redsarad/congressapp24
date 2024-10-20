from flask import Flask, request, jsonify
from sklearn.linear_model import LinearRegression
import numpy as np

app = Flask(__name__)

@app.route('/analyze', methods=['POST'])
def analyze_trends():
    try:
        # Get JSON data from the request body
        input_data = request.get_json()

        # Extract dates and grades
        dates = input_data['dates']
        grades = np.array(input_data['grades'])

        # Linear regression to predict the trend
        X = np.array(dates).reshape(-1, 1)  # Reshape for sklearn
        y = np.array(grades)

        # Train the model
        model = LinearRegression()
        model.fit(X, y)

        # Get model details (slope and intercept of the trend line)
        slope = model.coef_[0]
        intercept = model.intercept_
        score = model.score(X, y)

        # Return the results as JSON
        output_data = {
            "slope": slope,
            "intercept": intercept,
            "score": score
        }
        return jsonify(output_data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8080)
