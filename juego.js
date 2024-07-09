document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('flappyBirdGame');
    const ctx = canvas.getContext('2d');
    let gameInterval;
    let player;
    let obstacles = [];
    let gameSpeed = 2;
    let gravity = 0.2;
    let frame = 0;
    let obstacleInterval = 150;
    let score = 0;
    let lastObstacleTime = 0;
    let obstacleGenerationInterval = 2000;

    // Imágenes
    let playerImg = new Image();
    playerImg.src = '/multimedia/platypus_1.png';

    let obstacleImg = new Image();
    obstacleImg.src = '/multimedia/torree1.png';

    let backgroundImg = new Image();
    backgroundImg.src = '/multimedia/3224668.jpg';

    document.getElementById('playButton').addEventListener('click', function () {
        this.style.display = 'none'; // Esconde el botón cuando el juego comienza
        document.getElementById('flappyBirdGame').hidden = false;
        startGame();
    });

    canvas.addEventListener('click', function () {
        if (player) {
            player.jump();
        }
    });

    function startGame() {
        const playButton = document.getElementById('playButton');
        playButton.src = '/multimedia/retry-1.png'; // Cambia la imagen a la nueva después de iniciar el juego

        isGameOver = false;
        canvas.width = document.getElementById('gameContainer').offsetWidth;
        canvas.height = 200;
        player = new Player();
        obstacles = [];
        frame = 0;
        score = 0;
        gameSpeed = 2;  // Reinicia la velocidad del juego al valor inicial
        gameInterval = setInterval(updateGameArea, 20);
    }
    function addObstacles() {
        let gap = 100; // Espacio fijo por el que el jugador debe pasar
        let minHeight = 20; // Altura mínima para el obstáculo superior
        let maxHeight = (canvas.height - gap) / 2; // La altura máxima depende de la mitad de la altura del canvas menos el espacio del gap
        let upperHeight = Math.floor(Math.random() * (maxHeight - minHeight) + minHeight);
        let lowerHeight = canvas.height - gap - upperHeight;
    
        let obstacleWidth = 20; // Aumenta el ancho de los obstáculos aquí
    
        obstacles.push(new Obstacle(canvas.width, 0, obstacleWidth, upperHeight, 'green')); // Obstáculo superior
        obstacles.push(new Obstacle(canvas.width, upperHeight + gap, obstacleWidth, lowerHeight, 'green')); // Obstáculo inferior
    }
    

    function updateGameArea() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Dibuja el fondo
        ctx.drawImage(backgroundImg, 0, 0, canvas.width, canvas.height)

        let currentTime = Date.now();
        // Ajustar el intervalo de generación basado en la velocidad del juego
        let adjustedGenerationInterval = Math.max(1000, 2000 - (gameSpeed - 2) * 200);

        if (currentTime - lastObstacleTime > adjustedGenerationInterval) {
            lastObstacleTime = currentTime;
            addObstacles();
        }

        player.newPos();
        player.update();
        updateObstacles();

        obstacles.forEach(obstacle => {
            if (obstacle.x + obstacle.width < player.x && !obstacle.scoreCounted) {
                score += 100;
                obstacle.scoreCounted = true;
                increaseGameSpeed();
            }
        });

        checkGameOver();
        displayScore();
    }

    function Player() {
        this.width = 50;
        this.height = 50;
        this.x = 20;
        this.y = canvas.height / 2 - this.height / 2;
        this.gravitySpeed = 0;
        this.jumpStrength = -3.5; // Reduce la magnitud del salto para hacerlo más lento y menos potente

        this.update = function () {
            ctx.drawImage(playerImg, this.x, this.y, this.width, this.height);
        };

        this.newPos = function () {
            this.gravitySpeed += gravity;
            this.y += this.gravitySpeed;
            this.hitBottom();
        };

        this.jump = function () {
            this.gravitySpeed = this.jumpStrength;
        };

        this.hitBottom = function () {
            if (this.y > canvas.height - this.height) {
                this.y = canvas.height - this.height;
                this.gravitySpeed = 0;
                gameOver(); // Llama a gameOver cuando el jugador toca el suelo
            }
        };
    }




    function updateObstacles() {
        for (let i = 0; i < obstacles.length; i++) {
            obstacles[i].x -= gameSpeed; // Mueve cada obstáculo hacia la izquierda
            obstacles[i].draw();
        }

        obstacles = obstacles.filter(obstacle => obstacle.x + obstacle.width > 0); // Elimina los obstáculos que salen del canvas
    }

    function increaseGameSpeed() {
        // Aumenta la velocidad cada 500 puntos y asegúrate de que la puntuación no sea 0
        if (score % 500 === 0 && score !== 0) {
            gameSpeed += 0.75;  // Incrementa la velocidad en 0.05, un cambio más sutil
        }
    }

    function Obstacle(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.draw = function() {
        // Dibuja la imagen del obstáculo en lugar de un rectángulo
        ctx.drawImage(obstacleImg, this.x, this.y, this.width, this.height);
    };
}


    function displayScore() {
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.fillText("Score: " + score, 10, 20); // Muestra la puntuación en la esquina superior izquierda
    }

    function checkGameOver() {
        // Margen interno para la hitbox
        const margin = 15; // Este valor ajusta el margen interno de la hitbox

        // Ajustar las coordenadas para la hitbox del jugador con margen
        const playerBottom = player.y + player.height - margin;
        const playerTop = player.y + margin;

        // Verificar si el jugador toca el techo
        if (playerTop <= 0) {
            gameOver();
            return; // Finaliza el juego si toca el techo
        }

        // Verificar si el jugador toca el suelo
        if (playerBottom >= canvas.height) {
            gameOver();
            return; // Finaliza el juego si toca el suelo
        }

        // Verificar colisiones con obstáculos
        obstacles.forEach(obstacle => {
            const obstacleBottom = obstacle.y + obstacle.height;
            const obstacleRight = obstacle.x + obstacle.width;
            const obstacleTop = obstacle.y;
            const obstacleLeft = obstacle.x;

            // Verificar la colisión considerando el margen
            if (player.x + player.width - margin > obstacleLeft &&
                player.x + margin < obstacleRight &&
                playerTop < obstacleBottom &&
                playerBottom > obstacleTop) {
                gameOver();
                return; // Finaliza el juego si hay colisión con algún obstáculo
            }
        });
    }




    function gameOver() {
        clearInterval(gameInterval);
        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        // Ajustar la posición del texto para que aparezca en el centro superior
        ctx.fillText("Juego Terminado! Score: " + score, canvas.width / 2 - 120, 30); // '30' coloca el texto cerca del borde superior
        isGameOver = true;
        document.getElementById('playButton').style.display = 'block'; // Muestra el botón nuevamente
    }



});
