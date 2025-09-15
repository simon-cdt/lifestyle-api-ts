import { Router, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { upload } from "../../middleware/multerSalon";

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

    if (salons.length === 0) {
      res.json({
        success: false,
        message: "Aucun service disponible.",
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
      const { userId, name, address, phone, city } = req.body;

      if (!userId || !name || !address || !phone || !city || !req.file) {
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

      const days = await prisma.day.findMany();

      await prisma.salon.create({
        data: {
          name,
          address,
          city,
          phoneNumber: phone,
          imgUrl: req.file.filename,
          salonDays: {
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
                  openingTime: "08:00",
                  closingTime: "18:00",
                  isOpen: true,
                },
                {
                  dayId: (() => {
                    const tuesday = days.find((day) => day.day === "Tuesday");
                    if (!tuesday) {
                      throw new Error('Day "Tuesday" not found');
                    }
                    return tuesday.id;
                  })(),
                  openingTime: "08:00",
                  closingTime: "18:00",
                  isOpen: true,
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
                  openingTime: "08:00",
                  closingTime: "18:00",
                  isOpen: true,
                },
                {
                  dayId: (() => {
                    const thursday = days.find((day) => day.day === "Thursday");
                    if (!thursday) {
                      throw new Error('Day "Thursday" not found');
                    }
                    return thursday.id;
                  })(),
                  openingTime: "08:00",
                  closingTime: "18:00",
                  isOpen: true,
                },
                {
                  dayId: (() => {
                    const friday = days.find((day) => day.day === "Friday");
                    if (!friday) {
                      throw new Error('Day "Friday" not found');
                    }
                    return friday.id;
                  })(),
                  openingTime: "08:00",
                  closingTime: "18:00",
                  isOpen: true,
                },
                {
                  dayId: (() => {
                    const saturday = days.find((day) => day.day === "Saturday");
                    if (!saturday) {
                      throw new Error('Day "Saturday" not found');
                    }
                    return saturday.id;
                  })(),
                  openingTime: "10:00",
                  closingTime: "16:00",
                  isOpen: true,
                },
                {
                  dayId: (() => {
                    const sunday = days.find((day) => day.day === "Sunday");
                    if (!sunday) {
                      throw new Error('Day "Sunday" not found');
                    }
                    return sunday.id;
                  })(),
                  openingTime: "00:00",
                  closingTime: "00:00",
                  isOpen: false,
                },
              ],
            },
          },
        },
      });

      res.json({
        success: true,
        message: "Le salon a été ajouté avec succès.",
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
