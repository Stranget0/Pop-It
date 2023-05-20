// Utils
const lerp = (f0, f1, t) => (1 - t) * f0 + t * f1;
const clamp = (val, min, max) => Math.max(min, Math.min(val, max));
const roundArbitraryFloat = (val) => Math.round(val * 100000) / 100000;
function throttle(cb, delay) {
  let shouldWait = false;

  return (...args) => {
    if (shouldWait) return;

    cb(...args);
    shouldWait = true;
    setTimeout(() => {
      shouldWait = false;
    }, delay);
  };
}

//Custom elements
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

class Carousel extends HTMLElement {
  slides = [];
  progress = 0;

  constructor() {
    super();
    this.init();
    this.calculateSizes();
    this.bindings();
    this.events();
    this.startAutoScroll();
  }

  setTargetProgress(value, t = 0.1) {
    const frame = () => {
      const oldProgress = this.progress;
      this.progress = lerp(oldProgress, value, t);

      this.updateWrapTransform(this.progress);

      this.updateSlidesTransform(oldProgress, this.progress);

      if (roundArbitraryFloat(this.progress) === roundArbitraryFloat(value))
        return;

      this.progressId = requestAnimationFrame(frame);
    };

    cancelAnimationFrame(this.progressId);
    this.progressId = window.requestAnimationFrame(frame);
  }

  updateSlidesTransform(oldProgress, progress, maxScaleDelta = 0.2) {
    const progressDelta = progress - oldProgress;

    const speed = clamp(Math.abs(progressDelta) * 20, 0, maxScaleDelta);

    this.slides.forEach((slide) => {
      slide.style.transform = `scaleY(${1 - speed})`;
    });
  }

  updateWrapTransform(progress) {
    this.wrap.style.transform = `translateX(${-progress * this.maxScroll}px)`;
  }

  init() {
    this.wrap = this.querySelector(".carousel__container");
    this.slides = this.querySelectorAll(".carousel__slide");
  }
  bindings() {
    [
      "init",
      "calculateSizes",
      "handleTouchStart",
      "getHandleTouchMove",
      "handleTouchEnd",
      "events",
      "handleResize",
      "startAutoScroll",
      "stopAutoScroll",
      "updateSlidesTransform",
      "updateWrapTransform",
    ].forEach((key) => (this[key] = this[key].bind(this)));
  }
  calculateSizes() {
    this.scrollWidthMemo = this.wrap.scrollWidth;
    this.clientWidthMemo = this.clientWidth;
    this.maxScroll = this.scrollWidthMemo - this.clientWidthMemo;
    this.progressOfSlide = getPosSlideDifference(this.slides, this.maxScroll);

    function getPosSlideDifference(slides, maxScroll) {
      if (slides.length < 2) return 0;

      return (
        Math.abs(
          slides[0].getBoundingClientRect().x -
            slides[1].getBoundingClientRect().x
        ) / maxScroll
      );
    }
  }
  handleResize() {
    this.calculateSizes();
    this.progress = 0;
    this.wrap.style.transform = "";
    cancelAnimationFrame(this.progressId);
  }

  handleTouchStart(e) {
    this.startX = e.clientX || e.touches[0].clientX;
    this.isDragging = true;
    this.dataset.isDragging = "true";
    this.stopAutoScroll();
  }
  getHandleTouchMove() {
    return throttle((e) => {
      if (!this.isDragging) return;
      const pointX = e.clientX ?? e.touches[0].clientX;
      const progressDelta = (this.startX - pointX) / this.maxScroll;
      const newProgress = this.progress + progressDelta;
      this.setTargetProgress(clamp(newProgress, 0, 1));
    }, 25);
  }
  handleTouchEnd(e) {
    this.isDragging = false;
    this.dataset.isDragging = "false";
    this.startAutoScroll();
  }
  events() {
    window.addEventListener("resize", this.handleResize);
    // window.addEventListener("wheel", this.handleWheel);
    //
    this.addEventListener("touchstart", this.handleTouchStart);
    window.addEventListener("touchmove", this.getHandleTouchMove());
    window.addEventListener("touchend", this.handleTouchEnd);
    //
    this.addEventListener("mousedown", this.handleTouchStart);
    window.addEventListener("mousemove", this.getHandleTouchMove());
    window.addEventListener("mouseup", this.handleTouchEnd);
    this.addEventListener("mouseleave", this.handleTouchEnd);
  }

  startAutoScroll() {
    this.stopAutoScroll();
    let currentSlideIndex = 0;
    this.autoScrollIntervalId = setInterval(() => {
      this.setTargetProgress(
        clamp(currentSlideIndex * this.progressOfSlide, 0, 1),
        0.06
      );

      const nextSlideIndex = currentSlideIndex + 1;
      currentSlideIndex =
        nextSlideIndex < this.slides.length ? nextSlideIndex : 0;
    }, 2500);
  }
  stopAutoScroll() {
    clearInterval(this.autoScrollIntervalId);
  }
}

customElements.define("carousel-main", Carousel, { extends: "section" });
