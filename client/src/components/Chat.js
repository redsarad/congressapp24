import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Markdown from 'markdown-to-jsx'; // Import markdown-to-jsx

const Chat = () => {
  const { account } = useAuth();
  const [userInput, setUserInput] = useState(''); // Manage textbox input
  const [chatHistory, setChatHistory] = useState([]); // Store chat history
  const [loading, setLoading] = useState(false); // Loading state for the spinner

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Set loading to true when the request starts

    try {
      // Example API call
      const response = await fetch('http://localhost:3001/api/study-aid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: userInput }), // Send the user input
      });

      const data = await response.json();
      
      // Update chat history with new question and response
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { question: userInput, response: data.result.response },
      ]);
      
      // Clear input field after submission
      setUserInput('');
    } catch (error) {
      console.error('Error making API request:', error);
    } finally {
      setLoading(false); // Set loading to false when the request completes
    }
  };

  return (
    <div className="container mt-4">
      <h1 className="mb-4">LockedIn AI</h1>

      {/* Render chat history */}
      {chatHistory.length > 0 && (
        <div className="response-box border-0 rounded p-3 bg-transparent">
          {chatHistory.map((chat, index) => (
            <div key={index} style={{ marginBottom: '1rem' }}>
              <strong>{account.username}: </strong> {chat.question}
              <br/>
              <strong> LockedIn AI:</strong>
              <span className="markdown-response" style={{
                padding: '10px',
                fontFamily: 'Roboto, sans-serif',
                fontSize: '15px',
              }}>
                <Markdown>{chat.response}</Markdown> {/* Render Markdown here */}
              </span>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form-inline mb-4">
        <div className="form-group mr-2">
          <input
            type="text"
            className="form-control"
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Enter your request"
          />
        </div>
        <button type="submit" className="btn btn-primary">Send</button>
      </form>

      {/* Loading indicator */}
      {loading && <div className="spinner-border text-primary" role="status">
        <span className="sr-only">Loading...</span>
      </div>}
    </div>
  );
};

export default Chat;
