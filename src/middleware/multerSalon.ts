import multer from "multer";
import path from "path";

// Dossier de destination
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../../uploads/salons")); // Chemin vers /uploads/salons
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname); // garder l'extension
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// Filtrer les fichiers pour n’accepter que les images
const fileFilter = (req: any, file: any, cb: any) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Seules les images sont autorisées"), false);
  }
};

export const upload = multer({ storage, fileFilter });
