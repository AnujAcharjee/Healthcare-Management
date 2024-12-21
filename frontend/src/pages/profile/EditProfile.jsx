/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Button, Input } from "../../components";
import { useForm } from "react-hook-form";
import api from "../../axios.js";
import { Camera, Cancel } from "@mui/icons-material";
import { useSelector, useDispatch as dispatch } from "react-redux";
import { fetchUserData } from "../../store/userSlice.js";

function EditProfile({ onClose }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [preview, setPreview] = useState(null);

    const userData = useSelector((state) => state.user.userData);

    const dob = new Date(userData.DOB); // Assuming `userData.DOB` is in a valid date string format
    const day = dob.getDate().toString().padStart(2, '0');  // Pad day with leading zero if necessary
    const month = (dob.getMonth() + 1).toString().padStart(2, '0');  // Months are 0-based, so add 1
    const year = dob.getFullYear().toString().slice(-2);  // Get last 2 digits of the year
    const formattedDob = `${day}-${month}-${year}`;

    const uploadAvatar = async (data) => {
        if (!data.avatar[0]) return;
        const formData = new FormData();
        formData.append("avatar", data.avatar[0]);
        setLoading(true);
        try {
            await api.patch("/profile/avatar", formData);
            setPreview(null);
            if (onClose) onClose();
            dispatch(fetchUserData());
        } catch (error) {
            setError(error.response?.data?.message || "Upload failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (data) => {
        setLoading(true);
        try {
            await api.patch("/profile", data);
            if (onClose) onClose();
        } catch (error) {
            setError(error.response?.data?.message || "Update failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    // Handle image preview
    const handleImagePreview = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setPreview(null);
        setValue("avatar", null);
    };

    const handleTextFieldChange = () => {

    }

    let textFieldItems = [{ label: "User Name", value: "name" }];
    switch (userData.userType) {
        case "Patient":
            textFieldItems.push(
                { label: "Gender", value: "gender" },
                { label: "Date of Birth", value: "DOB" }
            );
            break;
        case "Hospital":
            textFieldItems.push(
                { label: "Ownership", value: "ownership" },
                { label: "State", value: "state" },
                { label: "City", value: "city" },
                { label: "Zip", value: "zip" }
            );
            break;
        case "Doctor":
            textFieldItems.push(
                { label: "Specialization", value: "specialization" },
                { label: "Hospital Email", value: "hospitalEmail" },
                { label: "City", value: "city" },
                { label: "Description", value: "description" }
            );
            break;
        default:
            break;
    }

    const {
        register,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm();

    useEffect(() => {
        if (userData) {
            textFieldItems.forEach(item => {
                setValue(`${item.value}`, userData[item.value])
            })
        }
    }, [userData, setValue, textFieldItems])

    return (
        <>
            {/* Backdrop (Overlay) */}
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
                <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md md:w-3/4">
                    {loading ? <p className="text-green-500 text-center">Loading...</p> : <p className="text-green-500 text-center">Edit profile</p>}
                    <div className="flex justify-between items-center mb-6">
                        <Button
                            type="button"
                            onClick={
                                preview ? handleSubmit(uploadAvatar) : handleSubmit(updateProfile)
                            }
                            className="text-gray-500 hover:text-gray-700"
                        >
                            {preview ? "Upload" : "Save"}
                        </Button>

                        <Button
                            onClick={onClose}
                            color=" bg-red-500 hover:bg-red-300"
                            className="text-gray-500 hover:text-gray-700"
                        >
                            X
                        </Button>
                    </div>

                    <form onSubmit={handleSubmit(updateProfile)} className="space-y-1">
                        {/* Avatar Upload Section */}
                        <div
                            className={`relative  h-48 mx-auto border-4 border-gray-400 bg-slate-300
                               flex items-center justify-center cursor-pointer hover:border-blue-400 transition-all group ${userData.userType === "Hospital" ? "rounded-md w-full" : "rounded-full w-48"}`}
                            style={{
                                backgroundImage: preview ? `url(${preview})` : `url(${userData.avatar.url})`,
                                backgroundSize: "cover",
                                backgroundPosition: "center",
                            }}
                        >
                            {!preview && (
                                <Camera className="mx-auto text-gray-500 w-12 h-12" />
                            )}
                            <input
                                type="file"
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                {...register("avatar", {
                                    validate: {
                                        lessThan5MB: (files) =>
                                            !files[0] || files[0].size < 5 * 1024 * 1024 || "Max file size is 5MB",
                                        acceptedFormats: (files) =>
                                            !files[0] || files[0].type.startsWith("image/") || "Only image files are allowed",
                                    },
                                })}
                                onChange={handleImagePreview}
                            />
                            {preview && (
                                <div
                                    onClick={handleRemoveImage}
                                    className={`absolute top-0 right-0 bg-white p-1 cursor-pointer ${userData.userType === "Hospital" ? "rounded-md" : "rounded-full"}`}
                                >
                                    <Cancel className="w-6 h-6 text-gray-700" />
                                </div>
                            )}
                        </div>

                        {/* Form Fields */}
                        {
                            textFieldItems.length > 0 &&
                            textFieldItems.map((item, index) => (
                                <Input
                                    key={index}
                                    disabled={preview && item.value !== "avatar"}
                                    label={item.label}
                                    {...register(item.value, { required: `${item.label} is required` })}
                                    className="w-full"
                                />
                            ))
                        }
                        {errors.avatar && (
                            <p className="text-red-600 text-center mt-2">{errors.avatar.message}</p>
                        )}
                    </form>

                    {/* Error Alert */}
                    {error && (
                        <p className="text-red-600 text-sm mt-4" aria-live="assertive">{error}</p>
                    )}
                </div>
            </div>
        </>
    );
}

export default EditProfile;
