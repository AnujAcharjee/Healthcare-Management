import { useState } from 'react';
import { PageContainer, Input, Button } from '../../components';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import api from '../../axios';

function ChangeContact() {
  const userData = useSelector((state) => state.user.userData);
  const [otpSent, setOtpSent] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState(null);
  const [submissionError, setSubmissionError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    defaultValues: {
      email: userData.email,
      phone: userData.phone,
    }
  });

  const sendOtp = async (data) => {
    setOtpLoading(true);
    setOtpError(null);
    try {
      await api.post('/send-otp', { email: data.email });
      setOtpSent(true);
    } catch (error) {
      const apiError = error.response?.data?.message || 'Failed to send OTP. Please try again.';
      setOtpError(apiError);
    } finally {
      setOtpLoading(false);
    }
  };

  const changeContact = async (data) => {
    setLoading(true);
    setSubmissionError(null);
    try {
      await api.patch('/profile/contact', data);
      reset(); 
      setOtpSent(false);
      alert('Contact information updated successfully!');
    } catch (error) {
      const apiError = error.response?.data?.message || 'Failed to update contact information. Please try again.';
      setSubmissionError(apiError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer className="h-auto">
      <div className='w-full py-3 text-3xl sm:text-xl text-slate-600 font-light font-serif border-b-2 text-center'>
        Change Email & Phone Number
      </div>
      <form className='my-5 md:px-40 sm:px-4 ' onSubmit={handleSubmit(changeContact)}>
        {/* Email Input */}
        <Input
          placeholder="Enter your Email"
          defaultValue={userData.email}
          disabled={otpSent || loading}
          {...register('email', { required: 'Email is required' })}
          error={errors.email?.message}
        />

        {/* Phone Input */}
        <Input
          placeholder="Enter your Phone number"
          defaultValue={userData.phone}
          disabled={otpSent || loading}
          {...register('phone', { required: 'Phone number is required' })}
          error={errors.phone?.message}
        />

        {/* OTP Input */}
        {otpSent && (
          <>
            <Input
              placeholder="Enter OTP sent"
              {...register('otp', { required: 'OTP is required' })}
              error={errors.otp?.message}
            />
            <Button type="submit" disabled={loading}>
              {loading ? 'Updating...' : 'Submit'}
            </Button>
          </>
        )}

        {/* OTP Button */}
        {!otpSent && (
          <Button
            type="button"
            onClick={sendOtp}
            disabled={otpLoading || loading}
          >
            {otpLoading ? 'Sending OTP...' : 'Get OTP'}
          </Button>
        )}

        {/* Error Messages */}
        {otpError && <p className="text-red-500 mt-2">{otpError}</p>}
        {submissionError && <p className="text-red-500 mt-2">{submissionError}</p>}
      </form>
    </PageContainer>
  );
}

export default ChangeContact;
