import os
import time
import json
from telethon import TelegramClient, events
from utils.logger import logger

# Rate Limiter Configuration
RATE_LIMIT = 5  # Max reports per minute per user
user_requests = {}

# Load environment variables
api_id = int(os.getenv('API_ID'))
api_hash = os.getenv('API_HASH')
bot_token = os.getenv('BOT_TOKEN')

# Initialize client
client = TelegramClient('bot', api_id, api_hash).start(bot_token=bot_token)

@client.on(events.NewMessage(pattern=r'^generate_report'))
async def handle_mini_app_data(event):
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
        target = data['target']
        reason = data['reason']
        
        # Simulate processing (replace with actual logic)
        await event.respond(f"🔄 Memproses laporan untuk {target}...")
        logger.info(f"Processing report for {target} by user {user_id}")
        
        # Simulate success/failure
        import random
        if random.choice([True, False]):  # 50% chance of success
            await event.respond(f"✅ Laporan berhasil diproses!")
            logger.info(f"Report successful for {target}")
        else:
            await event.respond("❌ Gagal memproses laporan. Coba lagi!")
            logger.error(f"Report failed for {target}")
            
    except Exception as e:
        await event.respond(f"❌ Error: {str(e)}")
        logger.exception(f"Error processing report: {str(e)}")

# Start the bot
logger.info("Bot is starting...")
client.run_until_disconnected()
