// Array of motivational quotes
const quotes = [
  "Fuel your body, fuel your mind.",
  "Eat well, live well.",
  "The secret of getting ahead is getting started.",
  "Small changes can make a big difference!",
  "Every healthy choice adds up."
];

// Function to display a random quote
function displayRandomQuote() {
  const quoteElement = document.getElementById('motivational-quote');
  const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
  quoteElement.textContent = randomQuote;
}

// Display a quote when the page loads
document.addEventListener('DOMContentLoaded', displayRandomQuote);
