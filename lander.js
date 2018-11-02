const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const gravity = .1;

const ship = {
    width: 10,
    height: 20,
    color: 'white',
    x: (canvas.width - 10) / 2,
    y: (canvas.height - 20) / 2,
    vx: 0,
    vy: 0,
    engineThrust: .3,
    isEngineOn: false,
    angle: 0,
    rotationSpeed: 7,
    cannonLength: 20
};

const createMissile = (ship) => {
    const speed = 10;
    return {
        x: ship.x + ship.width * Math.sin(ship.angle * Math.PI / 180) /2,
        y: ship.y - ship.height * Math.cos(ship.angle * Math.PI / 180) /2,
        angle: ship.angle,
        vx: speed * Math.sin(ship.angle * Math.PI / 180) + ship.vx,
        vy: -speed * Math.cos(ship.angle * Math.PI / 180) - ship.vy,
        color: "green"
    };
};

const missiles = [];

const moon = [];
for (let i = 0; i < canvas.width; i++) {
    if (i === 0) {
        moon[i] = canvas.height - 100;
    } else {
        // moon[i] = canvas.height - 100;
        const step = (Math.random() * 2 - 1 ) * 15;
        let newElevation = Math.min(moon[i-1] + step, canvas.height);
        newElevation = Math.max(newElevation, canvas.height/2 + ship.height/2);
        moon[i] = newElevation;
    }
}

const stars = [];
for (let i = 0; i < canvas.width; i++) {
    stars[i] = [];
    for (let j = 0; j < moon[i]; j++) {

        stars[i][j] = Math.random() < 0.001 ? 1 : 0;
    }
}


const drawShip = (ship, ctx) => {
    ctx.fillStyle = "red";
    // draw the center for the ship
    ctx.fillRect(ship.x, ship.y, 1, 1);

    ctx.save();
    ctx.strokeStyle = ship.color;

    const angle = ship.angle * Math.PI/180;
    ctx.translate(ship.x, ship.y);
    ctx.rotate(angle);

    ctx.strokeRect(-ship.width / 2, -ship.height / 2 , ship.width, ship.height);
    ctx.beginPath();
    ctx.moveTo(0, -ship.height/2);
    ctx.lineTo(0, -ship.cannonLength);
    ctx.stroke();

    if (ship.isEngineOn) {
        const flameLength = 30 + Math.random() * 10;
        ctx.beginPath();
        ctx.moveTo(-ship.width/3, ship.height/2);
        ctx.lineTo(0, flameLength);
        ctx.lineTo(ship.width/3, ship.height/2);
        ctx.stroke();
    }

    ctx.restore();
};

const drawSpace = (canvas, ctx) => {
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
};

const drawMoon = (moon, ctx) => {
    ctx.beginPath();
    ctx.strokeStyle = "#FFFFFF";
    ctx.moveTo(0, moon[0]);
    for (let i=0; i< moon.length; i++) {
        ctx.lineTo(i, moon[i]);
    }
    ctx.stroke();
};


const drawStars = (stars, ctx) => {
    for (let i = 0; i<stars.length; i++) {
        for (let j = 0; j<stars[i].length; j++) {
            if (stars[i][j] === 1) {
                ctx.fillStyle = '#E0E0E0';
                ctx.fillRect(i, j, 1, 1);
            }
        }
    }
};

const drawMissiles = (missiles, ctx) => {
    for (let i = 0; i < missiles.length; i++) {
        const missile = missiles[i];
        ctx.beginPath();

        const len = 20;
        ctx.moveTo(missile.x, missile.y);
        ctx.lineTo(
            missile.x+ len * Math.sin(missile.angle * Math.PI / 180),
            missile.y -  len * Math.cos(missile.angle * Math.PI / 180));
        ctx.strokeStyle = missile.color;
        ctx.stroke();
    }
};

const gameLoop = function() {
    // move ship
    ship.vy -= gravity;
    if (ship.isEngineOn) {
        ship.vy += ship.engineThrust * Math.cos(ship.angle * Math.PI / 180);
        ship.vx += ship.engineThrust * Math.sin(ship.angle * Math.PI / 180);
    }
    ship.y -= ship.vy;
    ship.x += ship.vx;

    // // ship touches moon
    // for (let i=-ship.width/2; i<ship.width/2; i++) {
    //     if (ship.y + ship.height/2 >= moon[Math.floor(i+ship.x/2)]) {
    //         ship.y = ship.height/2 + moon[ship.x];
    //         ship.vy = 0;
    //         ship.vx = 0;
    //         break;
    //     }
    // }

    // ship touches top
    if (ship.y - ship.height/2 <= 0) {
        ship.y = canvas.height/2;
        ship.vy = 0;
        ship.vx = 0;
    }

    // ship touches left
    if (ship.x - ship.width/2 <= 0) {
        ship.x = canvas.width/2;
        ship.y = canvas.height/2;
        ship.vx = 0;
        ship.vy = 0;
    }

    // ship touches rigth
    if (ship.x + ship.width/2 > canvas.width) {
        ship.x = canvas.width/2;
        ship.y = canvas.height/2;
        ship.vx = 0;
        ship.vy = 0;
    }

    // move missiles
    for (var i=0; i<missiles.length; i++) {
        missiles[i].x += missiles[i].vx;
        missiles[i].y += missiles[i].vy;

        // remove offbound missiles
        if (missiles[i].x < 0 ||
            missiles[i].x > canvas.width ||
            missiles[i].y < 0 ||
            missiles[i].y > canvas.height
           ) {
            missiles.splice(i, 1);
        }
    }

    // render
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawSpace(canvas, ctx);
    drawStars(stars, ctx);
    drawMoon(moon, ctx);
    drawShip(ship, ctx);
    drawMissiles(missiles, ctx);
};

document.addEventListener('keydown', (event) => {
    switch (event.keyCode) {
    case 32:  // space
        const missile = createMissile(ship);
        missiles.push(missile);
        break;
    case 37:  // left
        ship.angle -= ship.rotationSpeed;
        break;

    case 39: // right
        ship.angle += ship.rotationSpeed;
        break;

    case 38: // up
        ship.vy += ship.engineThrust;
        ship.isEngineOn = true;
        break;
    }
});


document.addEventListener('keyup', (event) => {
    switch (event.keyCode) {
    case 38: // up
        ship.isEngineOn = false;
        break;
    }
});


// game loop
setInterval(gameLoop, 1000/30);
