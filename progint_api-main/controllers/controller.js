import sampleDados from "../data/sampleDados.js";

export const getAllDados = (req, res) => {
    res.json(sampleDados);
}