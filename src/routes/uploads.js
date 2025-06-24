"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const router = express_1.default.Router();
// Configuration de multer pour le stockage
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads"); // dossier de destination
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        const extension = path_1.default.extname(file.originalname);
        cb(null, uniqueSuffix + extension); // exemple : 1687632187219-123456.jpg
    },
});
const upload = (0, multer_1.default)({ storage });
// Route POST pour uploader une image
router.post("/", upload.single("image"), (req, res) => {
    if (!req.file) {
        res.status(400).json({ error: "Aucun fichier envoyé." });
        return;
    }
    res.status(200).json({
        message: "Image uploadée avec succès.",
        imageUrl: `/uploads/${req.file.filename}`, // URL d'accès à l'image
    });
    return;
});
exports.default = router;
