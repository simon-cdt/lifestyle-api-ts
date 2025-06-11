import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { format } from "date-fns";

const router = Router();

type BarberAvailability = {
  barber: {
    id: string;
    imgUrl: string;
    pseudo: string;
    instagram: string;
    snapchat: string;
  };
  unavailability: { startTime: string; endTime: string }[];
};

router.post("/", async (req: Request, res: Response) => {
  try {
    const { salonId, serviceId, date } = req.body;

    const dateObj = new Date(date);
    const dayOfWeek = format(dateObj, "EEEE");

    // Vérifier si le salon existe
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
        barberServices: {
          some: {
            serviceId,
          },
        },
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
        imgUrl: true,
        pseudo: true,
        instagram: true,
        snapchat: true,
        barberServices: {
          where: {
            serviceId,
          },
          select: {
            serviceId: true,
            price: true,
            studentPrice: true,
          },
        },
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
        const unavailability: { startTime: string; endTime: string }[] = [];

        const appointments = await prisma.appointment.findMany({
          where: {
            barberId: barber.id,
            date: dateObj,
          },
          select: { startTime: true, endTime: true },
        });

        appointments.forEach((app) => {
          unavailability.push({
            startTime: app.startTime,
            endTime: app.endTime,
          });
        });

        const barberBreaks = await prisma.barberBreak.findMany({
          where: {
            barberId: barber.id,
            breakDate: dateObj,
          },
          select: { startTime: true, endTime: true },
        });

        barberBreaks.forEach((breakTime) => {
          unavailability.push({
            startTime: breakTime.startTime,
            endTime: breakTime.endTime,
          });
        });

        const salonBreaks = await prisma.salonBreak.findMany({
          where: {
            salonId,
            breakDate: dateObj,
          },
          select: { startTime: true, endTime: true },
        });

        salonBreaks.forEach((breakTime) => {
          unavailability.push({
            startTime: breakTime.startTime,
            endTime: breakTime.endTime,
          });
        });

        return {
          barber: {
            id: barber.id,
            imgUrl: barber.imgUrl,
            pseudo: barber.pseudo,
            instagram: barber.instagram,
            snapchat: barber.snapchat,
            price: barber.barberServices[0]?.price || 0,
            studentPrice: barber.barberServices[0]?.studentPrice || 0,
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
    res.json({ message: "Une erreur est survenue", available: false });
  }
});

export default router;
