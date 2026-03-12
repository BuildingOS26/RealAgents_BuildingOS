import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv(dotenv_path="backend/.env")

url: str = os.environ.get("SUPABASE_URL")
key: str = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")

if not url or not key:
    print("Error: Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
    exit(1)

supabase: Client = create_client(url, key)

print(f"Connecting to Supabase: {url}")

try:
    res = supabase.storage.list_buckets()
    print("Buckets found:")
    for bucket in res:
        print(f" - {bucket.name}")
except Exception as e:
    print(f"Error listing buckets: {e}")

# Try to list files in 'documents' if it exists, or 'building-files'
try:
    print("\nListing 'documents' bucket:")
    files = supabase.storage.from_("documents").list()
    print(files)
except Exception as e:
    print(f"Error listing 'documents': {e}")

try:
    print("\nListing 'building-files' bucket:")
    files = supabase.storage.from_("building-files").list()
    print(files)
except Exception as e:
    print(f"Error listing 'building-files': {e}")
