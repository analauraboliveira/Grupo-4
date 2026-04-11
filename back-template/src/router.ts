import { Router } from "express";
import SolicitanteController from "./controllers/solicitanteController";
import { AtendenteController } from './controllers/AtendenteController';

const router = Router();

const solicitanteController = new SolicitanteController();
const atendenteController = new AtendenteController();

router.post('/calls', solicitanteController.newCall);
router.get('/calls/:id', solicitanteController.getCallById);
router.put('/calls/:id', solicitanteController.updateCall);
router.get('/calls', solicitanteController.getHistory);

router.get('/chamados/:id/historico', atendenteController.getHistory);
router.patch('/chamados/:id/assumir', atendenteController.assignTicket);
router.patch('/chamados/:id/status', atendenteController.updateStatus);
router.post('/chamados/:id/comentarios', atendenteController.updateComment);

export default router;
