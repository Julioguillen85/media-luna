import React, { useState, useEffect, useRef } from 'react';
import { ShoppingBag, User, Phone, CheckCircle, Lock, LogOut, ClipboardList, Utensils, MessageCircle, X, Bot, Send, Sparkles, Trash2, Users, MapPin, Loader2, CheckSquare, Image as ImageIcon, Plus, Edit, Save, FileText, Facebook, ChevronDown, CupSoda, Star, Heart } from 'lucide-react';
import EnhancedChatBot from './EnhancedChatBot';

const DEMO_MODE = false;
const API_URL = "/api";
const BUSINESS_PHONE = "523123099318";
const FACEBOOK_PAGE_URL = "https://www.facebook.com/medialuna.frutibar";

// Opciones de respaldo para modo offline
const BACKUP_OPTIONS = {
  bases: ["Sabritas naturales", "Chips fuego", "Ruffles queso", "Doritos nacho", "Takis fuego", "Chips jalapeños", "Sabritas adobada", "Rancheritos", "Tostitos"],
  complements: ["Cueritos", "Pepino", "Jícama", "Salchicha", "Sandía (Temp)", "Piña", "Mango (Temp)", "Palomitas", "Churros de maíz", "Zanahoria rallada"],
  toppings: ["Manguitos", "Picafresas", "Lombrices", "Cacahuates", "Rellerindos", "Panditas", "Paletas", "Churro loko", "Sandías", "Lombrices ácidas", "Bolitochas de sandía", "Frutitas de gomita", "Tiburones de gomita", "Aros de durazno", "Cacahuate salado"]
};
const SIZE_LABELS = { quarter: "Bowl 1/4", half: "Bowl 1/2" };
const CUSTOMIZABLE_IDS = [6];

const INITIAL_PRODUCTS = [
  { id: 6, name: "Papas Preparadas (Bowl)", category: "Snacks", desc: "Elige Tamaño (1/4 o 1/2) + Base + Complementos + Toppings.", keywords: ["papas", "bowl", "preparadas"], img: "/images/papas-preparadas.jpg", gallery: ["/images/papas-preparadas.jpg"] },
  { id: 1, name: "Tostilocos", category: "Snacks", desc: "Tostitos con cueritos, jícama, pepino...", keywords: ["tostilocos"], img: "/images/tostilocos.jpg", gallery: ["/images/tostilocos.jpg"] },
  { id: 2, name: "Maruchan Preparada", category: "Snacks", desc: "Sopa instantánea con elote y queso.", keywords: ["maruchan"], img: "/images/maruchan.jpg", gallery: [] },
  { id: 3, name: "Elote en Vaso", category: "Snacks", desc: "Clásico esquite con mayonesa, queso y chile.", keywords: ["elote", "vaso"], img: "/images/elote.jpg", gallery: [] },
  { id: 4, name: "Tostielote", category: "Snacks", desc: "Tostitos preparados con esquite (elote), queso y crema.", keywords: ["tostielote"], img: "/images/tostielote.jpg", gallery: [] },
  { id: 5, name: "Duros Preparados", category: "Snacks", desc: "Chicharrón de harina con verdura y crema.", keywords: ["duro"], img: "/images/duros.jpg", gallery: [] },
  { id: 7, name: "Crepaletas", category: "Snacks", desc: "Crepa en forma de paleta con toppings dulces.", keywords: ["crepa"], img: "/images/crepaletas.jpg", gallery: [] },
  { id: 8, name: "Fresas con Crema", category: "Snacks", desc: "Fresas frescas con nuestra crema especial.", keywords: ["fresas"], img: "/images/fresas.jpg", gallery: [] },
  { id: 9, name: "Mini Hotcakes", category: "Snacks", desc: "Porción de hotcakes pequeños.", keywords: ["hotcakes"], img: "/images/hotcakes.jpg", gallery: [] },
  { id: 10, name: "Paletas de Hielo", category: "Snacks", desc: "Paleta de agua con chamoy y gomitas.", keywords: ["paleta"], img: "/images/paletas.jpg", gallery: [] },
  { id: 11, name: "Micheladas", category: "Bebidas", desc: "Preparado especial con escarchado.", keywords: ["michelada"], img: "/images/michelada.jpg", gallery: [] },
  { id: 12, name: "Cantaritos", category: "Bebidas", desc: "Estilo Jalisco con toronja, naranja y tequila.", keywords: ["cantarito"], img: "/images/cantarito.jpg", gallery: [] },
];
const INITIAL_CATEGORIES = ["Snacks", "Bebidas"];

