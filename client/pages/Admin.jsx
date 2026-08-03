import { useState, useRef, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import heic2any from "heic2any"

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
  
  // Imágenes de carga
  const [imagenesSeleccionadas, setImagenesSeleccionadas] = useState([])
  const [cargando, setCargando] = useState(false)
  const fileInputRef = useRef(null)

  const [productos, setProductos] = useState([])
  const [categoriasExistentes, setCategoriasExistentes] = useState([])
  const [cargandoLista, setCargandoLista] = useState(false)

  // ------------------------------------------
  // Estados para Editar
  // ------------------------------------------
  const [editandoId, setEditandoId] = useState(null)
  const [editName, setEditName] = useState('')
  const [editPrice, setEditPrice] = useState('')
  const [editStock, setEditStock] = useState('')
  const [editColors, setEditColors] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editImages, setEditImages] = useState([]) // Fotos (URLs viejas y Archivos nuevos)
  const [cargandoEdicion, setCargandoEdicion] = useState(false)

  // ------------------------------------------
  // FUNCIONES PARA MANEJO DE IMÁGENES (CARGA)
  // ------------------------------------------
  const handleFileChange = (e) => {
    if (e.target.files) {
      const archivosNuevos = Array.from(e.target.files)
      setImagenesSeleccionadas(prev => [...prev, ...archivosNuevos])
    }
  }

  const quitarImagen = (indexAEliminar) => {
    setImagenesSeleccionadas(prev => prev.filter((_, index) => index !== indexAEliminar))
  }

  const moverImagen = (index, direccion) => {
    const nuevoOrden = [...imagenesSeleccionadas]
    const nuevaPosicion = index + direccion
    if (nuevaPosicion < 0 || nuevaPosicion >= nuevoOrden.length) return
    const [imagenMovida] = nuevoOrden.splice(index, 1)
    nuevoOrden.splice(nuevaPosicion, 0, imagenMovida)
    setImagenesSeleccionadas(nuevoOrden)
  }

  // ------------------------------------------
  // FUNCIONES PARA MANEJO DE IMÁGENES (EDICIÓN)
  // ------------------------------------------
  const handleAgregarFotosEdicion = (e) => {
    if (e.target.files) {
      const archivosNuevos = Array.from(e.target.files)
      setEditImages(prev => [...prev, ...archivosNuevos])
    }
  }

  const moverImagenEdicion = (index, direccion) => {
    const nuevoOrden = [...editImages]
    const nuevaPosicion = index + direccion
    if (nuevaPosicion < 0 || nuevaPosicion >= nuevoOrden.length) return
    const [imagenMovida] = nuevoOrden.splice(index, 1)
    nuevoOrden.splice(nuevaPosicion, 0, imagenMovida)
    setEditImages(nuevoOrden)
  }

  const quitarImagenEdicion = (indexAEliminar) => {
    setEditImages(prev => prev.filter((_, index) => index !== indexAEliminar))
  }

  const convertImage = async (file) => {
    if (!file) return null;
    const esHeic = file.type === "image/heic" || file.type === "image/heif" || file.name.toLowerCase().endsWith(".heic") || file.name.toLowerCase().endsWith(".heif");
    if (esHeic) {
      try {
        let convertedBlob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.85 });
        if (Array.isArray(convertedBlob)) convertedBlob = convertedBlob[0];
        const nuevoNombre = file.name.replace(/\.(heic|heif)$/i, "") + ".jpg";
        return new File([convertedBlob], nuevoNombre, { type: "image/jpeg" });
      } catch (error) {
        console.error("Error al convertir HEIC:", error);
        alert(`La imagen "${file.name}" no pudo ser convertida. Convertila a .jpg en tu compu antes de subirla.`);
        throw new Error("Conversión cancelada.");
      }
    }
    return file; 
  };

  useEffect(() => {
    const authStatus = sessionStorage.getItem('adminAutenticado')
    if (authStatus === 'true') setIsLoggedIn(true)
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
    if (isLoggedIn && vista === 'gestionar') fetchProductos()
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
    if (!id) return alert("Error: El producto no tiene un ID válido")
    try {
      const res = await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' })
      if (res.ok || res.status === 204) {
        setProductos(prev => prev.filter(p => p.id !== id))
        alert('¡Producto eliminado correctamente!')
      } else {
        alert(`Error al intentar eliminar (Status: ${res.status})`)
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
    setEditColors(prod.colors && prod.colors.length > 0 ? prod.colors.join(', ') : '')
    setEditDescription(prod.description || '')
    
    const fotosActuales = []
    if (prod.image_url) fotosActuales.push(prod.image_url)
    if (prod.image_urls && prod.image_urls.length > 0) fotosActuales.push(...prod.image_urls)
    setEditImages(fotosActuales)
  }

  // ----------------------------------------------------
  // ACTUALIZAR Y SUBIR NUEVAS FOTOS DESDE LA EDICIÓN
  // ----------------------------------------------------
  const handleActualizar = async (id) => {
    setCargandoEdicion(true)
    try {
      const urlsFinales = []
      
      for (let i = 0; i < editImages.length; i++) {
        const item = editImages[i]
        
        if (typeof item === 'string') {
          urlsFinales.push(item) // Ya es una URL de supabase
        } else {
          // Es un archivo nuevo
          const fileListo = await convertImage(item)
          const safeFileName = fileListo.name.replace(/[^a-zA-Z0-9.]/g, '_')
          const fileName = `edit-${Date.now()}-${i}-${safeFileName}`
          
          const { error } = await supabase.storage.from('productos-fotos').upload(fileName, fileListo)
          if (error) throw error
          
          const publicUrl = supabase.storage.from('productos-fotos').getPublicUrl(fileName).data.publicUrl
          urlsFinales.push(publicUrl)
        }
      }

      const listaColoresActualizada = editColors ? editColors.split(',').map(c => c.trim()).filter(Boolean) : []
      const nuevaPortada = urlsFinales.length > 0 ? urlsFinales[0] : null
      const nuevaGaleria = urlsFinales.length > 1 ? urlsFinales.slice(1) : []

      const res = await fetch(`${API_URL}/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName,
          price: parseFloat(editPrice),
          stock: parseInt(editStock) || 0,
          colors: listaColoresActualizada,
          description: editDescription,
          image_url: nuevaPortada,
          image_urls: nuevaGaleria
        })
      })

      if (res.ok) {
        setProductos(productos.map(p => 
          p.id === id ? { 
            ...p, 
            name: editName, 
            price: editPrice, 
            stock: editStock, 
            colors: listaColoresActualizada,
            description: editDescription,
            image_url: nuevaPortada,
            image_urls: nuevaGaleria
          } : p
        ))
        setEditandoId(null)
        alert('¡Actualizado con éxito!')
      } else {
        alert('Error al actualizar en el servidor')
      }
    } catch (error) {
      console.error(error)
      alert('Error crítico al actualizar')
    } finally {
      setCargandoEdicion(false)
    }
  }

  const handleGuardar = async (e) => {
    e.preventDefault()
    if (!name || !price || !category) return alert('Completá los campos obligatorios')
    if (imagenesSeleccionadas.length === 0) return alert('Por favor seleccioná al menos una foto de portada.')
    
    setCargando(true)
    try {
      let imgUrl = null
      let imgUrls = []
      const portadaFile = imagenesSeleccionadas[0]
      const fileListo = await convertImage(portadaFile)
      const safeFileName = fileListo.name.replace(/[^a-zA-Z0-9.]/g, '_')
      const fileName = `portada-${Date.now()}-${safeFileName}`
      const { error } = await supabase.storage.from('productos-fotos').upload(fileName, fileListo)
      if (error) throw error
      imgUrl = supabase.storage.from('productos-fotos').getPublicUrl(fileName).data.publicUrl

      for (let i = 1; i < imagenesSeleccionadas.length; i++) {
        const fileGaleriaOriginal = imagenesSeleccionadas[i]
        const fileGaleriaListo = await convertImage(fileGaleriaOriginal)
        const safeGalFileName = fileGaleriaListo.name.replace(/[^a-zA-Z0-9.]/g, '_')
        const galFileName = `galeria-${Date.now()}-${i}-${safeGalFileName}`
        const galError = await supabase.storage.from('productos-fotos').upload(galFileName, fileGaleriaListo)
        if (galError.error) throw galError.error
        imgUrls.push(supabase.storage.from('productos-fotos').getPublicUrl(galFileName).data.publicUrl)
      }

      const listaColores = colorsInput ? colorsInput.split(',').map(c => c.trim()).filter(Boolean) : []
      const res = await fetch(`${API_URL}/products`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name, 
          description: description || null,
          price: parseFloat(price), 
          stock: parseInt(stock) || 0, 
          category, 
          image_url: imgUrl,      
          image_urls: imgUrls,    
          colors: listaColores    
        })
      })

      if (res.ok) {
        alert('¡Producto guardado con éxito! 🚀')
        setName(''); setPrice(''); setStock(''); setCategory(''); setDescription(''); setColorsInput('');
        setImagenesSeleccionadas([]);
        if (fileInputRef.current) fileInputRef.current.value = ''
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
          <button onClick={() => { setVista('cargar'); setEditandoId(null); }} className={`flex-1 py-6 px-4 border-2 border-warm font-black uppercase text-xs sm:text-sm text-center transition-all shadow-[4px_4px_0px_0px_rgba(74,59,50,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(74,59,50,1)] cursor-pointer ${vista === 'cargar' ? 'bg-warm-dark text-warm-light' : 'bg-warm-light text-warm-dark'}`}>
            Cargar Producto
          </button>
          <button onClick={() => { setVista('gestionar'); setEditandoId(null); }} className={`flex-1 py-6 px-4 border-2 border-warm font-black uppercase text-xs sm:text-sm text-center transition-all shadow-[4px_4px_0px_0px_rgba(74,59,50,1)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(74,59,50,1)] cursor-pointer ${vista === 'gestionar' ? 'bg-warm-dark text-warm-light' : 'bg-warm-light text-warm-dark'}`}>
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

            {/* SECCIÓN DE FOTOS CARGAR CON IMÁGENES CHIQUITAS */}
            <div className="border-2 border-warm p-4 bg-warm-card shadow-[3px_3px_0px_0px_rgba(74,59,50,1)]">
              <label className="block text-xs font-extrabold uppercase tracking-wider mb-2 text-center">
                Fotos del Producto <br/><span className="text-[10px] text-stone-600">(Seleccioná varias. Podés reordenarlas después)</span>
              </label>
              <input ref={fileInputRef} type="file" multiple accept="image/*" className="w-full text-xs font-bold text-warm-dark file:mr-3 file:py-2 file:px-3 file:border-2 file:border-warm file:text-xs file:font-extrabold file:uppercase file:bg-warm-dark file:text-warm-light hover:file:bg-warm-light hover:file:text-warm-dark cursor-pointer transition-all mb-4" onChange={handleFileChange} />

              {imagenesSeleccionadas.length > 0 && (
                <div className="flex flex-wrap gap-2 border-t-2 border-warm pt-4 justify-center">
                  {imagenesSeleccionadas.map((file, index) => (
                    <div key={index} className="relative w-16 h-20 border-2 border-warm bg-white p-1 flex flex-col items-center justify-between shadow-[2px_2px_0px_0px_rgba(74,59,50,0.5)]">
                      {index === 0 && <span className="absolute -top-2 -left-2 bg-warm-dark text-warm-light text-[8px] font-black uppercase px-1 py-0.5 border border-warm z-10">Portada</span>}
                      <img src={URL.createObjectURL(file)} alt={`Previa ${index}`} className="w-full h-12 object-cover border border-warm" />
                      <div className="flex w-full gap-0.5 mt-1">
                        <button type="button" onClick={() => moverImagen(index, -1)} disabled={index === 0} className={`flex-1 h-4 text-[8px] border border-warm flex items-center justify-center ${index === 0 ? 'bg-stone-300 text-stone-500 cursor-not-allowed' : 'bg-warm-light hover:bg-warm-dark hover:text-warm-light cursor-pointer'}`}>←</button>
                        <button type="button" onClick={() => quitarImagen(index)} className="flex-1 h-4 text-[8px] font-black border border-warm bg-warm-light text-warm-dark hover:bg-warm-dark hover:text-warm-light flex items-center justify-center cursor-pointer">✕</button>
                        <button type="button" onClick={() => moverImagen(index, 1)} disabled={index === imagenesSeleccionadas.length - 1} className={`flex-1 h-4 text-[8px] border border-warm flex items-center justify-center ${index === imagenesSeleccionadas.length - 1 ? 'bg-stone-300 text-stone-500 cursor-not-allowed' : 'bg-warm-light hover:bg-warm-dark hover:text-warm-light cursor-pointer'}`}>→</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" disabled={cargando} className={`w-full py-5 mt-2 border-2 border-warm font-black uppercase tracking-wider text-warm-light text-base bg-warm-dark hover:bg-warm-light hover:text-warm-dark shadow-[4px_4px_0px_0px_rgba(74,59,50,1)] transition-all cursor-pointer ${cargando ? 'opacity-50 cursor-not-allowed' : ''}`}>
              {cargando ? 'SUBIENDO PRODUCTO...' : 'SUBIR PRODUCTO AL CATÁLOGO'}
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
              <ul className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
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

                        <div>
                          <label className="text-[10px] font-bold uppercase">Colores (Separados por coma)</label>
                          <input type="text" placeholder="Ej: Blanco, Negro, Rojo" className="w-full border-2 border-warm p-2 text-sm font-bold bg-white" value={editColors} onChange={(e) => setEditColors(e.target.value)} />
                        </div>
                        
                        <div>
                          <label className="text-[10px] font-bold uppercase">Descripción</label>
                          <textarea className="w-full border-2 border-warm p-2 text-sm font-bold bg-white" rows="2" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                        </div>

                        {/* REORDENAMIENTO Y AGREGADO DE FOTOS EN EDICIÓN */}
                        <div className="border-2 border-warm p-2 bg-warm-card mt-1">
                          <div className="mb-3 border-b border-warm pb-2">
                            <label className="block text-[10px] font-bold uppercase mb-1">Agregar más fotos al producto</label>
                            <input type="file" multiple accept="image/*" onChange={handleAgregarFotosEdicion} className="w-full text-[10px] font-bold text-warm-dark file:mr-2 file:py-1 file:px-2 file:border-2 file:border-warm file:text-[10px] file:font-extrabold file:uppercase file:bg-warm-dark file:text-warm-light hover:file:bg-warm-light hover:file:text-warm-dark cursor-pointer transition-all" />
                          </div>
                          
                          {editImages.length > 0 ? (
                            <>
                              <label className="block text-[10px] font-bold uppercase mb-2">Organizar Fotos (La 1° será la portada)</label>
                              <div className="flex flex-wrap gap-2">
                                {editImages.map((img, index) => {
                                  // Determina si es una URL o un File nuevo para mostrarlo bien
                                  const imgURLPreview = typeof img === 'string' ? img : URL.createObjectURL(img)
                                  
                                  return (
                                    <div key={index} className="relative w-16 h-20 border-2 border-warm bg-white p-1 flex flex-col items-center justify-between shadow-[2px_2px_0px_0px_rgba(74,59,50,0.5)]">
                                      {index === 0 && <span className="absolute -top-2 -left-2 bg-warm-dark text-warm-light text-[8px] font-black uppercase px-1 py-0.5 border border-warm z-10">Portada</span>}
                                      <img src={imgURLPreview} alt="preview" className="w-full h-12 object-cover border border-warm" />
                                      <div className="flex w-full gap-0.5 mt-1">
                                        <button type="button" onClick={() => moverImagenEdicion(index, -1)} disabled={index === 0} className={`flex-1 h-4 text-[8px] border border-warm flex items-center justify-center ${index === 0 ? 'bg-stone-300 text-stone-500 cursor-not-allowed' : 'bg-warm-light hover:bg-warm-dark hover:text-warm-light cursor-pointer'}`}>←</button>
                                        <button type="button" onClick={() => quitarImagenEdicion(index)} className="flex-1 h-4 text-[8px] font-black border border-warm bg-warm-light text-warm-dark hover:bg-warm-dark hover:text-warm-light flex items-center justify-center cursor-pointer">✕</button>
                                        <button type="button" onClick={() => moverImagenEdicion(index, 1)} disabled={index === editImages.length - 1} className={`flex-1 h-4 text-[8px] border border-warm flex items-center justify-center ${index === editImages.length - 1 ? 'bg-stone-300 text-stone-500 cursor-not-allowed' : 'bg-warm-light hover:bg-warm-dark hover:text-warm-light cursor-pointer'}`}>→</button>
                                      </div>
                                    </div>
                                  )
                                })}
                              </div>
                            </>
                          ) : (
                            <p className="text-xs text-stone-500 font-bold">Sin fotos.</p>
                          )}
                        </div>

                        <div className="flex gap-2 mt-2">
                          <button onClick={() => handleActualizar(prod.id)} disabled={cargandoEdicion} className={`flex-1 bg-warm-dark text-warm-light font-bold text-xs py-2 border-2 border-warm hover:bg-white hover:text-warm-dark transition-all ${cargandoEdicion ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                            {cargandoEdicion ? 'GUARDANDO...' : 'Guardar Cambios'}
                          </button>
                          <button onClick={() => setEditandoId(null)} disabled={cargandoEdicion} className={`flex-1 bg-red-100 text-red-800 font-bold text-xs py-2 border-2 border-red-800 hover:bg-red-800 hover:text-white transition-all ${cargandoEdicion ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      
                      // MODO VISTA COMPACTA
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
                            <p className="text-[10px] text-stone-600 font-bold mt-1">Colores: {prod.colors.join(', ')}</p>
                          )}
                        </div>
                        <div className="flex gap-2 w-full sm:w-auto">
                          <button onClick={() => iniciarEdicion(prod)} className="flex-1 sm:flex-none border-2 border-warm bg-warm-card hover:bg-warm-dark hover:text-warm-light text-warm-dark font-extrabold px-3 py-2 text-xs uppercase tracking-wider transition-all shadow-[2px_2px_0px_0px_rgba(74,59,50,1)] cursor-pointer">
                            Editar
                          </button>
                          <button type="button" onClick={() => handleEliminar(prod.id, prod.name)} className="flex-1 sm:flex-none border-2 border-red-800 bg-red-50 hover:bg-red-800 hover:text-white text-red-800 font-extrabold px-3 py-2 text-xs uppercase tracking-wider transition-all shadow-[2px_2px_0px_0px_rgba(153,27,27,1)] cursor-pointer">
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