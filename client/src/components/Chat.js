import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Markdown from 'markdown-to-jsx';

const Chat = () => {
  const { account } = useAuth();
  const [userInput, setUserInput] = useState('');
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Reference to the chat container
  const chatContainerRef = useRef(null);

  // Load chat history from localStorage when component mounts
  useEffect(() => {
    const savedChatHistory = localStorage.getItem('chatHistory');
    if (savedChatHistory) {
      setChatHistory(JSON.parse(savedChatHistory));
    }
  }, []);

  // Save chat history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('chatHistory', JSON.stringify(chatHistory));
    scrollToBottom(); // Scroll to bottom when chat history updates
  }, [chatHistory]);

  // Scroll to the bottom of the chat
  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/study-aid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: userInput }),
      });

      const data = await response.json();

      setChatHistory((prevHistory) => [
        ...prevHistory,
        { question: userInput, response: data.result.response },
      ]);

      setUserInput('');
    } catch (error) {
      console.error('Error making API request:', error);
    } finally {
      setLoading(false);
    }
  };

  // Clear chat history
  const clearChatHistory = () => {
    setChatHistory([]);
    localStorage.removeItem('chatHistory');
  };

  return (
    <div className="container mt-4">
      <div className="header-container text-center">
        <h1 className="mb-4">LockedIn AI</h1>
      </div>

      {chatHistory.length > 0 && (
        <div className="response-box border-0 rounded p-3 bg-transparent" style={{ maxHeight: '800px', overflowY: 'auto' }}>
          {chatHistory.map((chat, index) => (
            <div key={index} style={{ marginBottom: '1rem' }}>
              <strong>{account.username}: </strong> {chat.question}
              <br />
              <strong>LockedIn AI:</strong>
              <span
                className="markdown-response"
                style={{
                  padding: '10px',
                  fontFamily: 'Roboto, sans-serif',
                  fontSize: '15px',
                }}
              >
                <Markdown>{chat.response}</Markdown>
              </span>
            </div>
          ))}
          {/* Dummy div to scroll into view */}
          <div ref={chatContainerRef} />
        </div>
      )}

      {/* Form to submit chat input */}
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
        {loading && (
        <div className="spinner-border text-primary ml-2" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      )}
      </form>

      {/* Clear Chat Button */}
      {chatHistory.length > 0 && (
        <button onClick={clearChatHistory} className="btn btn-danger mb-4">
          Clear Chat
        </button>
      )}
    </div>
  );
};

export default Chat;
