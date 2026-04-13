import os
import time
import uuid
import requests
import argparse
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler
from concurrent.futures import ThreadPoolExecutor

class PhotoSyncHandler(FileSystemEventHandler):
    def __init__(self, api_url, token, event_id):
        self.api_url = api_url
        self.token = token
        self.event_id = event_id
        self.executor = ThreadPoolExecutor(max_workers=4)
        print(f"🚀 Lightning Sync started for Event: {event_id}")

    def on_created(self, event):
        if not event.is_directory and event.src_path.lower().endswith(('.jpg', '.jpeg', '.png')):
            print(f"📸 New frame detected: {os.path.basename(event.src_path)}")
            self.executor.submit(self.upload_photo, event.src_path)

    def upload_photo(self, file_path):
        url = f"{self.api_url}/api/events/{self.event_id}/photos"
        headers = {"Authorization": f"Bearer {self.token}"}
        
        try:
            with open(file_path, "rb") as f:
                files = [("files", (os.path.basename(file_path), f, "image/jpeg"))]
                response = requests.post(url, headers=headers, files=files)
                
            if response.status_code == 200:
                print(f"✅ Synced: {os.path.basename(file_path)}")
            else:
                print(f"❌ Failed ({response.status_code}): {os.path.basename(file_path)}")
        except Exception as e:
            print(f"⚠️ Error syncing {os.path.basename(file_path)}: {e}")

def main():
    parser = argparse.ArgumentParser(description="SnapMoment Lightning Uploader CLI")
    parser.add_argument("--folder", required=True, help="Folder to monitor")
    parser.add_argument("--event", required=True, help="Event ID to sync to")
    parser.add_argument("--token", required=True, help="Your Photographer Access Token")
    parser.add_argument("--url", default="http://localhost:8000", help="API Base URL")
    
    args = parser.parse_args()
    
    if not os.path.exists(args.folder):
        print(f"Error: Folder {args.folder} does not exist.")
        return

    event_handler = PhotoSyncHandler(args.url, args.token, args.event)
    observer = Observer()
    observer.schedule(event_handler, args.folder, recursive=False)
    observer.start()

    print(f"⚡ Monitoring {args.folder}...")
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        observer.stop()
    observer.join()

if __name__ == "__main__":
    main()
