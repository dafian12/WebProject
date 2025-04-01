import pywhatkit as kit
import random
import time

def kirim_otp(nomor_hp: str):
    otp = random.randint(1000, 9999)  # Menghasilkan OTP 4 digit
    pesan = f"Your OTP is {otp}. Use this to verify your account."

    jam = time.localtime().tm_hour
    menit = time.localtime().tm_min + 1

    try:
        kit.sendwhatmsg(nomor_hp, pesan, jam, menit)
        return otp
    except Exception as e:
        return str(e)
