import { Router, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { upload } from "../../middleware/multerBarber";

const router = Router();

router.post("/salons", async (req: Request, res: Response) => {
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
      },
    });

    if (salons.length === 0) {
      res.json({
        success: false,
        message: "Aucun salon trouvé.",
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
      const {
        userId,
        clientId,
        salonId,
        pseudo,
        instagram,
        snapchat,
        isOpenMonday,
        isOpenTuesday,
        isOpenWednesday,
        isOpenThursday,
        isOpenFriday,
        isOpenSaturday,
        isOpenSunday,
      } = req.body;

      if (!userId || !clientId || !salonId || !pseudo || !req.file) {
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

      const client = await prisma.user.findUnique({
        where: { id: clientId },
        select: { id: true, role: true },
      });

      if (!client) {
        res.status(403).json({
          success: false,
          message: "Le client n'existe pas",
        });
        return;
      }

      if (client.role !== "CLIENT") {
        res.status(403).json({
          success: false,
          message: "L'utilisateur n'est pas un client",
        });
        return;
      }

      await prisma.user.update({
        where: { id: clientId },
        data: { role: "BARBER" },
      });

      const days = await prisma.day.findMany();

      const toBool = (val: string) => val === "true";

      await prisma.barber.create({
        data: {
          userId: clientId,
          salonId,
          instagram,
          snapchat,
          pseudo,
          imgUrl: req.file.filename,
          barberDays: {
            createMany: {
              data: [
                {
                  dayId: (() => {
                    const monday = days.find((day) => day.day === "Monday");
                    if (!monday) {
                      throw new Error('Day "Monday" not found');
                    }
                    return monday.id;
                  })(),
                  isWorking: toBool(isOpenMonday),
                },
                {
                  dayId: (() => {
                    const tuesday = days.find((day) => day.day === "Tuesday");
                    if (!tuesday) {
                      throw new Error('Day "Tuesday" not found');
                    }
                    return tuesday.id;
                  })(),
                  isWorking: toBool(isOpenTuesday),
                },
                {
                  dayId: (() => {
                    const wednesday = days.find(
                      (day) => day.day === "Wednesday"
                    );
                    if (!wednesday) {
                      throw new Error('Day "Wednesday" not found');
                    }
                    return wednesday.id;
                  })(),
                  isWorking: toBool(isOpenWednesday),
                },
                {
                  dayId: (() => {
                    const thursday = days.find((day) => day.day === "Thursday");
                    if (!thursday) {
                      throw new Error('Day "Thursday" not found');
                    }
                    return thursday.id;
                  })(),
                  isWorking: toBool(isOpenThursday),
                },
                {
                  dayId: (() => {
                    const friday = days.find((day) => day.day === "Friday");
                    if (!friday) {
                      throw new Error('Day "Friday" not found');
                    }
                    return friday.id;
                  })(),
                  isWorking: toBool(isOpenFriday),
                },
                {
                  dayId: (() => {
                    const saturday = days.find((day) => day.day === "Saturday");
                    if (!saturday) {
                      throw new Error('Day "Saturday" not found');
                    }
                    return saturday.id;
                  })(),
                  isWorking: toBool(isOpenSaturday),
                },
                {
                  dayId: (() => {
                    const sunday = days.find((day) => day.day === "Sunday");
                    if (!sunday) {
                      throw new Error('Day "Sunday" not found');
                    }
                    return sunday.id;
                  })(),
                  isWorking: toBool(isOpenSunday),
                },
              ],
            },
          },
        },
      });

      res.json({
        success: true,
        message: "Le barbier a été ajouté avec succès.",
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
