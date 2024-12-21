import { useSelector } from "react-redux";

function PatientProfile() {
    const dateOptions = {
        timeZone: "Asia/Kolkata",
        year: "numeric",
        month: "long",
        day: "numeric",
    };

    const { userData } = useSelector(state => state.user)

    return (
        <>
            {/* Upcoming Appointments */}
            {userData.opdAppointments && userData.opdAppointments.length > 0 && (
                <div className="bg-green-50 p-4 rounded-lg mb-6 shadow-xl">
                    <h2 className="text-xl font-semibold text-green-700 border-b-2 border-green-400 pb-2 mb-4">
                        Upcoming Appointments
                    </h2>
                    <ul className="list-disc pl-6 space-y-2">
                        {userData.opdAppointments.map((appointment, index) => (
                            <li key={index} className="text-gray-600">
                                {new Date(appointment.date).toLocaleDateString("en-IN", dateOptions)} with {appointment.doctor} ({appointment.type})
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Allocated Bed */}
            {userData.bedAllocated && (
                <div className="bg-green-50 p-4 rounded-lg mb-6 shadow-xl">
                    <div className=' text-green-700 border-b-2 border-green-400 pb-2 mb-4 '>
                        <h2 className="text-xl font-semibold text-green-700">
                            Allocated Bed
                        </h2>
                        <p className="text-gray-500 text-xs">
                            {new Date(userData.bedAllocated.date).toLocaleDateString("en-IN", dateOptions)}

                        </p>
                    </div>

                    {[
                        { label: "Hospital:", data: userData.bedAllocated.hospital },
                        { label: "Department:", data: userData.bedAllocated.department },
                        { label: "Ward:", data: userData.bedAllocated.ward },
                        { label: "Bed Number:", data: userData.bedAllocated.number },
                    ].map((item) => (
                        <p key={item.label} className="text-gray-600">
                            <span className="font-semibold text-gray-800">{item.label}</span> {item.data}
                        </p>
                    ))}
                </div>
            )}
        </>
    )
}

export default PatientProfile