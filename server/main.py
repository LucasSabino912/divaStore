import os
from fastapi import FastAPI, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Inicializar el cliente de Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

app = FastAPI(title="DivaStore API", version="1.0.0")

# Habilitar CORS para que React (puerto 5173 normalmente) pueda hablar con FastAPI sin problemas
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Esquema de Pydantic para validar los datos del producto
class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    stock: int = 0
    category: str
    image_url: Optional[str] = None

@app.get("/")
def read_root():
    return {"message": "¡API de DivaStore conectada a Supabase con éxito!"}

# ENDPOINTS 
# 1. Obtener todos los productos
@app.get("/products")
def get_products():
    response = supabase.table("products").select("*").execute()
    return response.data

# 2. Crear un producto
@app.post("/products", status_code=status.HTTP_201_CREATED)
def create_product(product: ProductCreate):
    response = supabase.table("products").insert(product.dict()).execute()
    
    if not response.data:
        raise HTTPException(status_code=400, detail="No se pudo crear el producto")
    
    return response.data[0]

# 3. Eliminar un producto por ID
@app.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int):
    response = supabase.table("products").delete().eq("id", product_id).execute()
    
    return None