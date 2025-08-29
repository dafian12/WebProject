import os
import time
import json
from telethon import TelegramClient, events
from utils.logger import logger

# Rate Limiter Configuration
RATE_LIMIT = 5  # Max reports per minute per user
user_requests = {}
blocked_accounts = {}  # Daftar akun yang diblokir

# Load environment variables
api_id = int(os.getenv('7786718775'))
api_hash = os.getenv('a9928643586f7a2a2efddf18e9cd1bf4')
bot_token = os.getenv('7211314981:AAFd0uvUVLGR8uTgLBEeQcOq85ZpQAcl3v0')

# Initialize client
client = TelegramClient('bot', api_id, api_hash).start(bot_token=bot_token)

@client.on(events.NewMessage(pattern=r'^mass_report'))
async def handle_mass_report(event):
    user_id = event.sender_id
    
    # Check rate limit
    current_time = time.time()
    if user_id not in user_requests:
        user_requests[user_id] = []
    
    # Remove old requests (older than 60 seconds)
    user_requests[user_id] = [t for t in user_requests[user_id] if current_time - t < 60]
    
    if len(user_requests[user_id]) >= RATE_LIMIT:
        await event.respond("⚠️ Batas laporan tercapai! Tunggu 1 menit lagi.")
        logger.warning(f"User {user_id} exceeded rate limit")
        return
    
    # Add current request
    user_requests[user_id].append(current_time)
    
    try:
        # Parse data from mini app
        data = json.loads(event.message.text)
        targets = data['target'].split(',')
        reason = data['reason']
        
        # Process each target account
        for target in targets:
            target = target.strip()
            if not target.startswith('@'):
                continue
                
            # Block target account (simulated)
            blocked_accounts[target] = True
            logger.info(f"Blocked account: {target}")
            
            # Send report to target
            await client.send_message(target, f"🚨 REPORT DARI ADMIN:\n\n{reason}\n\nAkun ini telah diblokir karena pelaporan.")
            logger.info(f"Report sent to {target}")
        
        await event.respond(f"✅ Laporan dikirim ke {len(targets)} akun target!")
        logger.info(f"Mass report completed for {targets}")
        
    except Exception as e:
        await event.respond(f"❌ Error: {str(e)}")
        logger.exception(f"Error processing mass report: {str(e)}")

# Start the bot
logger.info("Bot is starting...")
client.run_until_disconnected()
