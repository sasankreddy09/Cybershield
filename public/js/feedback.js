let selectedRating = 0;

function rate(stars) {
    selectedRating = stars;
    let starElements = document.querySelectorAll('.stars span');
    starElements.forEach((star, index) => {
        if (index < stars) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
    
    // Set rating value in hidden input
    document.querySelector("#rate").value = selectedRating;
}

function submitFeedback(event) {
    if (selectedRating === 0 || document.getElementById('feedbackText').value.trim() === "") {
        alert("Please provide a rating and feedback.");
        event.preventDefault(); // Prevent form submission
        return false;
    }
    
    alert("Feedback submitted successfully!");
    return true; // Allow form submission
}
