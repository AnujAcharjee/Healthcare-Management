import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux';
import { LogoutUser } from '../components/auth/index.js';
import { Outlet } from 'react-router-dom';
import Footer from '../components/Footer.jsx';
import { fetchUserData } from '../store/userSlice.js';
import Search from '../components/Search.jsx';

import { styled, useTheme } from '@mui/material/styles';
import { Box, SwipeableDrawer, CssBaseline, AppBar as MuiAppBar, Toolbar, List, Divider, IconButton, ListItem, ListItemButton, ListItemIcon, ListItemText, Typography } from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import LoginSharpIcon from '@mui/icons-material/LoginSharp';
import LogoutSharpIcon from '@mui/icons-material/LogoutSharp';
import SettingsIcon from '@mui/icons-material/Settings';
import HouseSharpIcon from '@mui/icons-material/HouseSharp';
import DriveFolderUploadSharpIcon from '@mui/icons-material/DriveFolderUploadSharp';
import LocalHospitalSharpIcon from '@mui/icons-material/LocalHospitalSharp';
import CreateIcon from '@mui/icons-material/Create';



const drawerWidth = 200;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })(
  ({ theme, }) => ({
    flexGrow: 1,
    padding: theme.spacing(0.5),
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginLeft: `-${drawerWidth}px`,
    variants: [
      {
        props: ({ open }) => open,
        style: {
          transition: theme.transitions.create('margin', {
            easing: theme.transitions.easing.easeOut,
            duration: theme.transitions.duration.enteringScreen,
          }),
          marginLeft: 0,
          // pointerEvents: 'none',  // Disable interactions when the drawer is open
        },
      },
    ],
  }),
);

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})(({ theme }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  variants: [
    {
      props: ({ open }) => open,
      style: {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: `${drawerWidth}px`,
        transition: theme.transitions.create(['margin', 'width'], {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
      },
    },
  ],
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

function MainPage() {
  const dispatch = useDispatch();
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  useEffect(() => {
    dispatch(fetchUserData())
  }, [dispatch,])

  const { userData, status, loading, error } = useSelector(state => state.user);

  if (loading) return <p>Loading user data...</p>;
  if (error) return <p>!!ERROR: {error}</p>;
  if (!userData) return <p>Failed to fetch user data {error}</p>;

  let navItems = [{ name: 'Home', icon: <HouseSharpIcon />, path: '/user', isActive: true }];
  switch (userData.userType) {
    case "Patient":
      navItems.push(
        { name: 'Medical Records', icon: <DriveFolderUploadSharpIcon />, path: '/user/medical-records', isActive: true, },
        { name: 'Appointments', icon: <LocalHospitalSharpIcon />, path: '/user/appointments', isActive: true, },
      );
      break;
    case "Hospital":
      navItems.push(

      );
      break;
    case "Doctor":
      navItems.push(
        { name: 'Prescribe', icon: <CreateIcon />, path: '/user/prescribe', isActive: true, },
      );
      break;
    default:
      break;
  }

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <CssBaseline />
        <AppBar
          color='success'
          position="fixed"
          open={open}
        >
          <Toolbar>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              onClick={handleDrawerOpen}
              edge="start"
              sx={[{ mr: 2, }, open && { display: 'none' },]}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" className="hidden sm:block">
              <i>Careplus</i>
            </Typography>

            {/* Search Btn */}
            <Search />

          </Toolbar>
        </AppBar>

        <SwipeableDrawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
          variant="persistent"
          anchor="left"
          open={open}
        >
          <DrawerHeader>
            <IconButton onClick={handleDrawerClose}>
              {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
            </IconButton>
          </DrawerHeader>
          <Divider />
          <List>
            {navItems.map((item) => (
              item.isActive &&
              <ListItem key={item.name} disablePadding>
                <ListItemButton component={Link} to={item.path}>
                  <ListItemIcon>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText primary={item.name} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Divider />
          <List>
            {!status ?
              (<ListItem key="LoginBtn" disablePadding>
                <ListItemButton component={Link} to="/login">
                  <ListItemIcon>
                    <LoginSharpIcon />
                  </ListItemIcon>
                  <ListItemText primary="Login" />
                </ListItemButton>
              </ListItem>) : (
                <ListItem key="LogoutBtn" disablePadding>
                  <ListItemButton onClick={() => setShowLogoutConfirm(true)}>
                    <ListItemIcon>
                      <LogoutSharpIcon />
                    </ListItemIcon>
                    <ListItemText primary="Logout" />
                  </ListItemButton>
                  {showLogoutConfirm && (
                    <LogoutUser
                      className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
                      onClose={() => setShowLogoutConfirm(false)}
                    />
                  )}
                </ListItem>)
            }
            <ListItem key="SettingsBtn" disablePadding>
              <ListItemButton component={Link} to="/user/settings">
                <ListItemIcon>
                  <SettingsIcon />
                </ListItemIcon>
                <ListItemText primary="Settings" />
              </ListItemButton>
            </ListItem>
          </List>

          <span className="mt-auto pb-1 text-sm text-gray-500 sm:text-center dark:text-gray-400">
            © 2024{" "}Careplus.
            <p> All Rights Reserved.</p>
          </span>
        </SwipeableDrawer>

        <Main open={open} className="bg-yellow-50 flex-col flex-1">
          <DrawerHeader />
          <Typography sx={{ height: '100%', minHeight: '100vh', flex: 1 }}>
            {/* Render nested routes here */}
            <Outlet />
          </Typography>
          <Footer />
        </Main>

      </Box>


    </>
  );
}


export default MainPage;