function show(req, res) {
    res.render("pages/index");
}

function showAuth(req, res, perfil, etapa) {
    res.render("pages/autenticacao", {
        perfil,
        etapa,
        tituloPerfil: perfil === "cliente" ? "Cliente" : "Prestador",
        rotaCadastro: `/${perfil}/cadastro`,
        rotaEntrar: `/${perfil}/entrar`
    });
}

module.exports = { show, showAuth };
