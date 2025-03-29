document.getElementById('startTest').addEventListener('click', function() {
    const networkType = document.querySelector('input[name="networkType"]:checked').value;
    const resultDiv = document.getElementById('result');

    resultDiv.innerHTML = 'Mengukur kecepatan...';

    // Simulasi Tes Kecepatan
    setTimeout(() => {
        const downloadSpeed = (Math.random() * 50 + 10).toFixed(2); // Mbps
        const uploadSpeed = (Math.random() * 20 + 5).toFixed(2); // Mbps
        const latency = (Math.random() * 50 + 10).toFixed(0); // ms

        resultDiv.innerHTML = `
            <strong>Hasil Tes (${networkType === 'wifi' ? 'Wi-Fi' : 'Data Seluler'})</strong><br>
            Kecepatan Download: ${downloadSpeed} Mbps<br>
            Kecepatan Upload: ${uploadSpeed} Mbps<br>
            Latensi: ${latency} ms
        `;
    }, 2000);
});
