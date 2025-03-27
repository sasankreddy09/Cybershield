async function scanIP() {
    let ip = document.getElementById('ipInput').value;
    if (ip.trim() === '') {
        alert('Please enter a valid IP address');
        return;
    }

    document.getElementById('reportBox').style.display = 'block';
    document.getElementById('reportContent').innerHTML = "Scanning........";

    try {
        const stats = await scanTarget(ip); // Await the result from scanTarget
        if (stats) {
            displayResults(stats); // Function to display results
        } else {
            document.getElementById('reportContent').innerHTML = "Error retrieving scan results.";
        }
    } catch (error) {
        console.error("Error scanning:", error);
        document.getElementById('reportContent').innerHTML = "An error occurred while scanning.";
    }
}

async function scanTarget(input) {
    const API_KEY = "api-key";
    const API_URL = `https://www.virustotal.com/api/v3/ip_addresses/${input}`;

    try {
        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                "x-apikey": API_KEY
            }
        });

        const responseData = await response.json();
        if (!responseData.data) {
            throw new Error("Invalid response from VirusTotal API");
        }

        return {
            Stats: responseData.data.attributes.last_analysis_stats,
            status: "completed"
        };
    } catch (error) {
        console.error("Error submitting input:", error);
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
        reportContent.innerHTML += "<br>⚠ <strong style='color: red;'>Highly Malicious! Avoid this IP.</strong>";
    } else if (stats.Stats.malicious > 10) {
        reportContent.innerHTML += "<br>⚠ <strong style='color: orange;'>High chance of being malicious.</strong>";
    } else if (stats.Stats.malicious > 0) {
        reportContent.innerHTML += "<br>⚠ <strong style='color: red;'>Potentially risky IP.</strong>";
    } else if (stats.Stats.suspicious > 0) {
        reportContent.innerHTML += "<br>⚠ <strong style='color: orange;'>Some suspicious activity detected.</strong>";
    } else {
        reportContent.innerHTML += "<br>✅ <strong style='color: green;'>This IP appears to be safe.</strong>";
    }
}
