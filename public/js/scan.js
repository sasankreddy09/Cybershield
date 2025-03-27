async function scanURL() {
    let URL = document.getElementById('urlInput').value;
    if (URL.trim() === '') {
        alert('Please enter a valid URL');
        return;
    }

    document.getElementById('reportBox').style.display = 'block';
    document.getElementById('reportContent').innerHTML = "Scanning........";

    try {
        const stats = await scanUrl(URL); // Await the result from scanUrl
        if (stats) {
            displayResults(stats); // Function to display results
        } else {
            document.getElementById('reportContent').innerHTML = "Error retrieving scan results.";
        }
    } catch (error) {
        console.error("Error scanning URL:", error);
        document.getElementById('reportContent').innerHTML = "An error occurred while scanning.";
    }
}

async function scanUrl(URL) {
    const API_KEY = "apikey";
    const API_URL = "https://www.virustotal.com/api/v3/urls";

    try {
        // Submit the URL for scanning
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "x-apikey": API_KEY,
                "Content-Type": "application/x-www-form-urlencoded"
            },
            body: `url=${encodeURIComponent(URL)}`
        });

        const responseData = await response.json();
        if (!responseData.data || !responseData.data.id) {
            throw new Error("Invalid response from VirusTotal API");
        }

        const analysisId = responseData.data.id;
        console.log(`Submitted for analysis: ${analysisId}`);

        const analysisUrl = `https://www.virustotal.com/api/v3/analyses/${analysisId}`;

        // Polling the analysis result
        let retries = 10;
        while (retries > 0) {
            await new Promise(resolve => setTimeout(resolve, 5000)); // Wait 5 seconds
            
            try {
                const analysisResponse = await fetch(analysisUrl, {
                    method: "GET",
                    headers: {
                        "x-apikey": API_KEY,
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                });

                const analysisData = await analysisResponse.json();
                if (!analysisData.data || !analysisData.data.attributes) {
                    throw new Error("Invalid analysis response");
                }

                const stats = {
                    Stats: analysisData.data.attributes.stats,
                    status: analysisData.data.attributes.status
                };

                if (stats.status === "completed") {
                    console.log("Analysis Result:", stats);
                    return stats;  // Return the result
                }

                console.log("Analysis is still in progress, waiting...");
            } catch (error) {
                console.error("Error fetching analysis:", error);
            }

            retries--;
        }

        console.log("Max retries reached. Try again later.");
        return null; // Return null if scan did not complete

    } catch (error) {
        console.error("Error submitting URL:", error);
        return null;
    }
}

function displayResults(stats) {
    let reportContent = document.getElementById("reportContent");

    let maliciousColor = stats.Stats.malicious > 0 ? "#ff4d4d" : "#4CAF50"; // Red if malicious, Green otherwise
    let suspiciousColor = stats.Stats.suspicious > 0 ? "#ff9900" : "#4CAF50"; // Orange if suspicious, Green otherwise
    let harmlessColor = "#4CAF50"; // Always green
    let undetectedColor = "#777"; // Gray

    // Set the report content with colored stats
    reportContent.innerHTML = `<strong>Scan Result</strong><br>
        Harmless: <span style="color: ${harmlessColor}; font-weight: bold;">${stats.Stats.harmless}</span><br>
        Malicious: <span style="color: ${maliciousColor}; font-weight: bold;">${stats.Stats.malicious}</span><br>
        Suspicious: <span style="color: ${suspiciousColor}; font-weight: bold;">${stats.Stats.suspicious}</span><br>
        Undetected: <span style="color: ${undetectedColor}; font-weight: bold;">${stats.Stats.undetected}</span><br>`;

    // Threat level message
    if (stats.Stats.malicious >= 30) {
        reportContent.innerHTML += "<br>⚠ <strong style='color: red;'>Highly Malicious! Do not visit this website.</strong>";
    } else if (stats.Stats.malicious > 10) {
        reportContent.innerHTML += "<br>⚠ <strong style='color: orange;'>High chance of being malicious.</strong>";
    } else if (stats.Stats.malicious > 0) {
        reportContent.innerHTML += "<br>⚠ <strong style='color: red;'>Potentially risky.</strong>";
    } else if (stats.Stats.suspicious > 0) {
        reportContent.innerHTML += "<br>⚠ <strong style='color: orange;'>Some suspicious activity detected.</strong>";
    } else {
        reportContent.innerHTML += "<br>✅ <strong style='color: green;'>This website appears to be safe.</strong>";
    }
}
