function updateScore(points) {
    currentScore += points;
    document.getElementById('score').textContent = currentScore;
}

function handleIngredientDrop(event, sliceElement) {
    const ingredient = event.dataTransfer.getData("text/plain");
    const clones = 4;
    
    // Clear existing clones first
    while(sliceElement.firstChild) {
        sliceElement.removeChild(sliceElement.firstChild);
    }

    // Create multiple clones with different positions
    for(let i = 0; i < clones; i++) {
        const clone = document.createElement('div');
        clone.className = 'ingredient-clone';
        clone.textContent = ingredient;
        // Generate viewport-relative positions
        clone.style.left = `${event.clientX + (Math.random() * 40 - 20)}px`;
        clone.style.top = `${event.clientY + (Math.random() * 40 - 20)}px`;
        clone.style.transform = `rotate(${Math.random() * 25 - 12.5}deg)`;
        clone.style.zIndex = 1000 + i;
        
        document.body.appendChild(clone); // Add to body instead of slice
        
        setTimeout(() => clone.remove(), 5000);
    }
}

// Update drop handler
pizzaCanvas.addEventListener('drop', e => {
    e.preventDefault();
    const slices = document.querySelectorAll('.slice');
    const randomSlice = slices[Math.floor(Math.random() * slices.length)];
    handleIngredientDrop(e, randomSlice);
    e.stopImmediatePropagation();
});


// Whiteboard/sketchpad logic
const whiteboard = document.getElementById('whiteboard-canvas');
const ctxWB = whiteboard.getContext('2d');
let drawing = false;
let paths = [];
let currentPath = [];

whiteboard.addEventListener('mousedown', (e) => {
    drawing = true;
    currentPath = [];
    ctxWB.beginPath();
});

whiteboard.addEventListener('mousemove', (e) => {
    if (!drawing) return;
    const rect = whiteboard.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    ctxWB.lineWidth = 2.5;
    ctxWB.lineCap = 'round';
    ctxWB.strokeStyle = '#a14c1a';
    ctxWB.lineTo(x, y);
    ctxWB.stroke();
    currentPath.push({x, y});
});

whiteboard.addEventListener('mouseup', (e) => {
    if (drawing) {
        drawing = false;
        ctxWB.closePath();
        if (currentPath.length > 0) {
            paths.push([...currentPath]);
        }
    }
});

whiteboard.addEventListener('mouseleave', (e) => {
    if (drawing) {
        drawing = false;
        ctxWB.closePath();
        if (currentPath.length > 0) {
            paths.push([...currentPath]);
        }
    }
});

// Undo button
document.getElementById('whiteboard-undo').addEventListener('click', () => {
    paths.pop();
    redrawWhiteboard();
});

// Clear button
document.getElementById('whiteboard-clear').addEventListener('click', () => {
    paths = [];
    ctxWB.clearRect(0, 0, whiteboard.width, whiteboard.height);
});

// Redraw all paths
function redrawWhiteboard() {
    ctxWB.clearRect(0, 0, whiteboard.width, whiteboard.height);
    ctxWB.lineWidth = 2.5;
    ctxWB.lineCap = 'round';
    ctxWB.strokeStyle = '#a14c1a';
    for (const path of paths) {
        ctxWB.beginPath();
        for (let i = 0; i < path.length; i++) {
            const {x, y} = path[i];
            if (i === 0) {
                ctxWB.moveTo(x, y);
            } else {
                ctxWB.lineTo(x, y);
            }
        }
        ctxWB.stroke();
        ctxWB.closePath();
    }
}
