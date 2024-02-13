var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite,
    Body = Matter.Body;

var engine = Engine.create({
    gravity: { x: 0, y: .2  } // Set gravity in the y-direction
});

// create a renderer
var render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false, // Set to true for wireframe view
        pixelRatio: 'auto' // Adjust pixelRatio to fix white corners
    }
});
console.log(window.innerWidth)
var sphere = Bodies.circle(window.innerWidth / 2, window.innerHeight / 2, 20, {
    restitution: .4,
    friction: 0,
    density: 0.002,
    frictionAir: .008, // Adjust air friction for sliding
    render: {
        fillStyle: 'blue',
    }
});
var box = Bodies.rectangle(window.innerWidth/2, 500, 200, 200, {
    density: .1,
    render: {
        fillStyle: 'pink'
    }
})
var leftborder = Bodies.rectangle(0,window.innerHeight-480,1,window.innerHeight,{
    isStatic: true,
    render: {
        fillStyle: 'green' // Rectangle color
    }
})
var rightborder = Bodies.rectangle(window.innerWidth,(window.innerHeight-480),1,window.innerHeight,{
    isStatic: true,
    render: {
        fillStyle: 'green' // Rectangle color
    }
})
var ceiling = Bodies.rectangle(960,1,window.innerWidth,1,{
    isStatic: true,
    render: {
        fillStyle: 'pink' // Rectangle color
    }
})
var ground = Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 39, window.innerWidth, 80, {
    isStatic: true,
    render: {
        fillStyle: 'green' // Rectangle color
    }
});

const objects = [sphere, box, ground, leftborder, rightborder, ceiling]
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
  let jumpImpulse = -0.045   ; // Adjust jump impulse as needed
  var damping = 0.00007; // Adjust damping factor as needed
  
  // Track keys pressed
  var keysPressed = { up: false, down: false, left: false, right: false, x: false, c: false, f: false};
  
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
            jumpImpulse = -0.06; // Adjust the bounce impulse when holding down the down arrow key
            sphere.restitution = 1;
            Body.applyForce(sphere, sphere.position, { x: 0, y: 0.0008 });
        } else {
            jumpImpulse = -0.045 
            sphere.restitution = 0.4;
        }
        requestAnimationFrame(slam);
    }
    function checkBoxCollision() {
        const collisions = Matter.Query.collides(sphere, [box]);
        if(keysPressed.x){
            sphere.render.strokeStyle = 'white';
            sphere.restitution = 0;
        }
        if (collisions.length > 0 && keysPressed.x) {
            sphere.render.strokeStyle = 'white';
            sphere.restitution = 0;
    
            const collision = collisions[0];
            const collisionNormal = collision.normal;
    
            const forceMagnitude = Math.sqrt(collisionNormal.x ** 2 + collisionNormal.y ** 2);
            console.log('Force Magnitude:', forceMagnitude);
    
            const additionalForce = 0.01;
            const scaleFactorSphere = .1; // Adjust this value as needed
            const scaleFactorBox = 2
    
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
    function applyGliding() {
        const glideForce = .0024; // Adjust the glide force as needed
        let glideTime = 3000
        if (keysPressed.c) {
            glideTime = 3000
            const glideImage = 'https://static.wikia.nocookie.net/minecraft_gamepedia/images/1/1f/Elytra_%28item%29_JE1_BE1.png/revision/latest?cb=20190502042255';
            sphere.render.sprite.texture = glideImage;
            if (sphere.velocity.y > 0) {
                Body.applyForce(sphere, sphere.position, { x: 0, y: -glideForce });
                setTimeout(() => {
                    sphere.render.sprite.texture = null;
                    keysPressed.c = false; // Release the gliding key                
                }, glideTime);
                glideTime = 3000
            }else{
                sphere.render.sprite.texture = null;
                Body.setVelocity(sphere, { x: sphere.velocity.x, y: 0 });
                glideTime = 3000    
            }
        }else{
            sphere.render.sprite.texture = null;
            glideTime = 3000 
        }
    
        requestAnimationFrame(applyGliding);
    }
    const platforms = objects.slice(6, objects.length);
    const defaultCollisionMask = sphere.collisionFilter.mask;

    function phase() {
        if (keysPressed.f) {
            // Disable collisions for the sphere with all objects in colliders array
            platforms.forEach(object => {
                console.log('Disabling collisions for:', object);
                object.collisionFilter.mask = 0;  // Set the mask to 0 to disable collisions
            });
            sphere.render.opacity = 0.5;  // Adjust opacity when phasing
        } else {
            // Enable collisions for the sphere with all objects in colliders array
            platforms.forEach(object => {

                object.collisionFilter.mask = defaultCollisionMask;  // Reset the mask to default
            });
            sphere.render.opacity = 1;  // Reset opacity
        }

        requestAnimationFrame(phase);
    }
    function shakeScreen() {
        const shakeMagnitude = 1.5; // Adjust the magnitude of the shake
        const originalTransform = render.canvas.style.transform;
    
        const startTime = Date.now();
        const duration = 500; // Adjust the duration of the shake effect in milliseconds
    
        // Function to calculate the smooth shake effect
        function calculateShake(offset, magnitude) {
            const time = Date.now() - startTime;
            const angle = (time / duration) * Math.PI * 2; // Use a full sine wave for the duration
    
            return Math.sin(angle) * magnitude * (1 - time / duration);
        }
    
        // Apply the smooth shake effect to the canvas position
        function updateShake() {
            const offsetX = calculateShake(0, shakeMagnitude);
            const offsetY = calculateShake(1, shakeMagnitude);
    
            render.canvas.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    
            // Continue updating the shake effect until the duration is reached
            if (Date.now() - startTime < duration) {
                requestAnimationFrame(updateShake);
            } else {
                // Reset the transform after the duration to stop the shake effect
                render.canvas.style.transform = originalTransform;
            }
        }
    
        // Start the smooth shake effect
        updateShake();
    }

    const colliders = objects.slice(2,objects.length)
    console.log(colliders)
    function checkGroundCollision() {
        const collisions = Matter.Query.collides(sphere, colliders);
        if (collisions.length > 0 && !keysPressed.up) {
            canJump = true;
            if(sphere.velocity.y < -8) {
                console.log(sphere.velocity.y)
                shakeScreen()
            }
        }

        requestAnimationFrame(checkGroundCollision);
      }
      
      applyForces();
      jump();
      slam();
      checkBoxCollision();
      applyGliding();
      phase();
      checkGroundCollision();
      
      document.addEventListener("keydown", function (e) {
          if (e.key === 'ArrowLeft') keysPressed.left = true;
          if (e.key === 'ArrowRight') keysPressed.right = true;
          if (e.key === 'ArrowUp') keysPressed.up = true;
          if (e.key === 'ArrowDown') keysPressed.down = true;
          if (e.key === 'x') keysPressed.x = true;
          if (e.key === 'c') keysPressed.c = true;
          if (e.key === 'f') keysPressed.f = true;
      });
      
      document.addEventListener("keyup", function (e) {
          if (e.key === 'ArrowLeft') keysPressed.left = false;
          if (e.key === 'ArrowRight') keysPressed.right = false;
          if (e.key === 'ArrowUp') keysPressed.up = false;
          if (e.key === 'ArrowDown') keysPressed.down = false;
          if (e.key === 'x') keysPressed.x = false;
          if (e.key === 'c') keysPressed.c = false;
          if (e.key === 'f') keysPressed.f = false;
      });    

