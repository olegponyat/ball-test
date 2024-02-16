var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite,
    Body = Matter.Body;

var engine = Engine.create({
    gravity: { x: 0, y: .1  } // Set gravity in the y-direction
});

// create a renderer
var render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false, // Set to true for wireframe view
        pixelRatio: '1' // Adjust pixelRatio to fix white corners
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
var box = Bodies.circle(window.innerWidth/2, 500, 20, {
    density: .001,
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
  var forceMagnitude = 0.0005;
  let jumpImpulse = -0.08   ; // Adjust jump impulse as needed
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
          function createSmoke(x, y) {
            function getRandomNumber() {
                return Math.floor(Math.random() * 15)
            }
            var smokeParticle = Bodies.circle(x, y, Math.random() * 10 + 5, {
                collisionFilter: false,
                render: {
                    fillStyle: 'rgba(255,255,255,0.5)'
                }
            });
            let particles = []
            for(let i = 0; i < getRandomNumber(); i++ ){
                particles.push(smokeParticle)
            }
        
            Composite.add(engine.world, particles);

            setTimeout(function() {
                Composite.remove(engine.world, smokeParticle);
            }, 400);
        
            // Apply a small random force to the particle to make it "rise"
            Body.applyForce(smokeParticle, smokeParticle.position, {
                x: (Math.random() - 0.5) * 0.02,
                y: -Math.random() * 0.02
            });
        }
        createSmoke(sphere.position.x, sphere.position.y)
      }
      requestAnimationFrame(jump);
    }
    function slam() {
        if (keysPressed.down) {
            
            sphere.restitution = .3;
            Body.applyForce(sphere, sphere.position, { x: 0, y: 0.0008 });
        } else {
            jumpImpulse = -0.05
            sphere.restitution = 0.4;
        }
        requestAnimationFrame(slam);
    }
    let collisionLine = null; // Declare the collisionLine variable outside the function
    let oval = null

    function checkBoxCollision() {
        const collisions = Matter.Query.collides(sphere, [box]);
    
        if (collisions.length > 0 && keysPressed.x) {
            sphere.render.strokeStyle = 'white';
            sphere.restitution = 0;
    
            const collision = collisions[0];
            const collisionPoint = collision.bodyB.position; // Collision point
            const collisionNormal = collision.normal;
    
            const forceMagnitude = Math.sqrt(collisionNormal.x ** 2 + collisionNormal.y ** 2);
            console.log('Force Magnitude:', forceMagnitude);
    
            const additionalForce = 0.01;
            const scaleFactorSphere = 0.125; // Adjust this value as needed
            const scaleFactorBox = 0.125;
    
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
    
            // Remove the previous collision line if it exists
            if (collisionLine) {
                Composite.remove(engine.world, collisionLine);
            }
            if (oval) {
                Composite.remove(engine.world, oval)
            }
    
            // Create a new collision line based on the collision normal
            const lineLength = 100;
            const lineThickness = 10;
            const fadeDuration = 500; // .5 seconds
    
            const lineStart = {
                x: collisionPoint.x - collisionNormal.x * lineLength / 2,
                y: collisionPoint.y - collisionNormal.y * lineLength / 2,
            };
    
            collisionLine = Bodies.rectangle(lineStart.x, lineStart.y, lineLength, lineThickness, {
                angle: Math.atan2(collisionNormal.y, collisionNormal.x),
                isStatic: true,
                collisionFilter: false,
                render: { fillStyle: 'white' },
            });

            const ovalPosition = {
                x: lineStart.x + Math.cos(collisionLine.angle) * lineLength / 2,
                y: lineStart.y + Math.sin(collisionLine.angle) * lineLength / 2,
            };

            oval = Bodies.circle(ovalPosition.x, ovalPosition.y, 20, {
                isStatic: true,
                collisionFilter: false,
                render: { fillStyle: 'white' },
            });

            Body.scale(oval, 1, 0.3)
            Body.setAngle(oval, collisionLine.angle + Math.PI / 2);

            // Add the collision line to the world
            Composite.add(engine.world, [collisionLine, oval]);
    
            // Fade out the opacity over time
            const startTime = Date.now();
    
            function updateFade() {
                if (!collisionLine) {
                    return; // Stop the fade if collisionLine is null
                }
                if (!oval) {
                    return;
                }

                const elapsed = Date.now() - startTime;
                const alpha = 1 - Math.min(1, elapsed / fadeDuration); // Calculate alpha based on elapsed time
    
                // Update the fillStyle with the new alpha value
                collisionLine.render.fillStyle = `rgba(255, 255, 255, ${alpha})`
                oval.render.fillStyle = `rgba(255,255,255, ${alpha})`
    
                const scaleFactor = 1 + .1 * alpha; // Adjust the scale factor as needed
                Body.scale(oval, 1.01, 1.01);

                if (elapsed < fadeDuration) {
                    requestAnimationFrame(updateFade);
                }else {
                    // Animation complete, remove the line and oval
                    Composite.remove(engine.world, [collisionLine, oval]);
                    oval = null;
                    collisionLine = null;
                }   
            }

            function shakeScreen() {
                const shakeMagnitude = 5; // Adjust the magnitude of the shake
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
                    const offsetX = calculateShake(1, shakeMagnitude);
                    const offsetY = calculateShake(1, shakeMagnitude);
            
                    render.canvas.style.transform = `translate(${offsetX}px, ${-offsetY}px)`;
            
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
            shakeScreen()            
            updateFade();
            var audio = new Audio('fart.wav')
            audio.play()
        } else if (!keysPressed.x) {
            
            sphere.restitution = 0.8;
            sphere.render.strokeStyle = null;
            sphere.render.lineWidth = 0; // Set the width to 0 to remove the outline
            if (collisionLine) {
                Composite.remove(engine.world, [collisionLine, oval]);
                oval = null
                collisionLine = null;
            }
        }
    
        requestAnimationFrame(checkBoxCollision);
    }
    
    function applyGliding() {
        const glideForce = 0.0002; // Adjust the glide force as needed
        let glideTime = 3000;
    
        if (keysPressed.c && !canJump) {
            const glideImage =
                'ballelytra.png'
            sphere.render.sprite.texture = glideImage;
    
    
            if (sphere.velocity.y > 0) {
                Body.applyForce(sphere, sphere.position, { x: 0, y: -glideForce });
    
                setTimeout(() => {
                    sphere.render.sprite.texture = null;
                    keysPressed.c = false; // Release the gliding key
                }, glideTime);
            } else {
                Body.setVelocity(sphere, { x: sphere.velocity.x, y: 0 });
                sphere.render.sprite.texture = null;
            }
        } else {
            sphere.render.sprite.texture = null;

        }
    
        requestAnimationFrame(applyGliding);
    }
    const platforms = objects.slice(0,2);
    console.log(platforms)
    const defaultCollisionMask = sphere.collisionFilter.mask;

    function phase() {
        if (keysPressed.f) {
            // Disable collisions for the sphere with all objects in colliders array
            sphere.collisionFilter.mask = 0
            function canCollide(){
                if(Matter.Query.collides(sphere, [ground,leftborder,rightborder,ceiling]).length > 0){
                    sphere.collisionFilter.mask = defaultCollisionMask
                }
            }
            canCollide()

            sphere.render.opacity = 0.5;  // Adjust opacity when phasing
        } else {
            sphere.collisionFilter.mask = defaultCollisionMask

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

