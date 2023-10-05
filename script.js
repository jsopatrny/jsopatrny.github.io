
let canvas; //game-canvas
let ctx;
let playerX; // Player's X-coordinate
let playerY; // Player's Y-coordinate
let keys = {}; // Track pressed keys
let frameIndex = 0; // Track the current frame index
const totalFrames = 8; // Total number of frames in player animation
let frameImages = {}; // Object to hold the image arrays for player animation
const animationInterval = 150; // Animation interval in milliseconds (adjusted for a slower animation)
let animationTimer = null; // Timer ID for controlling the animation
const playerSpeed = 2; // Player's movement speed
let isFlipped = false; // Flag to track if the character is flipped horizontally
let defaultFrameImage; // Default frame image when no key is pressed
let streetTile; // Background image
let locations; // Dict of buildings and their coordinates/images
let playerWidth;
let playerHeight;
let scale; // Canvas to game area scale factor, for resizing locations on window resize
let playerRatio;
let screenRatio;

const gameArea = {
  x: 0, // Game area's X-coordinate
  y: 0, // Game area's Y-coordinate
  width: 800, // Game area's width
  height: 600, // Game area's height
};

// Records which key is currently pressed, ie {ArrowDown: true}, for moving the player in gameLoop()
document.addEventListener('keydown', (event) => {
  keys[event.key] = true;
});

// Removes key from dict if it is no longer pressed
document.addEventListener('keyup', (event) => {
  delete keys[event.key];
});

// Returns a value * scale, with conditionals to make sure the number doesn't hit 0 (so the player and buildings
// are always visible)
function scaleValue(value, scale) {
  let scaled = value
  if (scale > 0) {
    scaled = Math.ceil(value * scale)
  } else {
    scaled = Math.floor(value * scale)
  }
  if (scaled != 0) {
    return scaled
  } else {
    return value
  }
}


// Add each location's information to the dictionary: {
  //   width,
  //   height,
  //   x: x location on the canvas,
  //   y: y location on the canvas,
  //   door_width: door width in pixels,
  //   door_height: door height in pixels,
  //   door_x: door's x offset from the top left corner of the building (for player collision detection),
  //   door_y: door's y offset from the top left corner of the building,
  //   src: source image file,
  //   popup: the popup window that should open on collision
  // }
function setLocations() {
  locations = {
    about: {
      width: 176,
      height: 143,
      x: 100,
      y: 50,
      door_width: 80,
      door_height: 46,
      door_x: 82,
      door_y: 97,
      src: 'images/about.png',
      popup: 'about'
    },
    contacts: {
      width: 176,
      height: 201,
      x: 824,
      y: 50,
      door_width: 79,
      door_height: 52,
      door_x: 86,
      door_y: 148,
      src: 'images/contacts.png',
      popup: 'contacts'
    },
    education: {
      width: 188,
      height: 257,
      x: 200,
      y: 250,
      door_width: 43,
      door_height: 46,
      door_x: 67,
      door_y: 211,
      src: 'images/education.png',
      popup: 'education'
    },
    projects: {
      width: 176,
      height: 204,
      x: 650,
      y: 305,
      door_width: 79,
      door_height: 46,
      door_x: 49,
      door_y: 157,
      src: 'images/projects.png',
      popup: 'projects'
    },
    resume: {
      width: 176,
      height: 201,
      x: 462,
      y: 50,
      door_width: 79,
      door_height: 46,
      door_x: 49,
      door_y: 155,
      src: 'images/resume.png',
      popup: 'resume'
    }
  }
}

