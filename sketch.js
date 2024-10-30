let hilt = [];
let ores = [];
let selectedHilt = null;
let selectedOre = null;
let screen = 0; // Start with the title screen
let swordHistory = []; // Array to store the history of swords created

let fireLevel = 255; // Level of the fire, max 255
let fireDiminishRate = 0.4; // Rate at which fire decreases
let wood = { x: 600, y: 350, size: 40, dragging: false }; // Wood position and dragging state
let anvil = { x: 100, y: 150, width: 160, height: 80 }; // Anvil position and size
let fireActive = false; // Track if the fire is active
let particles = []; // Array for fire particles

// Load sounds
let fireSound, anvilSound, failureSound;

function preload() {
  // Load sound files (ensure you have the correct paths)
  fireSound = loadSound('assets/crackling-fire.mp3'); // Fire crackling sound
  anvilSound = loadSound('assets/anvil-hit.mp3'); // Anvil hammering sound
  failureSound = loadSound('assets/failure.mp3'); // Failure sound
}

function setup() {
  createCanvas(700, 500);

  // First screen hilts
  hilt.push(createHilt('Ruby', [255, 0, 0], 50, 400));
  hilt.push(createHilt('Sapphire', [0, 0, 255], 150, 400));
  hilt.push(createHilt('Emerald', [0, 255, 0], 250, 400));
  hilt.push(createHilt('Topaz', [255, 255, 0], 350, 400));
  hilt.push(createHilt('Diamond', [0, 255, 255], 450, 400));

  // Second screen Ores
  ores.push(createOre('Iron', [192, 192, 192], 50, 400));
  ores.push(createOre('Copper', [128, 30, 20], 150, 400));
  ores.push(createOre('Steel', [230, 230, 230], 250, 400));
  ores.push(createOre('Obsidian', [0, 0, 0], 350, 400));
  ores.push(createOre('Quartz', [255, 229, 200], 450, 400));
}

function draw() {
  background(220);

  if (screen === 0) {
    displayTitleScreen();
  } else if (screen === 1) {
    displayGameScreen1();
  } else if (screen === 2) {
    displayGameScreen2();
  } else if (screen === 3 && selectedHilt && selectedOre) {
    displaySword();
  }

  // Update the fire if it is active
  if (fireActive) {
    updateFire();
  }
// Update particles
  updateParticles();
  
  // Check if fire is out
  if (fireLevel <= 0) {
    endGame();
  }
}

function mousePressed() {
  if (screen === 0) {
    screen = 1;
    fireActive = true;
    fireSound.loop(); // Start fire sound loop
  } else if (screen === 1) {
    selectHilt();
  } else if (screen === 2) {
    selectOre();
  } else if (screen === 3 || screen === 4) {
    restart();
  }

  // Start dragging wood if clicked on it
  if (screen < 3 && dist(mouseX, mouseY, wood.x, wood.y) < wood.size) {
    wood.dragging = true;
  }
}

function mouseDragged() {
  if (wood.dragging) {
    wood.x = mouseX;
    wood.y = mouseY;
  }
}

function mouseReleased() {
  if (wood.dragging) {
    if (dist(wood.x, wood.y, 500, 150) < 50) {
      fireLevel = min(fireLevel + 50, 255);
      createParticleEffect(wood.x, wood.y); // Create particle effect
    }
    wood.x = 600;
    wood.y = 350;
    wood.dragging = false;
  }
}

function displayTitleScreen() {
  fill(0);
  textSize(70);
  textAlign(CENTER, CENTER);
  text("Blacksmith", width / 2, height / 2 - 20);
  textSize(16);
  text("Click anywhere to start", width / 2, height / 2 + 30);
  text("*Hint Don't Let the Fire Die!", width / 2, height / 2 + 150);
  text("Drag the Wood to the Fire and make Swords", width / 2, height / 2 + 70);
}

function displayGameScreen1() {
  for (let i = 0; i < hilt.length; i++) {
    hilt[i].display();
  }
  displayAnvil();
  displayFire();
  displaySwordHistory();
  displayWood();
}

function displayGameScreen2() {
  displayAnvil();
  displayFire();
  displaySwordHistory();
  displayWood();
  for (let i = 0; i < ores.length; i++) {
    ores[i].display();
  }
}

