import { useState } from 'react';
import { PageContainer, Input, Button } from '../../components';
import { useForm } from 'react-hook-form';
import api from '../../axios';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

function DeleteAccount() {
  const navigate = useNavigate()
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const userData = useSelector((state) => state.user.userData);

  const departmentArr = []
  const wardArr = []
  if (userData.userType === "Hospital") {
    userData.departments?.forEach((department) => {
      departmentArr.push(department._id)
      department.wards?.forEach((ward) => {
        wardArr.push(ward.wardId)
      })
    })
  }

  const deleteAccount = async (data) => {
    setSubmissionError(null);
    setLoading(true);
    try {
      await api.delete('/profile', { data: { password: data.password, departmentArr, wardArr } });
      alert('Your account has been deleted successfully.');
      navigate("/dashboard")
    } catch (error) {
      const apiError =
        error.response?.data?.message || 'Failed to delete the account. Please try again.';
      setSubmissionError(apiError);
    } finally {
      setLoading(false);
    }
  };

  const confirmDeletion = () => {
    setShowConfirmation(true);
  };

  return (
    <PageContainer>
      <div className="w-full py-3 text-3xl text-slate-600 font-light font-serif border-b-2 text-center">
        Delete Account
      </div>
      <div>
        {/* Password Input Form */}
        <form onSubmit={handleSubmit(confirmDeletion)} className="my-5 md:px-40 sm:px-4">
          <Input
            type="password"
            placeholder="Enter your password"
            {...register("password", {
              required: "Password is required",
            })}
            error={errors.password?.message}
          />
          {errors.password && <p className="text-red-600 text-sm">{errors.password.message}</p>}

          <Button type="submit" disabled={loading}>
            {loading ? "Processing..." : "Proceed to Delete Account"}
          </Button>
        </form>

        {/* Confirmation Dialog */}
        {showConfirmation && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 rounded-md">
            <p className="text-red-600 text-lg">
              Are you sure you want to delete your account? This action cannot be undone.
            </p>
            <div className="mt-4 flex justify-between">
              <Button
                type="button"
                color="bg-red-600"
                onClick={handleSubmit(deleteAccount)}
                disabled={loading}
              >
                {loading ? "Deleting..." : "Yes, Delete"}
              </Button>
              <Button
                type="button"
                color='bg-blue-500'
                className=" text-gray-800"
                onClick={() => setShowConfirmation(false)}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Submission Error */}
        {submissionError && <p className="text-red-500 text-sm mt-4">{submissionError}</p>}
      </div>
    </PageContainer>
  );
}

export default DeleteAccount;
