"""
store_index.py
==============
Fetches ALL live data from Supabase database and re-indexes it into Pinecone.

Run this script whenever you want to refresh the AI's knowledge:
    cd pdf_rag
    python store_index.py
"""

from src.db_loader import load_from_supabase
from src.helper import text_split, download_huggingface_model
from pinecone.grpc import PineconeGRPC as Pinecone
from pinecone import ServerlessSpec
from langchain_pinecone import PineconeVectorStore
import os
from dotenv import load_dotenv

load_dotenv()

PINECONE_API_KEY = os.environ.get("PINECONE_API_KEY")
os.environ["PINECONE_API_KEY"] = PINECONE_API_KEY

INDEX_NAME = "pmajay"

print("=" * 60)
print("  PM-AJAY  |  Live Database → Pinecone Indexer")
print("=" * 60)

# ── Step 1: Load all rows from Supabase ──────────────────────────
print("\n[1/4] Loading data from Supabase...")
documents = load_from_supabase()

if not documents:
    print("❌ No documents loaded. Check Supabase credentials and table access.")
    exit(1)

# ── Step 2: Split documents into chunks ──────────────────────────
print(f"\n[2/4] Splitting {len(documents)} documents into chunks...")
text_chunks = text_split(documents)
print(f"  ✅ {len(text_chunks)} chunks created")

# ── Step 3: Load embedding model ─────────────────────────────────
print("\n[3/4] Loading HuggingFace embedding model...")
embeddings = download_huggingface_model()
print("  ✅ Embedding model ready")

# ── Step 4: Delete old index + re-create + upload ────────────────
print(f"\n[4/4] Uploading to Pinecone index: '{INDEX_NAME}'...")
pc = Pinecone(api_key=PINECONE_API_KEY)

# Delete and recreate index to avoid duplicate data
existing_indexes = [idx["name"] for idx in pc.list_indexes()]
if INDEX_NAME in existing_indexes:
    print(f"  🗑️  Deleting old index '{INDEX_NAME}'...")
    pc.delete_index(INDEX_NAME)
    print(f"  ✅ Old index deleted")

# Create fresh index
pc.create_index(
    name=INDEX_NAME,
    dimension=384,
    metric="cosine",
    spec=ServerlessSpec(cloud="aws", region="us-east-1")
)
print(f"  ✅ New index '{INDEX_NAME}' created")

# Upload all chunks
docsearch = PineconeVectorStore.from_documents(
    documents=text_chunks,
    index_name=INDEX_NAME,
    embedding=embeddings,
)

print(f"\n{'=' * 60}")
print(f"  ✅ Done! {len(text_chunks)} chunks indexed into Pinecone.")
print(f"  The AI assistant now has live database knowledge.")
print(f"{'=' * 60}")