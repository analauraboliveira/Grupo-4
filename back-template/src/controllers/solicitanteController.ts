
import { Handler } from "express";
import { prisma } from "../../lib/prisma";

export default class SolicitanteController {
    newCall: Handler = async (req, res) => {
        const { title, description, type, category, priority, impact, urgency, prazo_desejado, data_abertura, hora_abertura, observacao_legado } = req.body;
        const { userId } = req.params;
        try {
            const novoChamado = await prisma.chamados.create({
                data: {
                    titulo: title,
                    descricao: description,
                    tipo: type,
                    categoria: category,
                    prioridade: priority,
                    impacto: impact,
                    urgencia: urgency,
                    prazo_desejado: prazo_desejado,
                    data_abertura: data_abertura,
                    hora_abertura: hora_abertura,
                    observacao_legado: observacao_legado,
                    solicitante_id: Number(userId),
                    atendente_id: null,
                    status: "aberto",
                    criado_em: new Date(),
                    ultima_atualizacao: new Date(),
                },

            });
            return res.json(novoChamado);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
    getCallById: Handler = async (req, res) => {
        const { userId } = req.params;
        const { id } = req.params;
        try {
            if (typeof id !== "string") {
                return res.status(400).json({ message: "Invalid id" });
            }
            const call = await prisma.chamados.findUnique({
                where: {
                    id: id,
                    solicitante_id: Number(userId),
                },
            });
            return res.json(call);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
    updateCall: Handler = async (req, res) => {
        const { id } = req.params;
        const { userId } = req.params;
        try {
            if (typeof id !== "string") {
                return res.status(400).json({ message: "Invalid id" });
            }
            const call = await prisma.chamados.update({
                where: {
                    id: id,
                    solicitante_id: Number(userId),
                },
                data: req.body,
            });
            return res.json(call);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }
    getHistory: Handler = async (req, res) => {
        const { userId } = req.params;
        try {
            const history = await prisma.chamados.findMany({
                where: {
                    solicitante_id: Number(userId),
                },
                select: {
                    id: true,
                    titulo: true,
                    descricao: true,
                    tipo: true,
                    categoria: true,
                    prioridade: true,
                    impacto: true,
                    urgencia: true,
                    prazo_desejado: true,
                    data_abertura: true,
                    hora_abertura: true,
                    observacao_legado: true,
                    solicitante_id: true,
                    atendente_id: true,
                    status: true,
                    criado_em: true,
                    ultima_atualizacao: true,
                }
            })
            return res.json(history);
        } catch (error) {
            console.error(error);
            return res.status(500).json({ message: "Internal server error" });
        }
    }





}
