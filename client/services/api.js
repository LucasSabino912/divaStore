// client/src/services/api.js

const API_URL = import.meta.env.VITE_API_URL;

// Obtener todos los productos
export async function getProducts() {
  try {
    const response = await fetch(`${API_URL}/products`);
    if (!response.ok) throw new Error("Error al obtener los productos");
    return await response.json();
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
}
