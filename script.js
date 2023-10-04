
let canvas;
let ctx;
let playerX; // Player's X-coordinate
let playerY; // Player's Y-coordinate
let keys = {}; // Track pressed keys
let frameIndex = 0; // Track the current frame index
const totalFrames = 8; // Total number of frames in each animation
let frameImages = {}; // Object to hold the image arrays for each animation
const animationInterval = 150; // Animation interval in milliseconds (adjusted for a slower animation)
let animationTimer = null; // Timer ID for controlling the animation
const playerSpeed = 2; // Player's movement speed
let isFlipped = false; // Flag to track if the character is flipped horizontally
let defaultFrameImage; // Default frame image when no key is pressed
let streetTile;
let locations;
let location_images;
let playerWidth;
let playerHeight;
let scale;
let scaleX;
let scaleY;
let playerRatio;
let screenRatio;
let xRatio;
let yRatio;
const streetFiles = ['images/street_1.png', 'images/street_2.png', 'images/street_3.png'];
let streetImages = [];

const gameArea = {
  x: 0, // Game area's X-coordinate
  y: 0, // Game area's Y-coordinate
  width: 800, // Game area's width
  height: 600, // Game area's height
};


document.addEventListener('keydown', (event) => {
  keys[event.key] = true;
});

document.addEventListener('keyup', (event) => {
  delete keys[event.key];
});

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

  // // Prevents going all the way to 0
  // if (Math.round(value * scale) > 0) {
  //   return Math.round(value * scale)
  // } else {
  //   return value
  // }
}

function insertZeroAfterDecimal(inputNumber) {
  // Convert the input number to a string
  let numberString = inputNumber.toString();

  // Check if the number has a decimal point
  if (numberString.includes('.')) {
    // Split the number into the integer and fractional parts
    let [integerPart, fractionalPart] = numberString.split('.');

    // Add a zero to the fractional part and combine them back
    numberString = integerPart + '.0' + fractionalPart;
  }

  // Convert the modified string back to a number
  let result = parseFloat(numberString);

  return result;
}

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
      x: 775,
      y: 50,
      door_width: 79,
      door_height: 52,
      door_x: 86,
      door_y: 148,
      src: 'images/contacts.png',
      popup: 'contacts'
    },
    education: {
      width: 176,
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
      x: 550,
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
      x: 450,
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

  // GOTTA DO THIS WITH EVERYTHING

  oldX = canvas.width / playerX
  oldY = canvas.height / playerY
  
  playerWidth = canvas.width / screenRatio; // Set player width to 1/30th of the canvas width
  playerHeight = playerWidth * playerRatio

  // const newScaleX = (canvas.width / screenRatio) / playerWidth;
  // const newScaleY = (playerWidth * playerRatio) / playerHeight;

  // playerX *= newScaleX
  // playerY *= newScaleY

  playerX = canvas.width / xRatio
  playerY = canvas.height / yRatio

  // playerX *= screenRatio
  // playerY *= playerRatio



  // CAN"T LET HER GET SMALLER THAN 0
  // playerX = scaleValue(playerX, scale);
  // playerY = scaleValue(playerY, scale);
  // console.log()
  // console.log("SCALE", scale)
  // console.log("AFTER FUNC:", scale)
  // console.log("PLAYER WIDTH BEFORE:", playerWidth)
  // playerWidth = scaleValue(playerWidth, scale)
  // console.log("PLAYER WIDTH AFTER:", playerWidth)
  // console.log("PLAYER HEIGHT BEFORE:", playerHeight)
  // playerHeight = scaleValue(playerHeight, scale)
  // console.log("PLAYER HEIGHT AFTER:", playerHeight)
  // console.log()

  //TO DO: Do this in a loop

  for (let [location] of Object.entries(locations)) {

    // screenRatio: gameArea.width / 176,
    // proportion:  143 / 176
    // update to loop through each elm of the dict
    locations[location].x = scaleValue(locations[location].x, scale);
    locations[location].y = scaleValue(locations[location].y, scale);
    locations[location].width = scaleValue(locations[location].width, scale);
    locations[location].height = scaleValue(locations[location].height, scale);
    locations[location].door_x = scaleValue(locations[location].door_x, scale);
    locations[location].door_y = scaleValue(locations[location].door_y, scale);
    locations[location].door_width = scaleValue(locations[location].door_width, scale);
    locations[location].door_height = scaleValue(locations[location].door_height, scale);
  }
}

// function tileBackground() {
//   // Load all three background images
//   streetImages = streetFiles.map(imagePath => {
//     const image = new Image();
//     image.src = imagePath;
//     return image;
//   });