// Called every time the window is resized
// Scales the player and the buildings to keep their proportional size and locations
function setCanvasSize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;

  const canvasAspectRatio = canvas.width / canvas.height;
  const gameAreaAspectRatio = gameArea.width / gameArea.height;

  // Determine the scale factor based on the canvas and game area aspect ratios
  if (canvasAspectRatio > gameAreaAspectRatio) {
    // The canvas is wider, so scale based on height
    scale = canvas.height / gameArea.height;
  } else {
    // The canvas is taller, so scale based on width
    scale = canvas.width / gameArea.width;
  }
  
  // Updates the player's size based on the ratio of the initial player's size to the window size
  playerWidth = canvas.width / screenRatio;
  playerHeight = playerWidth * playerRatio

  // Scales each location's values according to the appropriate proportion
  for (let [location] of Object.entries(locations)) {
    for (const value of ['x', 'y', 'width', 'height', 'door_x', 'door_y', 'door_width', 'door_height']) {
      locations[location][value] = scaleValue(locations[location][value], scale)
    }
  }
}

// Initialize canvas and player
function initialize() {
  canvas = document.getElementById('game-canvas');
  ctx = canvas.getContext('2d');

  // Sets canvas size and initializes the location objects
  setLocations();
  setCanvasSize();

  // Update the locations every time the window is resized
  window.addEventListener('resize', () => {
    setLocations();
    setCanvasSize();
  });

  // Listen to clicks - user can click on buildings to open popups
  canvas.addEventListener('click', handleCanvasClick);

  // Player starts at top left of window
  playerX = 0;
  playerY = 0;

  playerWidth = 20; //orig: 27
  playerHeight = 32; //orig: 42

  // To scale the player, we have to get the ratio of the initial player size to the initial canvas size
  // and then scale the player according to that
  // playerRatio = the player's initial height to width ratio
  playerRatio = playerHeight / playerWidth
  // screenRatio = the player's inital width to gameArea ratio
  screenRatio = gameArea.width / playerWidth
  // Updates player's width to be proportional to the initial player width to game area ratio
  playerWidth = canvas.width / screenRatio;
  // Updates player's height based on it's initial width to height ratio
  playerHeight = playerWidth * playerRatio

  // Sets up the frameImages object, which contains an array of image objects for each direction animation
  // i.e. 8 images for the 'down' animation
  const animations = ['down', 'up', 'side'];
  for (const animation of animations) {
    frameImages[animation] = [];
    for (let i = 0; i < totalFrames; i++) {
      const frameImage = new Image();
      frameImage.src = `images/${animation}-${i + 1}.png`;
      frameImages[animation].push(frameImage);
    }
  }

  // Sets image for background tiling
  streetTile = new Image();
  streetTile.src = 'images/street.png';

  // Default player image, standing facing down
  defaultFrameImage = new Image();
  defaultFrameImage.src = 'images/down-1.png';

  // Display welcome bubble popup when the page is fully loaded
  document.addEventListener('DOMContentLoaded', function () {
    const welcome = document.getElementById('welcome');
    welcome.style.display = 'block';
  });

  // Runs the game loop once the page is loaded
  defaultFrameImage.addEventListener('load', function () {
    gameLoop();
  });
}

