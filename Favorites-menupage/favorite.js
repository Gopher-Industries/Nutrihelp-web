// Initialize favorites from localStorage
let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

document.addEventListener('DOMContentLoaded', function () {
  const favoriteButtons = document.querySelectorAll('.favorite-btn');
  const favoritesList = document.getElementById('favorites-list');

  // Function to update the favorites list display
  function updateFavoritesDisplay() {
    favoritesList.innerHTML = favorites.map(item => `<li>${item}</li>`).join('');
  }

  // Add to favorites event
  favoriteButtons.forEach(button => {
    button.addEventListener('click', function () {
      const item = this.getAttribute('data-item');
      if (!favorites.includes(item)) {
        favorites.push(item);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        updateFavoritesDisplay();
      }
    });
  });

  // Display favorites when page loads
  updateFavoritesDisplay();
});
