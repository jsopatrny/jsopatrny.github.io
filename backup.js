let canvas;
let ctx;
let playerX = 0; // Player's X-coordinate
let playerY = 0; // Player's Y-coordinate
let keys = {}; // Track pressed keys
let frameIndex = 0; // Track the current frame index
const totalFrames = 8; // Total number of frames in each animation
let frameImages = {}; // Object to hold the image arrays for each animation
const animationInterval = 150; // Animation interval in milliseconds (adjusted for a slower animation)
let animationTimer = null; // Timer ID for controlling the animation
const playerSpeed = 1; // Player's movement speed
let isFlipped = false; // Flag to track if the character is flipped horizontally
let defaultFrameImage; // Default frame image when no key is pressed
let streetTile;
let locations;
let location_images;

const gameArea = {
  x: 0, // Game area's X-coordinate
  y: 0, // Game area's Y-coordinate
  width: 800, // Game area's width
  height: 600, // Game area's height
};


const playerWidth = 27; // Width of the player's image
const playerHeight = 42; // Height of the player's image

document.addEventListener('keydown', (event) => {
  keys[event.key] = true;
});

document.addEventListener('keyup', (event) => {
  delete keys[event.key];
});

function scaleValue(value, scale) {
  return Math.round(value * scale);
}

function setLocations() {
  locations = {
    house: {
      width: 176,
      height: 143,
      x: 100,
      y: 100,
      // x: canvas.width / 2,
      // y: canvas.height / 2,
      door_width: 85,
      door_height: 50,
      door_x: 77,
      door_y: 97,
      src: 'images/house.png'
    },
    building: {
      width: 176,
      height: 257,
      x: 300,
      y: 200,
      // x: canvas.width / 4,
      // y: canvas.height / 4,
      door_width: 79,
      door_height: 46,
      door_x: 49,
      door_y: 211,
      src: 'images/building.png'
    }
  }
}

function setCanvasSize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const canvasAspectRatio = canvas.width / canvas.height;
  const gameAreaAspectRatio = gameArea.width / gameArea.height;

  // Determine the scale factor based on the canvas and game area aspect ratios
  let scale;
  if (canvasAspectRatio > gameAreaAspectRatio) {
    // The canvas is wider, so scale based on height
    scale = canvas.height / gameArea.height;
  } else {
    // The canvas is taller, so scale based on width
    scale = canvas.width / gameArea.width;
  }

  playerX = scaleValue(playerX, scale);
  playerY = scaleValue(playerY, scale);

  for (let [location] of Object.entries(locations)) {
    const locationWidth = locations[location].width;
    const locationHeight = locations[location].height;
    const locationDoorWidth = locations[location].door_width;
    const locationDoorHeight = locations[location].door_height;

    const widthScale = scale;
    const heightScale = scale;

    locations[location].x = scaleValue(locations[location].x, scale);
    locations[location].y = scaleValue(locations[location].y, scale);
    locations[location].width = scaleValue(locationWidth, widthScale);
    locations[location].height = scaleValue(locationHeight, heightScale);
    locations[location].door_x = scaleValue(locations[location].door_x, scale);
    locations[location].door_y = scaleValue(locations[location].door_y, scale);
    locations[location].door_width = scaleValue(locationDoorWidth, widthScale);
    locations[location].door_height = scaleValue(locationDoorHeight, heightScale);
  }
}



function initialize() {
  canvas = document.getElementById('game-canvas');
  ctx = canvas.getContext('2d');

  setLocations();
  window.addEventListener('resize', setLocations);

  setCanvasSize();
  window.addEventListener('resize', setCanvasSize);

  canvas.addEventListener('click', handleCanvasClick);

  streetTile = new Image();
  streetTile.src = 'images/street2.png';
  const animations = ['down', 'up', 'side'];

  for (const animation of animations) {
    frameImages[animation] = [];

    for (let i = 0; i < totalFrames; i++) {
      const frameImage = new Image();
      frameImage.src = `images/${animation}-${i + 1}.png`; // Replace with the path to your frame images
      frameImages[animation].push(frameImage);
    }
  }

  defaultFrameImage = new Image();
  defaultFrameImage.src = 'images/down-1.png'; // Replace with the path to your default frame image

  defaultFrameImage.addEventListener('load', function () {
    gameLoop();
  });

  // Wait for the background image to load before starting the game loop
  streetTile.addEventListener('load', function () {
    gameLoop();
  });

  // for (var i; i < Object.keys(locations).length; i++) {
  //   let i = new Image()
  //   location.src = 'images/' + location +'.png'
  // }

  // house = new Image();
  // house.src = 'images/house.png'

  // building = new Image();
  // building.src = 'images/building.png'
}

