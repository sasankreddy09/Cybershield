document.addEventListener("DOMContentLoaded", function () {
    document.getElementById('scanButton').addEventListener('click', async function () {
        const fileInput = document.getElementById('fileInput');
        const reportDiv = document.getElementById('reportBox');
        const scanResult = document.getElementById('scanResult');
        
        if (!fileInput || !reportDiv || !scanResult) {
            console.error("fileInput, reportBox, or scanResult not found!");
            return;
        }
        
        if (!fileInput.files.length) {
            alert('Please select a file to scan.');
            return;
        }

        const file = fileInput.files[0];
        if (file.size > 32 * 1024 * 1024) {
            alert('File size exceeds 32MB limit.');
            return;
        } 
        const apiKey ="apikey"; // 🔴 Replace with your API key
        const uploadUrl = "https://www.virustotal.com/api/v3/files";

        const formData = new FormData();
        formData.append("file", file);

        try {
            // Show loading animation
            reportDiv.style.display = 'block';
            scanResult.innerHTML = `
                <div class="loader"></div>
                <p>Scanning <strong>${file.name}</strong>... Please wait.</p>
            `;

            // 🔄 Step 1: Upload file to VirusTotal
            const uploadResponse = await fetch(uploadUrl, {
                method: "POST",
                headers: { "x-apikey": apiKey },
                body: formData
            });

            const uploadResult = await uploadResponse.json();
            if (!uploadResponse.ok) throw new Error(uploadResult.error.message);

            const fileId = uploadResult.data.id;

            // 🔄 Step 2: Fetch scan report
            const reportUrl = `https://www.virustotal.com/api/v3/analyses/${fileId}`;
            const reportResponse = await fetch(reportUrl, {
                method: "GET",
                headers: { "x-apikey": apiKey }
            });

            const reportResult = await reportResponse.json();
            const stats = reportResult.data.attributes.stats;

            // Fade in effect for report
            scanResult.innerHTML = `
                <div class="scan-result">
                    <h3>Scan Complete ✅</h3>
                    <p><strong>File Name:</strong> ${file.name}</p>
                    <p><strong>Detections:</strong> <span class="malicious">${stats.malicious}</span></p>
                    <p><strong>Suspicious:</strong> <span class="suspicious">${stats.suspicious}</span></p>
                    <p><strong>Undetected:</strong> <span class="safe">${stats.undetected}</span></p>
                </div>
            `;
            scanResult.classList.add("fade-in");
        } catch (error) {
            console.error("Error:", error);
            scanResult.innerHTML = "<p style='color: red;'>❌ Failed to fetch report!</p>";
        }
        fileInput.value="";
    });
});
