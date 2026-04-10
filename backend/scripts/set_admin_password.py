import os
import re

def update_env_file(filepath, new_password):
    if not os.path.exists(filepath):
        return False
        
    with open(filepath, 'r') as f:
        content = f.read()
        
    # Replace the existing password or add it
    if "ADMIN_PASSWORD_HASH=" in content:
        # Migration from hash to plain text
        content = re.sub(
            r'ADMIN_PASSWORD_HASH=.*', 
            f'ADMIN_PASSWORD={new_password}', 
            content
        )
    elif "ADMIN_PASSWORD=" in content:
        content = re.sub(
            r'ADMIN_PASSWORD=.*', 
            f'ADMIN_PASSWORD={new_password}', 
            content
        )
    else:
        content += f'\nADMIN_PASSWORD={new_password}\n'
        
    with open(filepath, 'w') as f:
        f.write(content)
    return True

print("🔓 SnapMoment Admin Password Updater (Normal Text)")
print("-" * 40)
password = input("Enter new Admin password: ")

if not password.strip():
    print("❌ Password cannot be empty.")
    exit(1)

# Paths to the .env files
backend_env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
root_env_path = os.path.join(os.path.dirname(__file__), "..", "..", ".env")

backend_updated = update_env_file(backend_env_path, password)
root_updated = update_env_file(root_env_path, password)

if backend_updated or root_updated:
    print(f"✅ Successfully updated your Admin Password!")
    print(f"💡 New password set to: {password}")
    print("💡 Don't forget to restart the backend container by running:")
    print("    docker compose restart backend")
else:
    print("❌ Could not find .env files to update.")
