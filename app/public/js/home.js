const carousel = document.querySelector(".services-carousel");

if (carousel) {
    const windowElement = carousel.querySelector(".services-carousel__window");
    const previousButton = carousel.querySelector(".services-carousel__control--previous");
    const nextButton = carousel.querySelector(".services-carousel__control--next");
    const dots = [...carousel.querySelectorAll(".services-carousel__dot")];

    const getPageWidth = () => {
        const card = windowElement.querySelector(".service-card");
        return card ? card.offsetWidth * 2 : 288;
    };

    const getPageCount = () => dots.length;

    const getCurrentPage = () => {
        const pageWidth = getPageWidth();
        const maxScroll = Math.max(0, windowElement.scrollWidth - windowElement.clientWidth);
        if (maxScroll === 0) return 0;

        const page = Math.round(windowElement.scrollLeft / pageWidth);
        return Math.max(0, Math.min(getPageCount() - 1, page));
    };

    const updateDots = () => {
        const currentPage = getCurrentPage();

        dots.forEach((dot, index) => {
            const active = index === currentPage;
            dot.classList.toggle("services-carousel__dot--active", active);
            dot.setAttribute("aria-selected", String(active));
        });

        previousButton.disabled = windowElement.scrollLeft <= 1;
        nextButton.disabled = windowElement.scrollLeft >= windowElement.scrollWidth - windowElement.clientWidth - 1;
    };

    const goToPage = (page) => {
        const boundedPage = Math.max(0, Math.min(getPageCount() - 1, page));
        const pageWidth = getPageWidth();
        const maxScroll = Math.max(0, windowElement.scrollWidth - windowElement.clientWidth);
        const target = Math.min(boundedPage * pageWidth, maxScroll);

        windowElement.scrollTo({ left: target, behavior: "smooth" });
    };

    windowElement.scrollLeft = 0;
    updateDots();

    previousButton.addEventListener("click", () => {
        goToPage(getCurrentPage() - 1);
    });

    nextButton.addEventListener("click", () => {
        goToPage(getCurrentPage() + 1);
    });

    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => goToPage(index));
    });

    let scrollFrame;
    windowElement.addEventListener("scroll", () => {
        if (scrollFrame) cancelAnimationFrame(scrollFrame);
        scrollFrame = requestAnimationFrame(updateDots);
    }, { passive: true });
}
