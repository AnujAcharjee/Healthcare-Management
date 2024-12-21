import { useState } from 'react';
import { Input, Button, FormContainer } from '../../components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';

function ResetPassword() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setError,
        getValues,
        clearErrors,
        formState: { errors },
    } = useForm();

    const resetPassword = async (data) => {
        clearErrors("api");
        setLoading(true);
        const { email, newPassword, oldPassword } = data;
        try {
            await axios.post('/api/v1/patients/login/reset-password', { email, newPassword, oldPassword });
            navigate('/patient/login');
        } catch (error) {
            setError('api', {
                type: 'manual',
                message: error.response?.data?.message || 'Password reset failed. Please try again.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <FormContainer>
            <h1 className="pb-8 text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-cyan-400 text-center">
                Reset Your Password
            </h1>
            {errors.api && <p className="text-red-600 mt-4 text-center">{errors.api.message}</p>}

            <form className="flex flex-col gap-4 pb-4" onSubmit={handleSubmit(resetPassword)}>
                <Input
                    placeholder="Enter your email"
                    type="email"
                    {...register('email', {
                        required: 'Email is required',
                        pattern: {
                            value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                            message: 'Invalid email format',
                        },
                    })}
                />
                {errors.email && <p className="text-red-600 text-sm">{errors.email.message}</p>}

                <Input
                    placeholder="Enter previous password"
                    type="password"
                    {...register('oldPassword', {
                        required: 'Old password is required',
                        pattern: {
                            value: /^(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{4,}$/,
                            message:
                                'Password must have at least 4 characters, 1 special character, and 1 number',
                        },
                    })}
                />
                {errors.oldPassword && (
                    <p className="text-red-600 text-sm">{errors.oldPassword.message}</p>
                )}

                <Input
                    placeholder="Enter new password"
                    type="password"
                    {...register('newPassword', {
                        required: 'New password is required',
                        pattern: {
                            value: /^(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{4,}$/,
                            message:
                                'Password must have at least 4 characters, 1 special character, and 1 number',
                        },
                        validate: (value) =>
                            value !== getValues('oldPassword') || 'New Password must be different from old password'
                    })}
                />
                {errors.newPassword && (
                    <p className="text-red-600 text-sm">{errors.newPassword.message}</p>
                )}

                <Input
                    placeholder="Confirm new password"
                    type="password"
                    {...register('confirmPassword', {
                        required: 'Password confirmation is required',
                        pattern: {
                            value: /^(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{4,}$/,
                            message:
                                'Password must have at least 4 characters, 1 special character, and 1 number',
                        },
                        validate: (value) =>
                            value === getValues('newPassword') || 'Passwords do not match',
                    })}
                />
                {errors.confirmPassword && (
                    <p className="text-red-600 text-sm">{errors.confirmPassword.message}</p>
                )}
                {getValues('newPassword') &&
                    getValues('confirmPassword') &&
                    getValues('newPassword') === getValues('confirmPassword') && (
                        <p className="text-green-500 text-sm">Passwords match</p>
                    )}

                <Button
                    type="submit"
                    disabled={loading}
                    className={`w-full bg-gradient-to-r from-teal-500 to-green-500 text-white rounded-lg shadow-md font-semibold ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'
                        } focus:ring-4 focus:ring-teal-400 transition-opacity`}
                >
                    {loading ? 'Resetting Password...' : 'RESET PASSWORD'}
                </Button>
            </form>
        </FormContainer>
    );
}

export default ResetPassword;