function gameLoop() {
  const previousX = playerX;
  const previousY = playerY;
  let animation = 'down'; // Default animation

  if (keys['ArrowUp']) {
    playerY -= playerSpeed; // Move player up
    animation = 'up';
  }
  if (keys['ArrowDown']) {
    playerY += playerSpeed; // Move player down
    animation = 'down';
  }
  if (keys['ArrowLeft']) {
    playerX -= playerSpeed; // Move player left
    animation = 'side';
    isFlipped = true; // Flip the character horizontally
  }
  if (keys['ArrowRight']) {
    playerX += playerSpeed; // Move player right
    animation = 'side';
    isFlipped = false; // Reset the character's flip state
  }

  // Restrict the player's position within the game area
  playerX = Math.max(0, Math.min(playerX, 0 + canvas.width - playerWidth));
  playerY = Math.max(0, Math.min(playerY, 0 + canvas.height - playerHeight));

  if (checkCollision()) {
    // Restore previous position if collision occurs
    playerX = previousX;
    playerY = previousY;
  }

  render(animation);

  if (!animationTimer) {
    animationTimer = setInterval(updateFrame, animationInterval);
  }

  // You can move this line outside the if statement if you want the animation to continue even when the player is not moving
  if (!keys['ArrowUp'] && !keys['ArrowDown'] && !keys['ArrowLeft'] && !keys['ArrowRight']) {
    clearInterval(animationTimer);
    animationTimer = null;
    frameIndex = 0; // Reset the frame index to display the default frame image
  }

  requestAnimationFrame(gameLoop);
}

function checkCollision() {
  // Collision detection logic
  // Example: Assuming there's a building at (100, 100) with a size of 50x50
  // TODO: create a list of building locations, show specific popups for each
  //list of names of every location
  // loop through every location to index on the location
  // popup field on location entry
  // pass as param to openpopup
  for (let [location] of Object.entries(locations)) {
    if (
      playerX < locations[location].x + locations[location].width &&
      playerX + 20 > locations[location].x &&
      playerY < locations[location].y + locations[location].height &&
      playerY + 20 > locations[location].y
    ) {
      // If the player is in the area of the "door," show the corresponding popup
      if (
        playerX < locations[location].x + locations[location].door_x + locations[location].door_width &&
        playerX + 20 > locations[location].x + locations[location].door_x &&
        playerY < locations[location].y + locations[location].door_y + locations[location].door_height &&
        playerY + 20 > locations[location].y + locations[location].door_y
      ) {
        openPopup()
      }

      // openpop passes the certain type of popup
      // openPopup();
      return true; // Collision occurred
    }
  }

  // Add more collision checks for other obstacles if needed

  return false; // No collision
}

function handleCanvasClick(event) {
  const canvasRect = canvas.getBoundingClientRect();
  const clickX = event.clientX - canvasRect.left;
  const clickY = event.clientY - canvasRect.top;

  // ADD LOCATION SIZES TO THE OBJECT

  for (let [location] of Object.entries(locations)) {
    if (
      clickX < locations[location].x + locations[location].width &&
      clickX > locations[location].x &&
      clickY < locations[location].y + locations[location].height &&
      clickY > locations[location].y
    ) {

      // openpop passes the certain type of popup
      openPopup();
      return true; // Collision occurred
    }
  }
}

function render(animation) {
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Create a pattern from the background image
  const backgroundPattern = ctx.createPattern(streetTile, 'repeat');
  ctx.fillStyle = backgroundPattern;
  ctx.fillRect(gameArea.x, gameArea.y, canvas.width, canvas.height);

  let currentFrameImage;

  if (animation === 'down' && !keys['ArrowUp'] && !keys['ArrowDown'] && !keys['ArrowLeft'] && !keys['ArrowRight']) {
    currentFrameImage = defaultFrameImage; // Set the default frame image for the 'down' animation
  } else {
    currentFrameImage = frameImages[animation][frameIndex]; // Get the current frame image for other animations
  }

  ctx.save(); // Save the current canvas state

  // Translate and flip the canvas context if the character is flipped horizontally
  if (isFlipped) {
    ctx.translate(playerX + currentFrameImage.width, playerY);
    ctx.scale(-1, 1);
  } else {
    ctx.translate(playerX, playerY);
  }

  // Draw the current frame image
  ctx.drawImage(currentFrameImage, 0, 0, currentFrameImage.width, currentFrameImage.height); // Adjust the size here

  ctx.restore(); // Restore the canvas state

  // Draw buildings, popup windows, and other elements based on game state
  // ...

  // Example of drawing a building
  // ctx.fillStyle = 'gray';
  // ctx.fillRect(100, 100, 50, 50);

  // Example of drawing a popup window
  if (playerX === 100 && playerY === 100) {
    // Open the popup window
    // Draw the content of the popup window
  }

  for (let [location] of Object.entries(locations)) {
    var image = new Image()
    image.src = locations[location].src
    ctx.drawImage(image, locations[location].x, locations[location].y, locations[location].width, locations[location].height); // Adjust the size here
  }

  // ctx.drawImage(house, locations.house.x, locations.house.y, locations.house.width, locations.house.height); // Adjust the size here
  // ctx.drawImage(building, locations.building.x, locations.building.y, locations.building.width, locations.building.height); // Adjust the size here
}

function openPopup() {
  const popup = document.getElementById('popup');
  popup.style.display = 'block';

  const closeButton = document.getElementById('popup-close-button');
  closeButton.addEventListener('click', closePopup);

  const downloadButton = document.getElementById('popup-download-button');
  downloadButton.addEventListener('click', downloadPDF);
}

function closePopup() {
  const popup = document.getElementById('popup');
  popup.style.display = 'none';
}

function downloadPDF() {
  window.open('resume.pdf')
  // Logic for downloading the PDF
  // You can use libraries like PDF.js or standard HTML5 download attribute
}

function updateFrame() {
  frameIndex = (frameIndex + 1) % totalFrames; // Increment frame index and wrap around
}

initialize();
