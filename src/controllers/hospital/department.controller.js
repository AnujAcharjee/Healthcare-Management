import mongoose from "mongoose";
import asyncHandler from "../../utils/asyncHandler.js";
import ApiError from "../../utils/ApiError.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { Department } from "../../models/department.model.js";
import { Ward } from "../../models/ward.collection.js";
import { Allocated_bed } from "../../models/allocatedBed.model.js";
import { Patient } from "../../models/patient.model.js";

const createDepartment = asyncHandler(async (req, res) => {
  const { name } = req.body;

  if (!name) {
    throw new ApiError(400, "All fields are required");
  }

  const createdDepartment = await Department.create({
    name,
    hospital_id: req.user?._id,
  });

  if (!createDepartment) {
    throw new ApiError(
      500,
      "Something went wrong while creating new department"
    );
  }
  return res
    .status(201)
    .json(
      new ApiResponse(201, createdDepartment, "Department crated successfully")
    );
});

const createWard = asyncHandler(async (req, res) => {
  const { name, totalBedNum } = req.body;
  const { department_id } = req.params;

  if (!name || !totalBedNum) {
    throw new ApiError(400, "All fields are required");
  }

  if (!department_id) {
    throw new ApiError(400, "Department ID is missing from the URL.");
  }

  // Validate if department_id is a valid ObjectId
  if (!mongoose.isValidObjectId(department_id)) {
    throw new ApiError(400, "Invalid Department ID format.");
  }

  // Check if the department exists
  const isDepartmentValid = await Department.findById(department_id);
  if (!isDepartmentValid) {
    throw new ApiError(404, "Department not found.");
  }

  const createdWard = await Ward.create({
    name,
    totalBedNum,
    department_id,
  });

  if (!createWard) {
    throw new ApiError(500, "Something went wrong while creating new ward");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, createdWard, "Ward successfully created"));
});

const updateWard = asyncHandler(async (req, res) => {
  const { name, totalBedNum } = req.body;
  const { ward_id } = req.params;

  if (!ward_id) {
    throw new ApiError(400, "Ward ID is missing from the URL");
  }

  if (!mongoose.isValidObjectId(ward_id)) {
    throw new ApiError(400, "Invalid Ward ID format.");
  }

  const updatedWard = await Ward.findByIdAndUpdate(
    ward_id,
    {
      name,
      totalBedNum,
    },
    { new: true }
  );

  if (!updatedWard) {
    throw new ApiError(404, "Ward not found.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, updatedWard, "Ward updated successfully"));
});

const getAllWards = asyncHandler(async (req, res) => {
  console.log("req reached", req.params);

  const { department_id } = req.params;

  if (!department_id) {
    throw new ApiError(400, "Department ID is missing from the URL.");
  }

  if (!mongoose.isValidObjectId(department_id)) {
    throw new ApiError(400, "Invalid Department ID format.");
  }

  const wards = await Ward.aggregate([
    {
      $match: { department_id: new mongoose.Types.ObjectId(department_id) },
    },
    {
      $project: { name: 1, totalBedNum: 1 },
    },
  ]);

  if (!wards?.length) {
    throw new ApiError(404, " No wards found for the department.");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, wards, "Wards fetched successfully"));
});

const allocateBed = asyncHandler(async (req, res) => {
  const { ward_id } = req.params;
  const { bedNumber, patientEmail, duration } = req.body;

  if (!bedNumber || !patientEmail || !duration) {
    throw new ApiError(400, "All fields are required");
  }

  if (!ward_id) {
    throw new ApiError(400, "Ward ID is missing from the URL");
  }

  if (!mongoose.isValidObjectId(ward_id)) {
    throw new ApiError(400, "Invalid Ward ID format.");
  }

  const isValidPatient = await Patient.findOne({ email: patientEmail });
  if (!isValidPatient) {
    throw new ApiError(400, "Entered patient email is not valid");
  }

  const allocatedBed = await Allocated_bed.create({
    bedNumber,
    patientEmail,
    duration,
    ward_id,
  });

  if (!allocatedBed) {
    throw new ApiError(
      500,
      "Something went wrong while creating new bed allocation"
    );
  }

  return res
    .status(201)
    .json(
      new ApiResponse(201, allocatedBed, "Bed is allocated to the Patient")
    );
});

const getAllocatedBedsInfo = asyncHandler(async (req, res) => {
  const { ward_id } = req.params;

  if (!ward_id) {
    throw new ApiError(400, "Ward ID is missing from the URL");
  }

  if (!mongoose.isValidObjectId(ward_id)) {
    throw new ApiError(400, "Invalid Ward ID format.");
  }

  const allBeds = await Allocated_bed.aggregate([
    { $match: { ward_id: new mongoose.Types.ObjectId(ward_id) } },
    {
      $lookup: {
        from: "patients",
        localField: "patientEmail",
        foreignField: "email",
        as: "allocatedPatient",
      },
    },
    {
      $addFields: {
        patientInfo: {
          $arrayElemAt: ["$allocatedPatient", 0],
        },
      },
    },
    {
      $project: {
        bedNumber: 1,
        duration: 1,
        patientInfo: {
          userName: 1,
          _id: 1,
        },
      },
    },
  ]);

  return res
    .status(200)
    .json(
      new ApiResponse(200, allBeds, "Allocated Beds data fetched successfully")
    );
});

const deleteAllocatedBed = asyncHandler(async (req, res) => {
  const { bed_id } = req.params;

  if (!bed_id) {
    throw new ApiError(400, "Bed ID is missing from the URL");
  }

  await Allocated_bed.findByIdAndDelete(bed_id);

  return res
    .status(204)
    .json(new ApiResponse(204, "Allocated Bed deleted successfully"));
});

export {
  createDepartment,
  createWard,
  getAllWards,
  updateWard,
  allocateBed,
  getAllocatedBedsInfo,
  deleteAllocatedBed,
};

// const getAllDepartments = asyncHandler(async (req, res) => {
//   const departments = await Department.aggregate([
//     {
//       $match: { hospital_id: req.user?._id },
//     },
//     {
//       $project: { name: 1 },
//     },
//   ]);

//   if (!departments?.length) {
//     throw new ApiError(400, "Department doesn't exist");
//   }

//   return res
//     .status(200)
//     .json(
//       new ApiResponse(200, departments, "Departments fetched successfully")
//     );
// });
