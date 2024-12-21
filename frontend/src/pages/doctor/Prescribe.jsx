import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { PageContainer, Button, Input } from '../../components'
import api from '../../axios'

const inputFieldItems = [
    { value: "patientEmail", placeholder: "Enter valid patient email", label: "Patient Email", type: "email" },
    { value: "symptoms", placeholder: "Enter symptoms", label: "Symptoms", type: "text" },
    { value: "diagnosedCondition", placeholder: "Enter diagnosed condition", label: "Diagnosed Condition", type: "text" },
]

const medicineInputFieldItems = [
    { value: "medicineName", placeholder: "Enter medicine name", label: "Medicine name" },
    { value: "dosage", placeholder: "Enter medicine dosage", label: "Dosage" },
    { value: "frequency", placeholder: "Enter frequency of medicine consumption", label: "Frequency" },
    { value: "instructions", placeholder: "Enter additional instructions", label: "Instructions" },
]

function Prescribe() {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const [medicines, setMedicines] = useState([])

    const {
        register,
        handleSubmit,
        formState: { errors },
        getValues,
        reset,
    } = useForm()

    const handleAddMedicine = () => {
        const { medicineName, dosage, frequency, instructions } = getValues()
        setMedicines((prevMedicines) => [
            ...prevMedicines,
            { name: medicineName, dosage, frequency, instructions },
        ])
    }

    const handleUploadPrescription = async (data) => {
        setLoading(true)
        setError(null)
        try {
            const formData = {
                ...data,
                medicinesPrescribed: medicines,
            }
            await api.post('/doctors/prescription', formData)
            reset()
            setMedicines([])
        } catch (error) {
            setError(error.response?.data?.message || "Failed to upload data. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return <p>Loading...</p>
    }
    if (error) {
        return <p>Error: {error}</p>
    }

    return (
        <PageContainer>
            <div className="w-full text-3xl text-slate-600 font-light font-serif border-b-2 mb-6">
                Prescribe
            </div>
            <form
                className='px-10'
                onSubmit={handleSubmit(handleUploadPrescription)}>
                {inputFieldItems.map((item, index) => (
                    <div key={index}>
                        <Input
                            type={item.type}
                            placeholder={item.placeholder}
                            {...register(`${item.value}`, { required: `${item.label} is required` })}
                        />
                        {errors[item.value] && (
                            <p className="text-red-600 text-center mt-2">{errors[item.value]?.message}</p>
                        )}
                    </div>
                ))}
            </form>

            {/* Medicine Input Fields */}
            <div className='px-10'>
                <h3 className="text-xl mt-4 text-center font-mono">Add Medicines</h3>
                {medicineInputFieldItems.map((item, index) => (
                    <Input
                        key={index}
                        placeholder={item.placeholder}
                        {...register(`${item.value}`, { required: `${item.label} is required` })}
                    />
                ))}
                <Button
                    className='py-1'
                    onClick={handleAddMedicine}
                >Add Medicine</Button>
            </div>

            {/* Medicines Table */}
            <table className="w-full border-collapse border border-gray-400 mt-4">
                <thead className="bg-gray-200">
                    <tr>
                        <th className="border border-gray-400 px-4 py-2">Name</th>
                        <th className="border border-gray-400 px-4 py-2">Dosage</th>
                        <th className="border border-gray-400 px-4 py-2">Frequency</th>
                        <th className="border border-gray-400 px-4 py-2">Instruction</th>
                    </tr>
                </thead>
                <tbody>
                    {medicines.length > 0 ? (
                        medicines.map((medicine, index) => (
                            <tr key={index}>
                                <td className="border border-gray-400 px-4 py-2">{medicine.name || "N/A"}</td>
                                <td className="border border-gray-400 px-4 py-2">{medicine.dosage || "N/A"}</td>
                                <td className="border border-gray-400 px-4 py-2">{medicine.frequency || "N/A"}</td>
                                <td className="border border-gray-400 px-4 py-2">{medicine.instructions || "N/A"}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="4" className="text-center border border-gray-400 px-4 py-2 text-gray-500">
                                No medicines prescribed
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>

            <Button
                onClick={handleSubmit(handleUploadPrescription)}
                className='py-4 px-8 my-3 mx-auto block'
            >
                Submit Prescription
            </Button>

        </PageContainer>
    )
}

export default Prescribe
