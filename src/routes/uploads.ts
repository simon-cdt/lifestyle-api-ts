import express from "express";
import multer from "multer";
import path from "path";

const router = express.Router();

// Configuration de multer pour le stockage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads"); // dossier de destination
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname);
    cb(null, uniqueSuffix + extension); // exemple : 1687632187219-123456.jpg
  },
});

const upload = multer({ storage });

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

export default router;
