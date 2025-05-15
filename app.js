//Declarea variables
let nextDom,
  prevDom,
  carouselDom,
  SliderDom,
  thumbnailBorderDom,
  thumbnailItemsDom,
  thumb,
  timeDom;
let rightSections;
let currentSlide = 0;
let totalSlides = 6;
let runTimeOut;
let timeRunning = 3000;

// Set up all SEE MORE buttons to link to the appropriate URLs
document.addEventListener("DOMContentLoaded", function () {
  // 🔄 DOM assignments first
  nextDom = document.getElementById("next");
  prevDom = document.getElementById("prev");
  carouselDom = document.querySelector(".carousel");
  SliderDom = carouselDom.querySelector(".list");
  thumbnailBorderDom = document.querySelector(".thumbnail");
  thumbnailItemsDom = thumbnailBorderDom.querySelectorAll(".item");
  timeDom = document.querySelector(".carousel .time");

  // ✅ Hook up buttons
  nextDom.onclick = function () {
    showSlider("next");
  };
  prevDom.onclick = function () {
    showSlider("prev");
  };

  // ✅ Pagination dots
  const dots = document.querySelectorAll(".pagination-dots .dot");
  dots.forEach((dot) => {
    dot.addEventListener("click", function () {
      const targetSlide = parseInt(this.getAttribute("data-slide"));
      if (targetSlide !== currentSlide) {
        navigateToSlide(targetSlide);
      }
    });
  });

  // ✅ See More buttons
  const slides = document.querySelectorAll(".carousel .list .item");
  slides.forEach((slide, index) => {
    const button = slide.querySelector(".buttons button");
    if (!button) return;
    button.addEventListener("click", function () {
      const urls = {
        2: "https://www.hitachivantara.com/content/dam/hvac/pdfs/solution-profile/iq-m-series-product-brief.pdf",
        3: "https://www.hitachivantara.com/content/dam/hvac/pdfs/datasheet/hitachi-iq-with-nvidia-hgx.pdf",
        4: "https://www.hitachivantara.com/content/dam/hvac/pdfs/solution-profile/solution-profile-hammerspace.pdf",
        5: "https://www.hitachivantara.com/content/dam/hvac/pdfs/architecture-guide/deploy-scalable-distributed-file-system-rapidly-easily-affordably-architecture-guide.pdf",
      };
      const defaultUrl =
        "https://www.hitachivantara.com/en-us/solutions/ai-analytics/hitachi-iq";
      window.open(urls[index] || defaultUrl, "_blank");
    });
  });

  document.querySelectorAll(".thumbnail .item").forEach((thumb, index) => {
    thumb.setAttribute("data-original-index", index.toString());
    thumb.setAttribute("data-slide", index.toString());
    thumb.classList.add("clickable");

    thumb.addEventListener("click", function () {
      const target = parseInt(thumb.getAttribute("data-slide"));
      if (target !== currentSlide) {
        navigateToSlide(target);
      }
    });
  });

  // ✅ Initialize state
  navigateToSlide(0);

  // ✅ Hide active thumbnail right away
  updateActiveThumbnail(0);
});

// Preload the iQ logo image
const iQLogoPreload = new Image();
iQLogoPreload.src = "image/iQLogo.svg";

// Function to control logo visibility
function handleLogoVisibility(slideIndex) {
  // No need to manually control logo visibility
  // The CSS will handle showing/hiding logos based on the :first-child selector
  // which automatically targets the current active slide

  // Reset animations for all logo wrappers to ensure they animate properly when they become active
  document.querySelectorAll(".logo-wrapper").forEach((wrapper) => {
    // Reset the animation by removing and re-adding the element to the DOM
    const parent = wrapper.parentNode;
    const clone = wrapper.cloneNode(true);
    parent.removeChild(wrapper);
    parent.appendChild(clone);
  });
}

// Function to update thumbnail visibility
function updateThumbnailVisibility(currentSlideIndex) {
  // Get all thumbnails
  const thumbnails = document.querySelectorAll(".thumbnail .item.clickable");

  // Show all thumbnails first
  thumbnails.forEach((thumbnail) => {
    thumbnail.style.display = "block";
  });

  // Since the DOM structure changes when using next/prev buttons,
  // we need to use the data-slide attribute to find the current slide's thumbnail
  thumbnails.forEach((thumbnail) => {
    const slideIndex = parseInt(thumbnail.getAttribute("data-slide"));
    if (slideIndex === currentSlideIndex) {
      thumbnail.style.display = "none";
    }
  });
}

// Function to update the active pagination dot
function updateActiveDot(slideIndex) {
  // Remove active class from all dots
  const dots = document.querySelectorAll(".pagination-dots .dot");
  dots.forEach((dot) => {
    dot.classList.remove("active");
  });
  // Add active class to the current slide's dot
  const activeDot = document.querySelector(
    `.pagination-dots .dot[data-slide="${slideIndex}"]`
  );
  if (activeDot) {
    activeDot.classList.add("active");
  }
}

function updateActiveThumbnail(slideIndex) {
  const thumbnails = document.querySelectorAll(".thumbnail .item.clickable");

  thumbnails.forEach((thumb) => {
    const thumbIndex = parseInt(thumb.getAttribute("data-slide"));
    const isActive = thumbIndex === slideIndex;
    thumb.classList.toggle("active", isActive);
    thumb.style.display = isActive ? "none" : "block"; // ✅ Hide active one
  });
}

