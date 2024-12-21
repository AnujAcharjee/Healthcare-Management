/* eslint-disable react/prop-types */
import { Button } from '../../components'
import { Link } from 'react-router-dom'

function DisplayReport({ reportToShow, setReportToShow, report, dateOptions }) {
    return (
        <div className="p-4 bg-white rounded shadow-xl mt-2">
            <Button onClick={() => setReportToShow("")} className="mb-2">
                Back
            </Button>
            {reportToShow === "prescriptions" && (
                <div className='border-2 border-black p-2 rounded-md mb-2'>
                    <div className="text-xl font-serif text-center">Prescription</div>
                    <div className='flex border-b-2'>
                        <div className='flex flex-col'>
                            <p>{report?.doctorName}</p>
                            <p className='text-center'>{report?.doctorSpecialization}</p>
                        </div>
                        <p >{new Date(report?.createdAt).toLocaleDateString("en-IN", dateOptions)}</p>
                    </div>
                    <div>
                        <strong>Symptoms:</strong>
                        <p>{report?.symptoms}</p>
                        <strong>Diagnosed Condition: </strong>
                        <p>{report?.diagnosedCondition}</p>
                    </div>

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
                            {report?.medicinesPrescribed?.length > 0 ? (
                                report?.medicinesPrescribed.map((medicine, index) => (
                                    <tr key={index}>
                                        <td className="border border-gray-400 px-4 py-2">{medicine.name || "N/A"}</td>
                                        <td className="border border-gray-400 px-4 py-2">{medicine.dosage || "N/A"}</td>
                                        <td className="border border-gray-400 px-4 py-2">{medicine.frequency || "N/A"}</td>
                                        <td className="border border-gray-400 px-4 py-2">{medicine.instruction || "N/A"}</td>
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
                    
                </div>
            )}
            {reportToShow === "labTestReports" && (
                <div>
                    <div className="text-xl font-serif text-center mb-4">Lab Test Report</div>
                    <p className='tex'>Lab Name: {report?.labName}</p>
                    <p>Description: {report?.description}</p>
                    <p>Uploaded Date: {new Date(report?.createdAt).toLocaleDateString("en-IN", dateOptions)}</p>
                    <Link to={report?.uploadedFile.url} className='text-blue-600 font-mono' >View file</Link>
                    <img src={report?.uploadedFile.url} alt="lab test report" className='w-full mt-3 h-max border-2 border-green-200' />
                </div>
            )}
            {reportToShow === "otherReports" && (
                <div>
                    <div className="text-xl font-serif text-center">Other Report</div>
                    <p>Title: {report?.title}</p>
                    <p>Description: {report?.description}</p>
                    <p>Uploaded Date: {new Date(report?.createdAt).toLocaleDateString("en-IN", dateOptions)}</p>
                    <Link to={report?.uploadedFile.url} className='text-blue-600 font-mono' >View file</Link>
                    <img src={report?.uploadedFile.url} alt="lab test report" className='w-full mt-3 h-max border-2 border-green-200' />
                </div>
            )}
        </div>
    )
}

export default DisplayReport