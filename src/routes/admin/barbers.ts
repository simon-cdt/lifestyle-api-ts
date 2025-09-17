import { Router, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { upload } from "../../middleware/multerBarber";
import path from "path";
import fs from "fs/promises";

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

    const barbers = await prisma.barber.findMany({
      select: {
        id: true,
        pseudo: true,
        imgUrl: true,
        salon: {
          select: {
            name: true,
          },
        },
      },
    });

    if (barbers.length === 0) {
      res.json({
        success: false,
        message: "Aucun barbier trouvé.",
      });
      return;
    }

    res.json(barbers);
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Une erreur est survenue.",
    });
  }
});

router.put(
  "/editImg",
  upload.single("image"),
  async (req: Request, res: Response) => {
    try {
      const { userId, barberId } = req.body;

      if (!userId || !barberId || !req.file) {
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

      const barber = await prisma.barber.findUnique({
        where: { id: barberId },
        select: { imgUrl: true },
      });
      if (!barber) {
        res.status(404).json({
          success: false,
          message: "Barber non trouvé.",
        });
        return;
      }

      const oldFilePath = path.join(
        __dirname,
        "../../../uploads/barbers/",
        barber.imgUrl
      );
      try {
        await fs.unlink(oldFilePath);
      } catch (err) {
        console.warn("Fichier déjà supprimé ou introuvable :", oldFilePath);
      }

      await prisma.barber.update({
        where: { id: barberId },
        data: { imgUrl: req.file.filename },
      });

      res.json({
        success: true,
        message: "Le barbier a été mis à jour avec succès.",
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

router.delete("/delete", async (req: Request, res: Response) => {
  try {
    const { userId, barberId } = req.body;

    if (!userId || !barberId) {
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

    const barber = await prisma.barber.findUnique({
      where: { id: barberId },
      select: { id: true, imgUrl: true },
    });
    if (!barber) {
      res.status(404).json({
        success: false,
        message: "Barber non trouvé.",
      });
      return;
    }

    await prisma.barberBreak.deleteMany({
      where: { barberId: barberId },
    });
    await prisma.barberAbsence.deleteMany({
      where: { barberId: barberId },
    });
    await prisma.barberDay.deleteMany({
      where: { barberId: barberId },
    });

    await prisma.appointment.deleteMany({
      where: { barberId: barberId },
    });
    await prisma.barberService.deleteMany({
      where: { barberId: barberId },
    });

    const client = await prisma.barber.findUnique({
      where: { id: barberId },
      select: { userId: true },
    });

    await prisma.user.update({
      where: { id: client?.userId },
      data: { role: "CLIENT" },
    });

    const filePath = path.join(
      __dirname,
      "../../../uploads/barbers/",
      barber.imgUrl
    );
    try {
      await fs.unlink(filePath);
    } catch (err) {
      console.warn("Fichier déjà supprimé ou introuvable :", filePath);
    }

    await prisma.barber.delete({
      where: { id: barberId },
    });

    res.json({
      success: true,
      message: "Le barber a été supprimé avec succès.",
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Une erreur est survenue.",
    });
  }
});

router.post("/services", async (req: Request, res: Response) => {
  try {
    const { userId, barberId } = req.body;

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

    const servicesBarber = await prisma.barberService.findMany({
      where: { barberId: barberId },
      select: {
        id: true,
        price: true,
        studentPrice: true,
        duration: true,
        service: {
          select: { type: true, id: true },
        },
      },
    });

    const rest = await prisma.service.findMany({
      where: { NOT: { barberService: { some: { barberId: barberId } } } },
      select: {
        id: true,
        type: true,
      },
    });

    const services = await prisma.service.findMany({
      where: { barberService: { some: { barberId: barberId } } },
      select: {
        id: true,
        type: true,
        show: true,
        barberService: {
          where: { barberId: barberId },
          select: {
            barberId: true,
            id: true,
            price: true,
            studentPrice: true,
            duration: true,
          },
        },
      },
    });

    res.json({ services, rest });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Une erreur est survenue.",
    });
  }
});

router.post("/service-add", async (req: Request, res: Response) => {
  try {
    const { userId, barberId, duration, price, studentPrice, serviceId } =
      req.body;

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

    await prisma.barberService.create({
      data: {
        barberId: barberId,
        serviceId: serviceId,
        duration: parseInt(duration, 10),
        price: price,
        studentPrice: studentPrice,
      },
    });

    res.json({
      success: true,
      message: "Service ajouté au barbier avec succès.",
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Une erreur est survenue.",
    });
  }
});

router.post("/service", async (req: Request, res: Response) => {
  try {
    const { userId, serviceBarberId } = req.body;

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

    const barberService = await prisma.barberService.findUnique({
      where: { id: serviceBarberId },
      select: {
        id: true,
        price: true,
        studentPrice: true,
        duration: true,
        barberId: true,
      },
    });

    if (!barberService) {
      res.status(404).json({
        success: false,
        message: "Service du barbier non trouvé.",
      });
      return;
    }

    res.json(barberService);
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Une erreur est survenue.",
    });
  }
});

router.put("/service-update", async (req: Request, res: Response) => {
  try {
    const { userId, serviceBarberId, duration, price, studentPrice } = req.body;

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

    await prisma.barberService.update({
      where: { id: serviceBarberId },
      data: {
        duration: parseInt(duration, 10),
        price: price,
        studentPrice: studentPrice,
      },
    });

    res.json({
      success: true,
      message: "Service du barbier mis à jour avec succès.",
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Une erreur est survenue.",
    });
  }
});

router.delete("/service-delete", async (req: Request, res: Response) => {
  try {
    const { userId, serviceBarberId } = req.body;

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

    const service = await prisma.barberService.findUnique({
      where: { id: serviceBarberId },
      select: { serviceId: true, barberId: true },
    });

    await prisma.appointment.deleteMany({
      where: {
        barberId: service?.barberId,
        serviceId: service?.serviceId,
      },
    });

    await prisma.barberService.delete({
      where: { id: serviceBarberId },
    });

    res.json({
      success: true,
      message: "Service du barbier supprimé avec succès.",
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Une erreur est survenue.",
    });
  }
});

router.post("/absence-add", async (req: Request, res: Response) => {
  try {
    const { userId, barberId, startDate, endDate } = req.body;

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

    const startDateFormat = startDate + "T00:00:00Z";
    const endDateFormat = endDate + "T00:00:00Z";

    await prisma.barberAbsence.create({
      data: {
        barberId: barberId,
        startDate: startDateFormat,
        endDate: endDateFormat,
      },
    });

    res.json({
      success: true,
      message: "Absence ajoutée au barbier avec succès.",
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Une erreur est survenue.",
    });
  }
});

router.post("/info", async (req: Request, res: Response) => {
  try {
    const { userId, barberId } = req.body;

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

    const barber = await prisma.barber.findUnique({
      where: { id: barberId },
      select: {
        id: true,
        pseudo: true,
        instagram: true,
        snapchat: true,
        salon: {
          select: {
            id: true,
            name: true,
          },
        },
        barberDays: {
          select: {
            isWorking: true,
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

    if (!barber) {
      res.status(404).json({
        success: false,
        message: "Barber non trouvé.",
      });
      return;
    }

    const barberFormat = {
      ...barber,
      isWorkingMonday: barber.barberDays.some(
        (d) => d.day.day === "Monday" && d.isWorking
      ),
      isWorkingTuesday: barber.barberDays.some(
        (d) => d.day.day === "Tuesday" && d.isWorking
      ),
      isWorkingWednesday: barber.barberDays.some(
        (d) => d.day.day === "Wednesday" && d.isWorking
      ),
      isWorkingThursday: barber.barberDays.some(
        (d) => d.day.day === "Thursday" && d.isWorking
      ),
      isWorkingFriday: barber.barberDays.some(
        (d) => d.day.day === "Friday" && d.isWorking
      ),
      isWorkingSaturday: barber.barberDays.some(
        (d) => d.day.day === "Saturday" && d.isWorking
      ),
      isWorkingSunday: barber.barberDays.some(
        (d) => d.day.day === "Sunday" && d.isWorking
      ),
    };

    const salons = await prisma.salon.findMany({
      select: {
        id: true,
        name: true,
      },
    });

    const { barberDays, ...barberWithoutDays } = barberFormat;

    res.json({ barber: barberWithoutDays, salons });
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
    const {
      userId,
      barberId,
      salonId,
      pseudo,
      instagram,
      snapchat,
      isWorkingMonday,
      isWorkingTuesday,
      isWorkingWednesday,
      isWorkingThursday,
      isWorkingFriday,
      isWorkingSaturday,
      isWorkingSunday,
    } = req.body;

    if (!userId || !barberId || !salonId || !pseudo) {
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

    await prisma.barber.update({
      where: { id: barberId },
      data: {
        salonId,
        pseudo,
        instagram,
        snapchat,
        barberDays: {
          updateMany: [
            {
              where: { dayId: days.find((d) => d.day === "Monday")?.id },
              data: { isWorking: isWorkingMonday },
            },
            {
              where: { dayId: days.find((d) => d.day === "Tuesday")?.id },
              data: { isWorking: isWorkingTuesday },
            },
            {
              where: { dayId: days.find((d) => d.day === "Wednesday")?.id },
              data: { isWorking: isWorkingWednesday },
            },
            {
              where: { dayId: days.find((d) => d.day === "Thursday")?.id },
              data: { isWorking: isWorkingThursday },
            },
            {
              where: { dayId: days.find((d) => d.day === "Friday")?.id },
              data: { isWorking: isWorkingFriday },
            },
            {
              where: { dayId: days.find((d) => d.day === "Saturday")?.id },
              data: { isWorking: isWorkingSaturday },
            },
            {
              where: { dayId: days.find((d) => d.day === "Sunday")?.id },
              data: { isWorking: isWorkingSunday },
            },
          ],
        },
      },
    });

    res.json({
      success: true,
      message: "Barber mis à jour avec succès.",
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
