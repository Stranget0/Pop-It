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
    if (isOpen) {
      setTimeout(() => window.addEventListener("click", this.handleCloseClick));
    } else window.removeEventListener("click", this.handleCloseClick);
  }

  getIsExpanded(listElement) {
    return listElement.getAttribute("aria-expanded");
  }
}

window.customElements.define("burger-menu", BurgerMenu, { extends: "nav" });
