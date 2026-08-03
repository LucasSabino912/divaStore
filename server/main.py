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

# Habilitar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ProductCreate(BaseModel):
    name: str
    description: Optional[str] = None
    price: float
    stock: int = 0
    category: str
    image_url: Optional[str] = None
    image_urls: List[str] = []
    colors: List[str] = []

class ProductUpdate(BaseModel):
    name: str
    price: float
    stock: int
    description: Optional[str] = None
    colors: List[str] = []
    image_url: Optional[str] = None
    image_urls: List[str] = []

@app.get("/")
def read_root():
    return {"message": "API conectada a Supabase con éxito"}

# Endpoint para el bota
@app.api_route("/health", methods=["GET", "HEAD"])
def health_check():
    return {"status": "ok"}


# ENDPOINTS 

# GET Productos
@app.get("/products")
def get_products():
    response = supabase.table("products").select("*").execute()
    return response.data

# POST Crear productos
@app.post("/products", status_code=status.HTTP_201_CREATED)
async def create_product(product: ProductCreate):
    try:
        response = supabase.table("products").insert(product.dict()).execute()
        if not response.data:
            raise HTTPException(status_code=400, detail="No se pudo crear el producto")
        return response.data[0]
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# DELETE Producto por id
@app.delete("/products/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(product_id: int):
    response = supabase.table("products").delete().eq("id", product_id).execute()
    return None

@app.put("/products/{product_id}")
async def update_product(product_id: int, product: ProductUpdate):
    try:
        # Pydantic convierte los datos a un diccionario apto para Supabase
        update_data = product.dict()

        response = supabase.table("products").update(update_data).eq("id", product_id).execute()
        
        if not response.data:
            raise HTTPException(status_code=404, detail="Producto no encontrado")
            
        return response.data[0]
    except Exception as e:
        print("Error en update:", str(e))  # Muestra el error exacto en tu consola de FastAPI
        raise HTTPException(status_code=500, detail=str(e))