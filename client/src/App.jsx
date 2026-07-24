import { useState, useEffect } from 'react'
import { getProducts } from '../services/api'

function App() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [categoriaActiva, setCategoriaActiva] = useState('todos')
  const [orden, setOrden] = useState('recientes')
  
  // Estado para el carrito de compras (guarda los productos agregados)
  const [carrito, setCarrito] = useState([])

  // Cargar productos al iniciar la app
  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const data = await getProducts()
      setProducts(data)
      setLoading(false)
    }
    fetchData()
  }, [])

  // Función para agregar un producto al carrito
  const agregarAlCarrito = (product) => {
    setCarrito([...carrito, product])
  }

  // Extraer categorías únicas de forma automática desde los productos reales
  const categoriasUnicas = ['todos', ...new Set(products.map(p => p.category?.toLowerCase()).filter(Boolean))]

  // Filtrar productos por categoría
  const productosFiltrados = products.filter(p => {
    if (categoriaActiva === 'todos') return true
    return p.category?.toLowerCase() === categoriaActiva
  })

  // Ordenar productos (menor precio, mayor precio, recientes)
  const productosOrdenados = [...productosFiltrados].sort((a, b) => {
    if (orden === 'menor-precio') return a.price - b.price
    if (orden === 'mayor-precio') return b.price - a.price
    return b.id - a.id
  })

  return (
    <div className="min-h-screen bg-white text-black font-sans">
      {/* Navbar Minimalista (Header Negro Elegante) */}
      <header className="border-b-2 border-black px-6 py-4 flex justify-between items-center sticky top-0 bg-black text-white z-50">
        <h1 className="text-xl font-extrabold tracking-widest uppercase">Diva Store</h1>
        <button 
          onClick={() => alert(`Productos en el carrito: ${carrito.length}`)}
          className="border-2 border-white px-4 py-2 text-sm font-bold bg-black text-white shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] transition-all cursor-pointer"
        >
          Carrito ({carrito.length})
        </button>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight mb-2">Diva Store</h2>
          <p className="text-gray-600 text-sm md:text-base">Catálogo exclusivo de accesorios seleccionados.</p>
        </div>

        {/* Barra de Filtros y Categorías Dinámicas */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-10 pb-6 border-b-2 border-black">
          
          {/* Categorías automáticas con scroll horizontal */}
          <div className="flex overflow-x-auto gap-2 pb-2 md:pb-0 no-scrollbar">
            {categoriasUnicas.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoriaActiva(cat)}
                className={`border-2 border-black px-4 py-2 text-sm font-bold uppercase whitespace-nowrap transition-all cursor-pointer ${
                  categoriaActiva === cat
                    ? 'bg-black text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,0.3)]'
                    : 'bg-white text-black hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Selector de Orden por Precio */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider">Ordenar:</span>
            <select
              value={orden}
              onChange={(e) => setOrden(e.target.value)}
              className="border-2 border-black px-3 py-2 text-sm font-bold bg-white focus:outline-none shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] cursor-pointer"
            >
              <option value="recientes">Más recientes</option>
              <option value="menor-precio">Menor precio</option>
              <option value="mayor-precio">Mayor precio</option>
            </select>
          </div>
        </div>

        {/* Estado de Carga */}
        {loading && (
          <div className="text-center py-20 font-bold uppercase tracking-wider text-gray-500">
            Cargando catálogo desde la base de datos...
          </div>
        )}

        {/* Mensaje si no hay productos */}
        {!loading && productosOrdenados.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-black p-8">
            <p className="font-bold text-lg uppercase">No hay productos disponibles en esta categoría.</p>
            <p className="text-sm text-gray-600 mt-1">Prueba agregando productos desde tu panel de administración.</p>
          </div>
        )}

        {/* Grilla de Productos Responsive */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {!loading && productosOrdenados.map((product) => (
            <div 
              key={product.id} 
              className="border-2 border-black p-4 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all bg-white"
            >
              <div>
                {/* Imagen del producto */}
                <div className="w-full h-48 bg-gray-100 border-2 border-black mb-4 flex items-center justify-center overflow-hidden">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-400 font-bold text-xs uppercase tracking-wider">[ Sin Imagen ]</span>
                  )}
                </div>

                <span className="text-xs font-bold uppercase tracking-wider bg-black text-white px-2 py-1">
                  {product.category}
                </span>
                
                <h3 className="font-bold text-lg mt-3">{product.name}</h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description || "Sin descripción."}</p>
              </div>

              <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="font-extrabold text-lg">${Number(product.price).toLocaleString('es-AR')}</span>
                <button 
                  onClick={() => agregarAlCarrito(product)}
                  className="border-2 border-black px-3 py-1 text-sm font-bold bg-white hover:bg-black hover:text-white transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
                >
                  Agregar
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}

export default App