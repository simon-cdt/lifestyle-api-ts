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
router.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const services = yield prisma_1.prisma.service.findMany({
            select: {
                id: true,
                type: true,
                duration: true,
                image: true,
                barberService: {
                    select: {
                        studentPrice: true,
                    },
                },
            },
            where: {
                show: true,
            },
        });
        const formattedServices = services.map((service) => ({
            id: service.id,
            type: service.type,
            duration: service.duration,
            image: service.image,
            price: Array.isArray(service.barberService) && service.barberService.length > 0
                ? Math.min(...service.barberService.map((bs) => bs.studentPrice))
                : null,
        }));
        if (formattedServices.length === 0) {
            res.json({
                success: false,
                message: "Aucun service disponible.",
            });
            return;
        }
        res.json(formattedServices);
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
