import os
from dotenv import load_dotenv
from supabase import create_client, Client
from langchain.docstore.document import Document

load_dotenv()

# ─── Tables to index from the live database ────────────────────────────────
# Add or remove table names here as needed
TABLES_TO_INDEX = [
    "projects",
    "approved_projects",
    "district_proposals",
    "work_orders",
    "work_progress",
    "fund_allocations",
    "fund_releases",
    "state_fund_releases",
    "village_fund_releases",
    "project_fund_releases",
    "project_assignments",
    "project_progress_updates",
    "implementing_agencies",
    "executing_agencies",
    "agency_assignments",
    "implementing_agencies_assignment",
    "district_assignment",
    "state_assignment",
    "states",
    "districts",
    "villages",
    "circulars",
    "uc_submissions",
    "support_tickets",
    "reports",
]

# ─── Columns to SKIP (sensitive / not useful for AI answers) ────────────────
SKIP_COLUMNS = {
    "password", "push_token", "bank_account_number",
    "verified_by", "approved_by", "changed_by",
}


def get_supabase_client() -> Client:
    url = os.getenv("SUPABASE_URL")
    key = os.getenv("SUPABASE_KEY")
    if not url or not key:
        raise ValueError("Missing SUPABASE_URL or SUPABASE_KEY in pdf_rag/.env")
    return create_client(url, key)


def row_to_text(table: str, row: dict) -> str:
    """Convert a database row dict to human-readable text."""
    lines = [f"Table: {table}"]
    for col, val in row.items():
        if col in SKIP_COLUMNS:
            continue
        if val is None or val == "" or val == [] or val == {}:
            continue
        lines.append(f"  {col}: {val}")
    return "\n".join(lines)


def load_from_supabase() -> list[Document]:
    """
    Fetches all rows from TABLES_TO_INDEX via Supabase REST API
    and returns them as a list of LangChain Documents.
    """
    client = get_supabase_client()
    all_docs = []

    for table in TABLES_TO_INDEX:
        try:
            # Fetch up to 1000 rows per table (Supabase default limit)
            response = client.table(table).select("*").limit(1000).execute()
            rows = response.data or []

            if not rows:
                print(f"  ⚠️  {table}: empty or no data")
                continue

            for row in rows:
                content = row_to_text(table, row)
                doc = Document(
                    page_content=content,
                    metadata={"source": table, "table": table}
                )
                all_docs.append(doc)

            print(f"  ✅  {table}: {len(rows)} rows → {len(rows)} documents")

        except Exception as e:
            print(f"  ❌  {table} failed: {e}")

    print(f"\nTotal documents loaded: {len(all_docs)}")
    return all_docs