function showRightSection() {
  const allItems = document.querySelectorAll(".carousel .list .item");

  allItems.forEach((item, i) => {
    const rightSection = item.querySelector(".right-section");

    // Only first visible item is the current slide
    if (i === 0) {
      item.classList.add("active");
      if (rightSection) rightSection.classList.add("active");
    } else {
      item.classList.remove("active");
      if (rightSection) rightSection.classList.remove("active");
    }
  });
}

// Function to update images based on the current slide index
function updateImagesForSlide(slideIndex) {
  handleLogoVisibility(slideIndex);
  showRightSection(slideIndex);
  updateThumbnailVisibility(slideIndex);
  updateActiveDot(slideIndex);
  updateActiveThumbnail(slideIndex);
}

// Function to navigate to a specific slide by index
function navigateToSlide(targetSlide) {
  // Calculate how many times to move forward or backward
  if (targetSlide === currentSlide) {
    return; // Already on this slide
  }

  // Determine the direction based on the target slide
  let direction;

  // Calculate the shortest path to the target slide
  let clockwiseDistance =
    (targetSlide - currentSlide + totalSlides) % totalSlides;
  let counterClockwiseDistance =
    (currentSlide - targetSlide + totalSlides) % totalSlides;

  if (clockwiseDistance <= counterClockwiseDistance) {
    direction = "next";
  } else {
    direction = "prev";
  }

  // Hide all content immediately to prevent flashing of wrong content
  const allContentElements = document.querySelectorAll(
    ".carousel .list .item .content"
  );
  allContentElements.forEach((content) => {
    content.style.opacity = "0";
    content.style.transition = "none";
  });

  // Get all slides and thumbnails
  const allSlides = Array.from(SliderDom.querySelectorAll(".item"));
  const allThumbnails = Array.from(
    thumbnailBorderDom.querySelectorAll(".item")
  );

  // First, ensure all slides have the correct data-slide attribute
  // This is critical for maintaining the correct content association
  allSlides.forEach((slide, index) => {
    if (!slide.hasAttribute("data-slide")) {
      slide.setAttribute("data-slide", index.toString());
    }
  });

  // Clear the containers
  while (SliderDom.firstChild) {
    SliderDom.removeChild(SliderDom.firstChild);
  }

  while (thumbnailBorderDom.firstChild) {
    thumbnailBorderDom.removeChild(thumbnailBorderDom.firstChild);
  }

  // Reorder the slides so that the target slide is first
  const reorderedSlides = [...allSlides];
  const reorderedThumbnails = [...allThumbnails];

  // Sort the slides based on their data-slide attribute to ensure correct order
  reorderedSlides.sort((a, b) => {
    const aIndex = parseInt(a.getAttribute("data-slide") || "0");
    const bIndex = parseInt(b.getAttribute("data-slide") || "0");
    return aIndex - bIndex;
  });

  // Sort thumbnails the same way
  reorderedThumbnails.sort((a, b) => {
    const aIndex = parseInt(a.getAttribute("data-slide") || "0");
    const bIndex = parseInt(b.getAttribute("data-slide") || "0");
    return aIndex - bIndex;
  });

  // Now rotate the arrays until the target slide is at index 0
  while (
    parseInt(reorderedSlides[0].getAttribute("data-slide")) !== targetSlide
  ) {
    reorderedSlides.push(reorderedSlides.shift());
  }

  while (
    parseInt(reorderedThumbnails[0].getAttribute("data-slide")) !== targetSlide
  ) {
    reorderedThumbnails.push(reorderedThumbnails.shift());
  }

  // Add the reordered slides back to the DOM in the correct order
  reorderedSlides.forEach((slide) => {
    SliderDom.appendChild(slide);
  });

  // Remove `.active` class from all .item elements
  allSlides.forEach((slide) => {
    slide.classList.remove("active");
  });

  // Add `.active` to the first slide (now current)
  reorderedSlides[0].classList.add("active");

  // Restore correct data-slide index to match actual slide ID
  reorderedThumbnails.forEach((thumbnail) => {
    const realIndex = thumbnail.getAttribute("data-original-index"); // we'll add this attribute once
    if (realIndex !== null) {
      thumbnail.setAttribute("data-slide", realIndex);
    }

    thumbnail.classList.add("clickable");

    thumbnail.onclick = () => {
      const target = parseInt(thumbnail.getAttribute("data-slide"));
      if (target !== currentSlide) {
        navigateToSlide(target);
      }
    };

    thumbnailBorderDom.appendChild(thumbnail);
  });
  updateActiveThumbnail(targetSlide); // ✅ will now find the correct one

  // Prepare to fade in the content of the first slide (now the target slide)
  const firstSlideContent = SliderDom.querySelector(
    ".item:first-child .content"
  );
  if (firstSlideContent) {
    firstSlideContent.style.opacity = "0";
    firstSlideContent.style.transition = "opacity 0.5s ease";

    // Fade in the content after a short delay
    setTimeout(() => {
      firstSlideContent.style.opacity = "1";
    }, 100);
  }

  // Clear any existing timeout to prevent conflicts
  clearTimeout(runTimeOut);

  // Add animation class based on direction
  carouselDom.classList.add(direction);

  // Update the current slide index
  currentSlide = targetSlide;

  // Update images for the new slide
  updateImagesForSlide(currentSlide);

  // Set timeout to remove animation classes
  runTimeOut = setTimeout(() => {
    carouselDom.classList.remove("next");
    carouselDom.classList.remove("prev");
  }, timeRunning);
}

function showSlider(type) {
  let targetSlide;
  if (type === "next") {
    targetSlide = (currentSlide + 1) % totalSlides;
  } else {
    targetSlide = (currentSlide - 1 + totalSlides) % totalSlides;
  }
  navigateToSlide(targetSlide);
}
