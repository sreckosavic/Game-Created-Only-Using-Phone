const canvas = document.querySelector(".canvas1");
let ctx = canvas.getContext("2d");
const canvasWidth = canvas.width = window.innerWidth;
const canvasHeigth = canvasHeight = canvas.height = window.innerHeight;

let sccore = 0;
let bestSccore = localStorage.getItem("bestSccore") || 0;
let isRuning = true;
let globalSpeed = 1;
const livesTags = document.querySelectorAll(".heart")
const sccoreText = document.querySelector(".sccoreText span");
const finalSccore = document.querySelector(".finalSccore span");
const bestSccoreText = document.querySelector(".bestSccoreText span");
const weaponsCards = document.querySelectorAll(".card");

bestSccoreText.innerHTML = bestSccore;
let health = 100;
let energy = 100;

const healthTag = document.querySelector(".healthBar h2 span");
const healthBar = document.querySelector(".healthBar.front");
const gameoverContainer = document.querySelector(".gameoverContainer");
const restartBtn = document.querySelector(".restartBtn");

const energyBar = document.querySelector(".energyBar.front");
let spawnInterval = 1900;
let selectedWeapon = "rock";

const enemies = [];
const bullets = [];
const bombExplosions = [];
const enemyExplosions = [];
const explosions = [];
const enemyTypes = ["normal", "fast", "invisible"];

let collisionArray = bullets;
let radius = 20;

function changeSccore(points) {
    sccore += points;
    sccoreText.innerHTML = sccore;
}

function updateHealth(demage) {
    health -= demage;
    healthBar.style.width = health + "%";
    healthBar.style.filter = "blur(10px)";
    healthBar.style.background = "red";
    setTimeout(function() {
        healthBar.style.filter = "blur(0px)";
        healthBar.style.background = "#49be25";
    }, 300);
    healthTag.innerHTML = health;
    if (health < 0) {
        health = 0;
        healthTag.innerHTML = health;
        gameOver();
    }
}

function updateEnergy(energyCost) {
    if(energy < energyCost) return;
    energy -= energyCost
    energyBar.style.width = energy + "%";
}

function gameOver() {
    isRuning = false;
    gameoverContainer.classList.add("active");
    
    finalSccore.innerHTML = sccore;
    localStorage.setItem("bestSccore", bestSccore);
    let currentBest = localStorage.getItem("bestSccore");
    
    if(sccore > currentBest){
        bestSccore = sccore;
        localStorage.setItem("bestSccore", bestSccore);
    }
    bestSccore = currentBest;
    console.log(currentBest);
}

restartBtn.addEventListener("click", () => {
    location.reload();
});

weaponsCards.forEach(card => {
    card.addEventListener("click", (e) => {
        const weaponName = card.getAttribute("name");
        selectedWeapon = weaponName;
    });
})

class Weapon {
    constructor(touchX, touchY) {
        this.size = 350;
        this.x = touchX;
        this.y = touchY;
        this.speed = 7;
        this.angle;
        this.cost;
        this.rotateSpeed = 4;
        this.image;

    }
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle * Math.PI / 360);
         //ctx.fillRect(0 - this.size / 2, 0 - this.size / 2, this.size, this.size);
        ctx.drawImage(this.image, 0 - this.size / 2, 0 - this.size / 2, this.size, this.size);
        ctx.restore();

    }
    update() {
        this.size -= this.speed;
        this.angle += this.rotateSpeed;
        if (this.size < 0) {
            bullets.splice(this, 1);
        }
    }
}

class Granade extends Weapon {
    constructor(touchX, touchY){
        super(touchX, touchY);
        this.angle = 0;
        this.image = granadeImg;
        this.cost = 100;
    }
    update(){
        this.size -= this.speed;
        this.angle += this.rotateSpeed;
        if (this.size < 0) {
            bullets.splice(this, 1);
            bombExplosions.push(new Explosion(this.x - 450, this.y - 450, 3));
        }
    }
}

class Rock extends Weapon {
    constructor(touchX, touchY){
        super(touchX, touchY);
        this.angle = 210;
        this.image = rockImg;
        this.cost = 10;
    }
    update(){
        this.size -= this.speed;
        this.angle += this.rotateSpeed;
        if(this.size < 0){
        bullets.splice(this, 1);
    }
    }
}

class Mine extends Weapon {
    constructor(touchX, touchY){
        super(touchX, touchY);
        this.cost = 25;
        this.size = 50;
        this.image = mineImg;
    }
    draw(){;
        ctx.drawImage(this.image, this.x, this.y, this.size, this.size);
    }
    update(){
        
    }
}

class Enemy {
    constructor() {
        this.image = enemyImg;
        this.x;
        this.y = 0;
        this.speed;
        this.size = 120;
        this.angle = 360;
        this.points;
        this.demage = Math.floor(Math.random()* 10 + 10);
        this.isColided = false;
    }
    draw() {
        ctx.drawImage(this.image, this.x, this.y, this.size, this.size);
    }
    update() {
        this.y += this.speed;
    }
    detectCollision(objectsArray, collisionRadius){
        objectsArray.forEach(object => {
            if ((this.x < object.x + object.size && this.x + this.size > object.x && this.y < object.y + object.size && this.y + this.size > object.y) && object.size < collisionRadius) {
                changeSccore(this.points);
                
                
                this.isColided = true;
                this.size = 0;
                this.speed = 0;
                enemyExplosions.push(new Explosion(this.x, this.y, 0.5));
                enemies.splice(this, 1);
                bullets.splice(object, 1);
            }
        });
        
    }
    onecallFun(){
        console.log("call test");
    }
    giveDemage() {
        if (this.y > canvasHeight + this.size) {
            enemies.shift();
            updateHealth(this.demage);
        }
    }
}

