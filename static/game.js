
function updateScore(points) {
    currentScore += points;
    document.getElementById('score').textContent = currentScore;
}

// Example usage:
// updateScore(10); // Adds 10 points

// Add this function to handle ingredient drops
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
        // Generate random positions within slice
        clone.style.setProperty('--tx', `${Math.random() * 20 - 10}px`);
        clone.style.setProperty('--ty', `${Math.random() * 20 - 10}px`);
        
        sliceElement.appendChild(clone);
        
        // Cleanup after animation
        setTimeout(() => {
            clone.remove();
        }, 5000);
    }
}

// Update your existing drop event listener to use this function
// Remove this duplicate declaration if it exists elsewhere
// Remove the conditional declaration block
// if(typeof pizzaCanvas === 'undefined') {
//     var pizzaCanvas = document.querySelector('.canvas-container');
// }

// Declare once at the top
const pizzaCanvas = document.querySelector('.canvas-container');

// Add event listeners to the canvas
pizzaCanvas.addEventListener('dragover', e => {
    e.preventDefault();
});

pizzaCanvas.addEventListener('drop', e => {
    e.preventDefault();
    // Get slice using coordinates adjusted for container position
    const rect = pizzaCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const slice = document.elementFromPoint(x, y);
    
    if (slice?.classList?.contains('slice')) {
        handleIngredientDrop(e, slice);
    }
});