let hilt = [];
let ores = [];
let selectedHilt = null;
let selectedOre = null;
let screen = 0; // Start with the title screen
let swordHistory = []; // Array to store the history of swords created

let fireLevel = 255; // Level of the fire, max 255
let fireVolume = 50; // Level of the fire, max 100
let fireDiminishRate = 0.4; // Rate at which fire decreases
let wood = { x: 600, y: 350, size: 40, dragging: true }; // Wood position and dragging state
let anvil = { x: 100, y: 155, width: 160, height: 80 }; // Anvil position and size
let fireActive = false; // Track if the fire is active
let particles = []; // Array for fire particles
let fireParticles = []; // Array for fire particles
let anvilSparkParticles = []; // Array for anvil spark particles


// Load sounds
let fireSound, anvilSound, failureSound, fireupSound, winSound;

let hiltImages = {};
let oreImages = {};

function preload() {
  // Load sound files (ensure you have the correct paths)
  fireSound = loadSound('assets/crackling-fire.mp3'); // Fire crackling sound
  anvilSound = loadSound('assets/anvil-hit.mp3'); // Anvil hammering sound
  failureSound = loadSound('assets/failure.mp3'); // Failure sound
  fireupSound = loadSound('assets/fire-up.mp3');
  winSound = loadSound('assets/winning.mp3');
  

  anvilIMG = loadImage('assets/bs_anvil.png')
  woodIMG = loadImage('assets/wood.png')
  backIMG = loadImage('assets/background.png')
  
// Load hilt and ore images
  hiltImages = {
    Ruby: loadImage('assets/ruby-hilt.PNG'),
    Sapphire: loadImage('assets/sapphire-hilt.PNG'),
    Emerald: loadImage('assets/emerald-hilt.PNG'),
    Topaz: loadImage('assets/topaz-hilt.PNG'),
    Diamond: loadImage('assets/diamond-hilt.PNG')
  };
  oreImages = {
    Iron: loadImage('assets/iron-ore.PNG'),
    Copper: loadImage('assets/copper-ore.PNG'),
    Steel: loadImage('assets/steel-ore.PNG'),
    Obsidian: loadImage('assets/obsidian-ore.PNG'),
    Quartz: loadImage('assets/quartz-ore.PNG')
  };
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
  background(backIMG);

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
  } else if (screen === 3 | screen === 4) {
    checkLinkButtonClick(); // Check if link button clicked
  } 
  
  // Check if the anvil is clicked to create spark effect
  if (dist(mouseX, mouseY, anvil.x + anvil.width , anvil.y + anvil.height / 2) < anvil.width / 2) {
    createSparkEffect(mouseX, mouseY); // Create spark particles at the anvil
    anvilSound.play(); // Play anvil sound for effect
    anvilSound.setVolume(0.1);
  }
}
  
  function keyPressed() {
  if (key === 'n') {
    restart();
  }
    
  if (key === 'r') {
    restartEnd();
  }
    

  // Start dragging wood if clicked on it
  if (screen < 3 && dist(mouseX, mouseY, wood.x, wood.y) < wood.size) {
    wood.dragging = true;
  }
}

function mouseDragged() {
  if (wood.dragging) {
    wood.x = mouseX - 20;
    wood.y = mouseY - 20;
  }
}

function mouseReleased() {
  if (wood.dragging) {
    if (dist(wood.x, wood.y, 500, 150) < 50) {
      fireLevel = min(fireLevel + 50, 255);
      fireVolume = min(fireVolume + 10, 50);
      fireupSound.play();
      createParticleEffect(wood.x + 20, wood.y + 20, random(500, 150)); // Create particle effect
    }
    wood.x = 600;
    wood.y = 350;
    wood.dragging = true;
  }
}

function displayTitleScreen() {
  fill(255);
  textSize(70);
  textAlign(CENTER, CENTER);
  text("Blacksmith", width / 2, height / 2 - 20);
  textSize(24);
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
  image(anvilIMG, 70, 60, 300, 300); // Draw the anvil with rounded corners
  fill(0);
}

