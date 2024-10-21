import { useAuth } from './contexts/AuthContext';
import Header from './components/Header';
import LoggedHeader from './components/Loggedheader';
import Chat from './components/Chat';
import Trend from './components/Trend';
export default function App() {
  const { isLoggedIn } = useAuth();

  return (
    <div className='App'>
      {isLoggedIn ?<Header />:<LoggedHeader/>}
      {isLoggedIn ? <LoggedInText /> : <LoggedOutText />}
    </div>
  );
}

const LoggedInText = () => {
  const { account } = useAuth();
  return <div>
    <Chat/>
    <Trend/>
    </div>
};

const LoggedOutText = () => (
  <div>
    <p>Don't forget to start your backend server, then authenticate yourself.</p>
    <h1>LockedIn</h1>
  </div>
  );