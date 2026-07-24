import { useState, useRef, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [verificando, setVerificando] = useState(true)
  const [usuarioInput, setUsuarioInput] = useState('')
  const [passwordInput, setPasswordInput] = useState('')
  const [errorLogin, setErrorLogin] = useState('')

  const [vista, setVista] = useState('cargar') 
  
  // Estados para Cargar
  const [name, setName] = useState('')
  const [price, setPrice] = useState('')
  const [stock, setStock] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')
  const [colorsInput, setColorsInput] = useState('')
  const [portadaFile, setPortadaFile] = useState(null)
  const [galeriaFiles, setGaleriaFiles] = useState([])
  const [cargando, setCargando] = useState(false)
  
  const portadaInputRef = useRef(null)
  const galeriaInputRef = useRef(null)

  const [productos, setProductos] = useState([])
  const [categoriasExistentes, setCategoriasExistentes] = useState([])
  const [cargandoLista, setCargandoLista] = useState(false)

  // Estados para Editar
  const [editandoId, setEditandoId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editStock, setEditStock] = useState('')

  useEffect(() => {
    const authStatus = sessionStorage.getItem('adminAutenticado')
    if (authStatus === 'true') {
      setIsLoggedIn(true)
    }
    setVerificando(false)
  }, [])

  const handleLogin = (e) => {
    e.preventDefault()
    if (usuarioInput.trim() === 'luchy' && passwordInput.trim() === 'diva') {
      sessionStorage.setItem('adminAutenticado', 'true')
      setIsLoggedIn(true)
    } else {
      setErrorLogin('Usuario o contraseña incorrectos ❌')
      setPasswordInput('')
    }
  }

  useEffect(() => {
    if (isLoggedIn && vista === 'gestionar') {
      fetchProductos()
    }
  }, [vista, isLoggedIn])

  const fetchProductos = async () => {
    setCargandoLista(true)
    try {
      const res = await fetch(`${API_URL}/products`)
      if (!res.ok) throw new Error('Error al traer productos')
      const data = await res.json()
      setProductos(data)
      const categoriasUnicas = Array.from(new Set(data.map((p) => p.category || 'General')))
      setCategoriasExistentes(categoriasUnicas)
    } catch (error) {
      console.error(error)
    } finally {
      setCargandoLista(false)
    }
  }

  const handleEliminar = async (id, nombreProd) => {
    if (!id) {
      alert("Error: El producto no tiene un ID válido")
      return
    }

    try {
      const res = await fetch(`${API_URL}/products/${id}`, { 
        method: 'DELETE'
      })

      if (res.ok || res.status === 204) {
        setProductos(prev => prev.filter(p => p.id !== id))
        alert('¡Producto eliminado correctamente!')
      } else {
        alert(`Error al intentar eliminar en el servidor (Status: ${res.status})`)
      }
    } catch (error) {
      console.error("Error en fetch eliminar:", error)
      alert('Error de conexión al intentar eliminar')
    }
  }

  const iniciarEdicion = (prod) => {
    setEditandoId(prod.id)
    setEditName(prod.name)
    setEditPrice(prod.price)
    setEditStock(prod.stock)
  }

  const handleActualizar = async (id) => {
    try {
      const res = await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          price: parseFloat(editPrice),
          stock: parseInt(editStock) || 0
        })
      })

      if (res.ok) {
        setProductos(productos.map(p => p.id === id ? { ...p, name: editName, price: editPrice, stock: editStock } : p))
        setEditandoId(null)
        alert('¡Actualizado con éxito!')
      } else {
        alert('Error al actualizar en el servidor')
      }
    } catch (error) {
      console.error(error)
      alert('Error de red al actualizar')
    }
  }

  const handleGuardar = async (e) => {
    e.preventDefault()
    if (!name || !price || !category) return alert('Completá los campos obligatorios (Nombre, Precio, Categoría)')
    
    setCargando(true)
    try {
      let imgUrl = null
      let imgUrls = []

      // Subir Foto de Portada
      if (portadaFile) {
        const safeFileName = portadaFile.name.replace(/[^a-zA-Z0-9.]/g, '_')
        const fileName = `portada-${Date.now()}-${safeFileName}`
        const { error } = await supabase.storage.from('productos-fotos').upload(fileName, portadaFile)
        if (error) throw error
        imgUrl = supabase.storage.from('productos-fotos').getPublicUrl(fileName).data.publicUrl
      }

      // Subir Galería de Fotos
      if (galeriaFiles && galeriaFiles.length > 0) {
        for (let i = 0; i < galeriaFiles.length; i++) {
          const file = galeriaFiles[i]
          const safeFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_')
          const fileName = `galeria-${Date.now()}-${i}-${safeFileName}`
          const { error } = await supabase.storage.from('productos-fotos').upload(fileName, file)
          if (error) throw error
          imgUrls.push(supabase.storage.from('productos-fotos').getPublicUrl(fileName).data.publicUrl)
        }
      }

      // Mapear colores de texto a Array
      const listaColores = colorsInput
        ? colorsInput.split(',').map(c => c.trim()).filter(Boolean)
        : []

      const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, 
          description: description || null,
          price: parseFloat(price), 
          stock: parseInt(stock) || 0, 
          category, 
          image_url: imgUrl,      // Portada principal
          image_urls: imgUrls,    // Fotos adicionales
          colors: listaColores    // Array de colores disponibles
        })
      })

      if (res.ok) {
        alert('¡Producto guardado con éxito! 🚀')
        setName(''); setPrice(''); setStock(''); setCategory(''); setDescription(''); setColorsInput('');
        setPortadaFile(null); setGaleriaFiles([]);
        if (portadaInputRef.current) portadaInputRef.current.value = ''
        if (galeriaInputRef.current) galeriaInputRef.current.value = ''
      } else {
        alert('Error al guardar en la base de datos')
      }
    } catch (error) {
      console.error(error)
      alert('Error crítico en la carga.')
    } finally {
      setCargando(false)
    }
  }

  if (verificando) return (
    <div className="h-screen flex items-center justify-center text-warm-dark" style={{ backgroundColor: '#E9DDD2' }}>
      <p className="font-extrabold uppercase tracking-widest animate-pulse">Verificando acceso...</p>
    </div>
  )

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#E9DDD2' }}>
        <div className="bg-warm-light p-8 border-2 border-warm shadow-warm w-full max-w-sm text-warm-dark">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-black uppercase tracking-tight">Acceso Admin</h1>
            <p className="text-stone-600 text-sm mt-1">Diva Store Control Panel</p>
          </div>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1">Usuario</label>
              <input type="text" className="w-full border-2 border-warm p-4 font-bold text-warm-dark focus:outline-none bg-warm-light text-base shadow-[2px_2px_0px_0px_rgba(74,59,50,1)]" value={usuarioInput} onChange={e => setUsuarioInput(e.target.value)} required placeholder="Usuario" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-1">Contraseña</label>
              <input type="password" className="w-full border-2 border-warm p-4 font-bold text-warm-dark focus:outline-none bg-warm-light text-base shadow-[2px_2px_0px_0px_rgba(74,59,50,1)]" value={passwordInput} onChange={e => setPasswordInput(e.target.value)} required placeholder="Contraseña" />
            </div>
            {errorLogin && <p className="text-red-700 text-xs font-bold text-center bg-red-100 border border-red-700 p-2">{errorLogin}</p>}
            <button type="submit" className="w-full bg-warm-dark text-warm-light hover:bg-warm-light hover:text-warm-dark border-2 border-warm py-4 font-extrabold uppercase tracking-wider shadow-[4px_4px_0px_0px_rgba(74,59,50,1)] transition-all cursor-pointer">
              Ingresar
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-10 px-4 sm:px-6 flex justify-center items-start font-sans text-warm-dark" style={{ backgroundColor: '#E9DDD2' }}>
      <div className="w-[92%] max-w-xl mx-auto bg-warm-light border-2 border-warm shadow-[6px_6px_0px_0px_rgba(74,59,50,0.2)] sm:shadow-[8px_8px_0px_0px_rgba(74,59,50,0.2)] p-5 sm:p-8 relative">        
        
        <button 
          onClick={() => {
            sessionStorage.removeItem('adminAutenticado')
            setIsLoggedIn(false)
          }} 
          className="absolute top-4 right-4 text-xs font-extrabold uppercase tracking-wider border-2 border-warm px-3 py-2 bg-warm-light hover:bg-warm-dark hover:text-warm-light transition-all shadow-[2px_2px_0px_0px_rgba(74,59,50,1)] cursor-pointer"
        >
          Cerrar Sesión
        </button>

        <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tight mb-1 text-center mt-2">Panel de Admin</h1>
        <p className="text-center text-stone-600 text-xs sm:text-sm mb-6">Gestión de stock y catálogo.</p>
        
        <div className="flex justify-center items-center gap-3 mb-8">
          <button 
            onClick={() => { setVista('cargar'); setEditandoId(null); }} 
            className={`flex-1 py-6 px-4 border-2 border-warm font-black uppercase text-xs sm:text-sm text-center transition-all shadow-[4px_4px_0px_0px_rgba(74,59,50,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(74,59,50,1)] cursor-pointer ${vista === 'cargar' ? 'bg-warm-dark text-warm-light' : 'bg-warm-light text-warm-dark'}`}
          >
            Cargar Producto
          </button>
          <button 
            onClick={() => { setVista('gestionar'); setEditandoId(null); }} 
            className={`flex-1 py-6 px-4 border-2 border-warm font-black uppercase text-xs sm:text-sm text-center transition-all shadow-[4px_4px_0px_0px_rgba(74,59,50,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(74,59,50,1)] cursor-pointer ${vista === 'gestionar' ? 'bg-warm-dark text-warm-light' : 'bg-warm-light text-warm-dark'}`}
          >
            Gestionar Catálogo
          </button>
        </div>

        {/* VISTA 1: CARGAR */}
        {vista === 'cargar' && (
          <form onSubmit={handleGuardar} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2">Nombre del Producto</label>
              <input className="w-full border-2 border-warm p-4 text-base font-bold text-warm-dark focus:outline-none bg-warm-light shadow-[3px_3px_0px_0px_rgba(74,59,50,1)]" type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Lentes Aviator" required />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2">Categoría</label>
                <input list="lista-categorias" className="w-full border-2 border-warm p-4 text-base font-bold text-warm-dark focus:outline-none bg-warm-light shadow-[3px_3px_0px_0px_rgba(74,59,50,1)]" value={category} onChange={e => setCategory(e.target.value)} placeholder="Ej: Lentes" required />
                <datalist id="lista-categorias">
                  {categoriasExistentes.map(cat => <option key={cat} value={cat} />)}
                </datalist>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2">Precio ($)</label>
                <input className="w-full border-2 border-warm p-4 text-base font-bold text-warm-dark focus:outline-none bg-warm-light shadow-[3px_3px_0px_0px_rgba(74,59,50,1)]" type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="15000" required />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2">Stock disponible</label>
              <input className="w-full border-2 border-warm p-4 text-base font-bold text-warm-dark focus:outline-none bg-warm-light shadow-[3px_3px_0px_0px_rgba(74,59,50,1)]" type="number" value={stock} onChange={e => setStock(e.target.value)} placeholder="10" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2">Colores disponibles (separados por coma)</label>
              <input className="w-full border-2 border-warm p-4 text-base font-bold text-warm-dark focus:outline-none bg-warm-light shadow-[3px_3px_0px_0px_rgba(74,59,50,1)]" type="text" value={colorsInput} onChange={e => setColorsInput(e.target.value)} placeholder="Ej: Negro, Naranja, Verde" />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2">Descripción (Opcional)</label>
              <textarea className="w-full border-2 border-warm p-4 text-base font-bold text-warm-dark focus:outline-none bg-warm-light shadow-[3px_3px_0px_0px_rgba(74,59,50,1)]" rows="2" value={description} onChange={e => setDescription(e.target.value)} placeholder="Detalles del producto..." />
            </div>

            {/* FOTO PORTADA */}
            <div className="border-2 border-warm p-4 text-center bg-warm-card shadow-[3px_3px_0px_0px_rgba(74,59,50,1)]">
              <label className="block text-xs font-extrabold uppercase tracking-wider mb-2">Foto de Portada (Principal para Catálogo)</label>
              <input ref={portadaInputRef} type="file" accept="image/*" className="w-full text-xs font-bold text-warm-dark file:mr-3 file:py-2 file:px-3 file:border-2 file:border-warm file:text-xs file:font-extrabold file:uppercase file:bg-warm-dark file:text-warm-light hover:file:bg-warm-light hover:file:text-warm-dark cursor-pointer transition-all" onChange={e => setPortadaFile(e.target.files?.[0] || null)} />
            </div>

            {/* GALERÍA */}
            <div className="border-2 border-warm p-4 text-center bg-warm-card shadow-[3px_3px_0px_0px_rgba(74,59,50,1)]">
              <label className="block text-xs font-extrabold uppercase tracking-wider mb-2">Galería (Múltiples fotos adicionales para el modal)</label>
              <input ref={galeriaInputRef} type="file" multiple accept="image/*" className="w-full text-xs font-bold text-warm-dark file:mr-3 file:py-2 file:px-3 file:border-2 file:border-warm file:text-xs file:font-extrabold file:uppercase file:bg-warm-dark file:text-warm-light hover:file:bg-warm-light hover:file:text-warm-dark cursor-pointer transition-all" onChange={e => setGaleriaFiles(e.target.files)} />
            </div>

            <button type="submit" disabled={cargando} className={`w-full py-5 mt-2 border-2 border-warm font-black uppercase tracking-wider text-warm-light text-base bg-warm-dark hover:bg-warm-light hover:text-warm-dark shadow-[4px_4px_0px_0px_rgba(74,59,50,1)] transition-all cursor-pointer ${cargando ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {cargando ? 'SUBIENDO...' : 'SUBIR PRODUCTO AL CATÁLOGO'}
            </button>
          </form>
        )}

        {/* VISTA 2: GESTIONAR */}
        {vista === 'gestionar' && (
          <div>
            {cargandoLista ? (
              <p className="text-center font-extrabold uppercase tracking-wider py-12 animate-pulse text-sm text-stone-600">Cargando catálogo...</p>
            ) : productos.length === 0 ? (
              <p className="text-center font-bold py-12 text-stone-600 text-sm">No hay productos cargados todavía.</p>
            ) : (
              <ul className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
                {productos.map(prod => (
                  <li key={prod.id} className="p-4 border-2 border-warm bg-warm-light shadow-[3px_3px_0px_0px_rgba(74,59,50,1)]">
                    
                    {/* MODO EDICIÓN */}
                    {editandoId === prod.id ? (
                      <div className="flex flex-col gap-3">
                        <div>
                          <label className="text-[10px] font-bold uppercase">Nombre</label>
                          <input className="w-full border-2 border-warm p-2 text-sm font-bold bg-white" value={editName} onChange={(e) => setEditName(e.target.value)} />
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1">
                            <label className="text-[10px] font-bold uppercase">Precio</label>
                            <input type="number" className="w-full border-2 border-warm p-2 text-sm font-bold bg-white" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
                          </div>
                          <div className="flex-1">
                            <label className="text-[10px] font-bold uppercase">Stock</label>
                            <input type="number" className="w-full border-2 border-warm p-2 text-sm font-bold bg-white" value={editStock} onChange={(e) => setEditStock(e.target.value)} />
                          </div>
                        </div>
                        <div className="flex gap-2 mt-1">
                          <button onClick={() => handleActualizar(prod.id)} className="flex-1 bg-warm-dark text-warm-light font-bold text-xs py-2 border-2 border-warm hover:bg-white hover:text-warm-dark transition-all">Guardar</button>
                          <button onClick={() => setEditandoId(null)} className="flex-1 bg-red-100 text-red-800 font-bold text-xs py-2 border-2 border-red-800 hover:bg-red-800 hover:text-white transition-all">Cancelar</button>
                        </div>
                      </div>
                    ) : (
                      
                      // MODO VISTA COMPACTA (SIN IMAGEN)
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-black text-sm">{prod.name}</p>
                            <span className="bg-warm-dark text-warm-light text-[9px] uppercase font-bold px-1.5 py-0.5">{prod.category || 'General'}</span>
                          </div>
                          <p className="text-xs font-extrabold text-warm-dark mt-1">
                            ${Number(prod.price).toLocaleString('es-AR')} <span className="text-stone-600 font-medium ml-2">Stock: {prod.stock}</span>
                          </p>
                          {prod.colors && prod.colors.length > 0 && (
                            <p className="text-[10px] text-stone-600 font-bold mt-1">
                              Colores: {prod.colors.join(', ')}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <button onClick={() => iniciarEdicion(prod)} className="flex-1 sm:flex-none border-2 border-warm bg-warm-card hover:bg-warm-dark hover:text-warm-light text-warm-dark font-extrabold px-3 py-2 text-xs uppercase tracking-wider transition-all shadow-[2px_2px_0px_0px_rgba(74,59,50,1)] cursor-pointer">
                            Editar
                          </button>
                          <button 
                            type="button"
                            onClick={() => handleEliminar(prod.id, prod.name)} 
                            className="flex-1 sm:flex-none border-2 border-red-800 bg-red-50 hover:bg-red-800 hover:text-white text-red-800 font-extrabold px-3 py-2 text-xs uppercase tracking-wider transition-all shadow-[2px_2px_0px_0px_rgba(153,27,27,1)] cursor-pointer"
                          >
                            Borrar
                          </button>
                        </div>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </div>
  )
}