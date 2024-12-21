import { useState } from "react";
import { Button } from "../../components";
import CreateDepartmentForm from "../hospital/CreateDepartmentFrom";
import CreateWardForm from "../hospital/CreateWardForm";
import api from "../../axios";
import MultipleStopIcon from '@mui/icons-material/MultipleStop';
import { useNavigate } from "react-router-dom";
import { Cancel } from "@mui/icons-material";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserData } from "../../store/userSlice";

function HospitalProfile() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [toggledDepartment, setToggledDepartment] = useState(null);
  const [isAddDepartmentInputVisible, setIsAddDepartmentInputVisible] = useState(false);
  const [toggleWardInput, setToggleWardInput] = useState(false);
  const [toggleDepartmentDelete, setToggleDepartmentDelete] = useState(false);
  const [departmentId, setDepartmentId] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [toggleDepartmentContent, setToggleDepartmentContent] = useState(true);

  const { userData } = useSelector(state => state.user)

  const handleToggledDepartment = (index) => {
    setToggledDepartment(toggledDepartment === index ? null : index);
  };

  const handleToggledWardInput = (index) => {
    setToggleWardInput(toggleWardInput === index ? null : index);
  };

  const handleCreateWard = async (data) => {
    try {
      const dataToSend = {
        ...data,
        department_id: departmentId
      }
      await api.post('/hospitals/department/ward', dataToSend);
      dispatch(fetchUserData())
      setSuccess("Ward added successfully!");
      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to add ward");
      setSuccess(null);
    }
  };

  const handleDeleteDepartment = async (departmentId) => {
    try {
      await api.delete('/hospitals/department', {
        data: { department_id: departmentId },
      });
      dispatch(fetchUserData())
      setSuccess("Department deleted successfully!");
      setError(null);
    } catch (error) {
      setError(error.response?.data?.message || "Failed to delete department. Try again");
      setSuccess(null);
    }
  };

  const handleWardClick = (Id) => {
    navigate(`/user/hospital/ward?Id=${encodeURIComponent(Id)}`);
  };

  return (
    <div className="bg-green-50 p-6 rounded-lg shadow-lg">
      <div className="text-xl font-semibold text-green-700 border-b-2 border-green-400 pb-3 mb-6 font-serif flex items-center">
        <span className="flex-grow">Departments</span>
        <Button
          onClick={() => setIsAddDepartmentInputVisible(!isAddDepartmentInputVisible)}
          className="px-3 py-1"
        >
          {isAddDepartmentInputVisible ? "Cancel" : "Create Department"}
        </Button>
      </div>
      {/* Display Error and Success messages */}
      {error && <p className="text-red-600 text-sm text-center my-2">
        {error}
        <Cancel
          onClick={() => setError(null)}
        />
      </p>}
      {success && <p className="text-green-600 text-sm text-center my-2">
        {success}
        <Cancel
          onClick={() => setSuccess(null)}
        />
      </p>}

      {/* Department Input Field */}
      {isAddDepartmentInputVisible && (
        <CreateDepartmentForm />
      )}

      {userData.departments.length > 0 &&
        userData.departments.map((department, index) => {
          if (department.name) {
            return (
              <div key={index} className="mb-6">
                {/* Render department name */}
                <div className="flex flex-wrap items-center sm:bg-green-300 bg-transparent rounded-lg px-4 py-2 shadow-md font-sans hover:bg-green-500 hover:text-white transition-all hover:border-green-600 duration-300 cursor-pointer border-green-800">
                  <div
                    onClick={() => handleToggledDepartment(index)}
                    className="flex-grow w-full sm:w-auto mb-2 sm:mb-0 bg-green-500 sm:bg-green-300 text-white rounded-md hover:bg-green-500 "
                  >
                    <div className="uppercase font-bold text-center sm:text-left">
                      {department.name}
                    </div>
                  </div>

                  {/* Button container */}
                  <div className="flex flex-wrap space-x-0 space-y-2 sm:space-x-2 sm:space-y-0 w-full sm:w-auto justify-center sm:justify-end">
                    <Button
                      onClick={() => {
                        setToggleDepartmentDelete(null)
                        handleToggledWardInput(index);
                        setDepartmentId(department._id);
                      }}
                      color="bg-blue-400 hover:bg-blue-600"
                      className="py-1 sm:py-0 px-4 w-full sm:w-auto shadow-inner text-center hover:translate-y-0.5 hover:scale-110 ease-in-out"
                    >
                      Create Ward
                    </Button>
                    <Button
                      onClick={() => {
                        setToggleWardInput(null)
                        setToggleDepartmentDelete(index)
                      }}
                      color="bg-red-400 hover:bg-red-600"
                      className="py-1 px-4 w-full sm:w-auto shadow-inner text-center hover:translate-y-0.5 hover:scale-110"
                    >
                      Delete Department
                    </Button>
                  </div>
                </div>

                {/* Render Ward Input Form or Delete Confirmation Message */}
                {(toggleWardInput === index || toggleDepartmentDelete === index) && (
                  <div className="w-full my-2 flex justify-center bg-slate-200 p-4 rounded shadow-inner">
                    {/* Render CreateWardForm */}
                    {toggleWardInput === index && (
                      <CreateWardForm handleCreateWard={handleCreateWard} />
                    )}

                    {/* Render Delete Department Confirmation */}
                    {toggleDepartmentDelete === index && (
                      <div className="w-full text-center">
                        <p className="text-lg font-medium mb-4">
                          Are you sure you want to delete this department?
                        </p>
                        <div className="flex justify-center space-x-4">
                          <Button
                            onClick={() => handleDeleteDepartment(department._id)}
                            aria-label="Confirm delete department"
                            color="bg-red-500 hover:bg-red-700"
                          >
                            Yes
                          </Button>
                          <Button
                            onClick={() => setToggleDepartmentDelete(null)}
                            aria-label="Cancel delete department"
                            color="bg-slate-400 hover:bg-slate-600"
                          >
                            No
                          </Button>

                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Render wards if they exist */}
                {toggledDepartment === index && (
                  <div className="ml-4 mt-4 border-2 rounded-lg border-green-500 p-4">
                    {department.wards.length > 0 ? (
                      <>
                        <div
                          className={`text-lg font-medium text-green-600 mt-2 text-center border-b-2 mb-4 pb-2 font-serif transition-transform duration-700 ease-in-out ${toggleDepartmentContent ? "translate-x-0" : "translate-x-2"
                            }`}
                        >
                          {toggleDepartmentContent ? "Wards" : "Outpatient Department"}
                          <button
                            onClick={() => setToggleDepartmentContent(!toggleDepartmentContent)}
                            className="text-center ml-4 bg-green-100 rounded-full px-2 border-2 border-green-300 transition-transform hover:-translate-y-1 hover:scale-110 hover:bg-green-300 duration-300 ease-in-out"
                          >
                            <MultipleStopIcon />
                          </button>
                        </div>

                        <div className="space-y-4">
                          {department.wards.map((ward) => (
                            <div
                              key={ward.wardId}
                              onClick={() => handleWardClick(ward.wardId)}
                              className="w-full bg-lime-400 rounded-lg px-6 py-2 text-center md:flex md:items-center md:justify-between hover:bg-lime-500 text-green-900 hover:text-white transition-all duration-300 cursor-pointer border-green-800 shadow-md"
                            >
                              {/* Ward Name */}
                              <div className="font-sans uppercase font-bold md:w-1/3 md:text-left">
                                {ward.name}
                              </div>
                              {/* Ward Details */}
                              <div className="flex flex-col space-y-3 md:flex-row md:space-y-0 md:space-x-6 md:w-2/3">
                                <div className="font-sans md:text-right">
                                  Capacity: {ward.capacity}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <p className="text-base text-center font-medium text-green-600 mt-2">
                        No wards created
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          }
        })}
    </div>
  );
}

export default HospitalProfile;