//   // ...

//   // // Wait for all images to load before starting the game loop
//   // Promise.all(streetImages.map(image => new Promise(resolve => {
//   //   image.addEventListener('load', resolve);
//   // }))).then(() => {
//   //   gameLoop();
//   // });

//   for (let x = 0; x < canvas.width; x += 65) {
//     for (let y = 0; y < canvas.height; y += 45) {
//       let image = streetImages[Math.floor(Math.random() * streetImages.length)]
//       ctx.drawImage(image, x, y);
//     }
//   }
// }

function initialize() {
  canvas = document.getElementById('game-canvas');
  ctx = canvas.getContext('2d');

  setLocations();
  setCanvasSize();

  window.addEventListener('resize', () => {
    setLocations();
    setCanvasSize();
  });

  canvas.addEventListener('click', handleCanvasClick);

  playerX = 0;
  playerY = 0;

  playerWidth = 20; //orig: 27
  playerHeight = 32; //orig: 42

  playerRatio = playerHeight / playerWidth
  screenRatio = gameArea.width / playerWidth

  playerWidth = canvas.width / screenRatio; // Set player width to 1/30th of the canvas width
  playerHeight = playerWidth * playerRatio

  streetTile = new Image();
  streetTile.src = 'images/street6.png';

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

  document.addEventListener('DOMContentLoaded', function () {
    // Code to show the popup when the page is fully loaded
    const welcome = document.getElementById('welcome');
    welcome.style.display = 'block';
  });

  defaultFrameImage.addEventListener('load', function () {
    gameLoop();
  });

  // tileBackground();

  // Wait for the background image to load before starting the game loop
  // streetTile.addEventListener('load', function () {
  //   gameLoop();
  // });

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
  // Add event listeners for arrow key presses and clicks
  document.addEventListener('keydown', function(event) {
    console.log("HELLO")
    const welcome = document.getElementById('welcome');
    if (welcome) {
      welcome.style.display = 'none';
    }
  });

  document.addEventListener('click', function(event) {
    console.log("HELLO2")
    const welcome = document.getElementById('welcome');
    if (welcome) {
      welcome.style.display = 'none';
    }
  });

  
  const previousX = playerX;
  const previousY = playerY;
  let animation = 'down'; // Default animation

  if (keys['ArrowUp']) {
    playerY -= playerSpeed * scale; // Move player up
    animation = 'up';
  }
  if (keys['ArrowDown']) {
    playerY += playerSpeed * scale; // Move player down
    animation = 'down';
  }
  if (keys['ArrowLeft']) {
    playerX -= playerSpeed * scale; // Move player left
    animation = 'side';
    isFlipped = true; // Flip the character horizontally
  }
  if (keys['ArrowRight']) {
    playerX += playerSpeed * scale; // Move player right
    animation = 'side';
    isFlipped = false; // Reset the character's flip state
  }

  // Restrict the player's position within the game area
  playerX = Math.max(0, Math.min(playerX, 0 + canvas.width - playerWidth));
  playerY = Math.max(0, Math.min(playerY, 0 + canvas.height - playerHeight));

  xRatio = canvas.width / playerX
  yRatio = canvas.height / playerY

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

  window.onscroll = function() {headerStick()};

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
        openPopup(locations[location].popup)
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
      openPopup(locations[location].popup);
      return true; // Collision occurred
    }
  }
}

function render(animation) {
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // tileBackground();
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
  ctx.drawImage(currentFrameImage, 0, 0, playerWidth, playerHeight); // Adjust the size here

  ctx.restore(); // Restore the canvas state

  for (let [location] of Object.entries(locations)) {
    var image = new Image()
    image.src = locations[location].src
    ctx.drawImage(image, locations[location].x, locations[location].y, locations[location].width, locations[location].height); // Adjust the size here
  }

  // ctx.drawImage(house, locations.house.x, locations.house.y, locations.house.width, locations.house.height); // Adjust the size here
  // ctx.drawImage(building, locations.building.x, locations.building.y, locations.building.width, locations.building.height); // Adjust the size here
}

function openPopup(type) {
  const popup = document.getElementById(type);
  popup.style.display = 'block';

  let button = type + "-close-button"

  const closeButton = document.getElementById(button);
  closeButton.addEventListener('click', function() {closePopup(type)});

  const downloadButton = document.getElementById('popup-download-button');
  downloadButton.addEventListener('click', downloadPDF);
}

function closePopup(type) {
  const popup = document.getElementById(type);
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
