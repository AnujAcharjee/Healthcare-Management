import RemoveCircleIcon from '@mui/icons-material/RemoveCircle';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import PasswordIcon from '@mui/icons-material/Password';

import  { useState } from 'react';
import ChangePassword from "./ChangePassword.jsx";
import ChangeContact from "./ChangeContact.jsx";
import DeleteAccount from "./DeleteAccount.jsx";

const items = [
  {
    icon: <PasswordIcon className='mx-3 rounded-lg border border-slate-600' />,
    name: "Change Password",
    component: <ChangePassword />,
  },
  {
    icon: <ManageAccountsIcon className='mx-3 rounded-lg border border-slate-600' />,
    name: "Change Email & Phone number",
    component: <ChangeContact />,
  },
  {
    icon: <RemoveCircleIcon className='mx-3 rounded-lg border border-slate-600' />,
    name: "Delete Account",
    component: <DeleteAccount />,
  }
];

function SettingsPage() {
  const [activePage, setActivePage] = useState(null);

  // Toggle page visibility
  const togglePage = (name) => {
    setActivePage(prev => (prev === name ? null : name)); // If it's already open, close it, else open it
  };

  return (
    <>
      <div className='w-full text-3xl text-slate-600 font-light font-serif border-b-2 mb-2 pb-2'>
        Settings
      </div>
      <div className='mb-2'>
        {items.map((item, index) => (
          <div key={index}>
            <button
              onDoubleClick={() => togglePage(item.name)} // Toggle the page on double-click
              onClick={() => togglePage(item.name)} // Open page on single-click
              className='w-full md:py-6 py-4 px-4 my-2 border bg-yellow-200 hover:bg-yellow-100 rounded-md text-left shadow-md sm:text-sm'
            >
              {item.icon}
              {item.name}
            </button>

            {/* Render corresponding page component */}
            {activePage === item.name && item.component}
          </div>
        ))}
      </div>
    </>
  );
}

export default SettingsPage;
