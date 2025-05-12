import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { format } from "date-fns";

const router = Router();
const prisma = new PrismaClient();

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

router.get("/:date/:idSalon", async (req: Request, res: Response) => {
  try {
    const salonId = req.params.idSalon;
    const date = req.params.date;

    const dateObj = new Date(date);
    const dayOfWeek = format(dateObj, "EEEE");

    // Vérifier si le salon existe
    const salon = (await prisma.salon.findUnique({
      where: { id: salonId },
    })) as (typeof prisma.salon extends {
      findUnique: (args: any) => Promise<infer T>;
    }
      ? T
      : never) & {
      [key: string]: any;
    };
    if (!salon) {
      res.json({ message: "Le salon n'existe pas", available: false });
      return;
    }

    // Vérifier si le salon est fermé à cette date
    const closures = await prisma.salonClosures.findMany({
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

    const isOpenKey = `isOpen${dayOfWeek}` as keyof typeof salon;
    if (!salon[isOpenKey]) {
      res.json({ message: "Le salon est fermé ce jour-là", available: false });
      return;
    }

    // Récupérer les horaires d'ouverture et de fermeture
    const workingFieldSalon = getWorkingField(dayOfWeek, true);
    const openingTime = salon[`${workingFieldSalon}OpeningTime`];
    const closingTime = salon[`${workingFieldSalon}ClosingTime`];

    if (!openingTime || !closingTime) {
      res.json({
        message: "Le salon n'est pas ouvert ce jour-là",
        available: false,
      });
      return;
    }

    const workingFieldBarber = getWorkingField(dayOfWeek, false);
    // Filtrer les barbiers qui travaillent ce jour-là
    const barbers = await prisma.barber.findMany({
      where: {
        salonId,
        [workingFieldBarber]: true,
      },
    });

    if (barbers.length === 0) {
      res.json({
        message: "Aucun barbier ne travaille ce jour-là",
        available: false,
      });
      return;
    }

    // Vérifier les absences des barbiers
    const absentBarbers = await prisma.barberAbsences.findMany({
      where: {
        startDate: { lte: dateObj },
        endDate: { gte: dateObj },
        barberId: { in: barbers.map((b) => b.id) },
      },
      select: { barberId: true },
    });
    const absentBarberIds = absentBarbers.map((a) => a.barberId);

    // Filtrer les barbiers disponibles (pas absents)
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

    // Récupérer les indisponibilités (rendez-vous, pauses des barbers et du salon)
    const barberAvailabilities: BarberAvailability[] = await Promise.all(
      availableBarbers.map(async (barber) => {
        const unavailability: { startTime: string; endTime: string }[] = [];

        // Récupérer les rendez-vous
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

        // Récupérer les pauses du barbier
        const barberBreaks = await prisma.barberBreaks.findMany({
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

        // Récupérer les pauses du salon
        const salonBreaks = await prisma.salonBreaks.findMany({
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
          },
          unavailability,
        };
      })
    );

    res.json({
      available: true,
      openingTime,
      closingTime,
      barbers: barberAvailabilities,
    });
  } catch (error) {
    console.error(error);
    res.json({ message: "Une erreur est survenue", available: false });
  }
});

const getWorkingField = (dayOfWeek: string, salon: boolean): string => {
  const daysMap: { [key: string]: string } = {
    Monday: salon ? "monday" : "isWorkingMonday",
    Tuesday: salon ? "tuesday" : "isWorkingTuesday",
    Wednesday: salon ? "wednesday" : "isWorkingWednesday",
    Thursday: salon ? "thursday" : "isWorkingThursday",
    Friday: salon ? "friday" : "isWorkingFriday",
    Saturday: salon ? "saturday" : "isWorkingSaturday",
    Sunday: salon ? "sunday" : "isWorkingSunday",
  };
  return daysMap[dayOfWeek] || "";
};

export default router;
