import React, { useEffect, useState } from "react";
import { PageContainer } from "../../components";
import { useLocation } from "react-router-dom";
import api from "../../axios";
import { Button, Input } from "../../components";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

function WardData() {
  const navigate = useNavigate()
  const [error, setError] = useState(null);
  const [wardData, setWardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tableDropdown, setTableDropdown] = useState(null);
  const [toggleEditWard, setToggleEditWard] = useState(false);
  const [toggleWardDelete, setToggleWardDelete] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    reset
  } = useForm();

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const wardId = queryParams.get("Id");

  const getWardData = async () => {
    setLoading(true);
    try {
      const response = await api.get('/hospitals/ward', { params: { ward_id: wardId } });
      setWardData(response.data.data);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to fetch ward data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    wardId && getWardData();
  }, [wardId]);

  // Setting the form values once the wardData is fetched
  useEffect(() => {
    if (wardData) {
      setValue("name", wardData.ward.name);
      setValue("capacity", wardData.ward.capacity);
    }
  }, [wardData, setValue]);

  const handleTableDropdown = (bedIndex) => {
    setTableDropdown(tableDropdown === bedIndex ? null : bedIndex);
  };

  const calculateReleaseDate = (createdAt, duration) => {
    if (!createdAt || !duration) return "N/A";
    const releaseDate = new Date(
      new Date(createdAt).getTime() + duration * 24 * 60 * 60 * 1000
    );
    return releaseDate.toDateString();
  };

  const handleEditWard = async (data) => {
    setLoading(true);
    setError(null)
    try {
      const dataToSend = {
        ...data,
        ward_id: wardId
      };
      await api.patch('/hospitals/ward', dataToSend);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to update ward data");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteWard = async () => {
    setLoading(true);
    setError(null)
    try {
      await api.delete('/hospitals/ward', { data: { ward_id: wardId } });
      navigate("/user/home")
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete ward");
    } finally {
      setLoading(false);
    }
  };

  const handelAllocateBed = async (data) => {
    try {
      setLoading(true);
      const dataToSend = {
        ...data,
        ward_id: wardId
      };
      await api.post('/hospitals/ward', dataToSend);
      reset()
      getWardData()
    } catch (error) {
      setError(error.response?.data?.message || "Entered patient email is not valid");
    } finally {
      setLoading(false);
    }
  }

  // const handleEdit = (bedId) => {
  //   console.log("Editing bed:", bedId);
  // };

  const handleDelete = async (bedId) => {
    setLoading(true);
    setError(null)
    try {
      await api.delete('/hospitals/bed', { data: { bed_id: bedId } });
      getWardData()
    } catch (Error) {
      setError(Error.response?.data?.message || "Failed to delete allocated bed");
    } finally {
      setLoading(false);
    }
  };

  const handleVisitPatientProfile = (patientId) => {
    console.log("Visiting patient profile:", patientId);
  };

  const inputFields = [
    { name: "patientEmail", type: "email", placeholder: "Enter patient email" },
    { name: "bedNumber", type: "text", placeholder: "Allocated bed number" },
    { name: "duration", type: "number", placeholder: "Expected stay duration (days)" },
  ];

  return (
    <PageContainer>
      <div className="w-full text-3xl text-slate-600 font-light font-serif border-b-2 mb-2">
        Ward Data
      </div>

      <div className="bg-green-50 p-6 rounded-lg shadow-lg">
        {loading && <p>Loading...</p>}
        {error && <p className="text-red-600">{error}</p>}

        {!loading && wardData?.ward && (
          <>
            <div className="w-full text-center text-xs text-slate-400 flex px-2">
              Double click over any data to Update
              <Button
                onClick={() => setToggleWardDelete(!toggleWardDelete)}
                color="bg-red-400 hover:bg-red-600"
                className=" ml-auto"
              >
                Delete Ward
              </Button>

            </div>
            {toggleWardDelete && (
              <div className="w-full text-center bg-red-200 p-2 my-1">
                <p className="text-lg font-medium mb-4">
                  Are you sure you want to delete this ward?
                </p>
                <div className="flex justify-center space-x-4">
                  <Button
                    onClick={() => handleDeleteWard()}
                    aria-label="Confirm delete department"
                    color="bg-red-500 hover:bg-red-700"
                  >
                    Yes
                  </Button>
                  <Button
                    onClick={() => setToggleWardDelete(!toggleWardDelete)}
                    aria-label="Cancel delete department"
                    color="bg-slate-400 hover:bg-slate-600"
                  >
                    No
                  </Button>
                </div>
              </div>
            )}

            <form
              onSubmit={handleSubmit(handleEditWard)}
              onDoubleClick={() => setToggleEditWard(!toggleEditWard)}
              className="flex py-4 px-2 border-b-2">

              <div className="text-xl font-sans w-2/3">{!toggleEditWard ? wardData.ward.name : (
                <>
                  <Input
                    placeholder="Enter ward name"
                    color="bg-gray-200 text-black"
                    {...register("name", { required: "All fields are required" })}
                  />
                </>
              )}</div>
              <div className="flex w-full space-x-4">
                <p> {!toggleEditWard ? `Capacity: ${wardData.ward.capacity}` : (
                  <>
                    <Input
                      placeholder="Enter ward capacity"
                      color="bg-gray-200 text-black"
                      className="ml-4"
                      {...register("capacity", { required: "All fields are required" })}
                    />
                  </>
                )}</p>
                <p> {!toggleEditWard ? `Current Patients: ${wardData.beds?.length || 0}` : null}</p>
                {toggleEditWard && (
                  <>
                    <Button type="submit">
                      Submit
                    </Button>
                  </>
                )}
              </div>
            </form>

            <div className="my-4 shadow-lg p-4 rounded-md">
              <div className="w-full text-2xl text-green-600 font-light font-serif mb-4 text-center">
                Allocate Bed to Patients
              </div>
              <form
                onSubmit={handleSubmit(handelAllocateBed)}
                className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:space-x-2">
                  {inputFields
                    .map((item, index) => (
                      <Input
                        key={index}
                        type={item.type}
                        placeholder={item.placeholder}
                        {...register(item.name, { required: `${item.name} is required` })}
                      />
                    ))}
                </div>
                <div className="flex flex-col sm:flex-row sm:space-x-2">
                  <Input
                    placeholder="Enter any remarks"
                    {...register("remarks")}
                  />
                  <Button
                    type="submit"
                    className="w-full sm:w-auto bg-green-500 hover:bg-green-700 text-white"
                  >
                    Submit
                  </Button>
                </div>
              </form>

            </div>

            <div className="border-2 p-3 rounded-md">
              <table className="min-w-full table-auto border-collapse rounded-md">
                <thead className="bg-gray-200 rounded-md">
                  <tr>
                    <th className="px-4 py-2 border-b">Bed Number</th>
                    <th className="px-4 py-2 border-b">Patient Name</th>
                    <th className="px-4 py-2 border-b">Admitted</th>
                    <th className="px-4 py-2 border-b">Release</th>
                  </tr>
                </thead>
                <tbody>

                  {wardData?.beds && wardData.beds.length > 0 ? (
                    wardData.beds.map((bed, index) => (
                      <React.Fragment key={index}>
                        <tr
                          onClick={() => handleTableDropdown(index)}
                          className={`transition-all cursor-pointer text-center rounded-lg ${tableDropdown === index
                            ? "bg-green-200"
                            : "hover:bg-green-200"
                            }`}>
                          <td className="px-4 py-2 border-b">{bed.bedNumber}</td>
                          <td className="px-4 py-2 border-b">
                            {bed.patientInfo?.name || "N/A"}
                          </td>
                          <td className="px-4 py-2 border-b">
                            {bed.createdAt
                              ? new Date(bed.createdAt).toDateString()
                              : "N/A"}
                          </td>
                          <td className="px-4 py-2 border-b">
                            {calculateReleaseDate(bed.createdAt, bed.duration)}
                          </td>
                        </tr>

                        {tableDropdown === index && (
                          <tr>
                            <td colSpan="4" className="w-full py-4 bg-green-200">
                              <div className="flex justify-center space-x-4">
                                {[
                                  //   {
                                  //   btnName: "Edit",
                                  //   function: () => handleEdit(bed._id),
                                  //   color: "bg-yellow-400 hover:bg-yellow-600",
                                  // }, 
                                  {
                                    btnName: "Delete",
                                    function: () => handleDelete(bed._id),
                                    color: "bg-red-400 hover:bg-red-600",
                                  }, {
                                    btnName: "Visit Patient Profile",
                                    function: () => handleVisitPatientProfile(bed.patientInfo._id),
                                    color: "bg-blue-400 hover:bg-blue-600",
                                  }].map((item, itemIndex) => (
                                    <Button
                                      key={itemIndex}
                                      onClick={item.function}
                                      color={item.color}
                                      className="py-2 sm:py-0 px-4 w-full sm:w-auto shadow-inner text-center hover:translate-y-0.5 hover:scale-110 ease-in-out"
                                    >
                                      {item.btnName}
                                    </Button>
                                  ))}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-2 border-b text-center"
                      >
                        No beds have been allocated
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </PageContainer>
  );
}

export default WardData;
