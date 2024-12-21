import { useState } from 'react'
import api from '../../axios';
import { useForm } from 'react-hook-form';
import { Button, Input } from '../../components';
import { useDispatch } from 'react-redux';
import { fetchUserData } from '../../store/userSlice';

function CreateDepartmentFrom() {
  const dispatch = useDispatch()
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors },
    reset
  } = useForm();

  const handleCreateDepartment = async (data) => {
    setLoading(true);
    clearErrors("api");
    try {
      await api.post("/hospitals/department", data);
      dispatch(fetchUserData())
      reset()
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to add department. Try again";
      setError("api", { type: "manual", message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full mb-4 flex justify-center bg-slate-200 p-2 rounded shadow-inner">
      <form
        onSubmit={handleSubmit(handleCreateDepartment)}
        className="w-2/3 flex items-center space-x-2 flex-col sm:flex-row sm:space-x-2"
      >
        <Input
          type="text"
          placeholder="Enter department name"
          {...register("name", {
            required: "Department name is required",
          })}
        />
        <Button
          className="py-1 px-4 sm:w-2/6 w-full"
          type="submit"
        >
          {loading ? "Adding..." : "Add department"}
        </Button>
        {errors.name && (
          <p className="text-red-600 text-sm mt-2 w-full text-center">
            {errors.name.message}
          </p>
        )}
      </form>
      {errors.api && (
        <p className="text-red-600 text-sm text-center mt-2">
          {errors.api.message}
        </p>
      )}
    </div>
  )
}

export default CreateDepartmentFrom