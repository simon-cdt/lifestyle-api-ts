import express from "express";
import path from "path";

import appRouter from "./routes/app";
import authRouter from "./routes/auth";
import servicesRouter from "./routes/services";
import uploadsRouter from "./routes/uploads";
import salonsRouter from "./routes/salons";
import availabilitiesRouter from "./routes/availabilities";
import appointmentRouter from "./routes/appointments";
import notificationsRouter from "./routes/notifications";
import agendaRouter from "./routes/admin/agenda";
import notificationsAdminRouter from "./routes/admin/notifications";
import clientsAdminRouter from "./routes/admin/clients";
import barbersAdminRouter from "./routes/admin/barbers";
import salonsAdminRouter from "./routes/admin/salons";
import servicesAdminRouter from "./routes/admin/services";

const app = express();
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));
app.use("/uploads", uploadsRouter);

app.get("/", (req, res) => {
  res.json({ message: "Bienvenue sur l'API de Lifestyle Barber" });
});

app.use("/app", appRouter);
app.use("/auth", authRouter);
app.use("/services", servicesRouter);
app.use("/salons", salonsRouter);
app.use("/availabilities", availabilitiesRouter);
app.use("/appointments", appointmentRouter);
app.use("/notifications", notificationsRouter);
app.use("/admin/agenda", agendaRouter);
app.use("/admin/notifications", notificationsAdminRouter);
app.use("/admin/clients", clientsAdminRouter);
app.use("/admin/barbers", barbersAdminRouter);
app.use("/admin/salons", salonsAdminRouter);
app.use("/admin/services", servicesAdminRouter);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
