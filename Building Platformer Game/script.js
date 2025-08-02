// DOM Element References
const startBtn = document.getElementById("start-btn");
const canvas = document.getElementById("canvas");
const startScreen = document.querySelector(".start-screen");
const checkpointScreen = document.querySelector(".checkpoint-screen");
const checkpointMessage = document.querySelector(".checkpoint-screen > p");

// Canvas Setup
const ctx = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;
const gravity = 0.5;
let isCheckpointCollisionDetectionActive = true;

// Utility function to scale sizes proportionally based on screen height
const proportionalSize = (size) => {
  return innerHeight < 500 ? Math.ceil((size / 500) * innerHeight) : size;
}

// Player Class
class Player {
  constructor() {
    this.position = {
      x: proportionalSize(10),
      y: proportionalSize(400),
    };
    this.velocity = {
      x: 0,
      y: 0,
    };
    this.width = proportionalSize(40);
    this.height = proportionalSize(40);
  }

  draw() {
    ctx.fillStyle = "#99c9ff";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  update() {
    this.draw();
    this.position.x += this.velocity.x;
    this.position.y += this.velocity.y;

    // Gravity and ground collision
    if (this.position.y + this.height + this.velocity.y <= canvas.height) {
      if (this.position.y < 0) {
        this.position.y = 0;
        this.velocity.y = gravity;
      }
      this.velocity.y += gravity;
    } else {
      this.velocity.y = 0;
    }

    // Left and right boundaries
    if (this.position.x < this.width) {
      this.position.x = this.width;
    }
    if (this.position.x >= canvas.width - this.width * 2) {
      this.position.x = canvas.width - this.width * 2;
    }
  }
}

// Platform Class
class Platform {
  constructor(x, y) {
    this.position = { x, y };
    this.width = 200;
    this.height = proportionalSize(40);
  }

  draw() {
    ctx.fillStyle = "#acd157";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}

// Checkpoint Class
class CheckPoint {
  constructor(x, y, z) {
    this.position = { x, y };
    this.width = proportionalSize(40);
    this.height = proportionalSize(70);
    this.claimed = false;
  }

  draw() {
    ctx.fillStyle = "#f1be32";
    ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
  }

  // Hide the checkpoint after it's claimed
  claim() {
    this.width = 0;
    this.height = 0;
    this.position.y = Infinity;
    this.claimed = true;
  }
}

// Game Initialization
const player = new Player();

// Platform positions array
const platformPositions = [ /* positions */ ];
const platforms = platformPositions.map(
  (platform) => new Platform(platform.x, platform.y)
);

// Checkpoint positions array
const checkpointPositions = [ /* positions */ ];
const checkpoints = checkpointPositions.map(
  (checkpoint) => new CheckPoint(checkpoint.x, checkpoint.y, checkpoint.z)
);

// Game Loop
const animate = () => {
  requestAnimationFrame(animate);
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw platforms and checkpoints
  platforms.forEach((platform) => platform.draw());
  checkpoints.forEach((checkpoint) => checkpoint.draw());

  // Update player position and apply physics
  player.update();

  // Horizontal movement within screen range
  if (keys.rightKey.pressed && player.position.x < proportionalSize(400)) {
    player.velocity.x = 5;
  } else if (keys.leftKey.pressed && player.position.x > proportionalSize(100)) {
    player.velocity.x = -5;
  } else {
    player.velocity.x = 0;

    // Scroll platforms and checkpoints if player reaches screen edge
    if (keys.rightKey.pressed && isCheckpointCollisionDetectionActive) {
      platforms.forEach((platform) => (platform.position.x -= 5));
      checkpoints.forEach((checkpoint) => (checkpoint.position.x -= 5));
    } else if (keys.leftKey.pressed && isCheckpointCollisionDetectionActive) {
      platforms.forEach((platform) => (platform.position.x += 5));
      checkpoints.forEach((checkpoint) => (checkpoint.position.x += 5));
    }
  }

  // Platform Collision Detection
  platforms.forEach((platform) => {
    const collisionDetectionRules = [
      player.position.y + player.height <= platform.position.y,
      player.position.y + player.height + player.velocity.y >= platform.position.y,
      player.position.x >= platform.position.x - player.width / 2,
      player.position.x <= platform.position.x + platform.width - player.width / 3,
    ];

    // Land on top of platform
    if (collisionDetectionRules.every(rule => rule)) {
      player.velocity.y = 0;
      return;
    }

    // Hit from below — bounce off
    const platformDetectionRules = [
      player.position.x >= platform.position.x - player.width / 2,
      player.position.x <= platform.position.x + platform.width - player.width / 3,
      player.position.y + player.height >= platform.position.y,
      player.position.y <= platform.position.y + platform.height,
    ];

    if (platformDetectionRules.every(rule => rule)) {
      player.position.y = platform.position.y + player.height;
      player.velocity.y = gravity;
    }
  });

  // Checkpoint Detection
  checkpoints.forEach((checkpoint, index, checkpoints) => {
    const checkpointDetectionRules = [
      player.position.x >= checkpoint.position.x,
      player.position.y >= checkpoint.position.y,
      player.position.y + player.height <= checkpoint.position.y + checkpoint.height,
      isCheckpointCollisionDetectionActive,
      player.position.x - player.width <= checkpoint.position.x - checkpoint.width + player.width * 0.9,
      index === 0 || checkpoints[index - 1].claimed === true,
    ];

    if (checkpointDetectionRules.every(rule => rule)) {
      checkpoint.claim();

      if (index === checkpoints.length - 1) {
        // Final checkpoint logic
        isCheckpointCollisionDetectionActive = false;
        showCheckpointScreen("You reached the final checkpoint!");
        movePlayer("ArrowRight", 0, false);
      } 
      // Regular checkpoint message
      else if (
        player.position.x >= checkpoint.position.x &&
        player.position.x <= checkpoint.position.x + 40
      ) {
        showCheckpointScreen("You reached a checkpoint!");
      }
    }
  });
}

// Key press tracking
const keys = {
  rightKey: { pressed: false },
  leftKey: { pressed: false }
};

// Player Movement Function
const movePlayer = (key, xVelocity, isPressed) => {
  if (!isCheckpointCollisionDetectionActive) {
    player.velocity.x = 0;
    player.velocity.y = 0;
    return;
  }

  switch (key) {
    case "ArrowLeft":
      keys.leftKey.pressed = isPressed;
      if (xVelocity === 0) player.velocity.x = xVelocity;
      player.velocity.x -= xVelocity;
      break;
    case "ArrowUp":
    case " ":
    case "Spacebar":
      player.velocity.y -= 8;
      break;
    case "ArrowRight":
      keys.rightKey.pressed = isPressed;
      if (xVelocity === 0) player.velocity.x = xVelocity;
      player.velocity.x += xVelocity;
  }
}

// Start the game
const startGame = () => {
  canvas.style.display = "block";
  startScreen.style.display = "none";
  animate();
}

// Show Checkpoint Message Screen
const showCheckpointScreen = (msg) => {
  checkpointScreen.style.display = "block";
  checkpointMessage.textContent = msg;

  // Hide after 2 seconds if still in active mode
  if (isCheckpointCollisionDetectionActive) {
    setTimeout(() => (checkpointScreen.style.display = "none"), 2000);
  }
}

// Event listeners
startBtn.addEventListener("click", startGame);

window.addEventListener("keydown", ({ key }) => {
  movePlayer(key, 8, true);
});

window.addEventListener("keyup", ({ key }) => {
  movePlayer(key, 0, false);
});
