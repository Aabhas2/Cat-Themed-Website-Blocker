// Fetch the blocked site from the query parameter
const params = new URLSearchParams(window.location.search);
const site = params.get("site");

// Update the message with the blocked site (if available)
if (site) {
  document.getElementById("blocked-site-message").textContent =
    `What you doing here on ${site} huh?!`;
}

//select image element
const catImage = document.getElementById("cat-meme");

//fallback image if API request fails
const fallbackImg = "img/Kitty.jpeg"

//Fetch the API key securely from the api_key.txt file 
fetch('/api_key.txt')
  .then(response => response.text())
  .then(key => {
    const apiKey = key.trim();
    //use apiKey in your API request 
    fetch(`https://api.thecatapi.com/v1/images/search?api_key=${apiKey}`)
      .then(response => response.json())
      .then(data => {
        catImage.src = data[0].url;
      })
      .catch(() => {
        //on api fail, show fallback image
        console.error("Failed to fetch the cat image from the API. Using fallback image.");
        catImage.src = fallbackImg;
        catImage.alt = "Fallback cat image loaded!";
      });
  })
  .catch(() => {
    //on api_key.txt fetch failure, set the fallback image
    console.error("Error loading API key. Using fallback image.");
    catImage.src = fallbackImg;
    catImage.alt = "Fallback cat image loaded!";
  });

