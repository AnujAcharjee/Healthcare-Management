import { createBrowserRouter } from 'react-router-dom';

import App from './App.jsx';
import {
    RegisterUser,
    LoginUser,
    LogoutUser,
    ResetPassword,
} from './components/auth/index.js';
import MainPage from './pages/Main.page.jsx';
import {
    MedicalRecordsPage,
    AppointmentsPage,
} from './pages/patient/index.js';
import SettingsPage from './pages/settings/SettingsPage.jsx';
import ProfilePage from './pages/profile/ProfilePage.jsx';
import WardData from './pages/hospital/WardData.jsx';
import Prescribe from './pages/doctor/Prescribe.jsx';

const routerConfig = createBrowserRouter([
    {
        path: '/dashboard',
        element: <App />,
    },
    {
        path: '/signup',
        element: <RegisterUser />,
    },
    {
        path: '/login',
        element: <LoginUser />,
    },
    {
        path: '/logout',
        element: <LogoutUser />,
    },
    {
        path: '/reset-password',
        element: <ResetPassword />,
    },
    {
        path: '/user',
        element: <MainPage />,
        children: [
            {
                index: true,
                element: <ProfilePage />,
            },
            {
                path: 'settings',
                element: <SettingsPage />,
            },
            {
                path: 'medical-records',
                element: <MedicalRecordsPage />,
            },
            {
                path: 'appointments',
                element: <AppointmentsPage />,
            },
            {
                path: 'hospital/ward',
                element: <WardData />,
            },
            {
                path: 'prescribe',
                element: <Prescribe />,
            }
        ],
    },
]);

export default routerConfig;
