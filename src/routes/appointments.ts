import { Router, Request, Response } from "express";
import { prisma } from "../lib/prisma";

const router = Router();

router.post("/create-user", async (req: Request, res: Response) => {
  try {
    const { clientId, barberId, serviceId, date, startTime, endTime } =
      req.body;

    const newDate = date + "T00:00:00Z";

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

    const client = await prisma.user.findUnique({
      where: {
        id: clientId,
      },
      select: {
        id: true,
        isBlackListed: true,
      },
    });

    if (client?.isBlackListed) {
      res.status(403).json({
        success: false,
        message: "Votre compte est bloqué.",
      });
      return;
    }

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
            id: true,
            type: true,
            duration: true,
            image: true,
          },
        },
        barber: {
          select: {
            id: true,
            pseudo: true,
            imgUrl: true,
            salon: {
              select: {
                id: true,
                name: true,
                city: true,
                address: true,
                imgUrl: true,
                phoneNumber: true,
              },
            },
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
      orderBy: {
        date: "desc",
      },
    });

    const formattedAppointments = appointments.map((appointment) => {
      const service = appointment.service;
      const barberService = appointment.barber.barberServices.find(
        (bs) => bs.serviceId === service.id
      );
      return {
        id: appointment.id,
        date: appointment.date,
        startTime: appointment.startTime,
        endTime: appointment.endTime,
        serviceId: appointment.service.id,
        serviceType: appointment.service.type,
        serviceDuration: appointment.service.duration,
        serviceImgUrl: appointment.service.image,
        barberId: appointment.barber.id,
        barberPseudo: appointment.barber.pseudo,
        barberImgUrl: appointment.barber.imgUrl,
        salonId: appointment.barber.salon.id,
        salonName: appointment.barber.salon.name,
        salonCity: appointment.barber.salon.city,
        salonAddress: appointment.barber.salon.address,
        salonImgUrl: appointment.barber.salon.imgUrl,
        salonPhoneNumber: appointment.barber.salon.phoneNumber,
        price: barberService?.price || 0,
        studentPrice: barberService?.studentPrice || 0,
      };
    });

    res.json(formattedAppointments);
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
            pseudo: true,
            salon: {
              select: {
                name: true,
                city: true,
                address: true,
                imgUrl: true,
                phoneNumber: true,
              },
            },
            barberServices: {
              select: {
                serviceId: true,
                price: true,
                studentPrice: true,
              },
            },
          },
        },
        service: {
          select: {
            id: true,
            type: true,
            duration: true,
          },
        },
      },
    });

    if (appointment) {
      const serviceId = appointment.service.id;
      const barberService = appointment.barber.barberServices.find(
        (bs) => bs.serviceId === serviceId
      );
      (appointment as any).price = barberService?.price || 0;
      (appointment as any).studentPrice = barberService?.studentPrice || 0;
      // Optionally, remove the full barberServices array to avoid confusion
      delete (appointment as any).barber.barberServices;
    }

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
