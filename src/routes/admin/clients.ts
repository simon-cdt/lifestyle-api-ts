import { Router, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { hash } from "bcrypt";

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

router.post("/informations", async (req: Request, res: Response) => {
  try {
    const { userId, clientId } = req.body;

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

    const client = await prisma.user.findUnique({
      where: { id: clientId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        role: true,
        isBlackListed: true,
      },
    });

    if (!client) {
      res.json({
        success: false,
        message: "Aucun client trouvé.",
      });
      return;
    }

    res.json(client);
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Une erreur est survenue.",
    });
  }
});

router.put("/blacklist", async (req: Request, res: Response) => {
  try {
    const { userId, clientId, isBlackListed } = req.body;

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

    const client = await prisma.user.findUnique({
      where: { id: clientId },
      select: {
        id: true,
      },
    });

    if (!client) {
      res.json({
        success: false,
        message: "Aucun client trouvé.",
      });
      return;
    }

    await prisma.user.update({
      where: { id: clientId },
      data: { isBlackListed: !isBlackListed },
    });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Une erreur est survenue.",
    });
  }
});

router.put("/password", async (req: Request, res: Response) => {
  try {
    const { userId, clientId, password } = req.body;

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

    const client = await prisma.user.findUnique({
      where: { id: clientId },
      select: {
        id: true,
      },
    });

    if (!client) {
      res.json({
        success: false,
        message: "Aucun client trouvé.",
      });
      return;
    }

    const hashedPassword = await hash(password, 10);

    await prisma.user.update({
      where: { id: client.id },
      data: { password: hashedPassword },
    });

    res.json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Une erreur est survenue.",
    });
  }
});

export default router;
