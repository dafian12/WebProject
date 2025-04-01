from flask import Flask, render_template, request, redirect, url_for, flash
import pywhatkit as kit
import random
import time

app = Flask(__name__)
app.secret_key = 'supersecretkey'

@app.route('/', methods=['GET', 'POST'])
def index():
    if request.method == 'POST':
        nomor_hp = request.form['nomor_hp']

        if nomor_hp:
            otp = random.randint(1000, 9999)  # Menghasilkan OTP 4 digit
            pesan = f"Your OTP is {otp}. Use this to verify your account."

            jam = time.localtime().tm_hour
            menit = time.localtime().tm_min + 1

            try:
                kit.sendwhatmsg(nomor_hp, pesan, jam, menit)
                flash(f'OTP {otp} telah dikirim ke {nomor_hp}', 'success')
            except Exception as e:
                flash(f'Terjadi kesalahan: {str(e)}', 'danger')

        return redirect(url_for('index'))

    return render_template('index.html')

# Untuk deployment di Vercel
def handler(event, context):
    return app(event, context)
