import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { useForm } from "react-hook-form";
import { Button, Input, FormContainer } from "../../components";
import Select from "react-select";

const RegisterUser = () => {
  const navigate = useNavigate();

  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingOtp, setLoadingOtp] = useState(false);
  const [remainingTime, setRemainingTime] = useState(0); // Track timer countdown

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    getValues,
    watch,
    formState: { errors },
    setValue,
    reset
  } = useForm();

  const email = watch("email")



  // Handle OTP sending
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

  // Handle user registration
  const signup = async (data) => {
    clearErrors('api');
    setLoading(true)
    try {
      await axios.post("/api/v1/register", data);
      navigate("/login");
    } catch (error) {
      setError("api", {
        type: "manual",
        message: error.response?.data?.message || "Registration failed"
      });
    } finally {
      reset()
      setLoading(false)
    }
  };

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

  const userOptions = [
    { value: "hospital", label: "Hospital" },
    { value: "patient", label: "Patient" },
    { value: "doctor", label: "Doctor" },
  ];

  return (
    <FormContainer>
      <h1 className="pb-4 text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-sky-500 to-cyan-400 text-center">
        Create Account
      </h1>

      {/* Display API errors */}
      {errors?.api?.message && (
        <p className="text-red-600 mt-8 text-center">{errors.api.message}</p>
      )}

      {/* Signup Form */}
      <form onSubmit={handleSubmit(signup)}>
        <div className="flex items-center gap-2 space-y-2">
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

        <div className="border-2 rounded-md px-2 my-2">
          <div className="flex flex-col space-y-2 py-2">
            <div className="space-y-2">
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
                    color: '#fff',
                    transition: 'color 0.3s ease',
                  }),
                  singleValue: (base) => ({
                    ...base,
                    color: '#fff',
                    transition: 'color 0.3s ease',
                  }),
                }}
              />
              {errors.userType && (
                <p className="text-red-600 text-sm">{errors.userType.message}</p>
              )}
            </div>
          </div>

          <Input
            label="User Name: "
            placeholder="Enter your full name"
            // disabled={!otpSent}
            {...register("name", { required: "User name is required" })}
          />
          {errors.name && <p className="text-red-600 text-sm">{errors.name.message}</p>}

          <Input
            label="User Gender: "
            placeholder="Enter a valid gender"
            // disabled={!otpSent}
            {...register("gender", { required: "Gender is required" })}
          />
          {errors.gender && <p className="text-red-600 text-sm">{errors.gender.message}</p>}

          <Input
            label="Date of Birth: "
            type="date"
            // disabled={!otpSent}
            {...register("DOB", { required: "Date of birth is required" })}
          />
          {errors.DOB && <p className="text-red-600 text-sm">{errors.DOB.message}</p>}

          <Input
            label="Phone Number:"
            type="text"
            placeholder="Enter phone number"
            // disabled={!otpSent}
            {...register("phone", { required: "Phone number is required" })}
          />
          {errors.phone && <p className="text-red-600 text-sm">{errors.phone.message}</p>}
        </div>

        <Input
          type="password"
          placeholder="Create a password"
          // disabled={!otpSent}
          {...register("password", {
            required: "Password is required",
            minLength: {
              value: 8,
              message: "Password must be at least 8 characters long",
            },
          })}
        />
        {errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}

        <Input
          type="password"
          placeholder="Re-enter created password"
          // disabled={!otpSent}
          {...register("confirmPassword", {
            required: "Password confirmation is required",
            validate: (value) =>
              value === getValues("password") || "Passwords do not match",
          })}
        />
        {errors.confirmPassword && (
          <p className="text-red-600 text-sm">{errors.confirmPassword.message}</p>
        )}
        {getValues("password") &&
          getValues("confirmPassword") &&
          getValues("password") === getValues("confirmPassword") && (
            <p className="text-green-500 text-sm">Passwords match</p>
          )}

        <Button
          type="submit"
          className="w-full bg-gradient-to-r from-teal-500 to-green-500 text-white rounded-lg shadow-md font-semibold hover:opacity-90 focus:ring-4 focus:ring-teal-400 transition-opacity"
        >
          {loading ? (
            "Signing up..."
          ) : (
            "Sign Up"
          )}
        </Button>
      </form>

      <p className="pt-5 text-gray-300">
        Already have an account?{" "}
        <Link to="/login" className="font-semibold text-teal-400">
          Login
        </Link>
      </p>
    </FormContainer>
  );
};

export default RegisterUser;
