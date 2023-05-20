class BurgerMenu extends HTMLElement {
  constructor() {
    super();
    this.toggleElement = this.querySelector(".menu__toggle");
    this.listElement = this.querySelector(".menu__list");

    this.toggleElement.addEventListener("click", () => {
      const willBeExpanded = this.getIsExpanded(this.listElement) === "false";
      this.setIsOpen(willBeExpanded);
    });

    this.handleCloseClick = this.handleCloseClick.bind(this);
    this.setIsOpen = this.setIsOpen.bind(this);
    this.getIsExpanded = this.getIsExpanded.bind(this);
  }

  handleCloseClick(e) {
    if (!e.target || !this.contains(e.target)) {
      this.setIsOpen(false);
    }
  }
  setIsOpen(isOpen) {
    this.listElement.setAttribute("aria-expanded", `${isOpen}`);
    this.setAttribute("aria-hidden", `${isOpen}`);
    if (isOpen) {
      this.setAttribute("hidden");
      setTimeout(() => window.addEventListener("click", this.handleCloseClick));
    } else {
      this.removeAttribute("hidden");
      window.removeEventListener("click", this.handleCloseClick);
    }
  }

  getIsExpanded(listElement) {
    return listElement.getAttribute("aria-expanded");
  }
}

customElements.define("burger-menu", BurgerMenu, { extends: "nav" });

class Carousel extends HTMLUListElement {
  slides = [];

  constructor() {
    super();
    const hasMinWidth = matchMedia(`(min-width: ${this.dataset.minWidth})`);
    if (!hasMinWidth) return;

    const slidesMax = parseInt(this.dataset.slidesCount);
    const slidesOptions = this.querySelectorAll(".carousel__slide");

    if (slidesMax > slidesOptions.length) return;

    let i = 0;
    for (const slide of slidesOptions) {
      const cloned = slide.cloneNode(true);
      cloned.setAttribute("data-index", `${i++}`);
      this.slides.push(cloned);
      slide.remove();
    }

    this.append(
      ...this.slides.slice(0, slidesMax).map((slide) => slide.cloneNode(true))
    );

    this.intervalId = setInterval(() => {
      this.shift();
      this.children[0].disappear(() => {
        const lastChild = this.children[this.children.length - 1];
        const lastSliceIndex = parseInt(lastChild.dataset.index);
        const nextSliceIndex = (lastSliceIndex + 1) % this.slides.length;
        const nextSlide = this.slides[nextSliceIndex].cloneNode(true);
        nextSlide.appear();
        this.append(nextSlide);
      });
    }, 5000);
  }

  shift() {
    this.classList.add("carousel-container--shift");
    this.addEventListener("animationend", () => {
      this.classList.remove("carousel-container--shift");
    });
  }
}

customElements.define("carousel-container", Carousel, { extends: "ul" });
