var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Composite = Matter.Composite,
    Body = Matter.Body;

var engine = Engine.create({
    gravity: { x: 0, y: .15} 
});


var render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: window.innerWidth,
        height: window.innerHeight,
        wireframes: false, 
        pixelRatio: '1' 
    }
});
var sphere = Bodies.circle(window.innerWidth / 2, window.innerHeight / 2, 20, {
    restitution: 1,
    friction: 0,
    density: 0.002,
    frictionAir: .008, 
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
        fillStyle: 'green' 
    }
})
var rightborder = Bodies.rectangle(window.innerWidth,(window.innerHeight-480),1,window.innerHeight,{
    isStatic: true,
    render: {
        fillStyle: 'green' 
    }
})
var ceiling = Bodies.rectangle(960,1,window.innerWidth,1,{
    isStatic: true,
    render: {
        fillStyle: 'pink' 
    }
})
var ground = Bodies.rectangle(window.innerWidth / 2, window.innerHeight + 39, window.innerWidth, 80, {
    isStatic: true,
    render: {
        fillStyle: 'green' 
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
  
  
  var forceMagnitude = 0.0005;
  let jumpImpulse = -0.08   ; 
  var damping = 0.00007; 
  
  
  var keysPressed = { up: false, down: false, left: false, right: false, x: false, c: false, f: false};
  
  
  var isJumping = false;
  
  
  let canJump = false;
  
  
  function applyForces() {
      
      Body.applyForce(sphere, sphere.position, { x: forceMagnitude * (keysPressed.right - keysPressed.left), y: 0 });
  
      
      Body.applyForce(sphere, sphere.position, { x: -sphere.velocity.x * damping, y: 0.00001 });
   
      requestAnimationFrame(applyForces);
  }
  
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
    let collisionLine = null; 
    let oval = null

    function updateSphere() {
        
        applyForces();  
        jump();         
        slam();         
    
        
        
        Matter.Engine.update(engine, 1000 / 60); 
    }

    function checkBoxCollision() {
        const collisions = Matter.Query.collides(sphere, [box]);
        sphere.render.strokeStyle = 'white';
        sphere.render.lineWidth = 5;    sphere.restitution = 0;
        if (collisions.length > 0 && keysPressed.x) {
            sphere.render.strokeStyle = 'white';
    
            const collision = collisions[0];
            const collisionPoint = collision.bodyB.position; 
            const collisionNormal = collision.normal;
    
            const forceMagnitude = Math.sqrt(collisionNormal.x ** 2 + collisionNormal.y ** 2);
            console.log('Force Magnitude:', forceMagnitude);
    
            const additionalForce = 0.01;
            const scaleFactorSphere = 0.125; 
            const scaleFactorBox = 0.125;
    
            
            Body.applyForce(sphere, sphere.position, {
                x: collisionNormal.x * (forceMagnitude + additionalForce) * scaleFactorSphere,
                y: collisionNormal.y * (forceMagnitude + additionalForce) * scaleFactorSphere,
            });
    
            
            Body.applyForce(box, box.position, {
                x: -collisionNormal.x * (forceMagnitude + additionalForce) * scaleFactorBox,
                y: -collisionNormal.y * (forceMagnitude + additionalForce) * scaleFactorBox,
            });
    
            
            if (collisionLine) {
                Composite.remove(engine.world, collisionLine);
            }
            if (oval) {
                Composite.remove(engine.world, oval)
            }
    
            
            const lineLength = 100;
            const lineThickness = 10;
            const fadeDuration = 500; 
    
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

            
            Composite.add(engine.world, [collisionLine, oval]);
    
            
            const startTime = Date.now();
    
            function updateFade() {
                if (!collisionLine) {
                    return; 
                }
                if (!oval) {
                    return;
                }

                const elapsed = Date.now() - startTime;
                const alpha = 1 - Math.min(1, elapsed / fadeDuration); 
    
                
                collisionLine.render.fillStyle = `rgba(255, 255, 255, ${alpha})`
                oval.render.fillStyle = `rgba(255,255,255, ${alpha})`
    
                const scaleFactor = 1 + .1 * alpha; 
                Body.scale(oval, 1.01, 1.01);

                if (elapsed < fadeDuration) {
                    requestAnimationFrame(updateFade);
                }else {
                    
                    Composite.remove(engine.world, [collisionLine, oval]);
                    oval = null;
                    collisionLine = null;
                }   
            }

            function shakeScreen() {
                const shakeMagnitude = 5; 
                const originalTransform = render.canvas.style.transform;
            
                const startTime = Date.now();
                const duration = 500; 
            
                
                function calculateShake(offset, magnitude) {
                    const time = Date.now() - startTime;
                    const angle = (time / duration) * Math.PI * 2; 
            
                    return Math.sin(angle) * magnitude * (1 - time / duration);
                }

                
                function updateShake() {
                    const offsetX = calculateShake(1, shakeMagnitude);
                    const offsetY = calculateShake(1, shakeMagnitude);
            
                    render.canvas.style.transform = `translate(${offsetX}px, ${-offsetY}px)`;
            
                    
                    if (Date.now() - startTime < duration) {
                        requestAnimationFrame(updateShake);
                    } else {
                        
                        render.canvas.style.transform = originalTransform;
                    }
                }
            
                
                updateShake();
            }
            shakeScreen()            
            updateFade();
            var audio = new Audio('fart.wav')
            audio.play()
        } else if (!keysPressed.x) {
            
            sphere.restitution = .8;
            sphere.render.strokeStyle = null;
            sphere.render.lineWidth = 0; 
            if (collisionLine) {
                Composite.remove(engine.world, [collisionLine, oval]);
                oval = null
                collisionLine = null;
            }
        }
    
        requestAnimationFrame(checkBoxCollision);
    }
    
    function applyGliding() {
        const glideForce = 0.00033; 

        if (keysPressed.c && !canJump) {
            if (sphere.velocity.y > 0) {
                Body.applyForce(sphere, sphere.position, { x: 0, y: -glideForce });
                let glideTime = 10000;
                setTimeout(() => {
                    sphere.render.sprite.texture = null;
                    keysPressed.c = false; 

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
            
            sphere.collisionFilter.mask = 0
            function canCollide(){
                if(Matter.Query.collides(sphere, [ground,leftborder,rightborder,ceiling]).length > 0){
                    sphere.collisionFilter.mask = defaultCollisionMask
                }
            }
            canCollide()

            sphere.render.opacity = 0.5;  
        } else {
            sphere.collisionFilter.mask = defaultCollisionMask

            sphere.render.opacity = 1;  
        }

        requestAnimationFrame(phase);
    }
    function shakeScreen() {
        const shakeMagnitude = 1.5; 
        const originalTransform = render.canvas.style.transform;
    
        const startTime = Date.now();
        const duration = 500; 
    
        
        function calculateShake(offset, magnitude) {
            const time = Date.now() - startTime;
            const angle = (time / duration) * Math.PI * 2; 
    
            return Math.sin(angle) * magnitude * (1 - time / duration);
        }
    
        
        function updateShake() {
            const offsetX = calculateShake(0, shakeMagnitude);
            const offsetY = calculateShake(1, shakeMagnitude);
    
            render.canvas.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
    
            
            if (Date.now() - startTime < duration) {
                requestAnimationFrame(updateShake);
            } else {
                
                render.canvas.style.transform = originalTransform;
            }
        }
    
        
        updateShake();
    }
    var trailPoints = [];

    
    function sandevistanEffect() {
        if (keysPressed.m) {
            
            engine.timing.timeScale = 0.2;
        } else {
            engine.timing.timeScale = 1;
        }

        
        if (keysPressed.m) {
            var now = Date.now();
            var hue = (now / 10) % 360;
            trailPoints.push({ x: sphere.position.x, y: sphere.position.y, time: now, hue: hue });
        }

        
        var cutoff = Date.now() - 500;
        trailPoints = trailPoints.filter(pt => pt.time > cutoff);

        
        var context = render.context;
        context.save();
        trailPoints.forEach(pt => {
            var age = Date.now() - pt.time;
            var alpha = 1 - (age / 500);
            context.fillStyle = `hsla(${pt.hue}, 100%, 50%, ${alpha})`;
            context.beginPath();
            context.arc(pt.x, pt.y, 10, 0, Math.PI * 2);
            context.fill();
        });
        context.restore();
        updateSphere();
        
        requestAnimationFrame(sandevistanEffect);
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
      sandevistanEffect();

      document.addEventListener("keydown", function (e) {
          if (e.key === 'ArrowLeft') keysPressed.left = true;
          if (e.key === 'ArrowRight') keysPressed.right = true;
          if (e.key === 'ArrowUp') keysPressed.up = true;
          if (e.key === 'ArrowDown') keysPressed.down = true;
          if (e.key === 'x') keysPressed.x = true;
          if (e.key === 'c') keysPressed.c = true;
          if (e.key === 'f') keysPressed.f = true;
          if (e.key === 'm') keysPressed.m = true;
      });
      
      document.addEventListener("keyup", function (e) {
          if (e.key === 'ArrowLeft') keysPressed.left = false;
          if (e.key === 'ArrowRight') keysPressed.right = false;
          if (e.key === 'ArrowUp') keysPressed.up = false;
          if (e.key === 'ArrowDown') keysPressed.down = false;
          if (e.key === 'x') keysPressed.x = false;
          if (e.key === 'c') keysPressed.c = false;
          if (e.key === 'f') keysPressed.f = false;
          if (e.key === 'm') keysPressed.m = false;
      });    

