import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.post("/create-user", async (req: Request, res: Response) => {
  try {
    const { clientId, barberId, serviceId, date, startTime, endTime } =
      req.body;

    // vérifie si le barber n'a pas déjà un rendez-vous à cette date et heure
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        barberId,
        date: {
          gte: new Date(date),
          lte: new Date(date),
        },
        startTime: {
          gte: startTime,
          lte: endTime,
        },
      },
    });
    if (existingAppointment) {
      res.json({
        success: false,
        message: "Le barbier a déjà un rendez-vous pour ce créneau.",
      });
      return;
    }

    const newDate = new Date(date);

    await prisma.appointment.create({
      data: {
        clientId,
        barberId,
        serviceId,
        date: newDate,
        startTime,
        endTime,
      },
    });

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

router.post("/create-guest", async (req: Request, res: Response) => {
  try {
    const { name, phoneNumber, barberId, serviceId, date, startTime, endTime } =
      req.body;

    // vérifie si le barber n'a pas déjà un rendez-vous à cette date et heure
    const existingAppointment = await prisma.appointment.findFirst({
      where: {
        barberId,
        date: {
          gte: new Date(date),
          lte: new Date(date),
        },
        startTime: {
          gte: startTime,
          lte: endTime,
        },
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

    const newDate = new Date(date);

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

router.post("/getAllByUserId", async (req: Request, res: Response) => {
  try {
    const { userId } = req.body;

    const appointments = await prisma.appointment.findMany({
      where: {
        clientId: userId,
      },
      select: {
        id: true,
        date: true,
        startTime: true,
        endTime: true,
        service: {
          select: {
            type: true,
            price: true,
            studentPrice: true,
            duration: true,
          },
        },
        barber: {
          select: {
            Salon: {
              select: {
                name: true,
                city: true,
                address: true,
                imgUrl: true,
              },
            },
          },
        },
      },
    });

    res.json(appointments);
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Une erreur est survenue.",
    });
  }
});

router.post("/getDetailsById", async (req: Request, res: Response) => {
  try {
    const { appointmentId, userId } = req.body;

    const appointment = await prisma.appointment.findUnique({
      where: {
        id: appointmentId,
        clientId: userId,
      },
      select: {
        id: true,
        date: true,
        startTime: true,
        endTime: true,
        barber: {
          select: {
            Salon: {
              select: {
                name: true,
                city: true,
                address: true,
                imgUrl: true,
                phoneNumber: true,
              },
            },
          },
        },
        service: {
          select: {
            type: true,
            price: true,
            studentPrice: true,
            duration: true,
          },
        },
      },
    });

    res.json(appointment);
  } catch (error) {
    console.error(error);
    res.status(400).json({
      success: false,
      message: "Une erreur est survenue.",
    });
  }
});

router.delete("/delete", async (req: Request, res: Response) => {
  try {
    const { appointmentId, userId } = req.body;

    const appointment = await prisma.appointment.findUnique({
      where: {
        id: appointmentId,
        clientId: userId,
      },
    });

    if (!appointment) {
      res.status(404).json({
        success: false,
        message: "Rendez-vous non trouvé.",
      });
      return;
    }

    await prisma.appointment.delete({
      where: {
        id: appointmentId,
      },
    });

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
