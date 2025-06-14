import { Router, Request, Response } from "express";
import { prisma } from "../../lib/prisma";
import { format } from "date-fns";

const router = Router();

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
            service: {
              select: { type: true },
            },
          },
        });

        appointments.forEach((app) => {
          unavailability.push({
            startTime: app.startTime,
            endTime: app.endTime,
            appointment: true,
            id: app.id,
            clientName: app.client?.firstName,
            serviceType: app.service.type,
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
          client: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
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
        };

        const { barber, serviceId, ...rest } = appointmentDetail;
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

export default router;
