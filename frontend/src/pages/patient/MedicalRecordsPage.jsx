import { useState, useEffect } from "react";
import api from "../../axios.js";
import { useForm } from "react-hook-form";
import { Input, Button, PageContainer } from "../../components";
import DisplayReport from "./DisplayReport.jsx";

function MedicalRecordsPage() {
  const [medicalRecords, setMedicalRecords] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedOption, setSelectedOption] = useState("labTestReports");
  const [selectedDisplayOption, setSelectedDisplayOption] = useState("prescriptions");
  const [uploadingReport, setUploadingReport] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  let [reportToShow, setReportToShow] = useState("")
  const [report, setReport] = useState(null)

  const dateOptions = {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "long",
    day: "numeric",
  };

  const {
    register,
    handleSubmit,
    setError: setFormError,
    formState: { errors: formErrors },
    reset,
  } = useForm();

  const fetchMedicalRecords = async () => {
    try {
      const response = await api.get("/patients/medical-records");
      setMedicalRecords(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch medical records");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicalRecords();
  }, []);

  const uploadReports = async (data) => {
    const formData = new FormData();
    formData.append("report", data.report[0]);

    if (selectedOption === "labTestReports") {
      formData.append("labName", data.labName);
      formData.append("testType", data.testType);
      formData.append("description", data.description);
    } else if (selectedOption === "otherReports") {
      formData.append("title", data.title);
      formData.append("description", data.description);
    }
    formData.append("reportType", selectedOption);

    setUploadingReport(true);
    try {
      await api.patch("patients/medical-records", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      reset();
      setShowUploadForm(false);
      fetchMedicalRecords();
    } catch (error) {
      setFormError("api", {
        type: "manual",
        message: error.response?.data?.message || "Uploading report failed",
      });
    } finally {
      setUploadingReport(false);
    }
  };

  // Dynamic field management for different report types
  const reportTypes = {
    labTestReports: [
      { placeholder: "Enter the lab name", value: "labName", required: "Lab Name is required" },
      { placeholder: "Enter a description", value: "description", required: "Description is required" },
    ],
    otherReports: [
      { placeholder: "Enter the title", value: "title", required: "Title is required" },
      { placeholder: "Enter a description", value: "description", required: "Description is required" },
    ],
  };


  const handleReportClick = (reports, report) => {
    if (reports === prescriptions) {
      setReportToShow("prescriptions");
    } else if (reports === otherReports) {
      setReportToShow("otherReports");
    } else {
      setReportToShow("labTestReports");
    }
    setReport(report);
  };


  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500 text-center">Error: {error}</p>;

  const { prescriptions, labTestReports, otherReports } = medicalRecords || {};

  const renderReport = (reports, label, key) => {
    return reports.length > 0 ? (
      reports.map((report, idx) => (
        <div
          onClick={() => handleReportClick(reports, report)}
          key={idx}
          className="p-2 bg-white rounded shadow flex space-x-10 text-blue-800 hover:cursor-pointer hover:bg-slate-200"
        >
          <p>{label}: {report[key] || "N/A"}</p>
          <p className="text-sm font-mono text-slate-600">{new Date(report.createdAt).toLocaleDateString("en-IN", dateOptions)}</p>
        </div>
      ))
    ) : (
      <p className="text-gray-500 text-center">No records found</p>
    );
  };

  return (
    <PageContainer>
      {/* Page Header */}
      <div className="w-full text-3xl text-slate-600 font-light font-serif border-b-2 flex pb-2">
        <span>Medical Records</span>
        <Button className="ml-auto" onClick={() => setShowUploadForm(!showUploadForm)}>
          {showUploadForm ? "Close Upload Form" : "Upload Reports"}
        </Button>
      </div>

      {/* Conditional rendering to handle reports display */}
      {reportToShow === "" ? (
        <>
          {/* Upload Form */}
          {showUploadForm && (
            <div className="bg-yellow-100 p-4 rounded-lg mb-2 shadow-xl sm:p-2 mt-2">
              <div className="p-2 bg-yellow-100 rounded-lg mx-auto text-black font-serif flex px-4 space-x-5">
                <button
                  onClick={() => setSelectedOption("labTestReports")}
                  className={`w-2/4 py-3 rounded-md shadow-inner ${selectedOption === "labTestReports" ? "bg-yellow-100" : "bg-yellow-50"}`}
                >
                  Lab Test Reports
                </button>
                <button
                  onClick={() => setSelectedOption("otherReports")}
                  className={`w-2/4 py-3 rounded-md shadow-inner ${selectedOption === "otherReports" ? "bg-yellow-100" : "bg-yellow-50"}`}
                >
                  Other Reports
                </button>
              </div>

              {/* Upload Form Fields */}
              <form className="flex flex-col gap-2 py-4 px-4" onSubmit={handleSubmit(uploadReports)}>
                {reportTypes[selectedOption]?.map((item, index) => (
                  <div key={index}>
                    <Input
                      type="text"
                      placeholder={item.placeholder}
                      {...register(item.value, { required: item.required })}
                      className={`${formErrors[item.value] ? "border-red-500" : ""} border-white`}
                    />
                    {formErrors[item.value] && (
                      <p className="text-red-600 text-sm">{formErrors[item.value].message}</p>
                    )}
                  </div>
                ))}

                {/* File Upload */}
                <Input
                  type="file"
                  accept=".pdf, .jpg, .png"
                  {...register("report", { required: "File is required" })}
                  className="border p-2 border-white"
                />
                {formErrors.report && (
                  <p className="text-red-600 text-sm">{formErrors.report.message}</p>
                )}

                <Button type="submit" disabled={uploadingReport} className="py-1">
                  {uploadingReport ? "Uploading..." : "Upload"}
                </Button>
              </form>
            </div>
          )}

          {/* Display Report Selection */}
          <div className="my-6 p-4 bg-yellow-200 rounded-lg shadow-xl sm:p-2">
            <div className="flex space-x-2 py-2">
              <button
                onClick={() => setSelectedDisplayOption("prescriptions")}
                className={`w-2/4 py-3 rounded-md shadow-inner ${selectedDisplayOption === "prescriptions" ? "bg-yellow-100" : "bg-yellow-50"}`}
              >
                Prescriptions
              </button>
              <button
                onClick={() => setSelectedDisplayOption("labTestReports")}
                className={`w-2/4 py-3 rounded-md shadow-inner ${selectedDisplayOption === "labTestReports" ? "bg-yellow-100" : "bg-yellow-50"}`}
              >
                Lab Tests
              </button>
              <button
                onClick={() => setSelectedDisplayOption("otherReports")}
                className={`w-2/4 py-3 rounded-md shadow-inner ${selectedDisplayOption === "otherReports" ? "bg-yellow-100" : "bg-yellow-50"}`}
              >
                Other Reports
              </button>
            </div>

            {/* Display Selected Reports */}
            <div className="w-full space-y-4 border-2 border-yellow-100 p-2 rounded-lg">
              {selectedDisplayOption === "prescriptions" && renderReport(prescriptions, "Doctor name", "doctorName")}
              {selectedDisplayOption === "labTestReports" && renderReport(labTestReports, "Lab name", "labName")}
              {selectedDisplayOption === "otherReports" && renderReport(otherReports, "Title", "title")}
            </div>
          </div>
        </>
      ) : (
        <>
          <DisplayReport reportToShow={reportToShow} setReportToShow={setReportToShow} report={report} dateOptions={dateOptions} />
        </>
      )}

    </PageContainer>
  );
}

export default MedicalRecordsPage;
