import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import Header from './components/Header'; // Ensure this component is defined
import Chat from './components/Chat';
import Trend from './components/Trend';

export default function App() {
  const { isLoggedIn, account } = useAuth(); // Ensure we're getting account info if needed
  const [currentPage, setCurrentPage] = useState('chat'); // Track which page is active

  // Function to navigate between pages
  const navigate = (page) => {
    setCurrentPage(page);
  };

  return (
    <div className="App">
      {/* Pass the navigate function as onNavigate prop to Header */}
      <Header onNavigate={navigate} />
      
      {/* Render main content based on authentication status */}
      <div>
        {isLoggedIn ? (
          <>
            {/* Render the current page */}
            <div>
              {currentPage === 'chat' && <ChatPage account={account} />}
              {currentPage === 'trend' && <TrendPage />}
            </div>
          </>
        ) : (
          <LoggedOutText />
        )}
      </div>
    </div>
  );
}

const ChatPage = ({ account }) => {
  return (
    <div>
      <Chat />
    </div>
  );
};

const TrendPage = () => {
  return (
    <div>
      <Trend />
    </div>
  );
};

const LoggedOutText = () => (
  <div>
    <p>Don't forget to start your backend server, then authenticate yourself.</p>
    <h1>LockedIn</h1>
  </div>
);
