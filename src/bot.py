import os
from telethon import TelegramClient, events
import json
import logging

# Setup logging
logging.basicConfig(level=logging.INFO)

# Load environment variables
api_id = int(os.getenv('7786718775'))
api_hash = os.getenv('a9928643586f7a2a2efddf18e9cd1bf4')
bot_token = os.getenv('7211314981:AAFd0uvUVLGR8uTgLBEeQcOq85ZpQAcl3v0')

# Initialize client
client = TelegramClient('bot', api_id, api_hash).start(bot_token=bot_token)

@client.on(events.NewMessage(pattern=r'^generate_report'))
async def handle_mini_app_data(event):
    try:
        # Parse data from mini app
        data = json.loads(event.message.text)
        target = data['target']
        reason = data['reason']

        # Simulate processing (replace with actual logic)
        await event.respond(f"Laporan untuk {target} dengan alasan '{reason}' sedang diproses...")
        
        # Here you can add your report generation logic
        # Example: Fetch messages from target and generate PDF
        
    except Exception as e:
        await event.respond(f"Error: {str(e)}")

# Start the bot
print("Bot is running...")
client.run_until_disconnected()
