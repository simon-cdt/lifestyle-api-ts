import { Router, Request, Response } from "express";
import { prisma } from "../../lib/prisma";

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

    const users = await prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
      },
    });

    if (users.length === 0) {
      res.json({
        success: false,
        message: "Aucun client trouvé.",
      });
      return;
    }

    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Une erreur est survenue.",
    });
  }
});

export default router;
