/**
 * Auction Website JavaScript
 * This file contains the core functionality for the auction website
 */

// Global variables
let isLoggedIn = false;
let currentUser = null;
let paidAuctions = []; // Array to store auction IDs that the user has paid entry fee for

// Check if user is logged in (in a real app, this would check session/token)
function checkLoginStatus() {
  // For demo purposes, we'll assume the user is not logged in initially
  return isLoggedIn;
}

// Login function
function login(email, password) {
  // In a real app, this would make an API call to verify credentials
  // For demo purposes, we'll just set the login status to true
  isLoggedIn = true;
  currentUser = {
    id: 1,
    name: "Demo User",
    email: email,
  };

  // Store login status in localStorage (for demo purposes)
  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("currentUser", JSON.stringify(currentUser));

  return true;
}

// Logout function
function logout() {
  isLoggedIn = false;
  currentUser = null;

  // Clear localStorage
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("currentUser");

  // Redirect to home page
  window.location.href = "index.html";
}

// Pay entry fee for an auction
function payEntryFee(auctionId, amount) {
  // In a real app, this would process payment and make API call
  // For demo purposes, we'll just add the auction ID to the paidAuctions array

  if (!isLoggedIn) {
    // Redirect to login page if not logged in
    window.location.href =
      "login.html?redirect=product-detail.html?id=" + auctionId;
    return false;
  }

  // Add auction to paid auctions
  paidAuctions.push(auctionId);

  // Store in localStorage (for demo purposes)
  localStorage.setItem("paidAuctions", JSON.stringify(paidAuctions));

  return true;
}

// Check if user has paid entry fee for an auction
function hasUserPaidEntryFee(auctionId) {
  // Check if auction ID is in paidAuctions array
  return paidAuctions.includes(auctionId);
}

// Place a bid on an auction
function placeBid(auctionId, amount) {
  // In a real app, this would make an API call to place the bid
  // For demo purposes, we'll just return true

  if (!isLoggedIn) {
    // Redirect to login page if not logged in
    window.location.href =
      "login.html?redirect=product-detail.html?id=" + auctionId;
    return false;
  }

  if (!hasUserPaidEntryFee(auctionId)) {
    // User hasn't paid entry fee
    alert("You must pay the entry fee before placing a bid.");
    return false;
  }

  // In a real app, this would validate the bid amount against the current highest bid
  // and update the UI accordingly

  return true;
}

// Get auction data
function getAuctionData(auctionId) {
  // In a real app, this would fetch data from an API
  // For demo purposes, we'll use hardcoded data

  const auctions = {
    1: {
      id: 1,
      name: "Vintage Leica Camera",
      category: "Antiques",
      description:
        "A rare vintage Leica camera from the 1950s in excellent condition with original leather case.",
      currentBid: 1250,
      basePrice: 1000,
      bidIncrement: 50,
      endsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
      seller: {
        id: 2,
        name: "John Smith",
        rating: 4.8,
      },
      images: [
        "https://via.placeholder.com/800x600",
        "https://via.placeholder.com/800x600?text=Image+2",
        "https://via.placeholder.com/800x600?text=Image+3",
        "https://via.placeholder.com/800x600?text=Image+4",
      ],
      bids: [
        {
          userId: 3,
          amount: 1250,
          time: new Date(Date.now() - 2 * 60 * 60 * 1000),
        },
        {
          userId: 4,
          amount: 1200,
          time: new Date(Date.now() - 5 * 60 * 60 * 1000),
        },
        {
          userId: 5,
          amount: 1150,
          time: new Date(Date.now() - 8 * 60 * 60 * 1000),
        },
        {
          userId: 6,
          amount: 1100,
          time: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      ],
    },
    // Add more auctions as needed
  };

  return auctions[auctionId] || null;
}

// Format time remaining
function formatTimeRemaining(endTime) {
  const now = new Date();
  const diff = endTime - now;

  if (diff <= 0) {
    return "Auction ended";
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return `${days}d ${hours}h`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
}

// Initialize the application
function initApp() {
  // Check if user is logged in
  const storedLoginStatus = localStorage.getItem("isLoggedIn");
  const storedUser = localStorage.getItem("currentUser");

  if (storedLoginStatus === "true" && storedUser) {
    isLoggedIn = true;
    currentUser = JSON.parse(storedUser);
  }

  // Load paid auctions from localStorage
  const storedPaidAuctions = localStorage.getItem("paidAuctions");
  if (storedPaidAuctions) {
    paidAuctions = JSON.parse(storedPaidAuctions);
  }

  // Update UI based on login status
  updateUI();
}

// Update UI based on login status
function updateUI() {
  const loginButtons = document.querySelectorAll(".login-button");
  const registerButtons = document.querySelectorAll(".register-button");
  const userMenus = document.querySelectorAll(".user-menu");

  if (isLoggedIn) {
    // Hide login/register buttons
    loginButtons.forEach((button) => button.classList.add("hidden"));
    registerButtons.forEach((button) => button.classList.add("hidden"));

    // Show user menu
    userMenus.forEach((menu) => {
      menu.classList.remove("hidden");
      const userNameElement = menu.querySelector(".user-name");
      if (userNameElement) {
        userNameElement.textContent = currentUser.name;
      }
    });
  } else {
    // Show login/register buttons
    loginButtons.forEach((button) => button.classList.remove("hidden"));
    registerButtons.forEach((button) => button.classList.remove("hidden"));

    // Hide user menu
    userMenus.forEach((menu) => menu.classList.add("hidden"));
  }

  // Update product detail page if on that page
  const payFeeSection = document.getElementById("not-paid-section");
  const paidSection = document.getElementById("paid-section");

  if (payFeeSection && paidSection) {
    // Get auction ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const auctionId = urlParams.get("id");

    if (auctionId && hasUserPaidEntryFee(auctionId)) {
      // User has paid entry fee, show paid section
      payFeeSection.classList.add("hidden");
      paidSection.classList.remove("hidden");
    } else {
      // User hasn't paid entry fee, show payment section
      payFeeSection.classList.remove("hidden");
      paidSection.classList.add("hidden");
    }
  }
}

// Initialize the app when DOM is loaded
document.addEventListener("DOMContentLoaded", initApp);

// Export functions for use in other files
window.auctionApp = {
  login,
  logout,
  payEntryFee,
  placeBid,
  getAuctionData,
  formatTimeRemaining,
};
