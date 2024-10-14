import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ limit: "16kb", extended: true }));
app.use(express.static("public"));
app.use(cookieParser());

//import Routes
import patientRouter from "./routes/patient.route.js";
import hospitalRouter from "./routes/hospital.route.js";
import doctorRouter from "./routes/doctor.route.js";

// routes declaration
app.use("/api/v1/patients", patientRouter);
app.use("/api/v1/hospitals", hospitalRouter);
app.use("/api/v1/doctors", doctorRouter);

export { app };
