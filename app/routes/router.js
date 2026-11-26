const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const DEMO_CLIENT_LOGIN = "steply";
const DEMO_CLIENT_PASSWORD = "2027";

function renderAuth(req, res, perfil, etapa) {
    res.render("pages/autenticacao", {
        perfil,
        etapa,
        email: "",
        dados: {},
        errosPorCampo: {},
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
    const errosPorCampo = {};

    erros.forEach((erro) => {
        if (!errosPorCampo[erro.path]) errosPorCampo[erro.path] = erro.msg;
    });

    if (!erros.length && etapa === "entrar" && perfil === "cliente") {
        const identificacao = typeof dados.email === "string" ? dados.email.trim().toLowerCase() : "";
        const senha = typeof dados.senha === "string" ? dados.senha : "";

        if (identificacao === DEMO_CLIENT_LOGIN && senha === DEMO_CLIENT_PASSWORD) {
            return res.redirect(303, "/cliente/inicio");
        }

        return res.status(401).render("pages/autenticacao", {
            perfil,
            etapa,
            email: typeof dados.email === "string" ? dados.email.trim() : "",
            dados,
            errosPorCampo: {},
            mensagem: "Usuário ou senha incorretos.",
            erro: true,
            tituloPerfil: "Cliente",
            rotaCadastro: `/${perfil}/cadastro`,
            rotaEntrar: `/${perfil}/entrar`
        });
    }

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
        errosPorCampo,
        mensagem,
        erro: erros.length > 0,
        tituloPerfil: perfil === "prestador" ? "Prestador" : "Cliente",
        rotaCadastro: `/${perfil}/cadastro`,
        rotaEntrar: `/${perfil}/entrar`
    });
}

router.get("/", (req, res) => res.render("pages/index"));
router.get("/cliente/inicio", (req, res) => res.render("pages/cliente-home", { nomeCliente: "fulano" }));
router.get("/cliente/explorar", (req, res) => res.render("pages/cliente-explorar"));
router.get("/cliente/emergencia", (req, res) => res.render("pages/cliente-emergencia"));
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

