var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite,
    Body = Matter.Body;

// create an engine
var engine = Engine.create();

// create a renderer
var render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false // Set to true for wireframe view
    }
});

var sphere = Bodies.circle(window.innerWidth / 2, window.innerHeight / 2, 20, {
    restitution: 0, // Bounciness of the sphere
    render: {
        fillStyle: 'blue',
    }
});
var ground = Bodies.rectangle(window.innerWidth / 2, window.innerHeight - 1, window.innerWidth, 1, {
    isStatic: true,
    render: {
        fillStyle: 'green' // Rectangle color
    }
});
Composite.add(engine.world, [sphere, ground]);

Render.run(render);

var runner = Runner.create();

Runner.run(runner, engine);

// Apply force to move the sphere
var forceMagnitude = 0.01;
var jumpImpulse = -0.09; // Adjust jump impulse as needed
var damping = 0.005; // Adjust damping factor as needed

// Track keys pressed
var keysPressed = { up: false, down: false, left: false, right: false };

// Flag to track if the sphere is in the air
var isJumping = false;

// Flag to check if the sphere can jump
var canJump = true;

// Continuous force application
function applyForces() {
    // Apply horizontal movement force
    Body.applyForce(sphere, sphere.position, { x: forceMagnitude * (keysPressed.right - keysPressed.left), y: 0 });

    // Apply damping forces for more realistic movement
    Body.applyForce(sphere, sphere.position, { x: -sphere.velocity.x * damping, y: 0 });

    requestAnimationFrame(applyForces);
}

// Continuous jump animation
function jump() {
    if (keysPressed.up && canJump) {
        Body.applyForce(sphere, sphere.position, { x: 0, y: jumpImpulse });
        canJump = false;
    }

    requestAnimationFrame(jump);
}

// Check for collisions with the ground
function checkGroundCollision() {
    const collisions = Matter.Query.collides(sphere, [ground]);
    if (collisions.length > 0 && !keysPressed.up) {
        canJump = true;
    }

    requestAnimationFrame(checkGroundCollision);
}

// Start applying forces, jump animation, and ground collision check
applyForces();
jump();
checkGroundCollision();

document.addEventListener("keydown", function (e) {
    if (e.key === 'ArrowLeft') keysPressed.left = true;
    if (e.key === 'ArrowRight') keysPressed.right = true;
    if (e.key === 'ArrowUp') keysPressed.up = true;
});

document.addEventListener("keyup", function (e) {
    if (e.key === 'ArrowLeft') keysPressed.left = false;
    if (e.key === 'ArrowRight') keysPressed.right = false;
    if (e.key === 'ArrowUp') keysPressed.up = false;
});
