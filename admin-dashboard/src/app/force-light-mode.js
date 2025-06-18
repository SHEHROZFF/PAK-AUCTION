// Force light mode script
(function() {
  // Force light mode
  document.documentElement.style.colorScheme = 'light';
  
  // Override any dark mode settings
  const style = document.createElement('style');
  style.textContent = `
    html, body {
      background-color: white !important;
      color-scheme: light !important;
    }
    
    * {
      color: initial !important;
    }
    
    .bg-indigo-600, .bg-indigo-700, .bg-indigo-800, .bg-indigo-900,
    .bg-purple-600, .bg-purple-700, .bg-purple-800, .bg-purple-900,
    .bg-blue-600, .bg-blue-700, .bg-blue-800, .bg-blue-900,
    .bg-red-600, .bg-red-700, .bg-red-800, .bg-red-900,
    .bg-green-600, .bg-green-700, .bg-green-800, .bg-green-900,
    .bg-gray-600, .bg-gray-700, .bg-gray-800, .bg-gray-900,
    .bg-black, .text-white {
      color: white !important;
    }
  `;
  document.head.appendChild(style);
  
  // Force light mode in localStorage
  localStorage.setItem('theme', 'light');
  localStorage.setItem('color-scheme', 'light');
})(); 