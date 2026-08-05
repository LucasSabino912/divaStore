import { useState, useEffect } from 'react'
import { getProducts } from '../services/api' 

// 1. DICCIONARIO DE COLORES
const MAPA_COLORES = {
  'negro': '#000000',
  'blanco': '#FFFFFF',
  'crema' : '#FFFDD0',
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
  'transparente': '#E3F2FD',
  'amarillo' : '#FFFF00',
  'violeta': '#7F00FF',
  'celeste': '#B2FFFF',
  'negro mate':'#171717',
  'nude': '#F2D2BD',
  'fucsia': 'FF00FF',
  'violeta azulado': '#8A2BE2',
  
  // GRADIENTES
  'verde marron': 'linear-gradient(90deg, #2E7D32 50%, #5C4033 50%)',
  'verde marrón': 'linear-gradient(90deg, #2E7D32 50%, #5C4033 50%)',
  'dorado negro': 'linear-gradient(90deg, #EFBF04 50%, #000000 50%)',
  'dorado marron': 'linear-gradient(90deg, #EFBF04 50%, #5C4033 50%)',
  'dorado marrón': 'linear-gradient(90deg, #EFBF04 50%, #5C4033 50%)',
  'transparente celeste': 'linear-gradient(90deg, #E3F2FD 50%, #B2FFFF 50%)',
  'naranja celeste': 'linear-gradient(90deg, #E66100 50%, #B2FFFF 50%)',
  'negro naranja': 'linear-gradient(90deg, #000000 50%, #E66100 50%)',
  'naranja negro': 'linear-gradient(90deg, #E66100 50%, #000000 50%)',
  'gris violeta': 'linear-gradient(90deg, #808080 50%, #7F00FF 50%)',
  'negro azul':'linear-gradient(90deg, #000000 50%, #1976D2 50%)',
  'celeste marron':'linear-gradient(90deg, #B2FFFF 50%, #5C4033 50%)',
  'celeste marrón':'linear-gradient(90deg, #B2FFFF 50%, #5C4033 50%)',
  'rosa marron':'linear-gradient(90deg, #E91E63 50%, #5C4033 50%)',
  'rosa marrón':'linear-gradient(90deg, #E91E63 50%, #5C4033 50%)',
  'rosa negro':'linear-gradient(90deg, #E91E63 50%, #000000 50%)',
  'verde rosa':'linear-gradient(90deg, #2E7D32 50%, #E91E63 50%)',
  'rosa violeta': 'linear-gradient(90deg, #E91E63 50%, #7F00FF 50%)',


  // ANIMAL PRINTS
  'print normal': 'repeating-radial-gradient(circle at 50% 50%, #000 0px, #000 2px, #c3793a 3px, #e3c16f 5px)',
  'print marrón': 'repeating-radial-gradient(circle at 50% 50%, #2b1704 0px, #2b1704 2px, #5c4033 3px, #8c6849 5px)',
  'print marron': 'repeating-radial-gradient(circle at 50% 50%, #2b1704 0px, #2b1704 2px, #5c4033 3px, #8c6849 5px)',
  'print amarillo': 'repeating-radial-gradient(circle at 50% 50%, #000 0px, #000 2px, #e66100 3px, #ffeb3b 5px)',
  'print transparente': 'repeating-radial-gradient(circle at 50% 50%, #4a2c11 0px, #4a2c11 2px, #c3793a 3px, #e3f2fd 5px)',
  'print azul': 'repeating-radial-gradient(circle at 50% 50%, #0d47a1 0px, #0d47a1 2px, #1976d2 3px, #90caf9 5px)'
}


