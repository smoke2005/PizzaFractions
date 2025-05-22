
function updateScore(points) {
    currentScore += points;
    document.getElementById('score').textContent = currentScore;
}

// Example usage:
// updateScore(10); // Adds 10 points