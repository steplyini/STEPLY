const authForm = document.querySelector("[data-auth-form]");

if (authForm) {
    authForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const message = authForm.querySelector(".auth-message");
        message.textContent = "A autenticação estará disponível em breve.";
    });
}
