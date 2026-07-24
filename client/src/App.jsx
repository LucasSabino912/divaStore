import { useState, useEffect } from 'react'
import { getProducts } from '../services/api' // Ajustá la ruta si es necesario

// 1. DICCIONARIO DE COLORES (Mapea el nombre que ponés en el admin a un color real)
const MAPA_COLORES = {
  'negro': '#000000',
  'blanco': '#FFFFFF',
  'gris': '#808080',
  'marrón': '#5C4033',
  'marron': '#5C4033',
  'carey': '#4A2C11',
  'caramelo': '#C3793A',
  'naranja': '#E66100',
  'rojo': '#D32F2F',
  'rosa': '#E91E63',
  'dorado': '#D4AF37',
  'oro': '#D4AF37',
  'verde': '#2E7D32',
  'verde oliva': '#556B2F',
  'azul': '#1976D2',
  'plateado': '#C0C0C0',
  'plata': '#C0C0C0',
  'transparente': '#E3F2FD'
}

const obtenerColorHex = (nombreColor) => {
  if (!nombreColor) return '#CCCCCC'
  const clave = nombreColor.toLowerCase().trim()
  return MAPA_COLORES[clave] || '#888888' // Gris por defecto si no existe
}

export default function App() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [categoriaActiva, setCategoriaActiva] = useState('todos')
  const [orden, setOrden] = useState('recientes')
  
  const [carrito, setCarrito] = useState([])

  // Estados para el Modal de Producto
  const [productoSeleccionado, setProductoSeleccionado] = useState(null)
  const [imagenPrincipal, setImagenPrincipal] = useState(null)
  const [colorElegido, setColorElegido] = useState('')

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      try {
        const data = await getProducts()
        setProducts(data || [])
      } catch (error) {
        console.error("Error al cargar productos:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Agregar al carrito (soporta agregar desde la tarjeta directo o desde el modal con el color elegido)
  const agregarAlCarrito = (product, color = null) => {
    const colorFinal = color || (product.colors && product.colors.length > 0 ? product.colors[0] : 'Único')
    setCarrito([...carrito, { ...product, colorSeleccionado: colorFinal }])
    alert(`Agregaste: ${product.name} (Color: ${colorFinal})`)
  }

  // Lógica del Modal
  const abrirModal = (prod) => {
    setProductoSeleccionado(prod)
    setImagenPrincipal(prod.image_url || (prod.image_urls && prod.image_urls[0]) || null)
    setColorElegido(prod.colors && prod.colors.length > 0 ? prod.colors[0] : '')
  }

  const cerrarModal = () => {
    setProductoSeleccionado(null)
    setImagenPrincipal(null)
    setColorElegido('')
  }

  // Filtrado y Ordenamiento
  const categoriasUnicas = ['todos', ...new Set(products.map(p => p.category?.toLowerCase()).filter(Boolean))]

  const productosFiltrados = products.filter(p => {
    if (categoriaActiva === 'todos') return true
    return p.category?.toLowerCase() === categoriaActiva
  })

  const productosOrdenados = [...productosFiltrados].sort((a, b) => {
    if (orden === 'menor-precio') return a.price - b.price
    if (orden === 'mayor-precio') return b.price - a.price
    return b.id - a.id
  })

  // Evitar scroll del fondo cuando el modal está abierto
  useEffect(() => {
    if (productoSeleccionado) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'unset'
  }, [productoSeleccionado])

  return (
    <div className="min-h-screen bg-white text-black font-sans relative">
      
      {/* NAVBAR */}
      <header className="border-b-2 border-black px-6 py-4 flex justify-between items-center sticky top-0 bg-black text-white z-40">
        <h1 className="text-xl font-extrabold tracking-widest uppercase">Diva Store</h1>
        <button 
          onClick={() => alert(`Productos en el carrito: ${carrito.length}`)}
          className="border-2 border-white px-4 py-2 text-sm font-bold bg-black text-white shadow-[2px_2px_0px_0px_rgba(255,255,255,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(255,255,255,1)] transition-all cursor-pointer"
        >
          Carrito ({carrito.length})
        </button>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-5xl font-extrabold uppercase tracking-tight mb-2">Diva Store</h2>
          <p className="text-gray-600 text-sm md:text-base">Catálogo exclusivo de accesorios seleccionados.</p>
        </div>

        {/* BARRA DE FILTROS */}
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-10 pb-6 border-b-2 border-black">
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

        {/* ESTADOS DE CARGA / VACÍO */}
        {loading && (
          <div className="text-center py-20 font-bold uppercase tracking-wider text-gray-500 animate-pulse">
            Cargando catálogo...
          </div>
        )}

        {!loading && productosOrdenados.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-black p-8">
            <p className="font-bold text-lg uppercase">No hay productos disponibles.</p>
          </div>
        )}

        {/* GRILLA DE PRODUCTOS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
          {!loading && productosOrdenados.map((product) => (
            <div 
              key={product.id} 
              className="border-2 border-black p-4 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all bg-white cursor-pointer group"
            >
              <div onClick={() => abrirModal(product)}>
                {/* Imagen del producto */}
                <div className="w-full h-56 bg-gray-100 border-2 border-black mb-4 flex items-center justify-center overflow-hidden relative">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <span className="text-gray-400 font-bold text-xs uppercase tracking-wider">[ Sin Imagen ]</span>
                  )}
                  {/* Etiqueta rápida si tiene varios colores */}
                  {product.colors && product.colors.length > 1 && (
                    <span className="absolute bottom-2 left-2 bg-white border-2 border-black text-[10px] font-bold px-2 py-0.5">
                      +{product.colors.length} Colores
                    </span>
                  )}
                </div>

                <span className="text-xs font-bold uppercase tracking-wider bg-black text-white px-2 py-1">
                  {product.category}
                </span>
                
                <h3 className="font-bold text-lg mt-3 group-hover:underline">{product.name}</h3>
                <p className="text-sm text-gray-600 mt-1 line-clamp-2">{product.description || "Sin descripción."}</p>
              </div>

              <div className="mt-6 flex items-center justify-between pt-4 border-t border-gray-200">
                <span className="font-extrabold text-lg">${Number(product.price).toLocaleString('es-AR')}</span>
                <button 
                  onClick={(e) => {
                    e.stopPropagation(); // Evita abrir el modal al tocar "Agregar" directo
                    agregarAlCarrito(product);
                  }}
                  className="border-2 border-black px-3 py-1 text-sm font-bold bg-white hover:bg-black hover:text-white transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none cursor-pointer"
                >
                  Agregar
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* ==================================================== */}
      {/* MODAL DEL PRODUCTO (Responsivo y Neo-Brutalista)     */}
      {/* ==================================================== */}
      {productoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={cerrarModal}>
          
          {/* Contenedor del Modal */}
          <div 
            className="bg-white border-4 border-black w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row relative"
            onClick={(e) => e.stopPropagation()} // Evita que se cierre al hacer clic adentro
          >
            
            {/* Botón Cerrar Absolute */}
            <button 
              onClick={cerrarModal}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-500 hover:text-white font-bold cursor-pointer transition-colors"
            >
              X
            </button>

            {/* SECCIÓN IZQUIERDA: GALERÍA DE IMÁGENES */}
            <div className="w-full md:w-1/2 p-6 border-b-4 md:border-b-0 md:border-r-4 border-black flex flex-col gap-4 bg-gray-50">
              
              {/* Imagen Principal Grande */}
              <div className="w-full aspect-square border-2 border-black bg-white overflow-hidden flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                {imagenPrincipal ? (
                  <img src={imagenPrincipal} alt={productoSeleccionado.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-bold text-gray-400 tracking-widest">[ Sin Imagen ]</span>
                )}
              </div>

              {/* Carrusel / Miniaturas (Une Portada + Galería filtrando repetidas o vacías) */}
              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {[productoSeleccionado.image_url, ...(productoSeleccionado.image_urls || [])]
                  .filter((url, index, self) => url && self.indexOf(url) === index) // Filtra nulos y duplicados
                  .map((img, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setImagenPrincipal(img)}
                      className={`w-16 h-16 flex-shrink-0 border-2 cursor-pointer transition-all ${
                        imagenPrincipal === img 
                          ? 'border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] scale-105' 
                          : 'border-gray-300 hover:border-black opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={img} alt="Miniatura" className="w-full h-full object-cover" />
                    </div>
                ))}
              </div>
            </div>

            {/* SECCIÓN DERECHA: INFO Y COMPRA */}
            <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between bg-white">
              
              <div>
                <span className="text-xs font-bold uppercase tracking-wider bg-black text-white px-2 py-1 mb-4 inline-block">
                  {productoSeleccionado.category || 'General'}
                </span>
                
                <h2 className="text-2xl md:text-4xl font-black uppercase tracking-tight mb-2 leading-none">
                  {productoSeleccionado.name}
                </h2>
                
                <p className="text-3xl font-extrabold text-black mb-6">
                  ${Number(productoSeleccionado.price).toLocaleString('es-AR')}
                </p>

                <p className="text-sm text-gray-700 mb-6 leading-relaxed">
                  {productoSeleccionado.description || 'Este producto no cuenta con descripción detallada.'}
                </p>

                {/* SELECTOR DE COLORES (Los circulitos mágicos) */}
                {productoSeleccionado.colors && productoSeleccionado.colors.length > 0 && (
                  <div className="mb-8 p-4 border-2 border-black bg-gray-50 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                    <p className="text-xs font-black uppercase tracking-wider mb-3">
                      Color seleccionado: <span className="text-black ml-1">{colorElegido || 'Elegí un color'}</span>
                    </p>
                    
                    <div className="flex flex-wrap gap-3">
                      {productoSeleccionado.colors.map((colorName) => {
                        const hex = obtenerColorHex(colorName)
                        const esSeleccionado = colorElegido === colorName

                        return (
                          <button
                            key={colorName}
                            type="button"
                            onClick={() => setColorElegido(colorName)}
                            title={colorName}
                            style={{ backgroundColor: hex }}
                            className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer relative ${
                              esSeleccionado
                                ? 'border-black scale-125 shadow-[0px_0px_0px_2px_#000]'
                                : 'border-gray-400 hover:scale-110 opacity-90'
                            }`}
                          >
                            {/* Si es blanco le damos un bordecito sutil para que no se pierda en el fondo */}
                            {colorName.toLowerCase() === 'blanco' && (
                              <span className="absolute inset-0 rounded-full border border-gray-300" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* ACCIONES (Stock y Agregar al Carrito) */}
              <div className="mt-8">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                  {productoSeleccionado.stock > 0 ? `${productoSeleccionado.stock} unidades en stock` : 'Sin stock'}
                </p>

                <button 
                  onClick={() => {
                    agregarAlCarrito(productoSeleccionado, colorElegido)
                    cerrarModal() // Opcional: cierra el modal tras agregar
                  }}
                  disabled={productoSeleccionado.stock <= 0}
                  className={`w-full py-4 border-2 border-black font-black uppercase tracking-wider text-sm transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                    productoSeleccionado.stock > 0 
                      ? 'bg-black text-white hover:bg-white hover:text-black hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] cursor-pointer'
                      : 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-none'
                  }`}
                >
                  {productoSeleccionado.stock > 0 ? 'Agregar al Carrito' : 'Agotado'}
                </button>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  )
}