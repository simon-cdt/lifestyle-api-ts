import { Router, Request, Response } from "express";
import { prisma } from "../../lib/prisma";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
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

    res.json({
      success: true,
      message: "Les salons ont été récupérés avec succès.",
      salons,
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
