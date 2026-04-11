import { Router } from "express";
import SolicitanteController from "./controllers/solicitanteController";
const router = Router();

const solicitanteController = new SolicitanteController();

router.post('/calls/:userId', solicitanteController.newCall);
router.get('/calls/:userId/:id', solicitanteController.getCallById);
router.put('/calls/:userId/:id', solicitanteController.updateCall);
router.get('/calls/:userId', solicitanteController.getHistory);

export default router;
