import { Router } from "express";
import SolicitanteController from "./controllers/solicitanteController";
import { AtendenteController } from './controllers/AtendenteController';

const router = Router();

const solicitanteController = new SolicitanteController();
const atendenteController = new AtendenteController();

router.post('/calls/:userId', solicitanteController.newCall);
router.get('/calls/:userId/:id', solicitanteController.getCallById);
router.put('/calls/:userId/:id', solicitanteController.updateCall);
router.get('/calls/:userId', solicitanteController.getHistory);

router.get('/chamados/:id/historico', atendenteController.getHistory);
router.patch('/chamados/:id/assumir', atendenteController.assignTicket);
router.patch('/chamados/:id/status', atendenteController.updateStatus);
router.post('/chamados/:id/comentarios', atendenteController.updateComment);

export default router;