const obtenerColorHex = (nombreColor) => {
  if (!nombreColor) return '#CCCCCC'
  const clave = nombreColor.toLowerCase().trim()
  return MAPA_COLORES[clave] || '#888888'
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
  const [carritoAbierto, setCarritoAbierto] = useState(false)

  const agregarAlCarrito = (product, color = null) => {
    const colorFinal = color || (product.colors && product.colors.length > 0 ? product.colors[0] : 'Único')
    
    const nuevoItem = {
      ...product,
      price: Number(product.price) || 0,
      colorSeleccionado: colorFinal,
      cartId: Date.now() + Math.random()
    }
    
    setCarrito([...carrito, nuevoItem])
    setCarritoAbierto(true)
  }

  const eliminarDelCarrito = (cartId) => {
    setCarrito(carrito.filter(item => item.cartId !== cartId))
  }

  const generarPedido = () => {
    if (carrito.length === 0) return

    let total = 0
    let mensaje = `¡Hola! Quiero hacer un pedido en Diva Store ✨\n\n`
    
    carrito.forEach(item => {
      // 1. Limpiamos el precio asegurando que sea un número
      const precioNumerico = Number(item.price) || 0
      
      mensaje += `▪️ 1x ${item.name} (Color: ${item.colorSeleccionado}) - $${precioNumerico.toLocaleString('es-AR')}\n`
      
      // 2. Sumamos directamente el número limpio
      total += precioNumerico
    })

    mensaje += `\nTotal: $${total.toLocaleString('es-AR')}\n\n¿Me pasás los datos para abonar?`

    navigator.clipboard.writeText(mensaje)
      .then(() => {
        const textoCodificado = encodeURIComponent(mensaje);
        window.open(`https://wa.me/5493547544591?text=${textoCodificado}`, '_blank')
      })
      .catch(() => alert("Hubo un error al copiar el texto, intentá de nuevo."))
  }


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

  useEffect(() => {
    if (productoSeleccionado) document.body.style.overflow = 'hidden'
    else document.body.style.overflow = 'unset'
  }, [productoSeleccionado])

  return (
    <div className="min-h-screen bg-white text-black font-sans relative">
      
      {/* NAVBAR */}
      <header className="border-b-2 border-black px-4 sm:px-6 py-2 sm:py-3 flex justify-between items-center sticky top-0 bg-white text-black z-40 shadow-sm">
        <div className="flex items-center h-12 sm:h-16">
          <img 
            src="/logo.jpg" 
            alt="Diva Store" 
            className="h-full w-auto object-contain cursor-pointer"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          />
        </div>
        <button 
          onClick={() => setCarritoAbierto(true)}
          className="border-2 border-black px-4 py-2 text-xs sm:text-sm font-bold bg-black text-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
        >
          Carrito ({carrito.length})
        </button>
      </header>

      {/* CONTENIDO PRINCIPAL */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">

        <div className="sticky top-16 sm:top-20 z-0 mb-6 w-full h-72 sm:h-96 md:h-[450px] border-2 border-black overflow-hidden bg-stone-100">
          <img 
            src="/portada2.jpg" 
            alt="Diva Store Portada" 
            className="w-full h-full object-cover object-center"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
              e.currentTarget.parentElement.classList.add('flex', 'items-center', 'justify-center')
              e.currentTarget.parentElement.innerHTML = '<span class="font-black text-xs sm:text-sm uppercase tracking-widest text-gray-400">[ Carga portada.jpg en /public ]</span>'
            }}
          />
        </div>

        {/* 2. CAPA SUPERIOR DEL CATÁLOGO QUE SUBE Y TAPA LA PORTADA */}
        <div className="relative z-30 w-full min-h-screen bg-white pt-4 border-t-2 border-black">          
          {/* BARRA DE FILTROS */}
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 mb-10 pb-6 border-b-2 border-black bg-white">
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
            <div className="text-center py-20 font-bold uppercase tracking-wider text-gray-500 animate-pulse bg-white">
              Cargando catálogo...
            </div>
          )}

          {!loading && productosOrdenados.length === 0 && (
            <div className="text-center py-20 border-2 border-dashed border-black p-8 bg-white">
              <p className="font-bold text-lg uppercase">No hay productos disponibles.</p>
            </div>
          )}

          {/* GRILLA DE PRODUCTOS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 bg-white pb-12">
            {!loading && productosOrdenados.map((product) => (
              <div 
                key={product.id} 
                className="border-2 border-black p-4 flex flex-col justify-between shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all bg-white cursor-pointer group"
              >
                <div onClick={() => abrirModal(product)}>
                  <div className="w-full h-56 bg-gray-100 border-2 border-black mb-4 flex items-center justify-center overflow-hidden relative">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <span className="text-gray-400 font-bold text-xs uppercase tracking-wider">[ Sin Imagen ]</span>
                    )}
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
                      e.stopPropagation(); 
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

        </div>
      </main>

      {/* MODAL DEL PRODUCTO */}
      {productoSeleccionado && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={cerrarModal}>
          <div 
            className="bg-white border-4 border-black w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] flex flex-col md:flex-row relative"
            onClick={(e) => e.stopPropagation()} 
          >
            <button 
              onClick={cerrarModal}
              className="absolute top-4 right-4 z-10 w-8 h-8 flex items-center justify-center bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-red-500 hover:text-white font-bold cursor-pointer transition-colors"
            >
              X
            </button>

            <div className="w-full md:w-1/2 p-6 border-b-4 md:border-b-0 md:border-r-4 border-black flex flex-col gap-4 bg-gray-50">
              <div className="w-full aspect-square border-2 border-black bg-white overflow-hidden flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                {imagenPrincipal ? (
                  <img src={imagenPrincipal} alt={productoSeleccionado.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="font-bold text-gray-400 tracking-widest">[ Sin Imagen ]</span>
                )}
              </div>

              <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                {[productoSeleccionado.image_url, ...(productoSeleccionado.image_urls || [])]
                  .filter((url, index, self) => url && self.indexOf(url) === index)
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
                            className={`w-8 h-8 rounded-full border-2 border-black bg-white p-0.5 flex items-center justify-center transition-all cursor-pointer ${
                              esSeleccionado
                                ? 'scale-125 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                                : 'hover:scale-110 opacity-80 hover:opacity-100'
                            }`}
                          >
                            <span
                              style={{ background: hex }}
                              className={`w-full h-full rounded-full block ${
                                colorName.toLowerCase() === 'blanco' ? 'border border-gray-300' : ''
                              }`}
                            />
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
                  {productoSeleccionado.stock > 0 ? `${productoSeleccionado.stock} unidades en stock` : 'Sin stock'}
                </p>

                <button 
                  onClick={() => {
                    agregarAlCarrito(productoSeleccionado, colorElegido)
                    cerrarModal() 
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

      {/* SIDEBAR / FULLSCREEN CARRITO */}
      {carritoAbierto && (
        <div 
          className="fixed inset-0 bg-black/50 z-50 transition-opacity" 
          onClick={() => setCarritoAbierto(false)}
        />
      )}

      <div className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-white border-l-0 sm:border-l-4 border-black z-50 transform transition-transform duration-300 flex flex-col ${carritoAbierto ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-5 border-b-4 border-black flex justify-between items-center bg-gray-50">
          <h2 className="text-xl font-black uppercase tracking-widest">Tu Pedido</h2>
          <button 
            onClick={() => setCarritoAbierto(false)}
            className="w-8 h-8 flex items-center justify-center bg-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:bg-black hover:text-white font-bold cursor-pointer transition-colors"
          >
            X
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-4">
          {carrito.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <p className="font-bold uppercase tracking-wider text-sm">El carrito está vacío</p>
            </div>
          ) : (
            carrito.map(item => (
              <div key={item.cartId} className="flex gap-4 border-2 border-black p-3 bg-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] relative">
                <button 
                  onClick={() => eliminarDelCarrito(item.cartId)}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 border-2 border-black text-white text-xs font-bold flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
                  title="Eliminar"
                >
                  X
                </button>
                
                <div className="w-16 h-16 border-2 border-black bg-gray-100 flex-shrink-0">
                  {item.image_url ? (
                    <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                  ) : null}
                </div>
                
                <div className="flex-1 flex flex-col justify-center">
                  <h4 className="font-bold text-sm leading-tight uppercase line-clamp-1">{item.name}</h4>
                  <p className="text-[10px] text-gray-500 font-extrabold tracking-wider uppercase mt-1">Color: {item.colorSeleccionado}</p>
                  <p className="font-black mt-1">${Number(item.price).toLocaleString('es-AR')}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {carrito.length > 0 && (
          <div className="p-5 border-t-4 border-black bg-white">
            <div className="flex justify-between items-end mb-4">
              <span className="font-bold uppercase tracking-wider text-sm">Total:</span>
              <span className="font-black text-2xl">${(carrito.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0)).toLocaleString('es-AR')}</span>
            </div>
            
            <button 
              onClick={generarPedido}
              className="w-full py-4 bg-black text-white border-2 border-black font-black uppercase tracking-wider text-sm hover:bg-white hover:text-black hover:translate-x-[-2px] hover:translate-y-[-2px] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
            >
              Enviar Pedido a WhatsApp
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
