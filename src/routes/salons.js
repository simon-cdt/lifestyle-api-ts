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
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { serviceId } = req.body;
        const salons = yield prisma_1.prisma.salon.findMany({
            where: {
                barbers: {
                    some: {
                        barberServices: {
                            some: {
                                serviceId: serviceId,
                            },
                        },
                    },
                },
            },
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
exports.default = router;
