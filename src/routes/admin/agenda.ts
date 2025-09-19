import { Router, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import {
  addDays,
  format,
  isAfter,
  isBefore,
  isEqual,
  parseISO,
} from "date-fns";
import Expo from "expo-server-sdk";
import { fr } from "date-fns/locale";

const router = Router();
const expo = new Expo();

type BarberAvailability = {
  barber: {
    id: string;
    pseudo: string;
  };
  unavailability: {
    startTime: string;
    endTime: string;
    appointment: boolean;
    id: string;
    clientName?: string;
    serviceType?: string;
  }[];
};

router.post("/", async (req: Request, res: Response) => {
  try {
    const { salonId, date, userId } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
      },
    });
    if (!user || user.role === "CLIENT") {
      res.status(403).json({
        success: false,
        message:
          "Accès refusé. Seul un administrateur peut accéder à cette ressource.",
      });
      return;
    }

    const dateObj = new Date(date);
    const dayOfWeek = format(dateObj, "EEEE");

    const salon = await prisma.salon.findUnique({
      where: { id: salonId },
      select: {
        id: true,
        salonDays: {
          where: {
            day: {
              day: dayOfWeek,
            },
          },
          select: {
            isOpen: true,
            openingTime: true,
            closingTime: true,
          },
        },
      },
    });
    if (!salon) {
      res.json({ message: "Le salon n'existe pas", available: false });
      return;
    }

    const closures = await prisma.salonClosure.findMany({
      where: {
        salonId,
        startDate: { lte: dateObj },
        endDate: { gte: dateObj },
      },
    });
    if (closures.length > 0) {
      res.json({
        message: "Le salon est fermé à cette date",
        available: false,
      });
      return;
    }

    const salonOpenDay = await prisma.salonDay.findFirst({
      where: {
        salonId: salonId,
        day: {
          day: dayOfWeek,
        },
      },
      select: {
        isOpen: true,
        openingTime: true,
        closingTime: true,
      },
    });

    if (!salonOpenDay?.isOpen) {
      res.json({
        message: "Le salon n'est pas ouvert ce jour-là",
        available: false,
      });
      return;
    }

    const barbers = await prisma.barber.findMany({
      where: {
        salonId,

        barberDays: {
          some: {
            isWorking: true,
            day: {
              day: dayOfWeek,
            },
          },
        },
      },
      select: {
        id: true,
        pseudo: true,
      },
    });

    if (barbers.length === 0) {
      res.json({
        message: "Aucun barbier ne travaille ce jour-là",
        available: false,
      });
      return;
    }

    const absentBarbers = await prisma.barberAbsence.findMany({
      where: {
        startDate: { lte: dateObj },
        endDate: { gte: dateObj },
        barberId: { in: barbers.map((b) => b.id) },
      },
      select: { barberId: true },
    });
    const absentBarberIds = absentBarbers.map((a) => a.barberId);

    const availableBarbers = barbers.filter(
      (b) => !absentBarberIds.includes(b.id)
    );

    if (availableBarbers.length === 0) {
      res.json({
        message: "Tous les barbers sont absents ce jour-là",
        available: false,
      });
      return;
    }

    const barberAvailabilities: BarberAvailability[] = await Promise.all(
      availableBarbers.map(async (barber) => {
        const unavailability: {
          startTime: string;
          endTime: string;
          appointment: boolean;
          id: string;
          clientName?: string;
          serviceType?: string;
          custom?: string;
        }[] = [];

        const appointments = await prisma.appointment.findMany({
          where: {
            barberId: barber.id,
            date: dateObj,
          },
          select: {
            id: true,
            startTime: true,
            endTime: true,
            client: {
              select: { firstName: true },
            },
            guest: { select: { name: true } },
            service: {
              select: { type: true },
            },
            custom: true,
          },
        });

        appointments.forEach((app) => {
          unavailability.push({
            startTime: app.startTime,
            endTime: app.endTime,
            appointment: true,
            id: app.id,
            clientName: app.client ? app.client.firstName : app.guest?.name,
            serviceType: app.service?.type,
            custom: app.custom || undefined,
          });
        });

        const barberBreaks = await prisma.barberBreak.findMany({
          where: {
            barberId: barber.id,
            breakDate: dateObj,
          },
          select: { id: true, startTime: true, endTime: true },
        });

        barberBreaks.forEach((breakTime) => {
          unavailability.push({
            startTime: breakTime.startTime,
            endTime: breakTime.endTime,
            appointment: false,
            id: breakTime.id,
          });
        });

        const salonBreaks = await prisma.salonBreak.findMany({
          where: {
            salonId,
            breakDate: dateObj,
          },
          select: { id: true, startTime: true, endTime: true },
        });

        salonBreaks.forEach((breakTime) => {
          unavailability.push({
            startTime: breakTime.startTime,
            endTime: breakTime.endTime,
            appointment: false,
            id: breakTime.id,
          });
        });

        return {
          barber: {
            id: barber.id,
            pseudo: barber.pseudo,
          },
          unavailability,
        };
      })
    );

    res.json({
      available: true,
      openingTime: salon.salonDays[0].openingTime,
      closingTime: salon.salonDays[0].closingTime,
      barbers: barberAvailabilities,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Une erreur est survenue.",
    });
  }
});