// Handle the player's position, collision, and any other game logic
// called every refresh rate (requestAnimationFrame)
function gameLoop() {
  // Removes welcome bubble on either keydown or click
  document.addEventListener('keydown', function(event) {
    const welcome = document.getElementById('welcome');
    if (welcome) {
      welcome.style.display = 'none';
    }
  });
  document.addEventListener('click', function(event) {
    const welcome = document.getElementById('welcome');
    if (welcome) {
      welcome.style.display = 'none';
    }
  });
  
  // Stores previous location before the player is moved to restrict player's movement on collision
  const previousX = playerX;
  const previousY = playerY;

  // Keeps track of which is the current animation direction
  let animation = 'down'; // Default animation

  // Move the player by updating their x and y coordinates on key presses
  if (keys['ArrowUp']) {
    playerY -= playerSpeed * scale; // Move player up
    animation = 'up'; // Play up animation
  }
  if (keys['ArrowDown']) {
    playerY += playerSpeed * scale; // Move player down
    animation = 'down'; // Play down animation
  }
  if (keys['ArrowLeft']) {
    playerX -= playerSpeed * scale; // Move player left
    animation = 'side'; // Play side animation
    isFlipped = true; // Flip the character horizontally
  }
  if (keys['ArrowRight']) {
    playerX += playerSpeed * scale; // Move player right
    animation = 'side'; // Play side animation
    isFlipped = false; // Reset the character's flip state
  }

  // Restrict the player's position within the game area
  playerX = Math.max(0, Math.min(playerX, 0 + canvas.width - playerWidth));
  playerY = Math.max(0, Math.min(playerY, 0 + canvas.height - playerHeight));

  // Check if the player has collided with any buildings
  if (checkCollision()) {
    // Restore previous position if collision occurs
    playerX = previousX;
    playerY = previousY;
  }

  render(animation);

  // Changes to the next image in the animation
  if (!animationTimer) {
    animationTimer = setInterval(updateFrame, animationInterval);
  }

  // If no keys are pressed, stop the animation and reset the player to the default image
  if (!keys['ArrowUp'] && !keys['ArrowDown'] && !keys['ArrowLeft'] && !keys['ArrowRight']) {
    clearInterval(animationTimer);
    animationTimer = null;
    frameIndex = 0; // Reset the frame index to display the default frame image
  }

  // Recursively calls gameLoop at browser's refresh rate
  requestAnimationFrame(gameLoop);
}

// Collision detection logic
// Return true if a collision is made, false otherwise
// So the player does not walk through buildings, and to trigger popups for the appropriate buildings
function checkCollision() {
  for (let [location] of Object.entries(locations)) {
    // Returns true if the player is within the bounds of a building
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
        openPopup(locations[location].popup)
      }
      return true; // Collision occurred
    }
  }

  // No collision
  return false;
}

// Trigger appropriate popup for when a building is clicked
function handleCanvasClick(event) {
  // Get (x, y) coordinates of the click
  const canvasRect = canvas.getBoundingClientRect();
  const clickX = event.clientX - canvasRect.left;
  const clickY = event.clientY - canvasRect.top;

  // If the click location is within one of the buildings, open the corresponding popup
  for (let [location] of Object.entries(locations)) {
    if (
      clickX < locations[location].x + locations[location].width &&
      clickX > locations[location].x &&
      clickY < locations[location].y + locations[location].height &&
      clickY > locations[location].y
    ) {

      // openpop passes the certain type of popup
      openPopup(locations[location].popup);
    }
  }
}

// Draws the buildings and players on the canvas
function render(animation) {
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Create a repeated pattern from the background image
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
  ctx.drawImage(currentFrameImage, 0, 0, playerWidth, playerHeight); // Adjust the size here

  ctx.restore(); // Restore the canvas state

  // Draw each image from the locations dictionary
  for (let [location] of Object.entries(locations)) {
    var image = new Image()
    image.src = locations[location].src
    ctx.drawImage(image, locations[location].x, locations[location].y, locations[location].width, locations[location].height);
  }
}

// Open the selected popup window and listen for close or PDF download
function openPopup(type) {
  const popup = document.getElementById(type);
  popup.style.display = 'block';

  // Gets the correct close button ID for the window
  let button = type + "-close-button"

  const closeButton = document.getElementById(button);
  closeButton.addEventListener('click', function() {closePopup(type)});

  const downloadButton = document.getElementById('popup-download-button');
  downloadButton.addEventListener('click', downloadPDF);
}

// Close the current popup window
function closePopup(type) {
  const popup = document.getElementById(type);
  popup.style.display = 'none';
}

// Download the resume PDF
function downloadPDF() {
  window.open('resume.pdf')
}

// Increments the animation frame index
function updateFrame() {
  frameIndex = (frameIndex + 1) % totalFrames; // Increment frame index and wrap around
}

initialize();
