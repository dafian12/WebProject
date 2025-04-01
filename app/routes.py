from flask import render_template, request, redirect, url_for, flash
from app import app
from app.otp_handler import kirim_otp

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        nomor_hp = request.form['nomor_hp']

        if nomor_hp:
            hasil = kirim_otp(nomor_hp)

            if isinstance(hasil, int):
                flash(f'OTP {hasil} telah dikirim ke {nomor_hp}', 'success')
            else:
                flash(f'Terjadi kesalahan: {hasil}', 'danger')

        return redirect(url_for('index'))

    return render_template('index.html')
