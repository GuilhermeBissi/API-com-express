import { Router } from "express";
import { getAllDados } from "../controllers/controller.js";

const rota = Router();


rota.get('/get', getAllDados);

export default rota;