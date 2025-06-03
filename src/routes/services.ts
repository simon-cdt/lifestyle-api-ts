import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const services = await prisma.service.findMany({
      select: {
        id: true,
        type: true,
        duration: true,
        image: true,
        barberService: {
          select: {
            studentPrice: true,
          },
        },
      },
      where: {
        show: true,
      },
    });

    const formattedServices = services.map((service) => ({
      id: service.id,
      type: service.type,
      duration: service.duration,
      image: service.image,
      price:
        Array.isArray(service.barberService) && service.barberService.length > 0
          ? Math.min(...service.barberService.map((bs) => bs.studentPrice))
          : null,
    }));

    if (formattedServices.length === 0) {
      res.json({
        success: false,
        message: "Aucun service disponible.",
      });
      return;
    }

    res.json(formattedServices);
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Une erreur est survenue.",
    });
  }
});

export default router;
