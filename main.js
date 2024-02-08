document.addEventListener("DOMContentLoaded", function () {
    const sphere = document.getElementById("sphere");
  
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
  
    let posX = 0;
    let posY = 0;
  
    let speedX = 0;
    let speedY = 0;
  
    const maxSpeed = 5;
  
    const pressedKeys = {};
  
    let isAnimating = false;
  
    const obstacles = document.querySelectorAll(".obstacle");

    function updatePosition() {
      sphere.style.transform = `translate(${posX}px, ${posY}px)`;
    }
  
    function checkCollision() {
        posX = Math.max(0, Math.min(posX, screenWidth - sphere.clientWidth));
        posY = Math.max(0, Math.min(posY, screenHeight - sphere.clientHeight));
      
        for (const obstacle of obstacles) {
          const obstacleLeft = obstacle.offsetLeft;
          const obstacleRight = obstacleLeft + obstacle.offsetWidth;
          const obstacleTop = obstacle.offsetTop;
          const obstacleBottom = obstacleTop + obstacle.offsetHeight;
      
          if (
            posX < obstacleRight &&
            posX + sphere.clientWidth > obstacleLeft &&
            posY < obstacleBottom &&
            posY + sphere.clientHeight > obstacleTop
          ) {
            const overlapLeft = posX + sphere.clientWidth - obstacleLeft;
            const overlapRight = obstacleRight - posX;
            const overlapTop = posY + sphere.clientHeight - obstacleTop;
            const overlapBottom = obstacleBottom - posY;
      
            const minOverlapX = Math.min(overlapLeft, overlapRight);
            const minOverlapY = Math.min(overlapTop, overlapBottom);
      
            if (minOverlapX < minOverlapY) {
              if (overlapLeft < overlapRight) {
                posX -= overlapLeft;
              } else {
                posX += overlapRight;
              }
            } else {
              if (overlapTop < overlapBottom) {
                posY -= overlapTop;
              } else {
                posY += overlapBottom;
              }
            }
          }
        }
      }
      
    function setSpeed() {
      speedX = 0;
      speedY = 0;
  
      if (pressedKeys.ArrowRight) speedX += maxSpeed;
      if (pressedKeys.ArrowLeft) speedX -= maxSpeed;
      if (pressedKeys.ArrowDown) speedY += maxSpeed;
      if (pressedKeys.ArrowUp) speedY -= maxSpeed;
  
      const magnitude = Math.sqrt(speedX ** 2 + speedY ** 2);
      if (magnitude > maxSpeed) {
        const scaleFactor = maxSpeed / magnitude;
        speedX *= scaleFactor;
        speedY *= scaleFactor;
      }
      console.log(`Velocity: X=${speedX}, Y=${speedY}`);
    }
  
    function moveSphere() {
      if (isAnimating) return;
      isAnimating = true;
  
      posX += speedX;
      posY += speedY;
  
      checkCollision();
      updatePosition();
      requestAnimationFrame(() => {
        isAnimating = false;
        moveSphere();
      });
    }
  
    document.addEventListener("keydown", function (e) {
      if (!pressedKeys[e.key]) {
        pressedKeys[e.key] = true;
  
        setSpeed();
        moveSphere();
      }
    });

    document.addEventListener("keyup", function (e) {
      pressedKeys[e.key] = false;
  
      setSpeed();
    });

    
  });
  