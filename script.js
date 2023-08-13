const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

const ball_initial_speed = 200;

const display_text1 = document.getElementById('display-text-1');
const display_text2 = document.getElementById('display-text-2');

const ball = {
    x: canvas.width/2,
    y: canvas.height/2,
    r:5,
    v: ball_initial_speed,
    theta: 0,
    color: "white",
    get vx() {
        return this.v * Math.cos(this.theta);
    },
    get vy() {
        return this.v * Math.sin(this.theta);
    }
};

const time = {
    curr: new Date() / 1000,
    past: new Date() / 1000,
    update() {
        this.past = this.curr;
        this.curr = new Date() / 1000;
    },
    get dt() {
        return this.curr - this.past > 0.3 ? 0 : this.curr - this.past;
    }
}

const rightPaddle = { // x and y are the center of the rectangle
    x: canvas.width - 20,
    y: canvas.height / 2,
    w: 10,
    h: 150,
    color: "white"
}

const leftPaddle = {
    x: 20,
    y: canvas.height / 2,
    w: 10,
    h: 150,
    color: "white"
}

const MAX_BOUNCE_ANGLE = 75 * Math.PI / 180; // teach them quickly about radian and degree conversions
const PADDLE_SPEED = 300;

const keys = {
    w: false,
    s: false,
    arrowup: false,
    arrowdown: false
}

let player1_wins = 0;
let player2_wins = 0;

const ball_speed_up = 10; // each time it bounces off a paddle, the speed increases by this amount

function init() {
    document.addEventListener('keydown', (e) => {
        const key = e.key.toLowerCase();

        // show them first how, if i simply do: `if (e.key === 'w') leftPaddle.y += PADDLE_SPEED * time.dt;`, then there is a slight pause when u hold it in the beginning
        // thats why i need to do it this way so there is no pause

        if (key === 'w') keys.w = true;
        if (key === 's') keys.s = true;
        if (key === 'arrowup') keys.arrowup = true;
        if (key === 'arrowdown') keys.arrowdown = true;
    });

    document.addEventListener('keyup', (e) => {
        const key = e.key.toLowerCase();

        if (key === 'w') keys.w = false;
        if (key === 's') keys.s = false;
        if (key === 'arrowup') keys.arrowup = false;
        if (key === 'arrowdown') keys.arrowdown = false;
    });

    requestAnimationFrame(loop);
}

/** tells u if `x` is in between `[a, b]`, ie `a <= x <= b` */
function inRange(x, a, b) {
    return (x >= a && x <= b);
}

function applyKeyBinds() {
    if (keys.w) {
        const y = leftPaddle.y + PADDLE_SPEED * time.dt;
        if (y + leftPaddle.h/2 <= canvas.height) leftPaddle.y = y;
        else leftPaddle.y = canvas.height - leftPaddle.h/2;
    }
    if (keys.s) {
        const y = leftPaddle.y - PADDLE_SPEED * time.dt;
        if (y - leftPaddle.h/2 >= 0) leftPaddle.y = y;
        else leftPaddle.y = leftPaddle.h/2
    }
    if (keys.arrowup) {
        const y = rightPaddle.y + PADDLE_SPEED * time.dt;
        if (y + rightPaddle.h/2 <= canvas.height) rightPaddle.y = y;
        else rightPaddle.y = canvas.height - rightPaddle.h/2;
    }
    if (keys.arrowdown) {
        const y = rightPaddle.y - PADDLE_SPEED * time.dt;
        if (y - rightPaddle.h/2 >= 0) rightPaddle.y = y;
        else rightPaddle.y = rightPaddle.h / 2; // make it perfectly on there
    }
}

function loop() {
    time.update();

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // apply keybinds
    applyKeyBinds();

    // draw the ball
    ctx.fillStyle = ball.color;
    ctx.beginPath();
    ctx.arc(ball.x, canvas.height - ball.y, ball.r, 0, 2 * Math.PI);
    ctx.fill();

    // draw the paddles
    ctx.fillStyle = rightPaddle.color; // right paddle
    ctx.fillRect(rightPaddle.x - rightPaddle.w/2, canvas.height - rightPaddle.y - rightPaddle.h/2, rightPaddle.w, rightPaddle.h);
    
    ctx.fillStyle = leftPaddle.color; // left paddle
    ctx.fillRect(leftPaddle.x - leftPaddle.w/2, canvas.height - leftPaddle.y - leftPaddle.h/2, leftPaddle.w, leftPaddle.h);

    // move the ball

    const x = ball.x + ball.vx * time.dt;
    const y = ball.y + ball.vy * time.dt;

    // check if colliding with right paddle
    if (x + ball.r >= rightPaddle.x - rightPaddle.w/2) {
        const bottomBound = rightPaddle.y - rightPaddle.h/2;
        const topBound = rightPaddle.y + rightPaddle.h/2;

        if (ball.vx > 0 && inRange(ball.y, bottomBound, topBound)) { // check vx > 0 to see if ball is going to the right, just in case (try taking it out and see what happens)
            // if in range, that means paddle is there, you can bounce it off now
            
            // tell them how pong works, the farther u are from the paddle center, the more the ball turns
            const relative_dist = rightPaddle.y - ball.y;
            const normalized_dist = relative_dist / (rightPaddle.h/2); // the max distance from center is half the paddles height, so when u divide by the max, u normalize ur distance, turning into a value bewteen 0 and 1
            const delta_theta = normalized_dist * MAX_BOUNCE_ANGLE;
            ball.theta = Math.PI + delta_theta;
            ball.v += ball_speed_up;
        }
        else {
            player1_wins++; // player 1 won that match
            ball.x = canvas.width/2;
            ball.y = canvas.width/2;
            ball.theta = 0 // goes to losers side
            leftPaddle.y = canvas.height/2; // reset the paddles
            rightPaddle.y = canvas.height/2;
            ball.v = ball_initial_speed; // reset the ball speed
        }
    }
    else if (x - ball.r <= leftPaddle.x + leftPaddle.w/2) {
        const bottomBound = leftPaddle.y - leftPaddle.h/2;
        const topBound = leftPaddle.y + leftPaddle.h/2;

        if (ball.vx < 0 && inRange(ball.y, bottomBound, topBound)) { // check vx > 0 to see if ball is going to the right, just in case (try taking it out and see what happens)
            // if in range, that means paddle is there, you can bounce it off now
        
            const relative_dist = leftPaddle.y - ball.y;
            const normalized_dist = relative_dist / (leftPaddle.h/2);
            const delta_theta = normalized_dist * MAX_BOUNCE_ANGLE;
            ball.theta = -delta_theta;
            ball.v += ball_speed_up;
        }
        else {
            player2_wins++; // player 2 won that match
            ball.x = canvas.width/2;
            ball.y = canvas.width/2;
            ball.theta = Math.PI // goes to losers side
            leftPaddle.y = canvas.height/2; // reset the paddles
            rightPaddle.y = canvas.height/2;
            ball.v = ball_initial_speed; // reset the ball speed
        }
    }
    else {
        // this means that the paddle is still in bewteen the paddles, therefore continue moving it
        ball.x = x;
        ball.y = y;
        if (ball.y - ball.r < 0 || ball.y + ball.r > canvas.height) ball.theta = Math.atan2(-ball.vy, ball.vx);
    }
    
    // render the wins
    display_text1.innerHTML = "Player 1: " + player1_wins;
    display_text2.innerHTML = "Player 2: " + player2_wins;

    requestAnimationFrame(loop);
}

init();
