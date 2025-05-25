// Global Variables
let currentQuestion = null;
let currentSlices = 1;
let pizzaSlices = [];
let orderHistory = [];
let currentScore = 0;

// DOM References
const fractionBox = document.getElementById("fractionBox");
const pizzaCanvas = document.getElementById("pizzaCanvas");
const ctx = pizzaCanvas.getContext("2d");
const lcmInput = document.getElementById("lcmInput");
const feedback = document.getElementById("feedback");
const convertPanel = document.getElementById("convertPanel");
const denomDisplay = document.getElementById("denominatorDisplay");
const convNum1 = document.getElementById("convNum1");
const convNum2 = document.getElementById("convNum2");
const convDen1 = document.getElementById("convDen1");
const convDen2 = document.getElementById("convDen2");
const toppingArea = document.getElementById("toppingArea");
const slicesContainer = document.getElementById("slicesContainer");
const ordersList = document.getElementById('ordersList');
const lcmInputArea = document.getElementById("lcmInputArea");

// Helper Functions
function gcd(a, b) { return b ? gcd(b, a % b) : a; }
function lcm(a, b) { return (a * b) / gcd(a, b); }

// Game Functions
function loadQuestion() {
    document.getElementById('nextQuestionBtn').style.display = 'none';
    pizzaSlices = [];
    
    lcmInputArea.style.display = "block";
    convertPanel.style.display = "none";
    toppingArea.style.display = "none";
    
    fetch('/question')
        .then(res => {
            if (!res.ok) throw new Error("Network response was not ok");
            return res.json();
        })
        .then(q => {
            if (q.done) {
                window.location.href = "/celebration";
                return;
            }
            currentQuestion = q;
            orderHistory.push(q);
            updateOrdersList();
            
            fractionBox.innerHTML = `🔢 Problem: <strong>${q.n1}/${q.d1} ${q.topping1} + ${q.n2}/${q.d2} ${q.topping2}</strong>`;
            lcmInput.value = '';
            lcmInput.disabled = false;
            feedback.textContent = '';
            
            drawPizza(1);
            redrawPizzaWithToppings();
            
            // Reset conversion elements
            document.getElementById("fracNum1").textContent = q.n1;
            document.getElementById("fracDen1").textContent = q.d1;
            document.getElementById("fracNum2").textContent = q.n2;
            document.getElementById("fracDen2").textContent = q.d2;
            document.getElementById("convDen1").textContent = "";
            document.getElementById("convDen2").textContent = "";
            convNum1.value = "";
            convNum2.value = "";
        })
        .catch(err => {
            fractionBox.innerHTML = "❌ Failed to load question. Is the backend running?";
            console.error(err);
        });
}

function checkLCM() {
    if (!currentQuestion) return;
    const d1 = currentQuestion.d1, d2 = currentQuestion.d2;
    const correctLCM = lcm(d1, d2);
    const userLCM = parseInt(lcmInput.value);
    
    if (userLCM === correctLCM) {
        feedback.textContent = `✅ Correct! Now convert both fractions to denominator ${userLCM}.`;
        lcmInput.disabled = true;
        
        lcmInputArea.style.display = "none";
        convertPanel.style.display = "block";
        toppingArea.style.display = "none";
        
        drawPizza(correctLCM);
        redrawPizzaWithToppings();
        
        denomDisplay.textContent = userLCM;
        convDen1.textContent = userLCM;
        convDen2.textContent = userLCM;
        
        convNum1.value = "";
        convNum2.value = "";
    } else {
        feedback.textContent = `❌ Nope! The correct number of slices is ${correctLCM}. Try again.`;
        drawPizza(correctLCM);
        redrawPizzaWithToppings();
    }
}

function checkConversion() {
    const userLCM = parseInt(denomDisplay.textContent);
    const n1 = currentQuestion.n1, d1 = currentQuestion.d1;
    const n2 = currentQuestion.n2, d2 = currentQuestion.d2;
    
    const expectedNum1 = n1 * (userLCM / d1);
    const expectedNum2 = n2 * (userLCM / d2);
    
    const userNum1 = parseInt(convNum1.value);
    const userNum2 = parseInt(convNum2.value);

    if (userNum1 === expectedNum1 && userNum2 === expectedNum2) {
        fetch('/validate_conversion', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                num1: userNum1,
                num2: userNum2
            })
        })
        .then(res => res.json())
        .then(() => {
            feedback.textContent = "✅ Conversion correct! Now add toppings to match these fractions.";
            convertPanel.style.display = "none";
            toppingArea.style.display = "block";
        });
    } else {
        feedback.textContent = "❌ Check your conversion and try again!";
    }
}

