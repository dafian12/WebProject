import asyncio
import websockets
import json
import random

connected_clients = set()
running_processes = {}

async def send_log(websocket, message):
    if websocket in connected_clients:
        await websocket.send(json.dumps({"log": message}))

async def attack_loop(server_address, server_port, websocket, process_id):
    while websocket in connected_clients:
        message = f"Menyerang {server_address}:{server_port} dari proses {process_id}"
        await send_log(websocket, message)
        await asyncio.sleep(random.uniform(0.5, 1.5))

async def handler(websocket, path):
    global running_processes

    connected_clients.add(websocket)
    try:
        async for message in websocket:
            data = json.loads(message)
            if data["action"] == "start":
                server_address = data["address"]
                server_port = int(data["port"])
                process_id = f"{server_address}:{server_port}"

                if process_id in running_processes:
                    await send_log(websocket, "Serangan sudah berjalan pada server tersebut.")
                    continue

                await send_log(websocket, f"Memulai serangan pada {server_address}:{server_port}...")
                process = asyncio.create_task(attack_loop(server_address, server_port, websocket, process_id))
                running_processes[process_id] = process

            elif data["action"] == "stop":
                for process_id, process in list(running_processes.items()):
                    if process:
                        process.cancel()
                        await send_log(websocket, f"Serangan pada {process_id} dihentikan.")
                        del running_processes[process_id]

    except websockets.ConnectionClosed:
        print("Koneksi terputus dari client.")
    finally:
        connected_clients.remove(websocket)
        for process_id, process in list(running_processes.items()):
            if process:
                process.cancel()
                del running_processes[process_id]

async def main():
    server = await websockets.serve(handler, "localhost", 8000)
    print("Server berjalan di ws://localhost:8000")
    await server.wait_closed()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Server dimatikan secara paksa.")
