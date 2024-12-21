import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { Button, FormContainer, Input } from "../../components";
import { useForm } from "react-hook-form";
import Select from "react-select";

const LoginUser = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0); // Track timer countdown

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    reset,
    watch,
    formState: { errors },
    setValue
  } = useForm();

  const email = watch("email");

  useEffect(() => {
    let timer;
    if (otpSent && remainingTime > 0) {
      timer = setInterval(() => {
        setRemainingTime((prev) => prev - 1);
      }, 1000);
    } else if (remainingTime <= 0) {
      setOtpSent(false); 
    }

    return () => clearInterval(timer); // Cleanup on unmount
  }, [otpSent, remainingTime]);

  const formatTime = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;


  const sendOTP = async () => {
    clearErrors("api");
    clearErrors("email");
    setLoadingOtp(true);
    try {
      await axios.post("/api/v1/send-otp", { email });
      setOtpSent(true);
      setRemainingTime(300); // Start the 5-minute timer
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to send OTP. Please try again.";
      setError("api", { type: "manual", message });
    } finally {
      setLoadingOtp(false);
    }
  };

  const signin = async (data) => {

    // if (!otpSent) {
    //   setError("otp", { type: "manual", message: "Please verify OTP before submitting." });
    //   return;
    // }

    clearErrors("api");
    setLoading(true);
    const formData = {
      ...data,
      otp: String(data.otp), // Explicitly convert OTP to string
    };
    try {
      await axios.post("/api/v1/login", formData);
      navigate("/user");
    } catch (error) {
      const message =
        error.response?.data?.message || "Login failed. Please try again.";
      setError("api", { type: "manual", message });
      reset({ ...data });
    } finally {
      setLoading(false);
    }
  };

  const userOptions = [
    { value: "hospital", label: "Hospital" },
    { value: "patient", label: "Patient" },
    { value: "doctor", label: "Doctor" },
  ];

  return (
    <FormContainer>
      <h1 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-cyan-400 text-center mb-6">
        Sign in
      </h1>

      {errors.api && (
        <p className="text-red-600 text-sm text-center mb-4">
          {errors.api.message}
        </p>
      )}

      <form className="space-y-4" onSubmit={handleSubmit(signin)}>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Enter your email"
            type="email"
            {...register("email", {
              required: "Email is required to send OTP",
              pattern: {
                value: /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
                message: "Email address must be valid",
              },
            })}
          />

          <Button
            type="button"
            disabled={loadingOtp || otpSent}
            onClick={sendOTP}
            className={` bg-gradient-to-r from-teal-500 to-green-500 text-white rounded-lg shadow-md font-semibold ${loadingOtp || otpSent ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
              } focus:ring-4 focus:ring-teal-400 transition-opacity text-xs py-1 `}
          >
            {loadingOtp
              ? "Sending..."
              : "Send OTP"}
          </Button>
        </div>
        {errors.email && (
          <p className="text-red-600 text-sm">{errors.email.message}</p>
        )}
        {otpSent && (
          <p className="text-green-600 text-sm text-center">
            OTP has been sent to your email. Expires in {formatTime(remainingTime)}s.
          </p>
        )}

        <div className="flex flex-col">
          <Select
            options={userOptions}
            onChange={(selectedOption) => setValue("userType", selectedOption.value)}
            className="w-full" 
            placeholder="Select User Type"
            // isDisabled={!otpSent}
            styles={{
              control: (base) => ({
                ...base,
                backgroundColor: '#1F2937', 
                borderColor: '#1F2937',
                padding: '0.5rem', 
                borderRadius: '0.375rem', 
              }),
              placeholder: (base) => ({
                ...base,
                color: '#fff', // Tailwind equivalent color (white text for placeholder)
                transition: 'color 0.3s ease', // Smooth fade transition for text color
              }),
              singleValue: (base) => ({
                ...base,
                color: '#fff', // Tailwind equivalent color (white text for selected value)
                transition: 'color 0.3s ease', // Smooth fade transition for selected value text color
              })
            }}
          />
          {errors.userType && (
            <p className="text-red-600 text-sm">{errors.userType.message}</p>
          )}
        </div>

        <Input
          placeholder="Enter OTP sent"
          type="text"
          maxLength="6"
          {...register("otp", {
            required: "OTP is required",
          })}
        // disabled={!otpSent}
        />
        {errors.otp && (
          <p className="text-red-600 text-sm">{errors.otp.message}</p>
        )}

        <Input
          placeholder="Enter your password"
          type="password"
          {...register("password", {
            required: "Password is required",
          })}
        // disabled={!otpSent}
        />
        {errors.password && (
          <p className="text-red-600 text-sm">{errors.password.message}</p>
        )}

        <Link
          to="/reset-password"
          className="text-right text-blue-500 hover:text-blue-600 text-sm block"
        >
          Forgot password?
        </Link>

        <Button
          type="submit"
          // disabled={loading || !otpSent}
          className={`w-full py-2 bg-gradient-to-r from-teal-500 to-green-500 text-white rounded-lg shadow-md font-semibold ${loading ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
            } focus:ring-4 focus:ring-teal-400 transition-opacity`}
        >
          {loading ? (
            "Signing in"
          ) : "SIGN IN"}
        </Button>
      </form>

      <div className="text-center text-sm text-gray-400 mt-4">
        New user?{" "}
        <Link
          to="/signup"
          className="text-blue-600 hover:text-blue-700 font-medium underline"
        >
          Create account here
        </Link>
      </div>
    </FormContainer>
  );
};

export default LoginUser;