class NormalPlane extends Enemy {
    constructor(){
        super();
        this.image = enemyImg;
        this.x = Math.random() * canvasWidth;
        this.speed = 3,
        this.points = 1;
    }
}

class FastPlane extends Enemy {
    constructor(){
        super();
        this.image = fastAirplaneImg;
        this.x = 0;
        this.points = 5;
        this.speedX = 4;
        this.speedY = 4
        
    }
    update(){
        this.x += this.speedX;
        this.y += this.speedY;
        
        if(this.x > canvasWidth - this.size){
            this.speedX = -5;
        }
        if(this.x < 0){
            this.speedX = 5;
        }
    }
}

class InvisiblePlane extends Enemy {
    constructor(){
        super();
        this.x = this.x = Math.random() * canvasWidth;
        this.size = 100;
        this.speed = 4;
        this.points = 25;
        this.image = invisiblePlaneImg;
        this.opacity = 0.1;
    }
    draw(){
        ctx.save();
        ctx.globalAlpha = this.opacity;
        ctx.drawImage(this.image, this.x, this.y, this.size, this.size);
        ctx.restore();
    }
}
class Explosion {
    constructor(enemyX, enemyY, sizeOptimizator) {
        this.image = explosionsImg;
        this.isPassed = false;
        this.frameX = 0;
        this.frameY = Math.floor(Math.random() * 3);
        this.maxFrame = 20;
        this.timer = 0;
        this.spriteSize = 300;
        this.size = this.spriteSize * sizeOptimizator;
        this.x = enemyX;
        this.y = enemyY;
    }
    draw() {
        //ctx.fillStyle = "red";
        //ctx.fillRect(this.x, this.y, this.size, this.size);
        ctx.drawImage(this.image, this.frameX * this.spriteSize, this.frameY * this.spriteSize, this.spriteSize, this.spriteSize, this.x, this.y, this.size, this.size);
    }
    update() {
        this.timer++;
        if (this.timer == this.maxFrame % 6) {
            this.frameX++;
            this.timer = 0;

            if (this.frameX > this.maxFrame) {
                this.isPassed = true;
                enemyExplosions.splice(this, 1);
                bombExplosions.splice(this, 1);
            }
        }
    }
}

canvas.addEventListener("click", (e) => {
    let touchX = e.clientX;
    let touchY = e.clientY;
    
    let bullet;
    switch(selectedWeapon){
        case "rock":
            bullet = new Rock(touchX, touchY);
            if(energy < bullet.cost) return;
            collisionArray = bullets;
            radius = 20;
            bullets.push(bullet);
            if(energy < bullet.cost) return;
            updateEnergy(bullet.cost);
        break;
        case "granade":
            bullet = new Granade(touchX, touchY);
            if(energy < bullet.cost) return;
            collisionArray = bombExplosions;
            radius = 1000;
            bullets.push(bullet);
            updateEnergy(bullet.cost);
        break;
        case "mine":
            bullet = new Mine(touchX, touchY);
            if(energy < bullet.cost) return;
            collisionArray = bullets;
            radius = 55;
            console.log(bullet);
            bullets.push(bullet);
            if(energy < bullet.cost) return;
            updateEnergy(bullet.cost);
        break;
    }
});

setInterval(() => {
    energy++;
    energyBar.style.width = energy + "%";

    if (energy > 100) energy = 100;
}, 50);

let lastTime = 0;

function animate(timeStamp) {
    if (!isRuning) return;
    let deltaTime = lastTime - timeStamp;
    lastTime = timeStamp;
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    enemies.forEach(enemy => {
        enemy.draw();
        enemy.update();
        enemy.giveDemage();
        enemy.detectCollision(collisionArray, radius);
    })
    bullets.forEach(b => {
        b.draw();
        b.update();
    });
    bombExplosions.forEach(explosion => {
        explosion.draw();
        explosion.update();
    });
    enemyExplosions.forEach(explosion => {
        explosion.draw();
        explosion.update();
    });
    updateInterval();
    console.log(spawnInterval);
    requestAnimationFrame(animate);
}

var interval;

animate(0);

function updateInterval(){
    spawnInterval = spawnInterval - 0.1;
    if(spawnInterval < 500) spawnInterval = 500;
}
function spawnEnemy(){
    let randomEnemy = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
    clearInterval(interval);
    
    switch(randomEnemy){
        case "normal": enemies.push(new NormalPlane());
        break;
        case "fast": enemies.push(new FastPlane());
        break;
        case "invisible": enemies.push(new InvisiblePlane());
        break;
    }
    interval = setInterval(spawnEnemy, spawnInterval);
}

spawnEnemy();