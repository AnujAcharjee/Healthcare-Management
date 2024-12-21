import { useState } from 'react';
import { useSelector } from 'react-redux';
import EditProfile from './EditProfile.jsx';
import { PageContainer, Button } from "../../components"
import PatientProfile from './PatientProfile.jsx';
import DoctorProfile from './DoctorProfile.jsx'
import HospitalProfile from './HospitalProfile.jsx'
import Avatar from '@mui/material/Avatar';

const dateOptions = {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "long",
    day: "numeric",
};

function stringToColor(string) {
    let hash = 0;
    let i;

    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = '#';

    for (i = 0; i < 3; i += 1) {
        const value = (hash >> (i * 8)) & 0xff;
        color += `00${value.toString(16)}`.slice(-2);
    }
    /* eslint-enable no-bitwise */

    return color;
}

function stringAvatar(name) {
    return {
        sx: {
            bgcolor: stringToColor(name),
        },
        children: `${name.split(' ')[0][0]}${name.split(' ')[1][0]}`,
    };
}

const ProfilePage = () => {
    const [showEditForm, setShowEditForm] = useState(false)

    const { userData, loading, error } = useSelector((state) => state.user);

    if (loading) return <p>Loading user data...</p>;
    if (error) return <p>!!ERROR: {error}</p>;
    if (!userData) return <p>Failed to fetch user data {error}</p>;

    return (
        <PageContainer className="max-w-6xl mx-auto p-4">
            {/* Cover Image */}
            {userData.userType === "Hospital" && userData.avatar && (
                <img
                    src={userData.avatar.url || "/display pic.jpeg"}
                    alt="Cover Image"
                    className="w-full md:h-60 sm:h-10 object-fill rounded-t-lg shadow-sm mb-4 border-yellow-300 border-2"
                />
            )}

            {/* Profile Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
                <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4 sm:px-4">
                    <div className={"flex border-b-2 border-gray-200 pb-2"}>
                        {userData.userType !== "Hospital" && userData.avatar && (
                            <>
                                <Avatar
                                    src={userData.avatar.url !== "" ? userData.avatar.url : "/display pic.jpeg"}
                                    alt="Profile Pic"
                                    {...(userData.avatar.url === "" ? stringAvatar(userData.name) : {})}
                                    sx={{ width: 100, height: 100 }}
                                    className="border-2 border-green-400 shadow-xl"
                                />
                            </>
                        )}
                        <div className='w-full p-2 ml-3 text-left'>
                            <h1 className="text-3xl font-semibold text-gray-800">{userData.name}</h1>
                            {userData.userType === "Patient" && (
                                <>
                                    <p className="text-gray-600">{new Date(userData.DOB).toLocaleDateString("en-IN", dateOptions)}</p>
                                    <p className="text-gray-600">gender: {userData.gender}</p>
                                </>
                            )}
                            {userData.userType === "Doctor" && (
                                <>
                                    <p className="text-gray-600">hospital: {userData.hospitalName}</p>
                                    <p className="text-gray-600">specialization: {userData.specialization}</p>
                                </>
                            )}
                            {userData.userType === "Hospital" && (
                                <>
                                    <p className="text-gray-600">{userData.ownership}</p>
                                    <p className="text-gray-600">{userData.city}, {userData.state} ( {userData.zip} )</p>
                                </>
                            )}
                        </div>
                    </div>
                    {userData.description && (<p className="text-gray-600 text-left">{userData.description}</p>)}

                    {/* Edit Profile Button */}
                    <Button
                        onClick={() => setShowEditForm(true)}
                        className="w-full py-1 px-4 mt-4"
                    >
                        Edit Profile
                    </Button>
                </div>
            </div>

            {showEditForm &&
                <EditProfile
                    className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50"
                    onClose={() => setShowEditForm(false)}
                />
            }

            {/* Contact Information */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-8 ">
                <h2 className="text-xl font-semibold text-blue-600 border-b-2 border-blue-400 pb-2 mb-4 font-serif">
                    Contact Information
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <p className="text-gray-600">
                        <span className="font-semibold text-gray-800">Email:</span> {userData.email}
                    </p>
                    <p className="text-gray-600">
                        <span className="font-semibold text-gray-800">Phone:</span> {userData.phone}
                    </p>
                </div>
            </div>

            {/* Profile Details by UserType */}
            {userData.userType === "Patient" && <PatientProfile />}
            {userData.userType === "Doctor" && <DoctorProfile />}
            {userData.userType === "Hospital" && <HospitalProfile />}

            {/* <Footer /> */}
        </PageContainer>
    );
};

export default ProfilePage;
