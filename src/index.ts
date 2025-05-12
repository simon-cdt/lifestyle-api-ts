import express from "express";
import authRouter from "./routes/auth";
import servicesRouter from "./routes/services";
import salonsRouter from "./routes/salons";
import availabilitiesRouter from "./routes/availabilities";

const app = express();
app.use(express.json());

app.use("/auth", authRouter);
app.use("/services", servicesRouter);
app.use("/salons", salonsRouter);
app.use("/availabilities", availabilitiesRouter);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
