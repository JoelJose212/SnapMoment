import os
import uuid
import logging
from pyftpdlib.authorizers import DummyAuthorizer, AuthenticationFailed
from pyftpdlib.handlers import FTPHandler
from pyftpdlib.servers import FTPServer
from sqlalchemy import create_engine, text
from app.config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("FTP-Gateway")

# Sync Engine for DB checks
DB_URL = settings.DATABASE_URL.replace("+asyncpg", "").replace("@postgres:", "@127.0.0.1:")
engine = create_engine(DB_URL)

class SnapMomentAuthorizer(DummyAuthorizer):
    """Custom authorizer that validates credentials against the events table."""
    
    def validate_authentication(self, username, password, handler):
        with engine.connect() as conn:
            # Username is the qr_token
            result = conn.execute(
                text("SELECT id, ftp_password, ftp_enabled FROM events WHERE qr_token = :token"),
                {"token": username}
            )
            row = result.fetchone()
            
            if not row:
                logger.warning(f"Auth failed: Token {username} not found")
                raise AuthenticationFailed("Invalid token")
            
            event_id, db_password, ftp_enabled = row
            
            if not ftp_enabled:
                logger.warning(f"Auth failed: FTP disabled for event {username}")
                raise AuthenticationFailed("FTP disabled for this event")
                
            if db_password and db_password != password:
                logger.warning(f"Auth failed: Incorrect password for event {username}")
                raise AuthenticationFailed("Incorrect password")
            
            # Setup virtual home directory for this user
            # We use a temporary ingestion folder for the event
            home_dir = os.path.join(settings.LOCAL_STORAGE_PATH, str(event_id), "ftp_ingest")
            os.makedirs(home_dir, exist_ok=True)
            
            # Add user dynamically if not already present
            if not self.has_user(username):
                self.add_user(username, password or "", home_dir, perm="elradfmwMT")
            else:
                # Update home dir just in case
                self.user_table[username]['home'] = home_dir
                
        return True

class SnapMomentFTPHandler(FTPHandler):
    def on_file_received(self, file_path):
        """Triggered when a camera finishes uploading a photo."""
        logger.info(f"File received via FTP: {file_path}")
        # In a real system, we would trigger the Celery task here.
        # For now, we rely on the 'Live Sync' watcher or a separate task.
        # To make it 'Neural', we should trigger processing immediately.
        try:
            # Import here to avoid circular imports
            from app.tasks.celery_app import celery_app
            # Extract event_id from path
            # Path is /app/uploads/<event_id>/ftp_ingest/filename.jpg
            parts = file_path.split(os.sep)
            event_id = parts[-3] # third from end
            
            # Actually, we should move it to the originals folder first.
            final_dir = os.path.join(settings.LOCAL_STORAGE_PATH, event_id, "originals")
            os.makedirs(final_dir, exist_ok=True)
            
            filename = os.path.basename(file_path)
            final_path = os.path.join(final_dir, filename)
            
            # If file already exists in final, maybe rename or overwrite
            os.rename(file_path, final_path)
            
            # 1. Create Photo Record in DB
            photo_id = uuid.uuid4()
            original_key = f"{event_id}/originals/{filename}"
            original_url = f"{settings.LOCAL_STORAGE_BASE_URL}/{event_id}/originals/{filename}"
            
            with engine.connect() as conn:
                conn.execute(
                    text("INSERT INTO photos (id, event_id, original_s3_key, original_s3_url, status, face_indexed, faces_count, has_social_crops) VALUES (:id, :event_id, :original_key, :original_url, 'processing', false, 0, false)"),
                    {"id": photo_id, "event_id": event_id, "original_key": original_key, "original_url": original_url}
                )
                conn.commit()
            
            # 2. Trigger Celery Task
            from app.tasks.photo_processing import process_single_photo
            process_single_photo.delay(str(photo_id), event_id, final_path, filename)
            logger.info(f"Triggered AI Indexing for event {event_id} after FTP receipt of {filename}")
        except Exception as e:
            logger.error(f"Failed to trigger ingestion: {e}")

def run_ftp_server():
    authorizer = SnapMomentAuthorizer()
    handler = SnapMomentFTPHandler
    handler.authorizer = authorizer
    handler.banner = "SnapMoment Neural FTP Gateway Ready."
    
    # Listen on all interfaces on port 2121 (to avoid root privileges)
    address = ("0.0.0.0", 2121)
    server = FTPServer(address, handler)
    
    # Set limits
    server.max_cons = 256
    server.max_cons_per_ip = 5
    
    logger.info("Starting SnapMoment FTP Gateway on port 2121...")
    server.serve_forever()

if __name__ == "__main__":
    run_ftp_server()
