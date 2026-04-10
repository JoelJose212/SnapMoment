import os
import bcrypt
import re

def update_env_file(filepath, new_hash):
    if not os.path.exists(filepath):
        return False
        
    with open(filepath, 'r') as f:
        content = f.read()
        
    # Replace the existing password hash line
    if "ADMIN_PASSWORD_HASH=" in content:
        content = re.sub(
            r'ADMIN_PASSWORD_HASH=.*', 
            f'ADMIN_PASSWORD_HASH={new_hash}', 
            content
        )
    else:
        content += f'\nADMIN_PASSWORD_HASH={new_hash}\n'
        
    with open(filepath, 'w') as f:
        f.write(content)
    return True

print("🔒 SnapMoment Admin Password Updater")
print("-" * 40)
password = input("Enter new Admin password (e.g. MySecret!123): ")

if not password.strip():
    print("❌ Password cannot be empty.")
    exit(1)

print("\nGenerating secure bcrypt hash...")
salt = bcrypt.gensalt()
hashed_password = bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

# Paths to the .env files
backend_env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
root_env_path = os.path.join(os.path.dirname(__file__), "..", "..", ".env")

backend_updated = update_env_file(backend_env_path, hashed_password)
root_updated = update_env_file(root_env_path, hashed_password)

if backend_updated or root_updated:
    print(f"✅ Successfully updated your Admin Password!")
    print("💡 Don't forget to restart the backend container by running:")
    print("    docker compose restart backend")
else:
    print("❌ Could not find .env files to update.")