router.get("/salons", async (req: Request, res: Response) => {
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

router.post("/info", async (req: Request, res: Response) => {
  try {
    const { appointment, id, userId } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
      },
    });
    if (!user || user.role === "CLIENT") {
      res.status(403).json({
        success: false,
        message:
          "Accès refusé. Seul un administrateur peut accéder à cette ressource.",
      });
      return;
    }

    let appointmentDetail = null;

    if (appointment) {
      appointmentDetail = await prisma.appointment.findUnique({
        where: { id },
        select: {
          id: true,
          serviceId: true,
          service: {
            select: {
              type: true,
            },
          },
          custom: true,
          client: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phoneNumber: true,
            },
          },
          guest: {
            select: {
              id: true,
              name: true,
              phoneNumber: true,
            },
          },
          startTime: true,
          endTime: true,
          barber: {
            select: {
              barberServices: {
                select: {
                  serviceId: true,
                  price: true,
                  studentPrice: true,
                },
              },
            },
          },
        },
      });
      if (appointmentDetail) {
        const serviceIdd = appointmentDetail.serviceId;
        const barberService = appointmentDetail.barber.barberServices.find(
          (bs) => {
            return bs.serviceId === serviceIdd;
          }
        );
        appointmentDetail = {
          ...appointmentDetail,
          price: barberService?.price || 0,
          studentPrice: barberService?.studentPrice || 0,
          appointment: true,
          client: {
            name: appointmentDetail.client
              ? `${appointmentDetail.client.firstName} ${appointmentDetail.client.lastName}`.trim()
              : appointmentDetail.guest?.name,
            email: appointmentDetail.client?.email,
            phoneNumber:
              appointmentDetail.client?.phoneNumber ||
              appointmentDetail.guest?.phoneNumber,
          },
        };

        const { barber, serviceId, guest, ...rest } = appointmentDetail;
        appointmentDetail = rest;
      }
    } else {
      appointmentDetail = await prisma.barberBreak.findUnique({
        where: { id },
        select: {
          id: true,
          startTime: true,
          endTime: true,
        },
      });
      if (appointmentDetail) {
        appointmentDetail = { ...appointmentDetail, appointment: false };
      }
    }

    if (!appointmentDetail) {
      res.status(404).json({
        success: false,
        message: "Rendez-vous ou pause introuvable.",
      });
      return;
    }

    res.json({ appointmentDetail, success: true });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Une erreur est survenue.",
    });
  }
});

router.post("/barberServices", async (req: Request, res: Response) => {
  try {
    const { barberId, userId } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
      },
    });
    if (!user || user.role === "CLIENT") {
      res.status(403).json({
        success: false,
        message:
          "Accès refusé. Seul un administrateur peut accéder à cette ressource.",
      });
      return;
    }

    const barber = await prisma.barber.findUnique({
      where: {
        id: barberId,
      },
      select: {
        barberServices: {
          select: {
            duration: true,
            service: {
              select: {
                id: true,
                type: true,
              },
            },
          },
        },
      },
    });

    if (barber?.barberServices.length === 0) {
      res.json({
        success: false,
        message: "Aucun service disponible pour ce barbier.",
      });
      return;
    }

    const services = barber?.barberServices.map((barberService) => {
      return {
        id: barberService.service.id,
        type: barberService.service.type,
        duration: barberService.duration,
      };
    });

    res.json({ services, success: true });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Une erreur est survenue.",
    });
  }
});

router.post("/create-guest", async (req: Request, res: Response) => {
  try {
    const {
      name,
      phoneNumber,
      barberId,
      serviceId,
      date,
      startTime,
      endTime,
      userId,
      customServiceName,
      custom,
    } = req.body;

    const newDate = date + "T00:00:00Z";

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
      },
    });
    if (!user || user.role === "CLIENT") {
      res.status(403).json({
        success: false,
        message:
          "Accès refusé. Seul un administrateur peut accéder à cette ressource.",
      });
      return;
    }

    // vérifie si le barber n'a pas déjà un rendez-vous à cette date et heure
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        barberId,
        date: {
          gte: newDate,
          lte: newDate,
        },
        OR: [
          {
            startTime: startTime,
          },
          {
            endTime: endTime,
          },
        ],
      },
    });
    if (existingAppointment) {
      res.json({
        success: false,
        message: "Le barbier a déjà un rendez-vous pour ce créneau.",
      });
      return;
    }

    const newGuest = await prisma.guest.create({
      data: {
        name,
        phoneNumber,
      },
      select: {
        id: true,
      },
    });

    if (custom && customServiceName) {
      await prisma.appointment.create({
        data: {
          guestId: newGuest.id,
          barberId,
          date: newDate,
          startTime,
          endTime,
          custom: customServiceName || false,
        },
      });
    } else {
      await prisma.appointment.create({
        data: {
          guestId: newGuest.id,
          barberId,
          serviceId,
          date: newDate,
          startTime,
          endTime,
        },
      });
    }

    res.json({
      success: true,
      message: "Le rendez-vous a été créé avec succès.",
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Une erreur est survenue.",
    });
  }
});