export default function App() {
  const [view, setView] = useState('home');
  const [products, setProducts] = useState(INITIAL_PRODUCTS);
  const [categories, setCategories] = useState(INITIAL_CATEGORIES);
  const [options, setOptions] = useState(BACKUP_OPTIONS);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);
  const [isBotOpen, setIsBotOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [productToCustomize, setProductToCustomize] = useState(null);
  const [galleryModalOpen, setGalleryModalOpen] = useState(false);
  const [galleryImages, setGalleryImages] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [checkoutFormData, setCheckoutFormData] = useState({
    name: '',
    phone: '',
    date: new Date().toISOString().split('T')[0],
    time: '16:00',
    peopleCount: '',
    eventLocation: ''
  });

  useEffect(() => {
    if (!DEMO_MODE) {
      setLoading(true);
      Promise.all([fetch(`${API_URL}/products`).then(r => r.json()), fetch(`${API_URL}/options`).then(r => r.json())])
        .then(([prodData, optData]) => {
          if (prodData && prodData.length > 0) setProducts(prodData);
          if (optData && optData.bases) setOptions(optData);
          setLoading(false);
        }).catch(err => { console.error("Error DB:", err); setLoading(false); });
    }
  }, []);

  useEffect(() => {
    if (isAdmin && !DEMO_MODE) {
      fetch(`${API_URL}/orders`)
        .then(r => r.json())
        .then(data => setOrders(data))
        .catch(err => console.error("Error loading orders:", err));
    }
  }, [isAdmin]);

  const handleProductClick = (product, openGallery = false) => {
    if (openGallery && product.gallery && product.gallery.length > 0) { setGalleryImages(product.gallery); setGalleryModalOpen(true); return; }
    const inCart = cart.find(item => item.id === product.id);
    if (inCart && !CUSTOMIZABLE_IDS.includes(product.id)) { removeFromCart(inCart.cartId); return; }
    if (CUSTOMIZABLE_IDS.includes(product.id)) { setProductToCustomize(product); setCustomModalOpen(true); }
    else { addToCart(product); }
  };
  const addToCart = (product, customization = null) => { setCart(prev => [...prev, { ...product, cartId: Date.now(), customization }]); };
  const removeFromCart = (cartId) => setCart(cart.filter(item => item.cartId !== cartId));
  const handleCheckout = async (formData) => {
    setLoading(true);
    const newOrder = {
      ...formData,
      customer: formData.name,
      items: cart,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };
    if (DEMO_MODE) {
      setTimeout(() => { setOrders([...orders, { ...newOrder, id: 999 }]); setLastOrder({ ...newOrder, id: 999 }); setCart([]); setView('confirmation'); setLoading(false); }, 1000);
    } else {
      try {
        const res = await fetch(`${API_URL}/orders`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newOrder) });
        const savedOrder = await res.json();
        setLastOrder(savedOrder); setCart([]); setView('confirmation');
      } catch (err) { alert("Error al guardar"); }
      setLoading(false);
    }
  };
  const handleSaveProduct = async (p) => { if (!DEMO_MODE) await fetch(`${API_URL}/products`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) }); setIsProductModalOpen(false); window.location.reload(); };
  const handleDeleteProduct = async (id) => { if (!DEMO_MODE && confirm("Borrar?")) await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' }); window.location.reload(); };
  const handleUpdateOptions = async (o) => { if (!DEMO_MODE) await fetch(`${API_URL}/options`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(o) }); alert("Guardado"); };

  const handleAutoFillCheckout = (data) => {
    setCheckoutFormData(data);
    setIsBotOpen(false);
    // Open checkout modal after a brief delay
    setTimeout(() => {
      setIsCheckoutModalOpen(true);
    }, 300);
  };

  const sendToWhatsApp = async () => {
    // Create order object
    const newOrder = {
      ...checkoutFormData,
      customer: checkoutFormData.name,
      items: cart,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    // Save order to backend first
    if (!DEMO_MODE) {
      try {
        const res = await fetch(`${API_URL}/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newOrder)
        });
        const savedOrder = await res.json();
        setOrders(prev => [...prev, savedOrder]);
      } catch (err) {
        console.error("Error saving order:", err);
        // Continue to WhatsApp even if save fails
      }
    }

    // Format order items for WhatsApp
    const itemsText = cart.map((item, idx) => {
      const itemName = item.name || item.product?.name || 'Producto';
      if (item.customization) {
        const sizeText = item.customization.size === 'quarter' ? 'Bowl 1/4' : 'Bowl 1/2';
        return `${idx + 1}. ${itemName} (${sizeText})
   Base: ${item.customization.bases.join(', ')}
   Complementos: ${item.customization.complements.join(', ')}
   Toppings: ${item.customization.toppings.join(', ')}`;
      }
      return `${idx + 1}. ${itemName}`;
    }).join('\n\n');

    // Build WhatsApp message
    const message = `🌙 *PEDIDO MEDIA LUNA SNACK BAR*

👤 *Cliente:* ${checkoutFormData.name}
📱 *WhatsApp:* ${checkoutFormData.phone}
👥 *Personas:* ${checkoutFormData.peopleCount}
📍 *Lugar:* ${checkoutFormData.eventLocation}
📅 *Fecha:* ${checkoutFormData.date}
🕐 *Hora:* ${checkoutFormData.time}

📦 *PRODUCTOS:*
${itemsText}

💬 Me gustaría recibir una cotización para este pedido. ¡Gracias! 😊`;

    // Encode and open WhatsApp
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${BUSINESS_PHONE}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');

    // Close modal and clear cart
    setIsCheckoutModalOpen(false);
    setCart([]);
    setCheckoutFormData({
      name: '',
      phone: '',
      date: new Date().toISOString().split('T')[0],
      time: '16:00',
      peopleCount: '',
      eventLocation: ''
    });
  };

  return (
    <div className="min-h-screen text-slate-900 flex flex-col relative overflow-x-hidden">
      <div className="pointer-events-none absolute inset-0 blur-3xl opacity-60">
        <div className="w-80 h-80 bg-rose-200 absolute -top-10 -left-10 rounded-full"></div>
        <div className="w-64 h-64 bg-amber-200 absolute top-20 right-10 rounded-full"></div>
        <div className="w-72 h-72 bg-cyan-200 absolute bottom-0 left-1/3 rounded-full"></div>
      </div>
      <nav className="sticky top-0 z-50">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mt-4 rounded-2xl border border-white/70 bg-white/80 backdrop-blur-xl shadow-[0_20px_70px_rgba(0,0,0,0.08)] px-5 py-3 flex justify-between items-center">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('home')}>
              <div className="bg-gradient-to-tr from-rose-500 to-amber-300 p-2 rounded-xl text-white shadow-lg"><span className="text-2xl" role="img" aria-label="watermelon">🍉</span></div>
              <div className="flex flex-col">
                <span className="text-xl md:text-2xl font-extrabold tracking-tight text-slate-900 leading-none">Media <span className="text-rose-500" style={{ fontFamily: 'cursive' }}>Luna</span></span>
                <span className="text-[11px] text-slate-400 tracking-[0.25em] uppercase font-bold">Snack Bar</span>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              {/* Cart Button with Badge */}
              <button
                onClick={() => setIsCartModalOpen(true)}
                className="relative p-2 rounded-xl hover:bg-rose-50 transition group"
              >
                <ShoppingBag size={20} className="text-slate-700 group-hover:text-rose-500 transition" />
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-lg animate-fade-in">
                    {cart.length}
                  </span>
                )}
              </button>

              {isAdmin ? (
                <button onClick={() => { setIsAdmin(false); setView('home'); }} className="text-rose-600 font-semibold text-sm flex items-center gap-1 px-3 py-2 rounded-xl hover:bg-rose-50 transition-colors">
                  <LogOut size={16} /> <span className="hidden sm:inline">Salir</span>
                </button>
              ) : (
                <button onClick={() => setShowLogin(true)} className="text-slate-400 hover:text-rose-500 transition p-2 rounded-full hover:bg-rose-50">
                  <Lock size={18} />
                </button>
              )}
              {isAdmin && view !== 'admin' && (
                <button onClick={() => setView('admin')} className="bg-slate-900 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg hover:-translate-y-0.5 active:translate-y-0 transition-transform">
                  Panel Admin
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="flex-grow max-w-6xl mx-auto px-4 py-8 relative z-10">
        {loading && <div className="fixed inset-0 bg-white/80 z-[60] flex items-center justify-center backdrop-blur-sm"><Loader2 className="animate-spin text-rose-500 mb-2" size={48} /></div>}
        {view === 'home' && (
          <>
            <ClientView products={products} categories={categories} cart={cart} onProductClick={handleProductClick} removeFromCart={removeFromCart} onCheckout={handleCheckout} openBot={() => setIsBotOpen(true)} checkoutFormData={checkoutFormData} setCheckoutFormData={setCheckoutFormData} />
          </>
        )}
        {view === 'confirmation' && lastOrder && <ConfirmationView order={lastOrder} onBack={() => setView('home')} />}
        {view === 'admin' && isAdmin && <AdminDashboard orders={orders} products={products} categories={categories} options={options} onSaveProduct={handleSaveProduct} onDeleteProduct={handleDeleteProduct} onUpdateOptions={handleUpdateOptions} setEditingProduct={setEditingProduct} setIsProductModalOpen={setIsProductModalOpen} />}
      </main>
      <EnhancedChatBot isOpen={isBotOpen} setIsOpen={setIsBotOpen} products={products} options={options} cart={cart} onAddProducts={addToCart} onAutoFillCheckout={handleAutoFillCheckout} />
      {customModalOpen && productToCustomize && <CustomizationModal product={productToCustomize} options={options} onClose={() => setCustomModalOpen(false)} onConfirm={(c) => { addToCart(productToCustomize, c); setCustomModalOpen(false); }} />}
      {galleryModalOpen && <GalleryModal images={galleryImages} onClose={() => setGalleryModalOpen(false)} />}
      {isProductModalOpen && <ProductFormModal product={editingProduct} categories={categories} onClose={() => { setIsProductModalOpen(false); setEditingProduct(null); }} onSave={handleSaveProduct} />}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogin={(p) => { if (p === 'admin123') { setIsAdmin(true); setShowLogin(false); setView('admin'); } else alert("Error"); }} />}
      {/* Cart Modal */}
      {isCartModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full max-h-[85vh] flex flex-col shadow-2xl">
            <div className="p-5 border-b flex justify-between items-center bg-gradient-to-r from-rose-50 to-amber-50">
              <h3 className="font-bold text-xl flex items-center gap-2 text-slate-900">
                <ShoppingBag className="text-rose-500" size={24} />
                Tu Pedido ({cart.length})
              </h3>
              <button onClick={() => setIsCartModalOpen(false)} className="p-2 hover:bg-white/50 rounded-full transition">
                <X size={24} className="text-slate-600" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-5">
              {cart.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShoppingBag className="text-slate-300" size={32} />
                  </div>
                  <p className="text-slate-400 font-medium">Tu carrito está vacío</p>
                  <p className="text-xs text-slate-300 mt-2">Agrega productos para continuar</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {cart.map(item => (
                    <div key={item.cartId} className="bg-gradient-to-br from-slate-50 to-white p-4 rounded-xl border border-slate-100 shadow-sm">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span className="font-bold text-slate-900">{item.name || item.product?.name || 'Producto'}</span>
                          {item.customization && (
                            <span className={`ml-2 text-[10px] px-2 py-0.5 rounded-full font-bold border ${item.customization.size === 'quarter' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-purple-50 text-purple-700 border-purple-200'}`}>
                              {item.customization.size === 'quarter' ? 'Bowl 1/4' : 'Bowl 1/2'}
                            </span>
                          )}
                        </div>
                        <button onClick={() => removeFromCart(item.cartId)} className="p-1.5 hover:bg-red-50 rounded-lg transition group">
                          <Trash2 size={16} className="text-slate-400 group-hover:text-red-500 transition" />
                        </button>
                      </div>
                      {item.customization && (
                        <div className="text-[10px] text-slate-500 space-y-1 bg-white p-2 rounded border border-slate-100">
                          <p><strong className="text-slate-700">Base:</strong> {item.customization.bases.join(', ')}</p>
                          <p><strong className="text-slate-700">Complementos:</strong> {item.customization.complements.join(', ')}</p>
                          <p><strong className="text-slate-700">Toppings:</strong> {item.customization.toppings.join(', ')}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            {cart.length > 0 && (
              <div className="p-5 border-t bg-slate-50 space-y-3">
                <button onClick={() => setIsCartModalOpen(false)} className="w-full py-3 bg-white border-2 border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition">
                  Continuar comprando
                </button>
                <button onClick={() => { setIsCartModalOpen(false); setIsCheckoutModalOpen(true); }} className="w-full py-3 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition flex items-center justify-center gap-2">
                  <FileText size={18} />
                  Continuar pedido
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full my-8 shadow-2xl">
            <div className="p-5 border-b flex justify-between items-center bg-gradient-to-r from-rose-50 to-amber-50">
              <h3 className="font-bold text-xl flex items-center gap-2 text-slate-900">
                <FileText className="text-rose-500" size={24} />
                Datos del Evento
              </h3>
              <button onClick={() => { setIsCheckoutModalOpen(false); setIsCartModalOpen(true); }} className="p-2 hover:bg-white/50 rounded-full transition">
                <X size={24} className="text-slate-600" />
              </button>
            </div>
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2"><User size={14} className="inline mr-1" /> Tu Nombre</label>
                <input type="text" value={checkoutFormData.name} onChange={(e) => setCheckoutFormData(prev => ({ ...prev, name: e.target.value }))} className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-rose-400 focus:outline-none transition" placeholder="Ej: María García" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2"><Phone size={14} className="inline mr-1" /> WhatsApp</label>
                <input type="tel" value={checkoutFormData.phone} onChange={(e) => setCheckoutFormData(prev => ({ ...prev, phone: e.target.value.replace(/\D/g, '') }))} className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-rose-400 focus:outline-none transition" placeholder="10 dígitos sin espacios" maxLength={10} />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2"><Users size={14} className="inline mr-1" /> Número de Personas</label>
                <input type="number" value={checkoutFormData.peopleCount} onChange={(e) => setCheckoutFormData(prev => ({ ...prev, peopleCount: e.target.value }))} className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-rose-400 focus:outline-none transition" placeholder="¿Para cuántas personas?" />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2"><MapPin size={14} className="inline mr-1" /> Lugar del Evento</label>
                <input type="text" value={checkoutFormData.eventLocation} onChange={(e) => setCheckoutFormData(prev => ({ ...prev, eventLocation: e.target.value }))} className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-rose-400 focus:outline-none transition" placeholder="Ej: Jardín Los Naranjos, Col. Centro" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Fecha</label>
                  <input type="date" value={checkoutFormData.date} onChange={(e) => setCheckoutFormData(prev => ({ ...prev, date: e.target.value }))} className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-rose-400 focus:outline-none transition text-sm" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Hora</label>
                  <input type="time" value={checkoutFormData.time} onChange={(e) => setCheckoutFormData(prev => ({ ...prev, time: e.target.value }))} className="w-full p-3 border-2 border-slate-200 rounded-xl focus:border-rose-400 focus:outline-none transition text-sm" />
                </div>
              </div>
            </div>
            <div className="p-5 border-t bg-slate-50">
              <button onClick={sendToWhatsApp} disabled={!checkoutFormData.name || !checkoutFormData.phone || !checkoutFormData.peopleCount} className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                <Phone size={20} />
                Enviar por WhatsApp
              </button>
              <p className="text-xs text-slate-400 text-center mt-3">Se abrirá WhatsApp con tu cotización lista</p>
            </div>
          </div>
        </div>
      )}

      {/* Floating Cart Button - Mobile Only */}
      {cart.length > 0 && (
        <button
          onClick={() => setIsCartModalOpen(true)}
          className="md:hidden fixed bottom-6 right-6 z-40 bg-gradient-to-r from-rose-500 to-rose-600 text-white p-4 rounded-full shadow-2xl hover:shadow-rose-300 transition-all hover:scale-110 active:scale-95"
        >
          <ShoppingBag size={24} />
          <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse">
            {cart.length}
          </span>
        </button>
      )}

      {/* Lunita Floating Button (Always Visible) */}
      {!isBotOpen && (
        <button
          onClick={() => setIsBotOpen(true)}
          className={`fixed z-40 bg-slate-900 text-white p-3 md:p-4 rounded-full shadow-2xl hover:shadow-slate-500/50 transition-all hover:scale-110 active:scale-95 flex items-center gap-2 group ${cart.length > 0 ? 'bottom-24 md:bottom-6 right-6' : 'bottom-6 right-6'}`}
        >
          <div className="relative">
            <Bot size={28} className="text-rose-300" />
            <span className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900 animate-pulse"></span>
          </div>
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap text-sm font-bold text-rose-100">
            ¿Ayuda?
          </span>
        </button>
      )}

      <footer className="mt-auto py-8 text-center text-sm text-slate-500 border-t border-white/70"><p className="font-semibold text-slate-800 mb-1">Media Luna Snack Bar 🌙</p><p className="text-xs">Manzanillo, Colima • Pedidos en Línea</p></footer>
    </div>
  );
}

function ClientView({ products, categories, cart, onProductClick, removeFromCart, onCheckout, openBot, checkoutFormData, setCheckoutFormData }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-10">
        <div className="rounded-[28px] bg-gradient-to-br from-white/90 via-white/75 to-white/60 border border-white/60 shadow-[0_20px_80px_rgba(0,0,0,0.08)] p-8 md:p-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-100/70 via-transparent to-amber-100/60"></div>
          <div className="absolute -right-10 -top-10 w-52 h-52 bg-rose-500/20 rounded-full blur-3xl"></div>
          <div className="absolute -left-6 bottom-0 w-40 h-40 bg-amber-400/20 rounded-full blur-2xl"></div>
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-8">
            <div className="flex-1 space-y-4">
              <div className="inline-flex items-center gap-2 bg-rose-100 text-rose-600 px-3 py-1 rounded-full text-xs font-bold border border-rose-200 shadow-sm">Fresh & Local</div>
              <h1 className="text-3xl md:text-4xl font-extrabold leading-tight tracking-tight text-slate-900">
                ¿Antojo de algo <span className="text-rose-500">delicioso</span>?<br />
                Preparamos tu snack al momento.
              </h1>
              <p className="text-slate-600 text-base md:text-lg flex items-center gap-2">
                <MapPin size={18} className="text-rose-500" /> Servicio exclusivo en Manzanillo, Colima.
              </p>
              <div className="flex flex-wrap gap-3">
                <button onClick={openBot} className="px-6 py-3 rounded-xl font-semibold bg-slate-900 text-white shadow-lg shadow-rose-200 hover:-translate-y-0.5 active:translate-y-0 transition-transform flex items-center gap-2">
                  <Sparkles size={18} className="text-amber-300" /> Habla con Lunita IA
                </button>
                <button onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })} className="px-4 py-3 rounded-xl font-semibold bg-white text-slate-900 border border-slate-200 hover:border-slate-300 shadow-sm flex items-center gap-2">
                  <Utensils size={18} /> Ver menú
                </button>
              </div>
            </div>
            <div className="w-full md:w-64 rounded-2xl bg-white/80 border border-white/60 p-5 shadow-inner grid grid-cols-2 gap-3 text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-500 flex items-center justify-center shadow-sm"><Utensils size={18} /></div>
                <div><p className="font-bold text-slate-800">Snacks</p><p className="text-[11px] uppercase tracking-wide text-slate-400">Preparados</p></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shadow-sm"><CupSoda size={18} /></div>
                <div><p className="font-bold text-slate-800">Bebidas</p><p className="text-[11px] uppercase tracking-wide text-slate-400">Refrescantes</p></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center shadow-sm"><CheckCircle size={18} /></div>
                <div><p className="font-bold text-slate-800">Cotiza</p><p className="text-[11px] uppercase tracking-wide text-slate-400">Rápido</p></div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-sm"><Bot size={18} /></div>
                <div><p className="font-bold text-slate-800">Asistente</p><p className="text-[11px] uppercase tracking-wide text-slate-400">IA</p></div>
              </div>
            </div>
          </div>
        </div>
        <div id="products" className="space-y-10">
          {categories.map(cat => {
            const catProducts = products.filter(p => p.category === cat);
            if (catProducts.length === 0) return null;
            return (
              <div key={cat} className="animate-fade-in">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
                    <span className="text-2xl">{cat === "Snacks" ? "🍟" : "🍹"}</span>
                    {cat === "Snacks" ? "Snacks & Antojos" : "Bebidas Refrescantes"}
                  </h2>
                  <div className="h-[1px] flex-1 bg-gradient-to-r from-rose-200 via-slate-200 to-transparent ml-4" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {catProducts.map(product => {
                    const isSelected = cart.some(item => item.id === product.id);
                    const isCustomizable = CUSTOMIZABLE_IDS.includes(product.id);
                    const hasGallery = product.gallery && product.gallery.length > 0;
                    return (
                      <div key={product.id} className={`glass-panel p-4 rounded-2xl transition-all duration-300 flex items-center gap-4 relative group overflow-hidden ${isSelected && !isCustomizable ? 'ring-2 ring-rose-300 shadow-rose-100' : 'hover:-translate-y-1'}`}>
                        <div className="w-24 h-24 flex-shrink-0 bg-slate-100 rounded-2xl overflow-hidden shadow-inner relative cursor-pointer border border-white/70" onClick={() => hasGallery && onProductClick(product, true)}>
                          <img src={product.img} alt={product.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                          {hasGallery && (<div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><ImageIcon className="text-white drop-shadow-md" size={24} /></div>)}
                          {isCustomizable && !hasGallery && (<div className="absolute bottom-0 left-0 right-0 bg-rose-500/90 text-white text-[9px] uppercase tracking-wider text-center py-1 font-bold backdrop-blur-sm">Armar</div>)}
                        </div>
                        <div className="flex-1 py-1 cursor-pointer" onClick={() => onProductClick(product, false)}>
                          <h3 className="font-bold text-lg text-slate-900 leading-tight mb-1">{product.name}</h3>
                          <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                            {product.description || product.desc || 'Delicioso snack preparado al momento'}
                          </p>
                          <div className="flex justify-between items-center">
                            <p className="text-rose-600 text-xs font-extrabold bg-rose-50 px-3 py-1 rounded-full border border-rose-100 shadow-sm">Cotización</p>
                            {isSelected && !isCustomizable ? (<div className="bg-green-100 text-green-600 p-1.5 rounded-lg shadow-sm"><CheckCircle size={18} /></div>) : (<div className={`p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 ${isCustomizable ? 'bg-amber-100 text-amber-600' : 'bg-slate-900 text-white'} shadow-sm`}>{isCustomizable ? <Sparkles size={18} /> : <Utensils size={18} />}</div>)}
                          </div>
                        </div>
                        {isSelected && !isCustomizable && (<button onClick={(e) => { e.stopPropagation(); removeFromCart(cart.find(i => i.id === product.id).cartId); }} className="absolute top-2 right-2 bg-white/90 text-red-500 p-1.5 rounded-full shadow hover:bg-red-50 transition-colors z-10 border border-rose-100"><Trash2 size={16} /></button>)}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <div className="lg:col-span-1">
        <div className="glass-panel p-6 rounded-3xl mb-8 hidden lg:block">
          <div className="flex items-center justify-between mb-6 border-b border-white/70 pb-4"><h2 className="text-xl font-extrabold flex items-center gap-2 text-slate-900"><ShoppingBag className="text-rose-500" /> Solicitud</h2><span className="bg-rose-500/10 text-rose-600 text-xs font-bold px-3 py-1 rounded-full border border-rose-200 shadow-sm">{cart.length} items</span></div>
          <div className="bg-white/70 p-4 rounded-2xl mb-6 max-h-[400px] overflow-y-auto custom-scrollbar border border-white/80 shadow-inner">
            {cart.length === 0 ? (<div className="text-center py-8"><div className="bg-white w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner border border-slate-100"><ShoppingBag className="text-slate-300" size={32} /></div><p className="text-slate-400 text-sm font-medium mb-3">Tu lista está vacía</p><button onClick={openBot} className="text-xs bg-slate-900 text-white px-3 py-2 rounded-full font-bold hover:-translate-y-0.5 transition-transform shadow-lg shadow-rose-100 flex items-center gap-1 mx-auto"><Sparkles size={14} /> Pedir ayuda a Lunita</button></div>) : (
              <ul className="space-y-4">{cart.map((item, idx) => (<li key={item.cartId || idx} className="bg-white p-3 rounded-xl shadow-sm animate-fade-in border border-slate-100"><div className="flex justify-between items-start mb-1"><div className="flex items-center gap-2"><span className="text-sm font-bold text-slate-900">{item.name}</span>{item.customization && (<span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border ${item.customization.size === 'quarter' ? 'bg-blue-50 text-blue-700 border-blue-100' : 'bg-purple-50 text-purple-700 border-purple-100'}`}>{item.customization.size === 'quarter' ? 'Bowl 1/4' : 'Bowl 1/2'}</span>)}</div><button onClick={() => removeFromCart(item.cartId)} className="text-slate-300 hover:text-red-500 transition-colors"><X size={16} /></button></div>{item.customization && (<div className="text-[10px] text-slate-500 mb-2 space-y-1 bg-slate-50 p-2 rounded border border-slate-100"><p className="line-clamp-1"><strong className="text-slate-700">Base:</strong> {item.customization.bases.join(", ")}</p><p className="line-clamp-1"><strong className="text-slate-700">Comp:</strong> {item.customization.complements.join(", ")}</p><p className="line-clamp-1"><strong className="text-slate-700">Top:</strong> {item.customization.toppings.join(", ")}</p></div>)}</li>))}</ul>
            )}
          </div>
          <CheckoutForm onCheckout={onCheckout} hasItems={cart.length > 0} formData={checkoutFormData} setFormData={setCheckoutFormData} />
        </div>
        <CommunitySection />
      </div>
    </div>
  );
}

// Social Media & Community Section
function CommunitySection() {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const testimonials = [
    { id: 1, name: "Ana P.", text: "¡Los mejores tostitos que he probado! Súper recomendados 🤤", stars: 5, date: "Hace 2 días" },
    { id: 2, name: "Carlos M.", text: "Excelente servicio y todo muy fresco. El bowl de 1/2 litro uffff 🔥", stars: 5, date: "Hace 1 semana" },
    { id: 3, name: "Sofia R.", text: "Me encanta que puedo armar mi snack como yo quiera. 💖", stars: 5, date: "Hace 3 días" },
    { id: 4, name: "Luis G.", text: "La atención de Lunita es genial, hice mi pedido súper rápido. 🤖", stars: 5, date: "Ayer" },
    { id: 5, name: "Mariana L.", text: "Las micheladas están en su punto. Volveré seguro. 🍻", stars: 5, date: "Hace 2 semanas" },
    { id: 6, name: "Diego F.", text: "Muy buenos precios y porciones generosas. 👌", stars: 4, date: "Hace 5 días" }
  ];

  const galleryPhotos = [
    "/images/tostilocos.jpeg",
    "/images/bowl_un_medio.jpeg",
    "/images/michelada.jpeg",
    "/images/waffles.jpeg",
    "/images/duro_preparado.jpeg",
    "/images/azulito.jpeg"
  ];

  const openLightbox = (index) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
  };

  const nextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % galleryPhotos.length);
  };

  const prevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev - 1 + galleryPhotos.length) % galleryPhotos.length);
  };

  return (
    <div className="space-y-6 md:space-y-8 mt-8 md:mt-12 animate-fade-in relative z-20">

      {/* Testimonials Carousel (Infinite Scroll) */}
      <div className="glass-panel p-4 md:p-6 rounded-2xl md:rounded-3xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 md:p-4 opacity-10 pointer-events-none">
          <MessageCircle size={64} className="text-rose-500 md:w-[100px] md:h-[100px]" />
        </div>
        <div className="flex items-center gap-2 mb-4 md:mb-6">
          <div className="bg-rose-100 p-1.5 md:p-2 rounded-full"><Star size={16} className="text-rose-500 fill-rose-500 md:w-5 md:h-5" /></div>
          <h3 className="text-lg md:text-xl font-extrabold text-slate-900">Lo que dicen nuestros clientes</h3>
        </div>

        <div className="relative w-full overflow-hidden mask-linear-fade">
          <div className="flex gap-3 md:gap-4 animate-marquee w-max">
            {/* Render testimonials twice to create infinite loop effect */}
            {[...testimonials, ...testimonials].map((t, i) => (
              <div key={i} className="w-[240px] md:w-[320px] bg-white/60 p-3 md:p-4 rounded-xl md:rounded-2xl border border-white/50 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 relative flex-shrink-0 cursor-default">
                <div className="flex items-center gap-1 mb-1.5 md:mb-2 text-amber-400">
                  {[...Array(5)].map((_, idx) => (
                    <Star key={idx} size={12} className={`md:w-[14px] md:h-[14px] ${idx < t.stars ? "fill-current" : "text-gray-300"}`} />
                  ))}
                </div>
                <p className="text-xs md:text-sm text-slate-700 italic mb-2 md:mb-3 line-clamp-3">"{t.text}"</p>
                <div className="flex justify-between items-end border-t border-slate-100 pt-1.5 md:pt-2">
                  <span className="font-bold text-[10px] md:text-xs text-slate-900">{t.name}</span>
                  <span className="text-[9px] md:text-[10px] text-slate-400">{t.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Social Gallery Grid */}
      <div className="glass-panel p-4 md:p-6 rounded-2xl md:rounded-3xl">
        <div className="flex justify-between items-end mb-4 md:mb-6">
          <div>
            <div className="flex items-center gap-2 mb-0.5 md:mb-1">
              <div className="bg-blue-100 p-1.5 md:p-2 rounded-full"><ImageIcon size={16} className="text-blue-600 md:w-5 md:h-5" /></div>
              <h3 className="text-lg md:text-xl font-extrabold text-slate-900">Galería Social 📸</h3>
            </div>
            <p className="text-xs md:text-sm text-slate-500">Síguenos en Facebook para más antojos.</p>
          </div>
          <a
            href={FACEBOOK_PAGE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-1.5 md:px-4 md:py-2 bg-[#1877F2] text-white text-xs md:text-sm font-bold rounded-lg md:rounded-xl shadow-lg shadow-blue-200 hover:bg-[#166fe5] transition-colors flex items-center gap-1.5 md:gap-2"
          >
            <Facebook size={16} className="md:w-[18px] md:h-[18px]" />
            Ver Facebook
          </a>
        </div>

        <div className="grid grid-cols-3 md:grid-cols-4 gap-2 md:gap-3">
          {galleryPhotos.map((src, i) => (
            <div key={i} onClick={() => openLightbox(i)} className={`rounded-lg md:rounded-xl overflow-hidden aspect-square border border-white/50 shadow-sm group relative cursor-pointer ${i >= 4 ? 'hidden md:block' : ''}`}>
              <img
                src={src}
                alt="Social Media"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' }}
              />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Heart className="text-white fill-white drop-shadow-md scale-0 group-hover:scale-100 transition-transform duration-300 w-6 h-6 md:w-8 md:h-8" />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center animate-fade-in" onClick={() => setLightboxOpen(false)}>
          <button className="absolute top-4 right-4 bg-white/10 p-2 rounded-full text-white hover:bg-white/20 transition-colors z-[110]">
            <X size={32} />
          </button>

          <button className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 p-3 rounded-full text-white hover:bg-white/20 transition-colors hidden md:block z-[110]" onClick={prevImage}>
            <ChevronDown className="rotate-90" size={32} />
          </button>

          <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 p-3 rounded-full text-white hover:bg-white/20 transition-colors hidden md:block z-[110]" onClick={nextImage}>
            <ChevronDown className="-rotate-90" size={32} />
          </button>

          <img
            src={galleryPhotos[currentImageIndex]}
            alt="Gallery Fullscreen"
            className="max-w-full max-h-[90vh] object-contain shadow-2xl rounded-lg"
            onClick={(e) => e.stopPropagation()}
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' }}
          />

          <p className="absolute bottom-6 text-white/50 text-sm font-medium">
            {currentImageIndex + 1} / {galleryPhotos.length}
          </p>
        </div>
      )}

    </div>
  );
}

function CheckoutForm({ onCheckout, hasItems, formData, setFormData }) {
  const handleSubmit = (e) => { e.preventDefault(); if (!hasItems) return; onCheckout(formData); };
  return (
    <form onSubmit={handleSubmit} className="space-y-4" id="checkout-form">
      <div className="bg-amber-50 text-amber-800 text-xs p-2.5 rounded-xl border border-amber-200 flex items-center gap-2 shadow-inner"><MapPin size={12} /><span>Servicio en <strong>Manzanillo, Colima</strong></span></div>
      <div className="relative"><User className="absolute left-3 top-3 text-slate-400" size={18} /><input required type="text" placeholder="Tu nombre" className="w-full pl-10 p-3 bg-white/70 border border-white/80 rounded-xl focus:ring-2 focus:ring-rose-300 outline-none transition-all text-sm shadow-inner" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div>
      <div className="relative"><Phone className="absolute left-3 top-3 text-slate-400" size={18} /><input required type="tel" placeholder="WhatsApp (314...)" className="w-full pl-10 p-3 bg-white/70 border border-white/80 rounded-xl focus:ring-2 focus:ring-rose-300 outline-none transition-all text-sm shadow-inner" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} /></div>
      <div className="relative"><MapPin className="absolute left-3 top-3 text-slate-400" size={18} /><input required type="text" placeholder="Lugar del evento (Ej: Colonia Jardines)" className="w-full pl-10 p-3 bg-white/70 border border-white/80 rounded-xl focus:ring-2 focus:ring-rose-300 outline-none transition-all text-sm shadow-inner" value={formData.eventLocation} onChange={e => setFormData({ ...formData, eventLocation: e.target.value })} /></div>
      <div className="grid grid-cols-2 gap-3">
        <input required type="date" className="w-full p-3 bg-white/70 border border-white/80 rounded-xl focus:ring-2 focus:ring-rose-300 outline-none text-sm text-slate-600 shadow-inner" value={formData.date} onChange={e => setFormData({ ...formData, date: e.target.value })} />
        <select className="w-full p-3 bg-white/70 border border-white/80 rounded-xl focus:ring-2 focus:ring-rose-300 outline-none text-sm text-slate-600 shadow-inner" value={formData.time} onChange={e => setFormData({ ...formData, time: e.target.value })}>
          {["14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"].map(t => <option key={t} value={t}>{t} PM</option>)}
        </select>
      </div>
      <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-800 shadow-lg shadow-rose-100/40"><label className="text-sm font-bold block mb-1 flex items-center gap-1 text-white"><Users size={16} /> Número de Personas</label><input required type="number" min="1" placeholder="Ej: 30 personas" className="w-full p-2 bg-white text-slate-900 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-rose-300 transition-all text-sm" value={formData.peopleCount} onChange={e => setFormData({ ...formData, peopleCount: e.target.value })} /></div>
      <button type="submit" disabled={!hasItems} className={`w-full py-4 rounded-xl font-bold text-white flex justify-center items-center gap-2 shadow-lg transition-all active:scale-[0.98] ${hasItems ? 'bg-gradient-to-r from-slate-900 via-rose-600 to-amber-500 hover:shadow-rose-300/60 hover:-translate-y-1' : 'bg-gray-300 cursor-not-allowed'}`}><FileText size={20} /> Solicitar Cotización</button>
    </form>
  );
}

function ChatBot({ isOpen, setIsOpen, products, options, onAddProducts }) {
  const [messages, setMessages] = useState([{ role: 'bot', text: '¡Hola! Soy Lunita IA 🌙. ¿Antojo de algo dulce o salado? Escribe lo que quieres y yo armo tu pedido.' }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [botState, setBotState] = useState('IDLE');
  const [currentBowl, setCurrentBowl] = useState({});
  const messagesEndRef = useRef(null);

  useEffect(() => { if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, isOpen]);

  const normalize = (str) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const processInput = (text) => {
    const lower = text.toLowerCase(); const normText = normalize(text);
    if (botState !== 'IDLE') return handleBowlBuilder(lower, normText);
    if (lower.includes("gracias")) return { text: "¡De nada! Es un gusto ayudarte. 🍉 ¿En qué más puedo servirte?" };
    const exitPhrases = ["ya nada", "sería todo", "bye", "nada mas", "listo"];
    if (exitPhrases.some(phrase => lower.includes(phrase))) return { type: 'exit' };
    if (lower.includes("papas") || lower.includes("bowl")) { setBotState('ASK_SIZE'); return { text: "¡Excelente! 🥔 Vamos a armar tu bowl de papas. ¿Qué tamaño prefieres? (Escribe '1/4' o '1/2')", choices: [{ id: 'q', name: 'Bowl 1/4' }, { id: 'h', name: 'Bowl 1/2' }] }; }
    const matched = products.filter(p => { const n = normalize(p.name); return n.includes(normText) || p.keywords.some(k => normText.includes(normalize(k))); });
    if (matched.length > 1) return { text: `Encontré varias opciones. ¿Cuál prefieres?`, choices: matched };
    else if (matched.length === 1) { const found = matched[0]; if (!CUSTOMIZABLE_IDS.includes(found.id)) { onAddProducts(found); return { text: `¡Qué rico! He agregado ${found.name} a tu lista. ¿Algo más?` }; } else { setBotState('ASK_SIZE'); return { text: `¡Claro! Vamos a armar tus ${found.name}. ¿Qué tamaño prefieres? (1/4 o 1/2)`, choices: [{ id: 'q', name: 'Bowl 1/4' }, { id: 'h', name: 'Bowl 1/2' }] }; } }
    return { text: "No estoy segura de qué es eso. Prueba escribiendo 'Quiero papas preparadas' o el nombre de un snack." };
  };

  const handleChoiceClick = (choice) => {
    if (choice.category) {
      if (CUSTOMIZABLE_IDS.includes(choice.id)) { setBotState('ASK_SIZE'); setMessages(prev => [...prev, { role: 'user', text: choice.name }, { role: 'bot', text: `¡Claro! Vamos a armar tus ${choice.name}. ¿Qué tamaño prefieres? (1/4 o 1/2)`, choices: [{ id: 'q', name: 'Bowl 1/4' }, { id: 'h', name: 'Bowl 1/2' }] }]); }
      else { onAddProducts(choice); setMessages(prev => [...prev, { role: 'user', text: choice.name }, { role: 'bot', text: `¡Listo! Agregué ${choice.name} a tu carrito.` }]); }
    } else if (choice.id === 'q' || choice.id === 'h') {
      const size = choice.id === 'q' ? 'quarter' : 'half'; setCurrentBowl({ ...currentBowl, size }); setBotState('ASK_BASE'); setMessages(prev => [...prev, { role: 'user', text: choice.name }, { role: 'bot', text: "Anotado. Ahora selecciona tus 2 bases:", selectionType: 'bases', options: options.bases, min: 2, max: 2 }]);
    }
  };

  const handleSelectionConfirm = (selected, type) => {
    if (type === 'bases') { setCurrentBowl(prev => ({ ...prev, bases: selected })); setBotState('ASK_COMPLEMENTS'); setMessages(prev => [...prev, { role: 'user', text: `Bases: ${selected.join(', ')}` }, { role: 'bot', text: "¡Listo! Ahora selecciona hasta 4 complementos:", selectionType: 'complements', options: options.complements, min: 0, max: 4 }]); }
    else if (type === 'complements') { setCurrentBowl(prev => ({ ...prev, complements: selected })); setBotState('ASK_TOPPINGS'); setMessages(prev => [...prev, { role: 'user', text: `Complementos: ${selected.join(', ')}` }, { role: 'bot', text: "¡Rico! Por último, elige hasta 6 toppings:", selectionType: 'toppings', options: options.toppings, min: 0, max: 6 }]); }
    else if (type === 'toppings') { const finalBowl = { ...currentBowl, toppings: selected }; const parent = products.find(p => p.id === 6); onAddProducts(parent, finalBowl); setBotState('IDLE'); setMessages(prev => [...prev, { role: 'user', text: `Toppings: ${selected.join(', ')}` }, { role: 'bot', text: "¡Perfecto! Tu bowl ha sido agregado al pedido. 🌙" }]); }
  };
  const handleBowlBuilder = (text) => { if (text.includes("cancel")) { setBotState('IDLE'); return { text: "Entendido, cancelé el armado." }; } return { text: "Por favor usa las opciones que te muestro en pantalla para armar tu pedido." }; };
  const handleSend = (e) => { e.preventDefault(); if (!input.trim()) return; const userText = input; setMessages(prev => [...prev, { role: 'user', text: userText }]); setInput(''); setIsTyping(true); setTimeout(() => { const response = processInput(userText); setIsTyping(false); if (response.type === 'exit') setMessages(prev => [...prev, { role: 'bot', text: '¡Hasta pronto! 😉' }]); else { const msg = { role: 'bot', text: response.text }; if (response.choices) msg.choices = response.choices; if (response.selectionType) { msg.selectionType = response.selectionType; msg.options = response.options; msg.min = response.min; msg.max = response.max; } setMessages(prev => [...prev, msg]); } }, 600); };
  if (!isOpen) return null;
  return (
    <div className="fixed bottom-6 right-6 w-full max-w-sm glass-panel rounded-3xl z-50 flex flex-col overflow-hidden h-[500px] animate-fade-in border border-white/70 shadow-[0_20px_70px_rgba(0,0,0,0.15)]">
      <div className="bg-gradient-to-r from-slate-900 via-rose-600 to-amber-400 p-4 text-white flex justify-between items-center shadow-md">
        <div className="flex items-center gap-3"><div className="bg-white/20 p-2 rounded-full backdrop-blur-sm"><Bot size={22} /></div><div><h3 className="font-bold text-base">Lunita IA 🌙</h3><span className="text-xs text-rose-100 flex items-center gap-1 opacity-90"><span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_5px_#4ade80]"></span> En línea</span></div></div>
        <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1.5 rounded-full transition-colors"><X size={20} /></button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-white/60 scroll-smooth">
        {messages.map((msg, i) => (
          <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
            <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm shadow-sm whitespace-pre-wrap ${msg.role === 'user' ? 'bg-slate-900 text-white rounded-br-sm' : 'bg-white/90 text-slate-800 rounded-bl-sm border border-white/70'}`}>{msg.text}</div>
            {msg.choices && (<div className="mt-2 flex flex-wrap gap-2">{msg.choices.map(c => (<button key={c.id} onClick={() => handleChoiceClick(c)} className="text-xs bg-rose-100 text-rose-700 px-3 py-1 rounded-full hover:bg-rose-200 border border-rose-200 shadow-sm">{c.name}</button>))}</div>)}
            {msg.selectionType && (<div className="mt-2 bg-white p-3 rounded-xl border border-gray-200 shadow-sm w-full"><IngredientSelector options={msg.options} min={msg.min} max={msg.max} onConfirm={(selected) => handleSelectionConfirm(selected, msg.selectionType)} /></div>)}
          </div>
        ))}
        {isTyping && <div className="flex justify-start"><div className="bg-white/90 p-4 rounded-2xl rounded-bl-sm shadow-sm border border-white/70 flex gap-1.5 items-center"><span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span><span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-100"></span><span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce delay-200"></span></div></div>} <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSend} className="p-3 bg-white/80 border-t border-white/70 flex gap-2 items-center"><input autoFocus type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Escribe aquí..." className="flex-1 bg-white rounded-full px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all border border-slate-100 shadow-inner" /><button type="submit" className="bg-slate-900 text-white p-3 rounded-full hover:bg-rose-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg active:scale-95" disabled={!input.trim()}><Send size={18} /></button></form>
    </div>
  );
}

function IngredientSelector({ options, min, max, onConfirm }) {
  const [selected, setSelected] = useState([]);
  const toggle = (opt) => { if (selected.includes(opt)) setSelected(selected.filter(i => i !== opt)); else { if (selected.length < max) setSelected([...selected, opt]); } };
  return (
    <div className="text-left"><p className="text-[10px] text-gray-400 mb-1">Selecciona entre {min} y {max}:</p><div className="max-h-40 overflow-y-auto grid grid-cols-2 gap-1 mb-2">{options.map(opt => (<button key={opt} onClick={() => toggle(opt)} disabled={!selected.includes(opt) && selected.length >= max} className={`text-[10px] p-1.5 rounded border text-left truncate ${selected.includes(opt) ? 'bg-rose-500 text-white border-rose-500' : 'bg-gray-50 text-gray-600 border-gray-100 disabled:opacity-50'}`}>{opt}</button>))}</div><button onClick={() => onConfirm(selected)} disabled={selected.length < min} className="w-full bg-green-500 text-white text-xs py-2 rounded font-bold hover:bg-green-600 disabled:bg-gray-300">Confirmar ({selected.length})</button></div>
  );
}

function ConfirmationView({ order, onBack }) {
  const itemsText = (order.items || []).map(i => { let text = `- ${i.name}`; if (i.customization) { const sizeLabel = i.customization.size === 'quarter' ? 'Bowl 1/4' : 'Bowl 1/2'; text += ` (${sizeLabel})\n     Base: ${i.customization.bases.join(", ")}\n     Comp: ${i.customization.complements.join(", ")}\n     Top: ${i.customization.toppings.join(", ")}`; } return text; }).join('\n\n');
  const waMessage = `Hola Media Luna! 🌙🍉\n*Solicito cotización para este pedido:*\n\nCliente: ${order.customer}\nPersonas: ${order.peopleCount}\nFecha: ${order.date} ${order.time}\n\n*Detalle de Solicitud:*\n${itemsText}`;
  const waLink = `https://api.whatsapp.com/send?phone=${BUSINESS_PHONE}&text=${encodeURIComponent(waMessage)}`;
  return (
    <div className="flex flex-col items-center justify-center pt-10 px-4">
      <div className="glass-panel p-8 rounded-3xl max-w-md w-full text-center border-t-8 border-rose-500">
        <CheckCircle className="text-green-500 mx-auto mb-4" size={48} />
        <h2 className="text-3xl font-extrabold mb-2 text-slate-900">¡Solicitud Enviada!</h2>
        <p className="text-slate-600 mb-6">Gracias {order.customer}. Hemos recibido tu solicitud. Un asesor de Media Luna revisará disponibilidad y te contactará al {order.phone} para enviarte la cotización.</p>
        <a href={waLink} target="_blank" className="block w-full bg-[#25D366] text-white font-bold py-3 rounded-xl mt-6 flex justify-center gap-2 shadow-lg hover:shadow-xl transition-all"><MessageCircle /> Agilizar por WhatsApp (Opcional)</a>
        <button onClick={onBack} className="mt-4 text-slate-400 underline">Volver</button>
      </div>
    </div>
  );
}

function AdminDashboard({ orders, products, categories, options, onSaveProduct, onDeleteProduct, onUpdateOptions, setEditingProduct, setIsProductModalOpen }) {
  const [tab, setTab] = useState('orders'); const [editingOptions, setEditingOptions] = useState(options);
  const handleOptionChange = (type, value) => { const list = value.split(',').map(s => s.trim()).filter(s => s); setEditingOptions({ ...editingOptions, [type]: list }); };
  const saveOptions = () => { onUpdateOptions(editingOptions); alert("Opciones actualizadas"); };
  return (
    <div className="flex flex-col md:flex-row gap-6 animate-fade-in"><div className="w-full md:w-72 bg-white rounded-2xl shadow-lg p-5 h-fit border border-gray-100"><h3 className="font-bold text-xl mb-6 text-center text-gray-800 flex items-center justify-center gap-2"><Lock size={20} className="text-rose-500" /> Admin Panel</h3><nav className="space-y-2"><button onClick={() => setTab('orders')} className={`w-full text-left px-5 py-3 rounded-xl flex items-center gap-3 transition-all ${tab === 'orders' ? 'bg-rose-50 text-rose-600 font-bold shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}><ClipboardList size={20} /> Solicitudes</button><button onClick={() => setTab('products')} className={`w-full text-left px-5 py-3 rounded-xl flex items-center gap-3 transition-all ${tab === 'products' ? 'bg-rose-50 text-rose-600 font-bold shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}><Utensils size={20} /> Productos</button><button onClick={() => setTab('ingredients')} className={`w-full text-left px-5 py-3 rounded-xl flex items-center gap-3 transition-all ${tab === 'ingredients' ? 'bg-rose-50 text-rose-600 font-bold shadow-sm' : 'text-gray-500 hover:bg-gray-50'}`}><CheckSquare size={20} /> Ingredientes</button></nav></div><div className="flex-1 bg-white rounded-2xl shadow-lg p-6 min-h-[500px] border border-gray-100">{tab === 'orders' && (<div><h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">Solicitudes Recientes</h2>{orders.length === 0 ? <p className="text-gray-400">Sin solicitudes aún.</p> : (<div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="bg-gray-50"><th className="p-3">ID</th><th className="p-3">Cliente</th><th className="p-3">Personas</th></tr></thead><tbody>{orders.map(o => (<tr key={o.id} className="border-b"><td className="p-3">#{o.id}</td><td className="p-3">{o.customer}</td><td className="p-3 font-bold text-rose-500">{o.peopleCount}</td></tr>))}</tbody></table></div>)}</div>)}{tab === 'products' && (<div><div className="flex justify-between items-center mb-6 border-b pb-4"><h2 className="text-2xl font-bold text-gray-800">Productos</h2><button onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }} className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-green-600"><Plus size={16} /> Nuevo</button></div><div className="grid grid-cols-1 gap-4">{products.map(p => (<div key={p.id} className="border p-3 rounded-lg flex justify-between items-center bg-gray-50"><div className="flex items-center gap-3"><img src={p.img} alt="" className="w-12 h-12 rounded bg-gray-200 object-cover" /><div><div className="font-bold text-gray-800">{p.name}</div><div className="text-xs text-gray-500">{p.category}</div></div></div><div className="flex gap-2"><button onClick={() => { setEditingProduct(p); setIsProductModalOpen(true); }} className="text-blue-500 hover:bg-blue-100 p-2 rounded"><Edit size={18} /></button><button onClick={() => onDeleteProduct(p.id)} className="text-red-500 hover:bg-red-100 p-2 rounded"><Trash2 size={18} /></button></div></div>))}</div></div>)}{tab === 'ingredients' && (<div className="space-y-6"><h2 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">Editar Ingredientes</h2>{['bases', 'complements', 'toppings'].map((type) => (<div key={type} className="bg-gray-50 p-4 rounded-xl border border-gray-200"><label className="font-bold text-gray-700 capitalize mb-2 block">{type}</label><textarea className="w-full p-3 border rounded-lg text-sm h-24" value={editingOptions[type].join(", ")} onChange={(e) => handleOptionChange(type, e.target.value)} /><p className="text-xs text-gray-400 mt-1">Separa los items con comas.</p></div>))}<button onClick={saveOptions} className="w-full bg-rose-500 text-white font-bold py-3 rounded-xl hover:bg-rose-600 flex justify-center gap-2"><Save size={20} /> Guardar Cambios</button></div>)}</div></div>
  );
}

function ProductFormModal({ product, categories, onClose, onSave }) {
  const [formData, setFormData] = useState(product || { name: '', category: categories[0], description: '', img: '' });
  const handleGalleryChange = (e) => { const urls = e.target.value.split(',').map(u => u.trim()); setFormData({ ...formData, gallery: urls }); };
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[80] p-4 backdrop-blur-sm animate-fade-in"><div className="bg-white p-6 rounded-2xl w-full max-w-md relative shadow-2xl max-h-[90vh] overflow-y-auto"><button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={20} /></button><h3 className="text-xl font-bold text-center mb-4 text-gray-800">{product ? 'Editar Producto' : 'Nuevo Producto'}</h3><form onSubmit={(e) => { e.preventDefault(); onSave(formData); }}><div className="space-y-4"><div><label className="text-xs font-bold text-gray-500 uppercase">Nombre</label><input required type="text" className="w-full p-2 border rounded-lg" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} /></div><div><label className="text-xs font-bold text-gray-500 uppercase">Descripción</label><textarea required rows="3" className="w-full p-2 border rounded-lg text-sm" value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} /></div><div><label className="text-xs font-bold text-gray-500 uppercase">Categoría</label><select className="w-full p-2 border rounded-lg" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })}>{categories.map(c => <option key={c} value={c}>{c}</option>)}</select></div><div><label className="text-xs font-bold text-gray-500 uppercase">Imagen Principal (URL)</label><input type="text" className="w-full p-2 border rounded-lg text-sm" value={formData.img} onChange={e => setFormData({ ...formData, img: e.target.value })} /></div><div><label className="text-xs font-bold text-gray-500 uppercase">Galería (URLs separadas por coma)</label><textarea rows="3" className="w-full p-2 border rounded-lg text-sm" placeholder="https://foto1.jpg, https://foto2.jpg" value={formData.gallery ? formData.gallery.join(', ') : ''} onChange={handleGalleryChange} /></div></div><button type="submit" className="w-full bg-green-500 text-white font-bold py-3 rounded-lg mt-6 hover:bg-green-600 transition-colors">Guardar Cambios</button></form></div></div>
  );
}

function CustomizationModal({ product, options, onClose, onConfirm }) {
  const [size, setSize] = useState('quarter'); const [bases, setBases] = useState([]); const [complements, setComplements] = useState([]); const [toppings, setToppings] = useState([]);
  const toggleOption = (list, setList, item, max) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      if (list.length < max) {
        setList([...list, item]);
      } else {
        alert(`Solo puedes elegir máximo ${max} opciones.`);
      }
    }
  };
  const handleConfirm = () => {
    // Validaciones Estrictas
    if (bases.length !== 2) {
      alert(`Debes elegir exactamente 2 bases (llevas ${bases.length}).`);
      return;
    }
    if (complements.length > 4) {
      alert(`Debes elegir máximo 4 complementos.`);
      return;
    }
    if (toppings.length > 6) {
      alert(`Debes elegir máximo 6 toppings.`);
      return;
    }
    onConfirm({ size, bases, complements, toppings });
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4 backdrop-blur-sm animate-fade-in"><div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden"><div className="bg-rose-500 p-4 text-white flex justify-between items-center shrink-0"><h3 className="font-bold text-lg flex items-center gap-2"><Utensils size={20} /> Armar: {product.name}</h3><button onClick={onClose}><X size={24} /></button></div><div className="p-6 overflow-y-auto flex-1 space-y-6"><section className="bg-yellow-50 p-4 rounded-xl border border-yellow-200"><h4 className="font-bold text-gray-800 text-lg mb-3">📏 Tamaño</h4><div className="grid grid-cols-2 gap-4">{['quarter', 'half'].map((sz) => (<button key={sz} onClick={() => setSize(sz)} className={`p-4 rounded-xl text-sm font-bold border-2 transition-all ${size === sz ? 'bg-yellow-100 border-yellow-500 text-yellow-800' : 'bg-white border-gray-100'}`}><div>{SIZE_LABELS[sz]}</div></button>))}</div></section>{[{ title: "1. Bases (Elige 2)", list: options.bases, state: bases, set: setBases, max: 2 }, { title: "2. Complementos (Max 4)", list: options.complements, state: complements, set: setComplements, max: 4 }, { title: "3. Toppings (Max 6)", list: options.toppings, state: toppings, set: setToppings, max: 6 }].map((sec, i) => (<section key={i}><div className="flex justify-between border-b pb-1 mb-2"><h4 className="font-bold">{sec.title}</h4><span className="text-xs bg-gray-200 px-2 rounded">{sec.state.length}/{sec.max}</span></div><div className="grid grid-cols-2 sm:grid-cols-3 gap-2">{sec.list.map(opt => (<button key={opt} onClick={() => toggleOption(sec.state, sec.set, opt, sec.max)} className={`p-2 rounded text-sm text-left flex justify-between ${sec.state.includes(opt) ? 'bg-rose-500 text-white' : 'bg-gray-50'}`}>{opt} {sec.state.includes(opt) && <CheckCircle size={14} />}</button>))}</div></section>))}</div><div className="p-4 border-t flex justify-between items-center bg-gray-50"><div className="text-sm text-gray-500 italic">Precio a cotizar</div><button onClick={handleConfirm} className="px-8 py-3 bg-rose-500 text-white rounded-xl font-bold shadow-lg">Agregar</button></div></div></div>
  );
}

function GalleryModal({ images, onClose }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  return (
    <div className="fixed inset-0 bg-black/90 z-[80] flex flex-col items-center justify-center p-4 animate-fade-in backdrop-blur-sm"><button onClick={onClose} className="absolute top-6 right-6 text-white bg-white/20 p-2 rounded-full hover:bg-white/40"><X size={32} /></button><div className="w-full max-w-3xl aspect-video bg-black rounded-lg overflow-hidden shadow-2xl relative mb-4"><img src={images[currentIndex]} alt="Galería" className="w-full h-full object-contain" />{images.length > 1 && (<><button onClick={() => setCurrentIndex(i => (i === 0 ? images.length - 1 : i - 1))} className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 p-2 rounded-full text-white hover:bg-white/40"><ChevronDown className="rotate-90" size={32} /></button><button onClick={() => setCurrentIndex(i => (i === images.length - 1 ? 0 : i + 1))} className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 p-2 rounded-full text-white hover:bg-white/40"><ChevronDown className="-rotate-90" size={32} /></button></>)}</div><div className="flex gap-2 overflow-x-auto max-w-full px-4">{images.map((img, idx) => (<button key={idx} onClick={() => setCurrentIndex(idx)} className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${idx === currentIndex ? 'border-rose-500 scale-110' : 'border-transparent opacity-50'}`}><img src={img} alt="" className="w-full h-full object-cover" /></button>))}</div></div>
  );
}

function LoginModal({ onClose, onLogin }) {
  const [pass, setPass] = useState('');
  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[70] p-4"><div className="bg-white p-8 rounded-3xl w-full max-w-sm"><h3 className="text-xl font-bold text-center mb-4">Acceso Admin</h3><input type="password" placeholder="Contraseña" className="w-full p-3 border rounded-xl mb-4" value={pass} onChange={e => setPass(e.target.value)} /><button onClick={() => onLogin(pass)} className="w-full bg-gray-900 text-white font-bold py-3 rounded-xl">Entrar</button></div></div>
  );
}
