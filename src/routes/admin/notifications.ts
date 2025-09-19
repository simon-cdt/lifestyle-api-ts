import { Router, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import Expo from "expo-server-sdk";
import { format } from "date-fns";

const router = Router();

const expo = new Expo();

router.post("/send", async (req, res) => {
  const { userIds, title, body, userId, everyone } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true, pushToken: true },
    });
    if (!user || user.role !== "ADMIN") {
      res.status(404).json({ message: "Utilisateur non autorisé." });
      return;
    }

    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, pushToken: true },
    });

    if (!users || users.length === 0) {
      res.status(400).json({ message: "Aucun utilisateur spécifié." });
      return;
    }

    if (!title || !body) {
      res
        .status(400)
        .json({ message: "Le titre et le contenu sont obligatoires." });
      return;
    }

    let messages = [];
    for (const user of users) {
      if (!Expo.isExpoPushToken(user.pushToken)) {
        continue;
      }
      messages.push({
        to: user.pushToken,
        sound: "default",
        title: title,
        body: body,
      });
    }

    // Envoyer les notifications par lots
    const chunks = expo.chunkPushNotifications(messages);
    const tickets = [];
    for (const chunk of chunks) {
      try {
        const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        tickets.push(...ticketChunk);
      } catch (error) {
        console.error("Erreur lors de l'envoi des notifications :", error);
      }
    }

    const date = format(new Date(), "yyyy-MM-dd") + "T00:00:00Z";

    if (everyone) {
      await prisma.notification.create({
        data: {
          title,
          message: body,
          everyone: true,
          createdAt: date,
        },
      });
    } else {
      await prisma.notification.create({
        data: {
          title,
          message: body,
          userNotifications: {
            createMany: {
              data: users.map((user) => ({ userId: user.id })),
            },
          },
          everyone: false,
          createdAt: date,
        },
      });
    }

    res.status(200).json({
      message: "Notifications envoyées avec succès.",
      tickets,
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi des notifications :", error);
    res.status(500).json({ message: "Erreur interne du serveur." });
    return;
  }
});

router.post("/users", async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
    if (!user || user.role !== "ADMIN") {
      res
        .status(404)
        .json({ message: "Utilisateur non autorisé.", success: false });
      return;
    }

    const users = await prisma.user.findMany({
      select: { id: true, firstName: true, lastName: true },
    });

    if (!users || users.length === 0) {
      res
        .status(400)
        .json({ message: "Aucun utilisateurs trouvés.", success: false });
      return;
    }

    const usersFactorised = users.map((user) => {
      return {
        id: user.id,
        name: user.firstName + " " + user.lastName,
      };
    });

    res.status(200).json({ success: true, users: usersFactorised });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Une erreur est survenue.", success: false });
    return;
  }
});

export default router;
