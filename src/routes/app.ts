import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.get("/", async (req: Request, res: Response) => {
  try {
    const version = await prisma.app.findFirst({
      select: {
        version: true,
      },
    });

    const phoneNumber = await prisma.salon.findFirst({
      select: {
        phoneNumber: true,
      },
    });

    const obj = {
      version: version?.version || "1.0.0",
      phoneNumber: phoneNumber?.phoneNumber || null,
    };

    res.json(obj);
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Une erreur est survenue.",
    });
  }
});

export default router;
