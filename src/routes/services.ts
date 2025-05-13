import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/show", async (req: Request, res: Response) => {
  try {
    const services = await prisma.service.findMany({
      select: {
        id: true,
        type: true,
        price: true,
        studentPrice: true,
        duration: true,
      },
      where: {
        show: true,
      },
    });

    res.json({
      success: true,
      message: "Les services ont été récupérés avec succès.",
      services,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Une erreur est survenue.",
    });
  }
});

router.get("/", async (req: Request, res: Response) => {
  try {
    const services = await prisma.service.findMany({
      select: {
        id: true,
        type: true,
        price: true,
        studentPrice: true,
        duration: true,
      },
    });

    res.json({
      success: true,
      message: "Les services ont été récupérés avec succès.",
      services,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Une erreur est survenue.",
    });
  }
});

export default router;
