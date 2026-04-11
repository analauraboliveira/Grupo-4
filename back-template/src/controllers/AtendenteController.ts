import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class AtendenteController {

    async visualizarHistorico(req: Request, res: Response) {
        const { id } = req.params;

        try {
            const historico = await prisma.chamados.findUnique({
                where: { id },
                include: {
                    atendente: {
                        select: { nome: true, email: true, departamento: true }
                    },
                    comentarios: {
                        include: { autor: { select: { nome: true, perfil: true } } },
                        orderBy: { criado_em: 'desc' }
                    },
                    historico_status: {
                        include: { usuario: { select: { nome: true, perfil: true } } },
                        orderBy: { alterado_em: 'desc' }
                    }
                }
            });

            if (!historico) {
                return res.status(404).json({ error: 'Chamado não encontrado.' });
            }

            return res.json(historico);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao buscar histórico.' });
        }
    }

    async assumirChamado(req: Request, res: Response) {
        const { id } = req.params;
        const { atendente_id } = req.body;

        try {
            const chamadoAtualizado = await prisma.chamados.update({
                where: { id },
                data: {
                    atendente_id: Number(atendente_id),
                    status: 'Em Atendimento'
                }
            });

            return res.json({ message: 'Chamado assumido com sucesso!', chamadoAtualizado });
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao assumir chamado.' });
        }
    }

    async atualizarStatusChamado(req: Request, res: Response) {
        const { id } = req.params;
        const { status_novo, alterado_por, observacao } = req.body;

        try {
            const resultado = await prisma.$transaction(async (tx) => {
                const chamadoAtual = await tx.chamados.findUnique({ where: { id } });

                if (!chamadoAtual) throw new Error('Chamado não encontrado.');

                // Atualiza o chamado principal
                const chamado = await tx.chamados.update({
                    where: { id },
                    data: { status: status_novo }
                });

                // Registra o histórico
                await tx.historico_status.create({
                    data: {
                        chamado_id: id,
                        status_anterior: chamadoAtual.status,
                        status_novo,
                        alterado_por: Number(alterado_por),
                        observacao,
                        alterado_em: new Date()
                    }
                });

                return chamado;
            });

            return res.json({ message: 'Status atualizado com sucesso.', resultado });
        } catch (error: any) {
            return res.status(400).json({ error: error.message || 'Erro ao atualizar status.' });
        }
    }

    async adicionarComentario(req: Request, res: Response) {
        const { id } = req.params;
        const { autor_id, mensagem, tipo } = req.body;

        try {
            const novoComentario = await prisma.comentarios.create({
                data: {
                    chamado_id: id,
                    autor_id: Number(autor_id),
                    mensagem,
                    tipo,
                    criado_em: new Date()
                }
            });

            return res.status(201).json(novoComentario);
        } catch (error) {
            return res.status(500).json({ error: 'Erro ao adicionar comentário.' });
        }
    }
}
