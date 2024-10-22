import Markdown from 'markdown-to-jsx';
import React, { useState, useEffect } from 'react';

const GradeTrendAnalyzer = () => {
  const [dates, setDates] = useState('');
  const [grades, setGrades] = useState('');
  const [subject, setSubject] = useState('');
  const [newSubject, setNewSubject] = useState('');
  const [analysis, setAnalysis] = useState(null);
  const [studyAid, setStudyAid] = useState(null); // Separate state for study aid
  const [plotImage, setPlotImage] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [subjectData, setSubjectData] = useState({});
  const [loading, setLoading] = useState(false);

  // Load data from local storage when the component mounts
  useEffect(() => {
    const savedSubjects = JSON.parse(localStorage.getItem('subjects')) || [];
    const savedSubjectData = JSON.parse(localStorage.getItem('subjectData')) || {};
    
    setSubjects(savedSubjects);
    setSubjectData(savedSubjectData);

    if (subject) {
      setDates(savedSubjectData[subject]?.dates || '');
      setGrades(savedSubjectData[subject]?.grades || '');
    }
  }, [subject]); // Run when subject changes

  // Save data to local storage whenever dates, grades, or subject changes
  useEffect(() => {
    if (subject) {
      const updatedSubjectData = {
        ...subjectData,
        [subject]: { dates, grades },
      };
      setSubjectData(updatedSubjectData);
      localStorage.setItem('subjectData', JSON.stringify(updatedSubjectData));
      localStorage.setItem('subjects', JSON.stringify(Object.keys(updatedSubjectData)));
    }
  }, [dates, grades, subject]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      dates: dates.split(',').map(date => date.trim()),
      grades: grades.split(',').map(Number),
      subject: subject,
    };

    try {
      const response = await fetch('http://localhost:3001/trendanalyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      // Check if the response contains the analysis and the study aid
      if (data && data.analysis) {
        setAnalysis(data.analysis); // Set the analysis object
        setPlotImage(data.plot); // Set the plot image URL
        setStudyAid(data.studyAid.result.response); // Extract the study aid response
      } else {
        console.error('Unexpected API response:', data);
        // Reset states if there's an error
        setAnalysis(null);
        setPlotImage('');
        setStudyAid(null);
      }
    } catch (error) {
      console.error('Error making API request:', error);
      // Reset states if there's an error
      setAnalysis(null);
      setPlotImage('');
      setStudyAid(null);
    } finally {
      setLoading(false);
    }
  };

  const addDate = () => {
    if (selectedDate) {
      setDates((prevDates) => 
        prevDates ? `${prevDates}, ${selectedDate}` : selectedDate
      );
      setSelectedDate('');
    }
  };

  const handleSubjectChange = (e) => {
    const selectedSubject = e.target.value;
    setSubject(selectedSubject);

    if (selectedSubject) {
      const savedData = subjectData[selectedSubject] || {};
      setDates(savedData.dates || '');
      setGrades(savedData.grades || '');
    } else {
      setDates('');
      setGrades('');
    }
  };

  const handleNewSubject = () => {
    if (newSubject && !subjects.includes(newSubject)) {
      const updatedSubjects = [...subjects, newSubject];
      setSubjects(updatedSubjects);
      setSubjectData((prevData) => ({
        ...prevData,
        [newSubject]: { dates: '', grades: '' }
      }));

      localStorage.setItem('subjects', JSON.stringify(updatedSubjects));
      localStorage.setItem('subjectData', JSON.stringify({
        ...subjectData,
        [newSubject]: { dates: '', grades: '' }
      }));
      
      setSubject(newSubject);
      setNewSubject('');
    }
  };

  const handleDeleteSubject = () => {
    if (subject) {
      const updatedSubjects = subjects.filter(subj => subj !== subject);
      const updatedSubjectData = { ...subjectData };
      delete updatedSubjectData[subject];

      setSubjects(updatedSubjects);
      setSubjectData(updatedSubjectData);
      setSubject('');

      localStorage.setItem('subjects', JSON.stringify(updatedSubjects));
      localStorage.setItem('subjectData', JSON.stringify(updatedSubjectData));
      setDates('');
      setGrades('');
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">Grade Trend Analyzer</h1>

      <form onSubmit={handleSubmit} className="mb-4">
        <div className="form-group">
          <label>Subject:</label>
          <select 
            className="form-control mb-2" 
            value={subject} 
            onChange={handleSubjectChange}
          >
            <option value="">Select a Subject</option>
            {subjects.map((subj, index) => (
              <option key={index} value={subj}>{subj}</option>
            ))}
          </select>

          {subject === "" && (
            <>
              <input 
                type="text" 
                className="form-control mb-2" 
                placeholder="New Subject"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
              />
              <button 
                type="button" 
                className="btn btn-secondary mb-2"
                onClick={handleNewSubject}
              >
                Add New Subject
              </button>
            </>
          )}
          
          {subject && (
            <button 
              type="button" 
              className="btn btn-danger mb-2"
              onClick={handleDeleteSubject}
            >
              Delete Selected Subject
            </button>
          )}
        </div>
        
        <div className="form-group">
          <label>Dates:</label>
          <div className="input-group">
            <input
              type="date"
              className="form-control"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
            <button
              type="button"
              className="btn btn-primary ml-2"
              onClick={addDate}
            >
              Add Date
            </button>
          </div>
          <input
            type="text"
            className="form-control mt-2"
            value={dates}
            onChange={(e) => setDates(e.target.value)}
            placeholder="Dates (comma separated)"
          />
        </div>
        
        <div className="form-group">
          <label>Grades:</label>
          <input
            type="text"
            className="form-control"
            value={grades}
            onChange={(e) => setGrades(e.target.value)}
            placeholder="Grades (comma separated)"
          />
        </div>
        
        <button type="submit" className="btn btn-primary">Analyze</button>
      </form>

      {loading && (
        <div className="spinner-border text-primary ml-2" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      )}

      {analysis && (
        <div className="analysis-box mb-4">
          <h3>Brief Analysis</h3>
          <p><strong>Overall trend:</strong> {analysis.analyze}</p>
          <p><strong>Average change:</strong> {analysis.slope.toFixed(2)}</p>
        </div>
      )}

      {studyAid && (
        <div className="study-aid-box mb-4">
          <h3>Study Plan</h3>
          <p><Markdown>{studyAid}</Markdown></p>
        </div>
      )}

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