function displaySword() {
  fireActive = false;
  // Display the selected ore image as the blade above the handle
  if (selectedOre && oreImages[selectedOre.name]) {
    image(oreImages[selectedOre.name], 215, 1, 272, 280);
  } else {
    fill(selectedOre.color);
    rect(340, 100, 20, 120); // Fallback rectangle if image isn't found
  }
  
  // Display the selected hilt image at the handle position
  if (selectedHilt && hiltImages[selectedHilt.name]) {
    image(hiltImages[selectedHilt.name], 248, 120, 200, 230);
  } else {
    fill(selectedHilt.color);
    rect(325, 250, 50, 150); // Fallback rectangle if image isn't found
  }

  // Text information about the created sword
  fill(255);
  textSize(36);
  textAlign(CENTER);
  text("Your Sword", 350, 400);
  textSize(20);
  fill(selectedHilt.color);
  text(`Hilt: ${selectedHilt.name}`, 350, 430);
  fill(selectedOre.color);
  text(`Ore: ${selectedOre.name}`, 350, 450);
  fill(255);
  text("Press N to create a new sword", 350, 470);

  // External link button for learning more
  fill(50, 100, 200);
  rect(width / 2 - 60, height / 2 + 90, 120, 30, 5);
  fill(255);
  textSize(14);
  text("Learn More", width / 2, height / 2 + 105);

  // Spark animation for effect
  sparkAnimation();
}


// Helper to check if link button is clicked in endGame screen
function checkLinkButtonClick() {
  let buttonX = width / 2 - 60;
  let buttonY = height / 2 + 90;
  let buttonWidth = 120;
  let buttonHeight = 30;
  
  if (mouseX > buttonX && mouseX < buttonX + buttonWidth && mouseY > buttonY && mouseY < buttonY + buttonHeight) {
    window.open('https://www.thecrucible.org/guides/bladesmithing/sword-making/#:~:text=Swordsmithing%20is%20a%20craft%20rooted%20in%20bladesmithing%20and,24%20inches%20long%20to%20craft%20swords%20from%20steel.');
  }
}

function displayFire() {
  // Generate new particles
  if (fireActive) {
    createFireParticles(5); // Create 5 particles each frame while the fire is active
  }
  
  // Display particles
  for (let i = fireParticles.length - 1; i >= 0; i--) {
    let p = fireParticles[i]
    p.y -= random(1, 3); // Particles rise upward
    p.size *= 0.95; // Gradually shrink
    p.opacity -= 4; // Fade out

    // Display the particle with a fire-like color
    fill(255, fireLevel, 0, p.opacity);
    ellipse(p.x, p.y + 20, fireVolume);

    // Remove particles that are no longer visible
    if (p.opacity <= 0 || p.size < 1) {
      fireParticles.splice(i, 1);
    }
  }
}

function createFireParticles(count) {
  for (let i = 0; i < count; i++) {
    fireParticles.push({
      x: 500 + random(-30, 30), // Center around the fire location
      y: 150 + random(-10, 10), // Small random offset for a flickering effect
      size: random(8, 15), // Starting size
      opacity: 255 // Full opacity initially
    });
  }
}

function updateFire() {
  if (fireActive) {
    fireLevel -= fireDiminishRate;
    fireVolume -= fireDiminishRate - 0.32;
    fireLevel = max(fireLevel, 0);
    fireVolume =max(fireVolume, 0);

    // Check if the fire has gone out
    if (fireLevel <= 0) {
      fireActive = false;
      endGame(); // Trigger end game if fire is out
    }
  }
}

function displayWood() {
  fill(139, 69, 19);
  image(woodIMG, wood.x, wood.y, 70, 70);
}

function displaySwordHistory() {
  fill(255);
  textSize(18);
  textAlign(LEFT);
  text("Sword History:", 10, 20);
  textSize(16);
  for (let i = 0; i < swordHistory.length; i++) {
    let sword = swordHistory[i];
    text(`Hilt: ${sword.hilt} + Ore: ${sword.ore}`, 10, 40 + i * 20);
  }
}

