/* eslint-disable no-unused-vars */
/* eslint-disable react/prop-types */
import { useState } from 'react'
import api from '../../axios';
import { useForm } from 'react-hook-form';
import { Button, Input } from '../../components';

function CreateWardForm({ handleCreateWard }) {
    const [loading, setLoading] = useState(false);

    const {
        register,
        handleSubmit,
        setError,
        clearErrors,
        formState: { errors },
        reset
    } = useForm();

    const handleAddWardSubmit = async (data) => {
        setLoading(true);
        clearErrors("api");
        await handleCreateWard(data)
        reset()
        setLoading(false);
    };

    return (
        <>
            <form
                onSubmit={handleSubmit(handleAddWardSubmit)}
                className="w-2/3 flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0"
            >
                {/* Input for Ward Name */}
                <div className="relative w-full">
                    <Input
                        type="text"
                        placeholder="Enter ward name"
                        {...register("name", {
                            required: "Ward name is required",
                        })}
                    />
                    {errors.name && (
                        <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
                    )}
                </div>

                {/* Input for Capacity */}
                <div className="relative w-full">
                    <Input
                        type="number"
                        placeholder="Enter total capacity"
                        {...register("capacity", {
                            required: "Capacity is required",
                        })}
                    />
                    {errors.capacity && (
                        <p className="text-red-600 text-sm mt-1">{errors.capacity.message}</p>
                    )}
                </div>

                {/* Submit Button */}
                <Button
                    className="whitespace-nowrap py-2"
                    type="submit"
                >
                    {loading ? "Creating..." : "Submit"}
                </Button>

            </form>

            {/* API Error Message */}
            {errors.api && (
                <p className="text-red-600 text-sm text-center mt-4">
                    {errors.api.message}
                </p>
            )}
        </>
    )
}

export default CreateWardForm