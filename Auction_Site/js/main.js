/**
 * AuctionX Front‑End Logic
 */

const products = [
  {
    id: 1,
    title: "MacBook Pro 2023",
    category: "computers",
    basePrice: 2000,
    currentBid: 2150,
    image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600",
  },
  {
    id: 2,
    title: "Vintage Rotary Phone (1965)",
    category: "phones",
    basePrice: 80,
    currentBid: 120,
    image: "https://images.unsplash.com/photo-1551085254-12a24e2dbf24?w=600",
  },
  {
    id: 3,
    title: "Oil Painting – Sunset at Sea",
    category: "art",
    basePrice: 500,
    currentBid: 640,
    image: "https://images.unsplash.com/photo-1502920514313-52581002a659?w=600",
  },
];

// ---- Navbar mobile toggle ----
function initNavbar() {
  const btn = document.getElementById("mobileMenu");
  const mobileNav = document.getElementById("mobileNav");
  if (btn) {
    btn.addEventListener("click", () => {
      mobileNav.classList.toggle("hidden");
    });
  }
  // Search bar
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const term = e.target.value.toLowerCase();
      document.querySelectorAll("[data-title]").forEach((card) => {
        card.style.display = card.dataset.title.includes(term) ? "" : "none";
      });
    });
  }
}

// ---- Hero Swiper ----
function initHeroSlider() {
  new Swiper(".heroSwiper", {
    loop: true,
    autoplay: { delay: 5000 },
    pagination: { el: ".swiper-pagination", clickable: true },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
  });
}

// ---- Load product cards on Home ----
function loadProducts() {
  const grid = document.getElementById("productGrid");
  if (!grid) return;
  grid.innerHTML = products
    .map(
      (p) => `
    <div class="border rounded-lg overflow-hidden shadow hover:shadow-lg transition bg-white" data-title="${p.title.toLowerCase()}">
      <a href="product-detail.html?id=${p.id}">
        <img src="${p.image}" alt="${p.title}" class="w-full h-52 object-cover">
        <div class="p-4 space-y-2">
          <h3 class="font-semibold text-lg">${p.title}</h3>
          <p class="text-sm text-gray-500 capitalize">${p.category}</p>
          <div class="flex justify-between items-center">
            <span class="text-indigo-600 font-bold">$${p.currentBid}</span>
            <span class="text-xs text-gray-400">Base: $${p.basePrice}</span>
          </div>
        </div>
      </a>
    </div>
  `
    )
    .join("");
}

// ---- Product detail rendering ----
function renderProductDetail() {
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));
  const product = products.find((p) => p.id === id) || products[0];
  const root = document.getElementById("productDetailRoot");
  if (!root) return;
  const depositKey = "deposit_paid_" + product.id;
  const hasDeposit = localStorage.getItem(depositKey) === "true";
  const bidsKey = "bids_" + product.id;
  const bids = JSON.parse(localStorage.getItem(bidsKey) || "[]");
  root.innerHTML = `
    <div class="grid md:grid-cols-2 gap-10">
      <div>
        <img src="${product.image}" alt="${
    product.title
  }" class="w-full h-96 object-cover rounded-lg shadow">
      </div>
      <div>
        <h1 class="text-3xl font-bold mb-2">${product.title}</h1>
        <p class="text-gray-500 mb-4 capitalize">${product.category}</p>
        <div class="mb-4">
          <span class="text-2xl font-bold text-indigo-600">$${
            product.currentBid
          }</span>
          <span class="text-sm text-gray-400 ml-2">Base price: $${
            product.basePrice
          }</span>
        </div>
        <div id="actionArea" class="space-y-4">
          ${
            hasDeposit
              ? `<button id="bidBtn" class="bg-indigo-600 text-white px-6 py-2 rounded hover:bg-indigo-700">Bid Now</button>`
              : `<button id="depositBtn" class="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700">Pay 10% Deposit ($${(
                  product.basePrice * 0.1
                ).toFixed(2)})</button>`
          }
        </div>
        <div class="mt-8">
          <h2 class="text-xl font-semibold mb-2">Bids</h2>
          <ul id="bidList" class="space-y-2 text-sm">
            ${
              bids.length
                ? bids
                    .map((b) => `<li>${b.name} bid $${b.amount}</li>`)
                    .join("")
                : "<li>No bids yet. Be the first one to bid.</li>"
            }
          </ul>
        </div>
      </div>
    </div>
  `;

  if (!hasDeposit) {
    document.getElementById("depositBtn").addEventListener("click", () => {
      if (confirm("Proceed to pay 10% deposit?")) {
        localStorage.setItem(depositKey, "true");
        renderProductDetail(); // rerender
      }
    });
  } else {
    document.getElementById("bidBtn").addEventListener("click", () => {
      const amount = prompt("Enter your bid amount ($):");
      if (!amount) return;
      const bidsArr = JSON.parse(localStorage.getItem(bidsKey) || "[]");
      const bid = { name: "You", amount: parseFloat(amount) };
      bidsArr.unshift(bid);
      localStorage.setItem(bidsKey, JSON.stringify(bidsArr));
      alert("Bid placed successfully!");
      renderProductDetail();
    });
  }
}

// Back to top button
const backToTopButton = document.getElementById("backToTop");
window.addEventListener("scroll", function () {
  if (window.scrollY > 300) {
    backToTopButton.classList.remove("scale-0");
    backToTopButton.classList.add("scale-100");
  } else {
    backToTopButton.classList.remove("scale-100");
    backToTopButton.classList.add("scale-0");
  }
});

backToTopButton.addEventListener("click", function () {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
});
