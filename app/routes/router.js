const express = require("express");
const router = express.Router();
const homeController = require("../controllers/homeController");

router.get("/", homeController.show);
router.get("/cliente/entrar", (req, res) => homeController.showAuth(req, res, "cliente", "entrar"));
router.get("/cliente/cadastro", (req, res) => homeController.showAuth(req, res, "cliente", "cadastro"));
router.get("/prestador/entrar", (req, res) => homeController.showAuth(req, res, "prestador", "entrar"));
router.get("/prestador/cadastro", (req, res) => homeController.showAuth(req, res, "prestador", "cadastro"));

module.exports = router;