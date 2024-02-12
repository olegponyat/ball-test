var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite,
    Body = Matter.Body;

// create an engine
var engine = Engine.create({
    gravity: { x: 0, y: .4  } // Set gravity in the y-direction
});

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
console.log(window.innerWidth)
var sphere = Bodies.circle(window.innerWidth / 2, window.innerHeight / 2, 20, {
    restitution: 1,
    friction: 0,
    density: 0.002,
    render: {
        fillStyle: 'blue',
    }
});
var box = Bodies.rectangle(1000, 500, 100, 100, {

})
var ground = Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 39, window.innerWidth, 80, {
    isStatic: true,
    render: {
        fillStyle: 'green' // Rectangle color
    }
});

const objects = [sphere, ground, box]
function randomNumberWidth(){
    return (Math.random() * window.innerWidth)
}
function randomPlatform(){
    return (Math.random() * 20).toFixed(0)
}
for( let i=1;i <= randomPlatform(); i++){
    console.log('chat')
    let platform = Bodies.rectangle(randomNumberWidth(),(-i * 100) + 900, 300, 20, {
        isStatic: true,
        render: {
            fillStyle: 'orange'
        }
    })
    objects.push(platform)
}

console.log(objects)
  Composite.add(engine.world, objects);
  
  Render.run(render);
  
  var runner = Runner.create();
  
  Runner.run(runner, engine);
  
  // Apply force to move the sphere
  var forceMagnitude = 0.001;
  var jumpImpulse = -0.065   ; // Adjust jump impulse as needed
  var damping = 0.00007; // Adjust damping factor as needed
  
  // Track keys pressed
  var keysPressed = { up: false, down: false, left: false, right: false, x: false};
  
  // Flag to track if the sphere is in the air
  var isJumping = false;
  
  // Flag to check if the sphere can jump
  let canJump = false;
  
  // Continuous force application
  function applyForces() {
      // Apply horizontal movement force
      Body.applyForce(sphere, sphere.position, { x: forceMagnitude * (keysPressed.right - keysPressed.left), y: 0 });
  
      // Apply damping forces for more realistic movement
      Body.applyForce(sphere, sphere.position, { x: -sphere.velocity.x * damping, y: 0.00001 });
  
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
    function slam() {
        if (keysPressed.down) {
            jumpImpulse = -1; // Adjust the bounce impulse when holding down the down arrow key
            sphere.restitution = 1;
            Body.applyForce(sphere, sphere.position, { x: 0, y: 0.001 });
        } else {
            var jumpImpulse = -0.065 
            sphere.restitution = 0.8;
        }
        requestAnimationFrame(slam);
    }
    function checkBoxCollision() {
        const collisions = Matter.Query.collides(sphere, [box]);
        if (collisions.length > 0 && keysPressed.x) {
            sphere.render.strokeStyle = 'white';
            sphere.restitution = 0.1;
    
            const collision = collisions[0];
            const collisionNormal = collision.normal;
    
            const forceMagnitude = Math.sqrt(collisionNormal.x ** 2 + collisionNormal.y ** 2);
            console.log('Force Magnitude:', forceMagnitude);
    
            const additionalForce = 0.01;
            const scaleFactorSphere = .1; // Adjust this value as needed
            const scaleFactorBox = .8
    
            // Apply a greater force to the sphere
            Body.applyForce(sphere, sphere.position, {
                x: collisionNormal.x * (forceMagnitude + additionalForce) * scaleFactorSphere,
                y: collisionNormal.y * (forceMagnitude + additionalForce) * scaleFactorSphere,
            });
            // Apply a greater force to the box
            Body.applyForce(box, box.position, {
                x: -collisionNormal.x * (forceMagnitude + additionalForce) * scaleFactorBox,
                y: -collisionNormal.y * (forceMagnitude + additionalForce) * scaleFactorBox,
            });
        } else if (!keysPressed.x) {
            sphere.restitution = 0.8;
            sphere.render.strokeStyle = null;
            sphere.render.lineWidth = 0; // Set the width to 0 to remove the outline
        }
        requestAnimationFrame(checkBoxCollision);
    }
    
    
    let colliders = objects.splice(1)
    console.log(colliders)
    // Check for collisions with the ground
    function checkGroundCollision() {
        const collisions = Matter.Query.collides(sphere, colliders);
        if (collisions.length > 0 && !keysPressed.up) {
            canJump = true;
        }

        requestAnimationFrame(checkGroundCollision);
      }
      
      applyForces();
      jump();
      slam();
      checkBoxCollision();
      checkGroundCollision();
      
      document.addEventListener("keydown", function (e) {
          if (e.key === 'ArrowLeft') keysPressed.left = true;
          if (e.key === 'ArrowRight') keysPressed.right = true;
          if (e.key === 'ArrowUp') keysPressed.up = true;
          if (e.key === 'ArrowDown') keysPressed.down = true;
          if (e.key === 'x') keysPressed.x = true
      });
      
      document.addEventListener("keyup", function (e) {
          if (e.key === 'ArrowLeft') keysPressed.left = false;
          if (e.key === 'ArrowRight') keysPressed.right = false;
          if (e.key === 'ArrowUp') keysPressed.up = false;
          if (e.key === 'ArrowDown') keysPressed.down = false;
          if (e.key === 'x') keysPressed.x = false;
      });    