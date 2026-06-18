from langchain.document_loaders import PyPDFLoader, DirectoryLoader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain.embeddings import HuggingFaceEmbeddings
from langchain.vectorstores.faiss import FAISS
from langchain_community.document_loaders import PDFMinerLoader, CSVLoader
from langchain.docstore.document import Document
import os


from unstructured.partition.pdf import partition_pdf
from PIL import Image
import pytesseract


def load_pdf_file(data):
    loader = DirectoryLoader(data,
                            glob = "*.pdf",
                            loader_cls = PyPDFLoader)
    documents = loader.load()

    return documents

def text_split(extracted_data):
    test_splitter = RecursiveCharacterTextSplitter(chunk_size = 500, chunk_overlap = 20)
    text_chunks = test_splitter.split_documents(extracted_data)
    return text_chunks

def download_huggingface_model():
    embeddings = HuggingFaceEmbeddings(model_name = 'sentence-transformers/all-MiniLM-L6-v2')
    return embeddings

def process_documents(filepath, embeddings):
    try:
        file_extension = os.path.splitext(filepath)[1].lower()
        
        if file_extension == '.pdf':
            loader = PDFMinerLoader(filepath)
        elif file_extension == '.csv':
            loader = CSVLoader(filepath) # encoding='utf-8' might be needed depending on file
        else:
             raise ValueError(f"Unsupported file type: {file_extension}")
             
        docs = loader.load()
        splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
        chunks = splitter.split_documents(docs)
        return FAISS.from_documents(chunks, embeddings)
    except Exception as e:
        raise RuntimeError(f"Failed to process document: {str(e)}")