function displayAnvil() {
  fill(128);
  rect(anvil.x, anvil.y, anvil.width, anvil.height, 10); // Draw the anvil with rounded corners
  fill(0);
}

function displaySword() {
  fireActive = false;
  fill(selectedHilt.color);
  rect(325, 150, 50, 150);
  fill(selectedOre.color);
  rect(340, 50, 20, 100);

  fill(0);
  textSize(20);
  textAlign(CENTER);
  text("Your Sword", 350, 350);
  textSize(18);
  text(`Hilt: ${selectedHilt.name}`, 350, 400);
  text(`Ore: ${selectedOre.name}`, 350, 420);
  text("Click anywhere to create a new sword", 350, 450);
  
  // Spark animation
  sparkAnimation();
}

function displayFire() {
  fill(255, fireLevel, 0);
  ellipse(500, 150, 100, 120);
}

function updateFire() {
  fireLevel -= fireDiminishRate;
  fireLevel = max(fireLevel, 0);
}

function displayWood() {
  fill(139, 69, 19);
  rect(wood.x, wood.y, 70, 20);
}

function displaySwordHistory() {
  fill(0);
  textSize(12);
  textAlign(LEFT);
  text("Sword History:", 10, 20);

  for (let i = 0; i < swordHistory.length; i++) {
    let sword = swordHistory[i];
    text(`${i + 1}: Hilt - ${sword.hilt}, Ore - ${sword.ore}`, 10, 40 + i * 20);
  }
}

function endGame() {
  screen = 4; // Set to Game Over screen
  failureSound.play(); // Play failure sound
  fireActive = false;
  fill(0);
  textSize(32);
  textAlign(CENTER, CENTER);
  text("Game Over", width / 2, height / 2);
  textSize(16);
  text("The fire has gone out!", width / 2, height / 2 + 40);
  text("Click anywhere to retry", width / 2, height / 2 + 60);
  noLoop();
}

function restart() {
  selectedHilt = null;
  selectedOre = null;
  screen = 1;
  fireLevel = 255;
  fireActive = true;
  fireSound.loop(); // Restart fire sound loop
  loop();
}

function selectHilt() {
  for (let i = 0; i < hilt.length; i++) {
    if (dist(mouseX, mouseY, hilt[i].x, hilt[i].y) < 40) {
      selectedHilt = hilt[i];
      screen = 2;
      anvilSound.play(); // Play anvil sound when selecting hilt
      break;
    }
  }
}

function selectOre() {
  for (let i = 0; i < ores.length; i++) {
    if (dist(mouseX, mouseY, ores[i].x, ores[i].y) < 40) {
      selectedOre = ores[i];
      screen = 3;
      swordHistory.push({ hilt: selectedHilt.name, ore: selectedOre.name });
      anvilSound.play(); // Play anvil sound when selecting ore
      break;
    }
  }
}

function createHilt(name, color, x, y) {
  return {
    name: name,
    color: color,
    x: x,
    y: y,
    display: function() {
      fill(this.color);
      ellipse(this.x, this.y, 40, 70);
      fill(0);
      textSize(12);
      textAlign(CENTER);
      text(this.name, this.x, this.y + 50);
    }
  };
}

function createOre(name, color, x, y) {
  return {
    name: name,
    color: color,
    x: x,
    y: y,
    display: function() {
      fill(this.color);
      ellipse(this.x, this.y, 40, 70);
      fill(0);
      textSize(12);
      textAlign(CENTER);
      text(this.name, this.x, this.y + 50);
    }
  };
}

function createParticleEffect(x, y) {
  for (let i = 0; i < 10; i++) {
    particles.push({ x: x, y: y, size: random(5, 10), lifetime: 255 });
  }
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    let p = particles[i];
    p.y -= 1; // Move particle up
    p.lifetime -= 5; // Decrease particle lifetime
    if (p.lifetime <= 0) {
      particles.splice(i, 1); // Remove dead particles
    }
  }

  // Display particles
  for (let p of particles) {
    fill(255, 215, 0, p.lifetime); // Gold color with fade
    ellipse(p.x, p.y, p.size);
  }
}

function sparkAnimation() {
  fill(255, 215, 0);
  for (let i = 0; i < 5; i++) {
    let x = random(325, 375);
    let y = random(50, 150);
    ellipse(x, y, random(3, 6));

  }
}