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

router.post("/hours", async (req: Request, res: Response) => {
  try {
    const { userId, salonId } = req.body;

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

    const salon = await prisma.salon.findUnique({
      where: { id: salonId },
      select: {
        id: true,
        salonDays: {
          select: {
            id: true,
            openingTime: true,
            closingTime: true,
            isOpen: true,
            dayId: true,
            day: {
              select: {
                id: true,
                day: true,
              },
            },
          },
        },
      },
    });

    const defaultHours = {
      mondayOpeningTime: "",
      mondayClosingTime: "",
      openMonday: false,
      tuesdayOpeningTime: "",
      tuesdayClosingTime: "",
      openTuesday: false,
      wednesdayOpeningTime: "",
      wednesdayClosingTime: "",
      openWednesday: false,
      thursdayOpeningTime: "",
      thursdayClosingTime: "",
      openThursday: false,
      fridayOpeningTime: "",
      fridayClosingTime: "",
      openFriday: false,
      saturdayOpeningTime: "",
      saturdayClosingTime: "",
      openSaturday: false,
      sundayOpeningTime: "",
      sundayClosingTime: "",
      openSunday: false,
    };

    const hours = salon?.salonDays.reduce(
      (acc, salonDay) => {
        switch (salonDay.day.day) {
          case "Monday":
            acc.mondayOpeningTime = salonDay.openingTime;
            acc.mondayClosingTime = salonDay.closingTime;
            acc.openMonday = salonDay.isOpen;
            break;
          case "Tuesday":
            acc.tuesdayOpeningTime = salonDay.openingTime;
            acc.tuesdayClosingTime = salonDay.closingTime;
            acc.openTuesday = salonDay.isOpen;
            break;
          case "Wednesday":
            acc.wednesdayOpeningTime = salonDay.openingTime;
            acc.wednesdayClosingTime = salonDay.closingTime;
            acc.openWednesday = salonDay.isOpen;
            break;
          case "Thursday":
            acc.thursdayOpeningTime = salonDay.openingTime;
            acc.thursdayClosingTime = salonDay.closingTime;
            acc.openThursday = salonDay.isOpen;
            break;
          case "Friday":
            acc.fridayOpeningTime = salonDay.openingTime;
            acc.fridayClosingTime = salonDay.closingTime;
            acc.openFriday = salonDay.isOpen;
            break;
          case "Saturday":
            acc.saturdayOpeningTime = salonDay.openingTime;
            acc.saturdayClosingTime = salonDay.closingTime;
            acc.openSaturday = salonDay.isOpen;
            break;
          case "Sunday":
            acc.sundayOpeningTime = salonDay.openingTime;
            acc.sundayClosingTime = salonDay.closingTime;
            acc.openSunday = salonDay.isOpen;
            break;
        }
        return acc;
      },
      { ...defaultHours }
    );

    res.json({ id: salon?.id, hours });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Une erreur est survenue.",
    });
  }
});

router.put("/hours", async (req: Request, res: Response) => {
  try {
    const {
      id,
      openMonday,
      openTuesday,
      openWednesday,
      openThursday,
      openFriday,
      openSaturday,
      openSunday,
      mondayOpeningTime,
      mondayClosingTime,
      tuesdayOpeningTime,
      tuesdayClosingTime,
      wednesdayOpeningTime,
      wednesdayClosingTime,
      thursdayOpeningTime,
      thursdayClosingTime,
      fridayOpeningTime,
      fridayClosingTime,
      saturdayOpeningTime,
      saturdayClosingTime,
      sundayOpeningTime,
      sundayClosingTime,
      userId,
    } = req.body;

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

    const salon = await prisma.salon.findUnique({
      where: { id },
      select: {
        salonDays: { select: { id: true, day: { select: { day: true } } } },
      },
    });

    if (!salon) {
      res.status(404).json({
        success: false,
        message: "Salon non trouvé.",
      });
      return;
    }

    const updatePromises = salon.salonDays.map((salonDay) => {
      let isOpen = false;
      let openingTime = "00:00";
      let closingTime = "00:00";
      switch (salonDay.day.day) {
        case "Monday":
          isOpen = openMonday;
          openingTime = openMonday ? mondayOpeningTime : "00:00";
          closingTime = openMonday ? mondayClosingTime : "00:00";
          break;
        case "Tuesday":
          isOpen = openTuesday;
          openingTime = openTuesday ? tuesdayOpeningTime : "00:00";
          closingTime = openTuesday ? tuesdayClosingTime : "00:00";
          break;
        case "Wednesday":
          isOpen = openWednesday;
          openingTime = openWednesday ? wednesdayOpeningTime : "00:00";
          closingTime = openWednesday ? wednesdayClosingTime : "00:00";
          break;
        case "Thursday":
          isOpen = openThursday;
          openingTime = openThursday ? thursdayOpeningTime : "00:00";
          closingTime = openThursday ? thursdayClosingTime : "00:00";
          break;
        case "Friday":
          isOpen = openFriday;
          openingTime = openFriday ? fridayOpeningTime : "00:00";
          closingTime = openFriday ? fridayClosingTime : "00:00";
          break;
        case "Saturday":
          isOpen = openSaturday;
          openingTime = openSaturday ? saturdayOpeningTime : "00:00";
          closingTime = openSaturday ? saturdayClosingTime : "00:00";
          break;
        case "Sunday":
          isOpen = openSunday;
          openingTime = openSunday ? sundayOpeningTime : "00:00";
          closingTime = openSunday ? sundayClosingTime : "00:00";
          break;
      }
      return prisma.salonDay.update({
        where: { id: salonDay.id },
        data: {
          isOpen,
          openingTime,
          closingTime,
        },
      });
    });

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: "Horaires mis à jour avec succès.",
    });
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
    const { userId, salonId } = req.body;

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

    const salon = await prisma.salon.findUnique({
      where: { id: salonId },
      select: {
        id: true,
        name: true,
        address: true,
        phoneNumber: true,
        city: true,
      },
    });

    if (!salon) {
      res.json({
        success: false,
        message: "Aucun salon disponible.",
      });
      return;
    }

    res.json(salon);
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Une erreur est survenue.",
    });
  }
});

router.put("/update", async (req: Request, res: Response) => {
  try {
    const { salonId, name, address, phone, city, userId } = req.body;

    if (!salonId || !name || !address || !phone || !city) {
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

    const salon = await prisma.salon.findUnique({
      where: { id: salonId },
    });
    if (!salon) {
      res.status(404).json({
        success: false,
        message: "Salon non trouvé.",
      });
      return;
    }

    await prisma.salon.update({
      where: { id: salonId },
      data: {
        name,
        address,
        phoneNumber: phone,
        city,
      },
    });

    res.json({
      success: true,
      message: "Les informations du salon ont été mises à jour avec succès.",
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
