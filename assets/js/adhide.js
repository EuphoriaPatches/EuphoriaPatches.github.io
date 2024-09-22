window.onload = function() {
    setTimeout(function() {
        var adContainer = document.getElementById('ad');
        var adVisible = adContainer.offsetHeight > 0; // Check if the ad is visible

        if (!adVisible) {
            adContainer.style.display = 'none'; // Hide the ad container if no ad is loaded
        }
    }, 2000); // Adjust the timeout duration if needed
};