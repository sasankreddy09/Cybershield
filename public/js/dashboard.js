function showSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => section.style.display = 'none');

    // Show the selected section
    document.getElementById(sectionId).style.display = 'block';
}

// Show the home section by default
document.addEventListener('DOMContentLoaded', () => {
    showSection('home');
});

// Sample feedback data (duplicates included)
// const feedbackData = [
//     "Great service!",
//     "Very helpful.",
//     "Great service!",
//     "Not working as expected.",
//     "Very helpful.",
//     "Very nice.",
//     "Awesome experience!",
//     "Could be better.",
//     "Not working as expected.",
//     "Awesome experience!"
// ];

// Function to count and display feedback
// function displayFeedbackData() {
//     const feedbackCount = {};

//     // Count feedback occurrences
//     feedbackData.forEach(feedback => {
//         feedbackCount[feedback] = (feedbackCount[feedback] || 0) + 1;
//     });

//     // Display feedback count in the dashboard
//     let feedbackBlock = document.querySelector('#feedback .data-blocks');
//     feedbackBlock.innerHTML = '';  // Clear current data

//     Object.keys(feedbackCount).forEach(feedback => {
//         const feedbackElement = document.createElement('div');
//         feedbackElement.classList.add('data-block');
//         feedbackElement.textContent = `${feedback}: ${feedbackCount[feedback]}`;
//         feedbackBlock.appendChild(feedbackElement);
//     });
// }

// Call the function to display feedback data on page load
window.onload = displayFeedbackData;

// Function to show sections
function showSection(section) {
    document.querySelectorAll('.section').forEach(sec => sec.classList.remove('active'));
    document.getElementById(section).classList.add('active');
}






