document.getElementById('checkerForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const playerID = document.getElementById('playerID').value;
    const resultDiv = document.getElementById('result');

    if (playerID.trim() === "") {
        resultDiv.textContent = "Harap masukkan ID Free Fire.";
        return;
    }

    // Untuk sekarang, kita akan menampilkan pesan statis
    resultDiv.textContent = `Nama akun untuk ID ${playerID}: ContohNama`;
});
