import { Router, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { upload } from "../../middleware/multerService";
import path from "path";
import fs from "fs";
import fsPromise from "fs/promises";

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

    const services = await prisma.service.findMany({
      select: {
        id: true,
        type: true,
        image: true,
        show: true,
      },
    });

    if (services.length === 0) {
      res.json({
        success: false,
        message: "Aucun service disponible.",
      });
      return;
    }

    res.json(services);
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Une erreur est survenue.",
    });
  }
});

router.put(
  "/editImg",
  upload.single("image"),
  async (req: Request, res: Response) => {
    try {
      const { userId, serviceId, customName } = req.body;

      if (!userId || !serviceId || !customName || !req.file) {
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

      const service = await prisma.service.findUnique({
        where: { id: serviceId },
        select: { image: true },
      });
      if (!service) {
        res.status(404).json({
          success: false,
          message: "Service non trouvé.",
        });
        return;
      }

      const ext = path.extname(req.file.originalname);

      if (customName) {
        const newPath = path.join(
          path.dirname(req.file.path),
          `${customName}${ext}`
        );
        await fs.promises.rename(req.file.path, newPath);
      }

      res.json({
        success: true,
        message: "Le service a été mis à jour avec succès.",
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

router.delete("/delete", async (req: Request, res: Response) => {
  try {
    const { userId, serviceId } = req.body;

    if (!userId || !serviceId) {
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

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: { image: true },
    });
    if (!service) {
      res.status(404).json({
        success: false,
        message: "Service non trouvé.",
      });
      return;
    }

    if (service.image) {
      const imagePath = path.join(
        __dirname,
        "../../../uploads/services",
        service.image + "_light.png"
      );
      const darkImagePath = path.join(
        __dirname,
        "../../../uploads/services",
        service.image + "_dark.png"
      );

      if (fs.existsSync(darkImagePath)) {
        fs.unlinkSync(darkImagePath);
      }
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await prisma.barberService.deleteMany({
      where: { serviceId: serviceId },
    });

    await prisma.appointment.deleteMany({
      where: { serviceId: serviceId },
    });

    await prisma.service.delete({
      where: { id: serviceId },
    });

    res.json({
      success: true,
      message: "Le service a été supprimé avec succès.",
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Une erreur est survenue.",
    });
  }
});

router.post("/informations", async (req: Request, res: Response) => {
  try {
    const { serviceId, userId } = req.body;

    if (!serviceId || !userId) {
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

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
      select: {
        id: true,
        type: true,
        show: true,
      },
    });

    if (!service) {
      res.status(404).json({
        success: false,
        message: "Service non trouvé.",
      });
      return;
    }

    res.json(service);
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Une erreur est survenue.",
    });
  }
});

router.put("/update", async (req: Request, res: Response) => {
  try {
    const { userId, serviceId, type, show } = req.body;

    if (!userId || !serviceId || !type || show === undefined) {
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

    const service = await prisma.service.findUnique({
      where: { id: serviceId },
    });
    if (!service) {
      res.status(404).json({
        success: false,
        message: "Service non trouvé.",
      });
      return;
    }

    await prisma.service.update({
      where: { id: serviceId },
      data: { type, show },
    });

    res.json({
      success: true,
      message: "Le service a été mis à jour avec succès.",
    });
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
  upload.fields([
    { name: "imageLight", maxCount: 1 },
    { name: "imageDark", maxCount: 1 },
  ]),
  async (req: Request, res: Response) => {
    try {
      const { type, userId, show } = req.body;

      if (
        !req.files ||
        !("imageLight" in req.files) ||
        !("imageDark" in req.files)
      ) {
        res.status(400).json({
          success: false,
          message: "Les deux images sont obligatoires",
        });
        return;
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const imageLight = files.imageLight[0];
      const imageDark = files.imageDark[0];

      const uploadsDir = path.join(__dirname, "../../../uploads/services");

      const newLightName = `${type}_light${path.extname(
        imageLight.originalname
      )}`;
      const newDarkName = `${type}_dark${path.extname(imageDark.originalname)}`;

      await fsPromise.rename(
        imageLight.path,
        path.join(uploadsDir, newLightName)
      );
      await fsPromise.rename(
        imageDark.path,
        path.join(uploadsDir, newDarkName)
      );

      await prisma.service.create({
        data: {
          type,
          show: show === "true",
          image: type,
        },
      });

      res.json({ success: true, message: "Service ajouté avec succès" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: "Erreur serveur" });
      return;
    }
  }
);

export default router;
