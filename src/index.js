"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const path_1 = __importDefault(require("path"));
const auth_1 = __importDefault(require("./routes/auth"));
const services_1 = __importDefault(require("./routes/services"));
const uploads_1 = __importDefault(require("./routes/uploads"));
const salons_1 = __importDefault(require("./routes/salons"));
const availabilities_1 = __importDefault(require("./routes/availabilities"));
const appointments_1 = __importDefault(require("./routes/appointments"));
const agenda_1 = __importDefault(require("./routes/admin/agenda"));
const notifications_1 = __importDefault(require("./routes/admin/notifications"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use("/uploads", express_1.default.static(path_1.default.join(__dirname, "..", "uploads")));
app.use("/uploads", uploads_1.default);
app.get("/", (req, res) => {
    res.json({ "message": "Bienvenue sur l'API de Lifestyle Barber" });
});
app.use("/auth", auth_1.default);
app.use("/services", services_1.default);
app.use("/salons", salons_1.default);
app.use("/availabilities", availabilities_1.default);
app.use("/appointments", appointments_1.default);
app.use("/admin/agenda", agenda_1.default);
app.use("/admin/notifications", notifications_1.default);
const PORT = process.env.PORT || 4001;
app.listen(PORT, () => {
    console.log(`http://localhost:${PORT}`);
});
