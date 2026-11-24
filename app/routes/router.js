const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");

function renderAuth(req, res, perfil, etapa) {
    res.render("pages/autenticacao", {
        perfil,
        etapa,
        email: "",
        dados: {},
        mensagem: "",
        erro: false,
        tituloPerfil: perfil === "cliente" ? "Cliente" : "Prestador",
        rotaCadastro: `/${perfil}/cadastro`,
        rotaEntrar: `/${perfil}/entrar`
    });
}

function processAuth(req, res, perfil, etapa) {
    const dados = req.body || {};
    const erros = validationResult(req).array();
    const mensagem = erros.length
        ? erros.map((erro) => erro.msg).join(" ")
        : etapa === "entrar"
            ? "A autenticação estará disponível em breve."
            : "O cadastro estará disponível em breve.";

    res.status(erros.length ? 422 : 200).render("pages/autenticacao", {
        perfil,
        etapa,
        email: typeof dados.email === "string" ? dados.email.trim() : "",
        dados,
        mensagem,
        erro: erros.length > 0,
        tituloPerfil: perfil === "prestador" ? "Prestador" : "Cliente",
        rotaCadastro: `/${perfil}/cadastro`,
        rotaEntrar: `/${perfil}/entrar`
    });
}

router.get("/", (req, res) => res.render("pages/index"));
router.get("/cliente/entrar", (req, res) => renderAuth(req, res, "cliente", "entrar"));
router.get("/cliente/cadastro", (req, res) => renderAuth(req, res, "cliente", "cadastro"));
router.get("/prestador/entrar", (req, res) => renderAuth(req, res, "prestador", "entrar"));
router.get("/prestador/cadastro", (req, res) => renderAuth(req, res, "prestador", "cadastro"));

const validarEmail = body("email")
    .isString().withMessage("Informe um e-mail válido.").bail()
    .trim()
    .notEmpty().withMessage("Informe seu e-mail.").bail()
    .isEmail().withMessage("Informe um e-mail válido.");

const validarSenha = body("senha")
    .isString().withMessage("Informe sua senha.").bail()
    .notEmpty().withMessage("Informe sua senha.");

const validarLogin = [
    validarEmail,
    validarSenha
];

const validarCadastro = [
    validarEmail,
    body("senha")
        .isString().withMessage("A senha deve ter pelo menos 8 caracteres.").bail()
        .isLength({ min: 8 }).withMessage("A senha deve ter pelo menos 8 caracteres."),
    body("confirmar-senha")
        .isString().withMessage("Confirme sua senha.").bail()
        .custom((value, { req }) => value === req.body?.senha)
        .withMessage("As senhas não coincidem.")
];

function rotaAuth(perfil, etapa, validadores) {
    return [
        ...validadores,
        (req, res) => processAuth(req, res, perfil, etapa)
    ];
}

router.post("/cliente/entrar", rotaAuth("cliente", "entrar", validarLogin));
router.post("/cliente/cadastro", rotaAuth("cliente", "cadastro", validarCadastro));
router.post("/prestador/entrar", rotaAuth("prestador", "entrar", validarLogin));
router.post("/prestador/cadastro", rotaAuth("prestador", "cadastro", validarCadastro));

module.exports = router;