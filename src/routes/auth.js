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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../lib/prisma");
const bcrypt_1 = require("bcrypt");
const router = (0, express_1.Router)();
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, expoPushToken } = req.body;
        const existingUser = yield prisma_1.prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phoneNumber: true,
                password: true,
                isBlackListed: true,
                role: true,
                pushToken: true,
            },
        });
        if (!existingUser) {
            res.json({
                success: false,
                message: "L'utilisateur n'existe pas.",
            });
            return;
        }
        if (!(yield (0, bcrypt_1.compare)(password, existingUser.password))) {
            res.json({
                success: false,
                message: "Le mot de passe est incorrect.",
            });
            return;
        }
        if (expoPushToken) {
            yield prisma_1.prisma.user.update({
                where: { id: existingUser.id },
                data: { pushToken: expoPushToken },
            });
        }
        const { password: _removed } = existingUser, rest = __rest(existingUser, ["password"]);
        res.json({
            success: true,
            message: "La connexion a réussie.",
            user: rest,
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
router.post("/register", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, firstName, lastName, password, phoneNumber, expoPushToken } = req.body;
        const existingUser = yield prisma_1.prisma.user.findFirst({
            where: {
                OR: [
                    {
                        email: email,
                    },
                    {
                        phoneNumber: phoneNumber,
                    },
                ],
            },
        });
        if (existingUser) {
            res.status(400).json({
                success: false,
                message: "L'e-mail ou le numéro de téléphone est déjà utilisé.",
            });
            return;
        }
        const hashedPassword = yield (0, bcrypt_1.hash)(password, 10);
        const user = yield prisma_1.prisma.user.create({
            data: {
                email,
                firstName,
                lastName,
                password: hashedPassword,
                phoneNumber,
                pushToken: expoPushToken,
            },
            select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phoneNumber: true,
                isBlackListed: true,
                role: true,
                pushToken: true,
            },
        });
        res.status(201).json({
            success: true,
            message: "La création du compte a réussi.",
            user,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Une erreur est survenue.",
        });
    }
}));
router.put("/update", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, firstName, lastName, email, phoneNumber } = req.body;
        const user = yield prisma_1.prisma.user.findUnique({
            where: {
                id,
            },
            select: {
                id: true,
            },
        });
        if (!user || user.id !== id) {
            res.status(403).json({
                success: false,
                message: "Vous n'êtes pas autorisé à faire cette action.",
            });
            return;
        }
        const mailExists = yield prisma_1.prisma.user.findFirst({
            where: {
                email,
            },
            select: {
                id: true,
            },
        });
        if (mailExists && mailExists.id !== id) {
            res.status(400).json({
                success: false,
                message: "L'e-mail est déjà utilisé.",
            });
            return;
        }
        const phoneExists = yield prisma_1.prisma.user.findFirst({
            where: {
                phoneNumber,
            },
            select: {
                id: true,
            },
        });
        if (phoneExists && phoneExists.id !== id) {
            res.status(400).json({
                success: false,
                message: "Le numéro de téléphone est déjà utilisé.",
            });
            return;
        }
        const userUpdate = yield prisma_1.prisma.user.update({
            where: {
                id,
            },
            data: {
                firstName,
                lastName,
                phoneNumber,
                email,
            },
            select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                phoneNumber: true,
                isBlackListed: true,
                role: true,
                pushToken: true,
            },
        });
        res.status(200).json({
            success: true,
            message: "L'utilisateur a bien été modifié.",
            user: userUpdate,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Une erreur est survenue.",
        });
    }
}));
router.put("/update-password", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, currentPassword, newPassword } = req.body;
        const user = yield prisma_1.prisma.user.findUnique({
            where: {
                id,
            },
            select: {
                password: true,
            },
        });
        if (!user) {
            res.status(403).json({
                success: false,
                message: "Vous n'êtes pas autorisé à faire cette action.",
            });
            return;
        }
        if (!(yield (0, bcrypt_1.compare)(currentPassword, user === null || user === void 0 ? void 0 : user.password))) {
            res.status(403).json({
                success: false,
                message: "Le mot de passe actuel est incorrect.",
            });
            return;
        }
        const hashedPassword = yield (0, bcrypt_1.hash)(newPassword, 10);
        yield prisma_1.prisma.user.update({
            where: {
                id,
            },
            data: {
                password: hashedPassword,
            },
        });
        res.status(200).json({
            success: true,
            message: "Le mot de passe a bien été modifié.",
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Une erreur est survenue.",
        });
    }
}));
router.delete("/delete", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id, password } = req.body;
        const user = yield prisma_1.prisma.user.findUnique({
            where: {
                id,
            },
            select: {
                id: true,
                password: true,
            },
        });
        if (!user || !(yield (0, bcrypt_1.compare)(password, user === null || user === void 0 ? void 0 : user.password))) {
            res.status(403).json({
                success: false,
                message: "Le mot de passe est incorrect.",
            });
            return;
        }
        yield prisma_1.prisma.user.delete({
            where: {
                id,
            },
        });
        res.status(200).json({
            success: true,
            message: "L'utilisateur a bien été supprimé.",
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Une erreur est survenue.",
        });
    }
}));
exports.default = router;
