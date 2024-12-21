import { useState } from 'react';
import { PageContainer, Input, Button } from '../../components';
import { useForm } from 'react-hook-form';
import api from '../../axios';

function ChangePassword() {
  const [submissionError, setSubmissionError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, getValues, reset } = useForm();

  const changePassword = async (data) => {

    setLoading(true);
    setSubmissionError(null); // Reset previous errors
    try {
      await api.post('/reset-password', {
        oldPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      alert('Password changed successfully!');
      reset()
    } catch (error) {
      const apiError = error.response?.data?.message || 'Failed to change password. Please try again.';
      setSubmissionError(apiError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer className="h-auto">
      <div className='w-full py-3 text-3xl text-slate-600 font-light font-serif border-b-2 text-center'>
        Change Password
      </div>
      <form className='my-5 md:px-40 sm:px-4' onSubmit={handleSubmit(changePassword)}>
        {/* Current Password */}
        <Input
          type="password"
          placeholder="Enter current password"
          {...register('currentPassword', { required: 'Current password is required' })}
          error={errors.currentPassword?.message}
        />

        {/* New Password */}
        <Input
          type="password"
          placeholder="Create new password"
          {...register("newPassword", {
            required: "New password is required",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters long",
            },
          })}
          error={errors.newPassword?.message}
        />

        {/* Confirm New Password */}
        <Input
          type="password"
          placeholder="Re-enter new password"
          {...register("confirmPassword", {
            required: "Password confirmation is required",
            validate: (value) =>
              value === getValues("newPassword") || "Passwords do not match",
          })}
          error={errors.confirmPassword?.message}
        />

        {/* Password Match Indicator */}
        {getValues("newPassword") &&
          getValues("confirmPassword") &&
          getValues("newPassword") === getValues("confirmPassword") && (
            <p className="text-green-500 text-sm">Passwords match</p>
          )}

        {/* Submission Error */}
        {submissionError && <p className="text-red-500 text-sm mt-2">{submissionError}</p>}

        {/* Submit Button */}
        <Button type="submit" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit'}
        </Button>
      </form>
    </PageContainer>
  );
}

export default ChangePassword;
