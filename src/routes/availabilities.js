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
const date_fns_1 = require("date-fns");
const router = (0, express_1.Router)();
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { salonId, serviceId, date } = req.body;
        const dateObj = new Date(date);
        const dayOfWeek = (0, date_fns_1.format)(dateObj, "EEEE");
        // Vérifier si le salon existe
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
            var _a, _b;
            const unavailability = [];
            const appointments = yield prisma_1.prisma.appointment.findMany({
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
            const barberBreaks = yield prisma_1.prisma.barberBreak.findMany({
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
            const salonBreaks = yield prisma_1.prisma.salonBreak.findMany({
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
                    price: ((_a = barber.barberServices[0]) === null || _a === void 0 ? void 0 : _a.price) || 0,
                    studentPrice: ((_b = barber.barberServices[0]) === null || _b === void 0 ? void 0 : _b.studentPrice) || 0,
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
        res.json({ message: "Une erreur est survenue", available: false });
    }
}));
exports.default = router;