router.post("/create-break", async (req: Request, res: Response) => {
  try {
    const {
      barberId,
      date,
      startTime,
      endTime,
      userId,
      oneTime,
      dateRecurrence,
    } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });

    if (!user || user.role === "CLIENT") {
      res.status(403).json({
        success: false,
        message:
          "Accès refusé. Seul un administrateur peut accéder à cette ressource.",
      });
      return;
    }

    if (oneTime) {
      await prisma.barberBreak.create({
        data: {
          barberId,
          breakDate: date + "T00:00:00Z",
          startTime,
          endTime,
        },
      });

      res.json({
        success: true,
        message: "La pause a été créée avec succès.",
      });
    } else {
      let dateAdd = date;

      while (isAfter(dateAdd, dateRecurrence) === false) {
        const breakDateStr = format(dateAdd, "yyyy-MM-dd") + "T00:00:00Z";

        await prisma.barberBreak.create({
          data: {
            barberId,
            breakDate: breakDateStr,
            startTime,
            endTime,
          },
        });

        dateAdd = addDays(dateAdd, 1);
      }

      res.json({
        success: true,
        message: "Les pauses ont été créées avec succès.",
      });
    }
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Une erreur est survenue.",
    });
  }
});

router.delete("/delete-break", async (req: Request, res: Response) => {
  try {
    const { id, userId } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
      },
    });
    if (!user || user.role === "CLIENT") {
      res.status(403).json({
        success: false,
        message:
          "Accès refusé. Seul un administrateur peut accéder à cette ressource.",
      });
      return;
    }

    const breakToDelete = await prisma.barberBreak.findUnique({
      where: { id },
    });

    if (!breakToDelete) {
      res.status(404).json({
        success: false,
        message: "Pause introuvable.",
      });
      return;
    }

    await prisma.barberBreak.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "La pause a été supprimée avec succès.",
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Une erreur est survenue.",
    });
  }
});

router.delete("/delete-appointment", async (req: Request, res: Response) => {
  try {
    const { id, userId } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        role: true,
      },
    });
    if (!user || user.role === "CLIENT") {
      res.status(403).json({
        success: false,
        message:
          "Accès refusé. Seul un administrateur peut accéder à cette ressource.",
      });
      return;
    }

    const appointmentToDelete = await prisma.appointment.findUnique({
      where: { id },
      select: {
        date: true,
        startTime: true,
        endTime: true,
        client: {
          select: {
            id: true,
            pushToken: true,
            firstName: true,
          },
        },
      },
    });

    if (!appointmentToDelete) {
      res.status(404).json({
        success: false,
        message: "Rendez-vous introuvable.",
      });
      return;
    }

    await prisma.appointment.delete({
      where: { id },
    });

    if (appointmentToDelete.client?.pushToken) {
      await prisma.notification.create({
        data: {
          title: "Rendez-vous annulé",
          message: `Bonjour ${
            appointmentToDelete.client?.firstName
          }, votre rendez-vous prévu le ${format(
            appointmentToDelete.date,
            "PPPP",
            { locale: fr }
          )} entre ${appointmentToDelete.startTime} et ${
            appointmentToDelete.endTime
          } a été annulé.`,
          userNotifications: {
            create: {
              userId: appointmentToDelete.client.id,
            },
          },
          createdAt: format(new Date(), "yyyy-MM-dd") + "T00:00:00Z",
          everyone: false,
        },
      });

      const notification = {
        to: appointmentToDelete.client.pushToken,
        sound: "default",
        title: "Rendez-vous annulé",
        body: `Bonjour ${
          appointmentToDelete.client.firstName
        }, votre rendez-vous prévu le ${format(
          appointmentToDelete.date,
          "PPPP",
          { locale: fr }
        )} entre ${appointmentToDelete.startTime} et ${
          appointmentToDelete.endTime
        } a été annulé.`,
      };
      await expo.sendPushNotificationsAsync([notification]);
    }

    res.json({
      success: true,
      message: "Le rendez-vous a été supprimé avec succès.",
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
