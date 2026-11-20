const carousel = document.querySelector(".services-carousel");

if (carousel) {
    const windowElement = carousel.querySelector(".services-carousel__window");
    const previousButton = carousel.querySelector(".services-carousel__control--previous");
    const nextButton = carousel.querySelector(".services-carousel__control--next");

    windowElement.scrollLeft = 0;

    previousButton.addEventListener("click", () => {
        windowElement.scrollBy({ left: -144, behavior: "smooth" });
    });

    nextButton.addEventListener("click", () => {
        windowElement.scrollBy({ left: 144, behavior: "smooth" });
    });
}
