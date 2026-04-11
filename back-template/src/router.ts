import { Router } from "express";
import SolicitanteController from "./controllers/solicitanteController";
const router = Router();

const solicitanteController = new SolicitanteController();

router.post('/calls', solicitanteController.newCall);
router.get('/calls/:id', solicitanteController.getCallById);
router.put('/calls/:id', solicitanteController.updateCall);
router.get('/calls', solicitanteController.getHistory);

export default router;
