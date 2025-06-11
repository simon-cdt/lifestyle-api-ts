import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { compare, hash } from "bcrypt";

const router = Router();

router.post("/login", async (req: Request, res: Response) => {
  try {
    const { email, password, expoPushToken } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        password: true,
        isBlackListed: true,
        role: true,
        pushToken: true,
      },
    });

    if (!existingUser) {
      res.json({
        success: false,
        message: "L'e-mail n'existe pas.",
      });
      return;
    }

    if (!(await compare(password, existingUser.password))) {
      res.json({
        success: false,
        message: "Le mot de passe est incorrect.",
      });
      return;
    }

    if (expoPushToken) {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { pushToken: expoPushToken },
      });
    }

    const { password: _removed, ...rest } = existingUser;

    res.json({
      success: true,
      message: "La connexion a réussie.",
      user: rest,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Une erreur est survenue.",
    });
  }
});

router.post("/register", async (req: Request, res: Response) => {
  try {
    const { email, firstName, lastName, password, phoneNumber } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          {
            email: email,
          },
          {
            phoneNumber: phoneNumber,
          },
        ],
      },
    });

    if (existingUser) {
      res.status(400).json({
        success: false,
        message: "L'e-mail ou le numéro de téléphone est déjà utilisé.",
      });
      return;
    }

    const hashedPassword = await hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        password: hashedPassword,
        phoneNumber,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        isBlackListed: true,
        role: true,
        pushToken: true,
      },
    });

    res.status(201).json({
      success: true,
      message: "La création du compte a réussi.",
      user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Une erreur est survenue.",
    });
  }
});

router.put("/update", async (req: Request, res: Response) => {
  try {
    const { id, firstName, lastName, email, phoneNumber } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (!user || user.id !== id) {
      res.status(403).json({
        success: false,
        message: "Vous n'êtes pas autorisé à faire cette action.",
      });
      return;
    }

    const mailExists = await prisma.user.findFirst({
      where: {
        email,
      },
      select: {
        id: true,
      },
    });

    if (mailExists && mailExists.id !== id) {
      res.status(400).json({
        success: false,
        message: "L'e-mail est déjà utilisé.",
      });
      return;
    }

    const phoneExists = await prisma.user.findFirst({
      where: {
        phoneNumber,
      },
      select: {
        id: true,
      },
    });
    if (phoneExists && phoneExists.id !== id) {
      res.status(400).json({
        success: false,
        message: "Le numéro de téléphone est déjà utilisé.",
      });
      return;
    }

    const userUpdate = await prisma.user.update({
      where: {
        id,
      },
      data: {
        firstName,
        lastName,
        phoneNumber,
        email,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phoneNumber: true,
        isBlackListed: true,
        role: true,
        pushToken: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "L'utilisateur a bien été modifié.",
      user: userUpdate,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Une erreur est survenue.",
    });
  }
});

router.put("/update-password", async (req: Request, res: Response) => {
  try {
    const { id, currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        password: true,
      },
    });

    if (!user) {
      res.status(403).json({
        success: false,
        message: "Vous n'êtes pas autorisé à faire cette action.",
      });
      return;
    }

    if (!(await compare(currentPassword, user?.password))) {
      res.status(403).json({
        success: false,
        message: "Le mot de passe actuel est incorrect.",
      });
      return;
    }

    const hashedPassword = await hash(newPassword, 10);

    await prisma.user.update({
      where: {
        id,
      },
      data: {
        password: hashedPassword,
      },
    });

    res.status(200).json({
      success: true,
      message: "Le mot de passe a bien été modifié.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Une erreur est survenue.",
    });
  }
});

router.delete("/delete", async (req: Request, res: Response) => {
  try {
    const { id, password } = req.body;

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user || !(await compare(password, user?.password))) {
      res.status(403).json({
        success: false,
        message: "Le mot de passe est incorrect.",
      });
      return;
    }

    await prisma.user.delete({
      where: {
        id,
      },
    });

    res.status(200).json({
      success: true,
      message: "L'utilisateur a bien été supprimé.",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Une erreur est survenue.",
    });
  }
});

export default router;
