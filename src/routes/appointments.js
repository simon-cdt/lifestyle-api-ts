"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const router = (0, express_1.Router)();
router.post("/create-user", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { clientId, barberId, serviceId, date, startTime, endTime } = req.body;
        const newDate = date + "T00:00:00Z";
        // vérifie si le barber n'a pas déjà un rendez-vous à cette date et heure
        const existingAppointment = yield prisma_1.prisma.appointment.findFirst({
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
        const client = yield prisma_1.prisma.user.findUnique({
            where: {
                id: clientId,
            },
            select: {
                id: true,
                isBlackListed: true,
            },
        });
        if (client === null || client === void 0 ? void 0 : client.isBlackListed) {
            res.status(403).json({
                success: false,
                message: "Votre compte est bloqué.",
            });
            return;
        }
        yield prisma_1.prisma.appointment.create({
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
    }
    catch (error) {
        console.error(error);
        res.status(400).json({
            success: false,
            message: "Une erreur est survenue.",
        });
    }
}));
router.post("/getAllByUserId", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { userId } = req.body;
        const appointments = yield prisma_1.prisma.appointment.findMany({
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
            const barberService = appointment.barber.barberServices.find((bs) => bs.serviceId === service.id);
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
                price: (barberService === null || barberService === void 0 ? void 0 : barberService.price) || 0,
                studentPrice: (barberService === null || barberService === void 0 ? void 0 : barberService.studentPrice) || 0,
            };
        });
        res.json(formattedAppointments);
    }
    catch (error) {
        console.error(error);
        res.status(400).json({
            success: false,
            message: "Une erreur est survenue.",
        });
    }
}));
router.post("/getDetailsById", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { appointmentId, userId } = req.body;
        const appointment = yield prisma_1.prisma.appointment.findUnique({
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
            const barberService = appointment.barber.barberServices.find((bs) => bs.serviceId === serviceId);
            appointment.price = (barberService === null || barberService === void 0 ? void 0 : barberService.price) || 0;
            appointment.studentPrice = (barberService === null || barberService === void 0 ? void 0 : barberService.studentPrice) || 0;
            // Optionally, remove the full barberServices array to avoid confusion
            delete appointment.barber.barberServices;
        }
        res.json(appointment);
    }
    catch (error) {
        console.error(error);
        res.status(400).json({
            success: false,
            message: "Une erreur est survenue.",
        });
    }
}));
router.delete("/delete", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { appointmentId, userId } = req.body;
        const appointment = yield prisma_1.prisma.appointment.findUnique({
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
        yield prisma_1.prisma.appointment.delete({
            where: {
                id: appointmentId,
            },
        });
        res.json({
            success: true,
            message: "Le rendez-vous a été supprimé avec succès.",
        });
    }
    catch (error) {
        console.error(error);
        res.status(400).json({
            success: false,
            message: "Une erreur est survenue.",
        });
    }
}));
exports.default = router;
