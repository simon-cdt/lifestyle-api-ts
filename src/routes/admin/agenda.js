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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../../lib/prisma");
const date_fns_1 = require("date-fns");
const expo_server_sdk_1 = __importDefault(require("expo-server-sdk"));
const locale_1 = require("date-fns/locale");
const router = (0, express_1.Router)();
const expo = new expo_server_sdk_1.default();
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { salonId, date, userId } = req.body;
        const user = yield prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                role: true,
            },
        });
        if (!user || user.role === "CLIENT") {
            res.status(403).json({
                success: false,
                message: "Accès refusé. Seul un administrateur peut accéder à cette ressource.",
            });
            return;
        }
        const dateObj = new Date(date);
        const dayOfWeek = (0, date_fns_1.format)(dateObj, "EEEE");
        const salon = yield prisma_1.prisma.salon.findUnique({
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
        const closures = yield prisma_1.prisma.salonClosure.findMany({
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
        const salonOpenDay = yield prisma_1.prisma.salonDay.findFirst({
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
        if (!(salonOpenDay === null || salonOpenDay === void 0 ? void 0 : salonOpenDay.isOpen)) {
            res.json({
                message: "Le salon n'est pas ouvert ce jour-là",
                available: false,
            });
            return;
        }
        const barbers = yield prisma_1.prisma.barber.findMany({
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
        const absentBarbers = yield prisma_1.prisma.barberAbsence.findMany({
            where: {
                startDate: { lte: dateObj },
                endDate: { gte: dateObj },
                barberId: { in: barbers.map((b) => b.id) },
            },
            select: { barberId: true },
        });
        const absentBarberIds = absentBarbers.map((a) => a.barberId);
        const availableBarbers = barbers.filter((b) => !absentBarberIds.includes(b.id));
        if (availableBarbers.length === 0) {
            res.json({
                message: "Tous les barbers sont absents ce jour-là",
                available: false,
            });
            return;
        }
        const barberAvailabilities = yield Promise.all(availableBarbers.map((barber) => __awaiter(void 0, void 0, void 0, function* () {
            const unavailability = [];
            const appointments = yield prisma_1.prisma.appointment.findMany({
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
                },
            });
            appointments.forEach((app) => {
                var _a;
                unavailability.push({
                    startTime: app.startTime,
                    endTime: app.endTime,
                    appointment: true,
                    id: app.id,
                    clientName: app.client ? app.client.firstName : (_a = app.guest) === null || _a === void 0 ? void 0 : _a.name,
                    serviceType: app.service.type,
                });
            });
            const barberBreaks = yield prisma_1.prisma.barberBreak.findMany({
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
            const salonBreaks = yield prisma_1.prisma.salonBreak.findMany({
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
        })));
        res.json({
            available: true,
            openingTime: salon.salonDays[0].openingTime,
            closingTime: salon.salonDays[0].closingTime,
            barbers: barberAvailabilities,
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
router.get("/salons", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const salons = yield prisma_1.prisma.salon.findMany({
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
    }
    catch (error) {
        console.error(error);
        res.status(400).json({
            success: false,
            message: "Une erreur est survenue.",
        });
    }
}));
router.post("/info", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    try {
        const { appointment, id, userId } = req.body;
        const user = yield prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                role: true,
            },
        });
        if (!user || user.role === "CLIENT") {
            res.status(403).json({
                success: false,
                message: "Accès refusé. Seul un administrateur peut accéder à cette ressource.",
            });
            return;
        }
        let appointmentDetail = null;
        if (appointment) {
            appointmentDetail = yield prisma_1.prisma.appointment.findUnique({
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
                const barberService = appointmentDetail.barber.barberServices.find((bs) => {
                    return bs.serviceId === serviceIdd;
                });
                appointmentDetail = Object.assign(Object.assign({}, appointmentDetail), { price: (barberService === null || barberService === void 0 ? void 0 : barberService.price) || 0, studentPrice: (barberService === null || barberService === void 0 ? void 0 : barberService.studentPrice) || 0, appointment: true, client: {
                        name: appointmentDetail.client
                            ? `${appointmentDetail.client.firstName} ${appointmentDetail.client.lastName}`.trim()
                            : (_a = appointmentDetail.guest) === null || _a === void 0 ? void 0 : _a.name,
                        email: (_b = appointmentDetail.client) === null || _b === void 0 ? void 0 : _b.email,
                        phoneNumber: ((_c = appointmentDetail.client) === null || _c === void 0 ? void 0 : _c.phoneNumber) ||
                            ((_d = appointmentDetail.guest) === null || _d === void 0 ? void 0 : _d.phoneNumber),
                    } });
                const { barber, serviceId, guest } = appointmentDetail, rest = __rest(appointmentDetail, ["barber", "serviceId", "guest"]);
                appointmentDetail = rest;
            }
        }
        else {
            appointmentDetail = yield prisma_1.prisma.barberBreak.findUnique({
                where: { id },
                select: {
                    id: true,
                    startTime: true,
                    endTime: true,
                },
            });
            if (appointmentDetail) {
                appointmentDetail = Object.assign(Object.assign({}, appointmentDetail), { appointment: false });
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
    }
    catch (error) {
        console.error(error);
        res.status(400).json({
            success: false,
            message: "Une erreur est survenue.",
        });
    }
}));
router.post("/barberServices", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { barberId, userId } = req.body;
        const user = yield prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                role: true,
            },
        });
        if (!user || user.role === "CLIENT") {
            res.status(403).json({
                success: false,
                message: "Accès refusé. Seul un administrateur peut accéder à cette ressource.",
            });
            return;
        }
        const barberServices = yield prisma_1.prisma.service.findMany({
            where: {
                barberService: {
                    some: {
                        barberId,
                    },
                },
            },
            select: {
                id: true,
                type: true,
                duration: true,
            },
        });
        if (barberServices.length === 0) {
            res.json({
                success: false,
                message: "Aucun service disponible pour ce barbier.",
            });
            return;
        }
        res.json({ services: barberServices, success: true });
    }
    catch (error) {
        console.error(error);
        res.status(400).json({
            success: false,
            message: "Une erreur est survenue.",
        });
    }
}));
router.post("/create-guest", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, phoneNumber, barberId, serviceId, date, startTime, endTime, userId, } = req.body;
        const newDate = date + "T00:00:00Z";
        const user = yield prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                role: true,
            },
        });
        if (!user || user.role === "CLIENT") {
            res.status(403).json({
                success: false,
                message: "Accès refusé. Seul un administrateur peut accéder à cette ressource.",
            });
            return;
        }
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
        const newGuest = yield prisma_1.prisma.guest.create({
            data: {
                name,
                phoneNumber,
            },
            select: {
                id: true,
            },
        });
        yield prisma_1.prisma.appointment.create({
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
    }
    catch (error) {
        console.error(error);
        res.status(400).json({
            success: false,
            message: "Une erreur est survenue.",
        });
    }
}));
router.post("/create-break", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { barberId, date, startTime, endTime, userId } = req.body;
        const newDate = date + "T00:00:00Z";
        const user = yield prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                role: true,
            },
        });
        if (!user || user.role === "CLIENT") {
            res.status(403).json({
                success: false,
                message: "Accès refusé. Seul un administrateur peut accéder à cette ressource.",
            });
            return;
        }
        yield prisma_1.prisma.barberBreak.create({
            data: {
                barberId,
                breakDate: newDate,
                startTime,
                endTime,
            },
        });
        res.json({
            success: true,
            message: "La pause a été créée avec succès.",
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
router.delete("/delete-break", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, userId } = req.body;
        const user = yield prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                role: true,
            },
        });
        if (!user || user.role === "CLIENT") {
            res.status(403).json({
                success: false,
                message: "Accès refusé. Seul un administrateur peut accéder à cette ressource.",
            });
            return;
        }
        const breakToDelete = yield prisma_1.prisma.barberBreak.findUnique({
            where: { id },
        });
        if (!breakToDelete) {
            res.status(404).json({
                success: false,
                message: "Pause introuvable.",
            });
            return;
        }
        yield prisma_1.prisma.barberBreak.delete({
            where: { id },
        });
        res.json({
            success: true,
            message: "La pause a été supprimée avec succès.",
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
router.delete("/delete-appointment", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const { id, userId } = req.body;
        const user = yield prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                role: true,
            },
        });
        if (!user || user.role === "CLIENT") {
            res.status(403).json({
                success: false,
                message: "Accès refusé. Seul un administrateur peut accéder à cette ressource.",
            });
            return;
        }
        const appointmentToDelete = yield prisma_1.prisma.appointment.findUnique({
            where: { id },
            select: {
                date: true,
                startTime: true,
                endTime: true,
                client: {
                    select: {
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
        yield prisma_1.prisma.appointment.delete({
            where: { id },
        });
        if ((_a = appointmentToDelete.client) === null || _a === void 0 ? void 0 : _a.pushToken) {
            const notification = {
                to: appointmentToDelete.client.pushToken,
                sound: "default",
                title: "Rendez-vous annulé",
                body: `Bonjour ${appointmentToDelete.client.firstName}, votre rendez-vous prévu le ${(0, date_fns_1.format)(appointmentToDelete.date, "PPPP", { locale: locale_1.fr })} entre ${appointmentToDelete.startTime} et ${appointmentToDelete.endTime} a été annulé.`,
            };
            yield expo.sendPushNotificationsAsync([notification]);
        }
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