const validarLoginCliente = [
    body("email")
        .isString().withMessage("Informe seu e-mail ou o usuário steply.").bail()
        .trim()
        .notEmpty().withMessage("Informe seu e-mail ou o usuário steply.").bail()
        .custom((value) => value.toLowerCase() === DEMO_CLIENT_LOGIN || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
        .withMessage("Informe um e-mail válido ou o usuário steply."),
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

function cpfValido(valor) {
    const cpf = String(valor || "").replace(/\D/g, "");

    if (!/^\d{11}$/.test(cpf) || /^([\d])\1{10}$/.test(cpf)) {
        return false;
    }

    let soma = 0;
    for (let indice = 0; indice < 9; indice++) {
        soma += Number(cpf[indice]) * (10 - indice);
    }

    let digito = (soma * 10) % 11;
    if (digito === 10) digito = 0;
    if (digito !== Number(cpf[9])) return false;

    soma = 0;
    for (let indice = 0; indice < 10; indice++) {
        soma += Number(cpf[indice]) * (11 - indice);
    }

    digito = (soma * 10) % 11;
    if (digito === 10) digito = 0;
    return digito === Number(cpf[10]);
}

function cnpjValido(valor) {
    const cnpj = String(valor || "").replace(/\D/g, "");
    if (!/^\d{14}$/.test(cnpj) || /^([\d])\1{13}$/.test(cnpj)) return false;

    const pesosUm = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const pesosDois = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    function calcularDigito(base, pesos) {
        const soma = base.reduce((total, digito, indice) => total + Number(digito) * pesos[indice], 0);
        const resto = soma % 11;
        return resto < 2 ? 0 : 11 - resto;
    }

    const digitoUm = calcularDigito(cnpj.slice(0, 12), pesosUm);
    if (digitoUm !== Number(cnpj[12])) return false;

    const digitoDois = calcularDigito(cnpj.slice(0, 13), pesosDois);
    return digitoDois === Number(cnpj[13]);
}

const validarCadastroCliente = [
    validarEmail,
    body("nome")
        .isString().withMessage("Informe seu nome completo.").bail()
        .trim()
        .matches(/^\S+(?:\s+\S+)+$/).withMessage("Informe seu nome completo.")
        .bail()
        .isLength({ min: 3, max: 120 }).withMessage("O nome completo deve ter entre 3 e 120 caracteres."),
    body("cpf")
        .isString().withMessage("Informe seu CPF.").bail()
        .trim()
        .custom(cpfValido).withMessage("Informe um CPF válido."),
    body("nascimento")
        .isString().withMessage("Informe sua data de nascimento.").bail()
        .custom((value) => {
            const data = dataBrasileiraValida(value);
            return data !== null;
        }).withMessage("Informe uma data de nascimento válida.").bail()
        .custom((value) => {
            const data = dataBrasileiraValida(value);
            const hoje = new Date();
            hoje.setHours(0, 0, 0, 0);
            return data <= hoje;
        }).withMessage("A data de nascimento não pode ser futura."),
    body("bairro")
        .isString().withMessage("Informe seu bairro.").bail()
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage("O bairro deve ter entre 2 e 100 caracteres."),
    body("cidade")
        .isString().withMessage("Informe sua cidade.").bail()
        .trim()
        .isLength({ min: 2, max: 100 }).withMessage("A cidade deve ter entre 2 e 100 caracteres."),
    body("cep")
        .isString().withMessage("Informe seu CEP.").bail()
        .trim()
        .matches(/^\d{5}-?\d{3}$/).withMessage("Informe um CEP válido."),
    body("telefone")
        .optional({ values: "falsy" })
        .isString().withMessage("Informe um telefone válido.").bail()
        .custom((value) => /^\d{10,11}$/.test(String(value).replace(/\D/g, "")))
        .withMessage("Informe um telefone válido com 10 ou 11 dígitos."),
    body("senha")
        .isString().withMessage("A senha deve ter pelo menos 8 caracteres.").bail()
        .isLength({ min: 8 }).withMessage("A senha deve ter pelo menos 8 caracteres."),
    body("confirmar-senha")
        .isString().withMessage("Confirme sua senha.").bail()
        .custom((value, { req }) => value === req.body?.senha)
        .withMessage("As senhas não coincidem.")
];

const validarCadastroPrestador = [
    validarEmail,
    body("nome")
        .isString().withMessage("Informe seu nome completo.").bail()
        .trim().matches(/^\S+(?:\s+\S+)+$/).withMessage("Informe seu nome completo."),
    body("nome-comercial")
        .isString().withMessage("Informe o nome comercial.").bail()
        .trim().isLength({ min: 2, max: 120 }).withMessage("O nome comercial deve ter entre 2 e 120 caracteres."),
    body("senha")
        .isString().withMessage("A senha deve ter pelo menos 8 caracteres.").bail()
        .isLength({ min: 8 }).withMessage("A senha deve ter pelo menos 8 caracteres."),
    body("confirmar-senha")
        .isString().withMessage("Confirme sua senha.").bail()
        .custom((value, { req }) => value === req.body?.senha).withMessage("As senhas não coincidem."),
    body("nascimento")
        .isString().withMessage("Informe sua data de nascimento.").bail()
        .custom((value) => dataBrasileiraValida(value) !== null)
        .withMessage("Informe uma data de nascimento válida no formato dd/mm/aaaa."),
    body("documento")
        .isString().withMessage("Informe CPF ou CNPJ.").bail()
        .trim()
        .custom((value) => {
            const numeros = value.replace(/\D/g, "");
            return numeros.length === 11 ? cpfValido(numeros) : numeros.length === 14 ? cnpjValido(numeros) : false;
        }).withMessage("Informe um CPF ou CNPJ válido."),
    body("bairro")
        .isString().withMessage("Informe seu bairro.").bail()
        .trim().isLength({ min: 2, max: 100 }).withMessage("O bairro deve ter entre 2 e 100 caracteres."),
    body("cidade")
        .isString().withMessage("Informe sua cidade.").bail()
        .trim().isLength({ min: 2, max: 100 }).withMessage("A cidade deve ter entre 2 e 100 caracteres."),
    body("cep")
        .isString().withMessage("Informe seu CEP.").bail()
        .trim().matches(/^\d{5}-?\d{3}$/).withMessage("Informe um CEP válido."),
    body("telefone")
        .optional({ values: "falsy" })
        .custom((value) => /^\d{10,11}$/.test(String(value).replace(/\D/g, "")))
        .withMessage("Informe um telefone válido com 10 ou 11 dígitos."),
    body("numero")
        .isString().withMessage("Informe o número do endereço.").bail()
        .trim().matches(/^\d{1,10}$|^S\/N$/i).withMessage("Informe um número válido."),
    body("estado")
        .isString().withMessage("Informe o estado.").bail()
        .trim().isLength({ min: 2, max: 40 }).withMessage("Informe um estado válido."),
    body("rua")
        .isString().withMessage("Informe a rua.").bail()
        .trim().isLength({ min: 2, max: 150 }).withMessage("A rua deve ter entre 2 e 150 caracteres.")
];

/* cadastro de cliente adicional: fim dos validadores */

function rotaAuth(perfil, etapa, validadores) {
    return [
        ...validadores,
        (req, res) => processAuth(req, res, perfil, etapa)
    ];
}

router.post("/cliente/entrar", rotaAuth("cliente", "entrar", validarLoginCliente));
router.post("/cliente/cadastro", rotaAuth("cliente", "cadastro", validarCadastroCliente));
router.post("/prestador/entrar", rotaAuth("prestador", "entrar", validarLogin));
router.post("/prestador/cadastro", rotaAuth("prestador", "cadastro", validarCadastroPrestador));

function dataBrasileiraValida(valor) {
    const texto = String(valor || "").trim();
    const digitos = texto.replace(/\D/g, "");

    let dia;
    let mes;
    let ano;

    if (/^\d{2}\/\d{2}\/\d{4}$/.test(texto)) {
        const partes = texto.split("/");
        dia = Number(partes[0]);
        mes = Number(partes[1]);
        ano = Number(partes[2]);
    } else if (/^\d{8}$/.test(digitos)) {
        dia = Number(digitos.slice(0, 2));
        mes = Number(digitos.slice(2, 4));
        ano = Number(digitos.slice(4, 8));
    } else {
        return null;
    }

    if (ano < 1900 || ano > new Date().getFullYear()) return null;
    if (mes < 1 || mes > 12) return null;

    const diasNoMes = new Date(ano, mes, 0).getDate();
    if (dia < 1 || dia > diasNoMes) return null;

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const data = new Date(ano, mes - 1, dia);
    data.setHours(0, 0, 0, 0);

    return data <= hoje ? data : null;
}

module.exports = router;