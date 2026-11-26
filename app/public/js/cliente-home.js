const carousel = document.querySelector(".service-carousel");
const servicesSheet = document.querySelector(".services-sheet");
const emergencySheet = document.querySelector(".emergency-sheet");

const openSheet = (sheet) => {
    if (sheet && !sheet.open) sheet.showModal();
};

const closeSheet = (sheet) => {
    if (sheet?.open) sheet.close();
};

if (carousel) {
    const windowElement = carousel.querySelector(".service-carousel__window");
    const firstCard = carousel.querySelector(".service-card");
    const cardGap = Number.parseFloat(getComputedStyle(windowElement).columnGap) || 14;
    const getStep = () => firstCard.getBoundingClientRect().width + cardGap;

    carousel.querySelector("[data-carousel-previous]").addEventListener("click", () => {
        windowElement.scrollBy({ left: -getStep(), behavior: "smooth" });
    });

    carousel.querySelector("[data-carousel-next]").addEventListener("click", () => {
        windowElement.scrollBy({ left: getStep(), behavior: "smooth" });
    });
}

if (servicesSheet) {
    document.querySelectorAll("[data-open-services]").forEach((button) => {
        button.addEventListener("click", () => {
            const activeSheet = button.closest("dialog");
            if (activeSheet?.open) activeSheet.close();
            servicesSheet.showModal();
        });
    });

    servicesSheet.querySelector("[data-close-services]").addEventListener("click", () => {
        servicesSheet.close();
    });

    servicesSheet.addEventListener("click", (event) => {
        if (event.target === servicesSheet) servicesSheet.close();
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && servicesSheet.open) {
            event.preventDefault();
            servicesSheet.close();
        }
    });
}

if (emergencySheet) {
    document.querySelector("[data-open-emergency]")?.addEventListener("click", () => openSheet(emergencySheet));
}

document.querySelectorAll("[data-close-sheet]").forEach((button) => {
    button.addEventListener("click", () => closeSheet(button.closest("dialog")));
});

[emergencySheet].forEach((sheet) => {
    sheet?.addEventListener("click", (event) => {
        if (event.target === sheet) closeSheet(sheet);
    });
});
