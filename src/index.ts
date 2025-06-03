import express from "express";
import path from "path";

import authRouter from "./routes/auth";
import servicesRouter from "./routes/services";
import uploadsRouter from "./routes/uploads";
import salonsRouter from "./routes/salons";
import availabilitiesRouter from "./routes/availabilities";
import appointmentRouter from "./routes/appointments";
import adminRouter from "./routes/admin/index";

const app = express();
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
app.use("/uploads", uploadsRouter);

app.use("/auth", authRouter);
app.use("/services", servicesRouter);
app.use("/salons", salonsRouter);
// app.use("/availabilities", availabilitiesRouter);
// app.use("/appointments", appointmentRouter);
// app.use("/admin", adminRouter);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
