import { useState } from 'react';

const GradeTrendAnalyzer = () => {
  const [dates, setDates] = useState(''); // State to store the dates
  const [grades, setGrades] = useState(''); // State to store the grades
  const [subject, setSubject] = useState(''); // State to store the subject
  const [analysis, setAnalysis] = useState(null); // Store the analysis from API
  const [plotImage, setPlotImage] = useState(''); // State to store the plot image URL

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare the payload
    const payload = {
      dates: dates.split(',').map(date => date.trim()),
      grades: grades.split(',').map(Number), // Convert grades to an array of numbers
      subject: subject,
    };

    try {
      // Call the API
      const response = await fetch('http://localhost:3001/trendanalyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      // Check if the response contains the analysis and the plot image
      if (data && data.analysis) {
        setAnalysis(data.analysis); // Use the nested "analysis" object
        setPlotImage(data.plot); // Set the plot image URL from the response
      } else {
        console.error('Unexpected API response:', data);
        // Optionally reset states if there's an error
        setAnalysis(null);
        setPlotImage('');
      }
    } catch (error) {
      console.error('Error making API request:', error);
      // Optionally reset states if there's an error
      setAnalysis(null);
      setPlotImage('');
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Grade Trend Analyzer</h1>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="form-group">
          <label>Dates (comma-separated):</label>
          <input
            type="text"
            className="form-control"
            value={dates}
            onChange={(e) => setDates(e.target.value)}
            placeholder="e.g. 2024-01-01, 2024-01-15, 2024-02-01"
          />
        </div>
        <div className="form-group">
          <label>Grades (comma-separated):</label>
          <input
            type="text"
            className="form-control"
            value={grades}
            onChange={(e) => setGrades(e.target.value)}
            placeholder="e.g. 85, 90, 78"
          />
        </div>
        <div className="form-group">
          <label>Subject:</label>
          <input
            type="text"
            className="form-control"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Math, History"
          />
        </div>
        <button type="submit" className="btn btn-primary">Analyze</button>
      </form>

      {/* Display the analysis */}
      {analysis && (
        <div className="analysis-box mb-4">
          <h3>Analysis</h3>
          <p><strong>Result:</strong> {analysis.analyze}</p>
        </div>
      )}

      {/* Display the plot image if available */}
      {plotImage && (
        <div className="plot-image mb-4">
          <h3>Grade Trend Plot</h3>
          <img src={plotImage} alt="Grade Trend Plot" style={{ maxWidth: '100%', height: 'auto' }} />
        </div>
      )}
    </div>
  );
};

export default GradeTrendAnalyzer;
