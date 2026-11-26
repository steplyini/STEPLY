# Steply

## Executar

Instale as dependências do projeto e inicie o servidor:

```sh
npm install
node app.js
```

A homepage fica disponível em `http://localhost:3000`.

No fluxo de demonstração, entre como cliente com usuário `steply` e senha `2027`
para abrir a tela inicial. Use “Explorar agora” e “Emergência” nos atalhos para
abrir as respectivas páginas. Essas credenciais são apenas para protótipo.

## Estrutura

- `app/routes/`: rotas Express, handlers das páginas e validações de formulário.
- `app/views/`: templates EJS.
- `app/public/`: CSS, JavaScript e recursos estáticos.

A homepage de apresentação corresponde ao frame Figma `482:15`, com canvas de
360 × 4722 px. A tela inicial após entrar corresponde ao frame `520:14`; os
serviços de “Ver todos” são exibidos em um bottom sheet responsivo inspirado no
frame `849:324`. As telas “Explorar agora” e “Emergência” seguem as referências
Figma `873:1192` e `934:794`.
