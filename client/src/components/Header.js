import { Fragment, useState } from 'react';
import {
  AppBar,
  IconButton,
  Avatar,
  Popover,
  List,
  ListSubheader,
  ListItemButton,
  Button,
  Toolbar,
  Box,
} from '@mui/material';
import OnlineIndicator from './OnlineIndicator';
import AuthModal from './AuthModal';
import { useAuth } from '../contexts/AuthContext';
import logo from '../logo_processed.png';

export default function Header({ onNavigate }) {
  const { isLoggedIn, account, logout } = useAuth();

  const [anchorEl, setAnchorEl] = useState(null);
  const [popover, setPopover] = useState(false);
  const [authModal, setAuthModal] = useState(false);
  const [register, setRegister] = useState(false);

  const openPopover = (e) => {
    setPopover(true);
    setAnchorEl(e.currentTarget);
  };

  const closePopover = () => {
    setPopover(false);
    setAnchorEl(null);
  };

  const clickLogin = () => {
    setRegister(false);
    setAuthModal(true);
    closePopover();
  };

  const clickRegister = () => {
    setRegister(true);
    setAuthModal(true);
    closePopover();
  };

  return (
    <AppBar className="header" position="static">
      <Toolbar style={{ justifyContent: 'space-between', width: '100%' }}>
        {/* Left Side - Title and Buttons */}
        <Box display="flex" alignItems="center">
          <img src={logo} style={{height:"80px"}}/>
          {isLoggedIn && (
            <Box ml={2}>
              <Button color="inherit" onClick={() => onNavigate('chat')}>
                Chat
              </Button>
              <Button color="inherit" onClick={() => onNavigate('trend')}>
                Trend
              </Button>
            </Box>
          )}
        </Box>

        {/* Right Side - Avatar and OnlineIndicator */}
        <Box display="flex" alignItems="center" ml="auto">
          <IconButton onClick={openPopover}>
            <OnlineIndicator online={isLoggedIn}>
              <Avatar src={account?.username || ''} alt={account?.username || ''} />
            </OnlineIndicator>
          </IconButton>
        </Box>
      </Toolbar>

      <Popover
        anchorEl={anchorEl}
        open={popover}
        onClose={closePopover}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <List style={{ minWidth: '100px' }}>
          <ListSubheader style={{ textAlign: 'center' }}>
            Hello, {isLoggedIn ? account.username : 'Guest'}
          </ListSubheader>

          {isLoggedIn ? (
            <ListItemButton onClick={logout}>Logout</ListItemButton>
          ) : (
            <Fragment>
              <ListItemButton onClick={clickLogin}>Login</ListItemButton>
              <ListItemButton onClick={clickRegister}>Register</ListItemButton>
            </Fragment>
          )}
        </List>
      </Popover>

      <AuthModal
        open={authModal}
        close={() => setAuthModal(false)}
        isRegisterMode={register}
        toggleRegister={() => setRegister((prev) => !prev)}
      />
    </AppBar>
  );
}
