import { Router, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { upload } from "../../middleware/multerSalon";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });

    if (!user || user.role !== "ADMIN") {
      res.status(403).json({
        success: false,
        message: "Accès refusé.",
      });
      return;
    }

    const salons = await prisma.salon.findMany({
      select: {
        id: true,
        name: true,
        address: true,
        phoneNumber: true,
        city: true,
        imgUrl: true,
      },
    });

    if (salons.length === 0) {
      res.json({
        success: false,
        message: "Aucun service disponible.",
      });
      return;
    }

    res.json(salons);
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Une erreur est survenue.",
    });
  }
});

router.post(
  "/add",
  upload.single("image"),
  async (req: Request, res: Response) => {
    try {
      const { userId, name, address, phone, city } = req.body;

      if (!userId || !name || !address || !phone || !city || !req.file) {
        res.status(400).json({
          message: "Tous les champs obligatoires doivent être remplis.",
        });
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { role: true },
      });

      if (!user || user.role !== "ADMIN") {
        res.status(403).json({
          success: false,
          message: "Accès refusé.",
        });
        return;
      }

      await prisma.salon.create({
        data: {
          name,
          address,
          city,
          phoneNumber: phone,
          imgUrl: req.file.filename,
        },
      });

      res.json({
        success: true,
        message: "Le salon a été ajouté avec succès.",
      });
    } catch (error) {
      console.error(error);
      res.status(400).json({
        success: false,
        message: "Une erreur est survenue.",
      });
    }
  }
);

export default router;