function endGame() {
  screen = 4; // Set to Game Over screen
  failureSound.play(); // Play failure sound
  failureSound.setVolume(0.2);
  fireActive = false;
  fill('red');
  textSize(64);
  textAlign(CENTER, CENTER);
  text("Game Over", width / 2, height / 2);
  textSize(18);
  text("The fire has gone out!", width / 2, height / 2 + 50);
  text("Press R to retry", width / 2, height / 2 + 70);
  // Display external link button
  fill(50, 100, 200);
  rect(width / 2 - 60, height / 2 + 90, 120, 30, 5);
  fill(255);
  textSize(14);
  text("Learn More", width / 2, height / 2 + 105);
  noLoop();
}

function restart() {
  selectedHilt = null;
  selectedOre = null;
  screen = 1;
  fireActive = true;
  fireSound.loop(); // Restart fire sound loop
  loop();
}

function restartEnd() {
  selectedHilt = null;
  selectedOre = null;
  screen = 1;
  fireActive = true;
  fireLevel = 255;
  fireVolume = 50;
  fireSound.loop(); // Restart fire sound loop
  loop();
}

function selectHilt() {
  for (let i = 0; i < hilt.length; i++) {
    if (dist(mouseX, mouseY, hilt[i].x, hilt[i].y) < 50) {
      selectedHilt = hilt[i];
      screen = 2;
      anvilSound.play(); // Play anvil sound when selecting hilt
      anvilSound.setVolume(0.5);
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
    if (swordHistory.length > 6) {
        swordHistory.shift(); // Remove the earliest entry
      }
      anvilSound.play(); // Play anvil sound when selecting ore
      anvilSound.setVolume(0.5);
      winSound.play();
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
      if (hiltImages[this.name]) {
        image(hiltImages[this.name], this.x - 20, this.y - 85, 120, 130);
      } else {
      fill(this.color);
      ellipse(this.x, this.y, 40, 70);
      }
      fill(100, 100, 100);
      ellipse(this.x + 42, this.y + 55, 80, 30);
      fill(this.color);
      textSize(16);
      textAlign(CENTER);
      text(this.name, this.x + 42, this.y + 55);
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
      if (oreImages[this.name]) {
        image(oreImages[this.name], this.x - 43, this.y - 110, 150, 180);
      } else {
      fill(this.color);
      ellipse(this.x, this.y, 40, 70);
      }
      fill(100, 100, 100);
      ellipse(this.x + 32, this.y + 55, 80, 30);
      fill(this.color);
      textSize(16);
      textAlign(CENTER);
      text(this.name, this.x + 32, this.y + 55);
    }
  };
}

function createParticleEffect(x, y) {
  for (let i = 0; i < 10; i++) {
    particles.push({ x: random(470, 520), y: random(190, 80), size: random(5, 10), lifetime: 255 });
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
  
  // Update anvil spark particles
  for (let i = anvilSparkParticles.length - 1; i >= 0; i--) {
    let p = anvilSparkParticles[i];
    p.x += p.xSpeed;
    p.y += p.ySpeed;
    p.size *= 0.95; // Shrink gradually
    p.lifetime -= 5; // Fade out gradually

    fill(255, 215, 0, p.lifetime); // Spark color
    ellipse(p.x, p.y, p.size);

    if (p.lifetime <= 0 || p.size < 1) {
      anvilSparkParticles.splice(i, 1);
    }
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

function createSparkEffect(x, y) {
  for (let i = 0; i < 10; i++) {
    anvilSparkParticles.push({
      x: x + random(-20, 20), // Slight random spread around the anvil click position
      y: y + random(-10, 10),
      size: random(3, 6),
      xSpeed: random(-1, 1), // Horizontal movement speed
      ySpeed: random(-2, -1), // Vertical movement speed for upward motion
      lifetime: 255
    });
  }
}