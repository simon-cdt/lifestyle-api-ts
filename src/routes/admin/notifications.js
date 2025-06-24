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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = require("../../lib/prisma");
const expo_server_sdk_1 = __importDefault(require("expo-server-sdk"));
const router = (0, express_1.Router)();
const expo = new expo_server_sdk_1.default();
router.post("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userIds, title, body, userId } = req.body;
    try {
        const user = yield prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, role: true, pushToken: true },
        });
        if (!user || user.role !== "ADMIN") {
            res.status(404).json({ message: "Utilisateur non autorisé." });
            return;
        }
        const users = yield prisma_1.prisma.user.findMany({
            where: { AND: [{ id: { in: userIds } }, { pushToken: { not: null } }] },
            select: { id: true, pushToken: true },
        });
        if (!users || users.length === 0) {
            res.status(400).json({ message: "Aucun utilisateur spécifié." });
            return;
        }
        if (!title || !body) {
            res
                .status(400)
                .json({ message: "Le titre et le contenu sont obligatoires." });
            return;
        }
        let messages = [];
        for (const user of users) {
            if (!expo_server_sdk_1.default.isExpoPushToken(user.pushToken)) {
                console.error(`Le token push n'est pas valide : ${user.pushToken}`);
                continue;
            }
            messages.push({
                to: user.pushToken,
                sound: "default",
                title: title,
                body: body,
            });
        }
        // Envoyer les notifications par lots
        const chunks = expo.chunkPushNotifications(messages);
        const tickets = [];
        for (const chunk of chunks) {
            try {
                const ticketChunk = yield expo.sendPushNotificationsAsync(chunk);
                tickets.push(...ticketChunk);
            }
            catch (error) {
                console.error("Erreur lors de l'envoi des notifications :", error);
            }
        }
        res.status(200).json({
            message: "Notifications envoyées avec succès.",
            tickets,
        });
    }
    catch (error) {
        console.error("Erreur lors de l'envoi des notifications :", error);
        res.status(500).json({ message: "Erreur interne du serveur." });
        return;
    }
}));
exports.default = router;
