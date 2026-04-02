#!/usr/bin/env python3
import subprocess
import os
import sys
import time
import signal
import psutil  # You'll need to install this: pip install psutil

def start_service(service_name, port):
    """Start a microservice"""
    service_path = os.path.join(service_name, "app.py")
    if os.path.exists(service_path):
        print(f"Starting {service_name} on port {port}...")
        # Use creationflags to ensure proper process group creation on Windows
        creation_flags = 0
        if sys.platform == "win32":
            creation_flags = subprocess.CREATE_NEW_PROCESS_GROUP
        
        process = subprocess.Popen(
            [sys.executable, "app.py"],
            cwd=service_name,
            creationflags=creation_flags
        )
        return process
    else:
        print(f"Error: {service_path} not found!")
        return None

def kill_child_processes(parent_pid):
    """Kill all child processes recursively"""
    try:
        parent = psutil.Process(parent_pid)
        children = parent.children(recursive=True)
        for child in children:
            child.terminate()
        gone, still_alive = psutil.wait_procs(children, timeout=3)
        for p in still_alive:
            p.kill()
    except psutil.NoSuchProcess:
        return

def main():
    services = [
        ("chatbot_service", 5000),
        ("smartcart_service", 5002),
    ]
    
    processes = []
    
    print(" Starting microservices...")
    
    for service_name, port in services:
        process = start_service(service_name, port)
        if process:
            processes.append((service_name, process, port))
            time.sleep(2)  # Wait between starts
    
    print("\nServices started:")
    for service_name, _, port in processes:
        print(f"   • {service_name}: http://localhost:{port}")
    
    print("\n Available endpoints:")
    print("   • Products: http://localhost:5002/api/products")
    print("   • Chat: http://localhost:5000/api/chat")
    print("   • Health checks: /api/health on each service")
    
    print("\n Press Ctrl+C to stop all services")
    
    try:
        # Keep main process alive
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n Stopping services...")
        for service_name, process, _ in processes:
            print(f"   Stopping {service_name}...")
            kill_child_processes(process.pid)
            process.terminate()
            try:
                process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                process.kill()
        print("All services stopped")

if __name__ == "__main__":
    main()