import { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import Header from './components/Header'; // Ensure this component is defined
import Chat from './components/Chat';
import Trend from './components/Trend';
import Top from './topimage.png';
import ChatImg from './chat.png';
import Grade from './gradetrend.png';
import { blue } from '@mui/material/colors';

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
  <div style={{ padding: '0px', margin: '0' }}>
    <h1 style={{ fontSize: '4rem', textAlign: 'center' , marginTop:'20px'}}>Lock In with LockedIn</h1>
    <h2 id="description" style={{ fontSize: '1.5rem', textAlign: 'center', marginBottom: '20px' }}>
      A revolutionary tool aiding underprivileged and marginalized students to academic excellence 
      through cutting-edge AI and Machine Learning
    </h2>
    <img id="first-pic" src={Top} style={{ height: 'auto', width: '100%', maxWidth: '1500px', display: 'block', margin: '0 auto 20px' }} alt="Top image" />
    <br></br>
    <br></br>
    <main>
      <section style={{ marginTop: '10px', height:'80px',textAlign: 'center', display: 'flex', justifyContent: 'space-around', alignItems: 'center', backgroundColor:'lightgray'}}>
      <h2>What do we offer?</h2>
      </section>
    
    <section id="use-way" style={{ marginBottom: '40px', textAlign: 'center', display: 'flex', justifyContent: 'space-around', alignItems: 'center', backgroundColor:'lightgray'}}>
  <div style={{ flex: '1', margin: '10px' }}>
    <h2>1. LockedIn AI</h2>
    <p style={{ fontSize: '1.5rem', textAlign: 'center' }}>
      A revolutionary AI chatbot powered by Meta's Llama 3
    </p>
  </div>
  
  <div style={{ flex: '1', margin: '10px' }}>
    <h2>2. Grade Trend Analyzer</h2>
    <p style={{ fontSize: '1.5rem', textAlign: 'center' }}>
      Analyzes trends and creates action plans
    </p>
  </div>
</section><section id="chatbot-section" style={{
    marginBottom: '40px',
    padding: '20px', // Added padding for the entire section
}}>
    <h2 id="chatbot-title" style={{ fontSize: '2rem', textAlign: 'center'}}>1. LockedIn AI</h2>
    <img id="second-pic" src={ChatImg} style={{ height: 'auto', width: '100%', maxWidth: '1500px', display: 'block', margin: '0 auto 20px' }} alt="Chatbot image" />
    <p style={{ fontSize: '1rem', textAlign: 'center', padding: '0 10px' }}> {/* Added horizontal padding */}
        Our revolutionary chatbot, powered by Meta's very own Llama 3, is designed to help you with any of your study needs. 
        From explaining complex calculus to analyzing Macbeth, our chatbot can assist you in your academic endeavors.
    </p>
</section>

<section id="gradetrendanalyzer-section" style={{ 
    marginBottom: '40px', 
    width: 'auto', 
    backgroundColor: 'lightgray', // Added light gray background
    padding: '20px' // Added padding for the entire section
}}>
    <h2 id="gradetrend-title" style={{ fontSize: '2rem', textAlign:'center' }}>2. Grade Trend Analyzer</h2>
    <img id="third-pic" src={Grade} style={{ height: 'auto', width: '100%', maxWidth: '1500px', display: 'block', margin: '0 auto 20px' }} alt="Grade Trend Analyzer image" />
    <p style={{ fontSize: '1rem', textAlign: 'center', padding: '0 10px' }}> {/* Added horizontal padding */}
        Every goal needs an action plan. However, it's hard to come up with an action plan. We take the planning out of plan and let you focus on the action. 
        We take your grade at certain dates and use Machine Learning to determine how your grade is trending, and with the help of LockedIn AI, 
        devise an action plan to help you succeed.
    </p>
</section>
<section id="chatbot-section" style={{
    marginBottom: '40px',
    padding: '20px', // Added padding for the entire section
}}>
    <h2 id="chatbot-title" style={{ fontSize: '2rem', textAlign: 'center' }}>Sign up now and get access to these resources FOR FREE!</h2>
</section>
    </main>
  </div>
);