function drawPizza(slices) {
    currentSlices = slices;
    pizzaSlices = Array.from({length: slices}, () => ({ toppings: [] }));
    const angle = (2 * Math.PI) / slices;
    
    ctx.clearRect(0, 0, pizzaCanvas.width, pizzaCanvas.height);
    ctx.strokeStyle = "#795548";
    ctx.lineWidth = 3;
    
    for(let i = 0; i < slices; i++) {
        ctx.beginPath();
        ctx.moveTo(150, 150);
        ctx.arc(150, 150, 130, i * angle, (i + 1) * angle);
        ctx.closePath();
        ctx.fillStyle = "#ffe0b2";
        ctx.fill();
        ctx.stroke();
    }
}

function redrawPizzaWithToppings() {
    const slices = pizzaSlices.length;
    const angle = (2 * Math.PI) / slices;
    
    ctx.clearRect(0, 0, pizzaCanvas.width, pizzaCanvas.height);
    ctx.strokeStyle = "#795548";
    ctx.lineWidth = 3;
    
    for(let i = 0; i < slices; i++) {
        ctx.beginPath();
        ctx.moveTo(150, 150);
        ctx.arc(150, 150, 130, i * angle, (i + 1) * angle);
        ctx.closePath();
        ctx.fillStyle = "#ffe0b2";
        ctx.fill();
        ctx.stroke();

        const toppings = pizzaSlices[i].toppings;
        for (let j = 0; j < toppings.length; j++) {
            const midAngle = (i + 0.5) * angle;
            const r = 90 + 18 * j;
            const x = 150 + r * Math.cos(midAngle);
            const y = 150 + r * Math.sin(midAngle);
            ctx.font = "24px serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(toppings[j], x, y);
        }
    }
}

function updateScore(points) {
    currentScore += points;
    document.getElementById('score').textContent = currentScore;
}

function showCelebration() {
    document.getElementById('celebrationPopup').style.display = 'flex';
}

function closeCelebration() {
    document.getElementById('celebrationPopup').style.display = 'none';
    updateScore(50);
}

function checkToppings() {
    const ovenAnimation = document.getElementById('ovenAnimation');
    ovenAnimation.style.display = 'flex';
    
    setTimeout(() => {
        if (!currentQuestion) return;
        
        fetch('/validate', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                question_id: currentQuestion.id,
                pizza_slices: pizzaSlices.map(slice => slice.toppings)
            })
        })
        .then(res => res.json())
        .then(data => {
            ovenAnimation.style.display = 'none';
            if (data.correct) {
                showCelebration();
                feedback.textContent = '';
                toppingArea.style.display = "block";
                document.getElementById('nextQuestionBtn').style.display = 'inline-block';
            } else {
                feedback.textContent = `❌ Try again! ${data.actual[Object.keys(data.actual)[0]]} vs ${data.expected[Object.keys(data.expected)[0]]}`;
            }
        });
    }, 5000);
}

function updateOrdersList() {
    ordersList.innerHTML = '';
    
    orderHistory.forEach((order, index) => {
        const orderItem = document.createElement('div');
        orderItem.className = 'order-item';
        orderItem.innerHTML = `
            <strong>Order #${index + 1}:</strong><br>
            ${order.n1}/${order.d1} ${order.topping1} + 
            ${order.n2}/${order.d2} ${order.topping2}
        `;
        ordersList.appendChild(orderItem);
    });
    
    ordersList.scrollTop = ordersList.scrollHeight;
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    loadQuestion();
    redrawPizzaWithToppings();
});

document.querySelectorAll('.ingredient-bin').forEach(bin => {
    bin.addEventListener('dragstart', function(e) {
        e.dataTransfer.setData('text/plain', this.dataset.emoji);
        e.dataTransfer.effectAllowed = 'copy';
    });
});

pizzaCanvas.addEventListener('dragover', function(e) {
    e.preventDefault();
});

pizzaCanvas.addEventListener('drop', function(e) {
    e.preventDefault();
    const rect = pizzaCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left - 150;
    const y = e.clientY - rect.top - 150;
    const r = Math.sqrt(x*x + y*y);
    if (r > 130) return;
    
    let theta = Math.atan2(y, x);
    if (theta < 0) theta += 2 * Math.PI;
    const sliceIndex = Math.floor(theta / ((2 * Math.PI) / currentSlices));
    
    const emoji = e.dataTransfer.getData('text/plain');
    if (emoji && pizzaSlices[sliceIndex]) {
        pizzaSlices[sliceIndex].toppings.push(emoji);
        redrawPizzaWithToppings();
    }
});

pizzaCanvas.addEventListener('click', function(e) {
    const rect = pizzaCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left - 150;
    const y = e.clientY - rect.top - 150;
    const r = Math.sqrt(x*x + y*y);
    if (r > 130) return;
    
    let theta = Math.atan2(y, x);
    if (theta < 0) theta += 2 * Math.PI;
    const sliceIndex = Math.floor(theta / ((2 * Math.PI) / currentSlices));
    
    if (pizzaSlices[sliceIndex]) {
        pizzaSlices[sliceIndex].toppings = [];
        redrawPizzaWithToppings();
    }
});