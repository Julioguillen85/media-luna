import React, { useState, useEffect } from 'react';
import { ShoppingBag, Bot, Loader2 } from 'lucide-react';
import Navbar from './components/layout/Navbar';
import HeroSection from './components/layout/HeroSection';
import Footer from './components/layout/Footer';
import ProductGrid from './components/menu/ProductGrid';
import AdminDashboard from './components/admin/AdminDashboard';
import LoginModal from './components/admin/LoginModal';
import CustomizationModal from './components/menu/CustomizationModal';
import GalleryModal from './components/menu/GalleryModal';
import CartModal from './components/cart/CartModal';
import ConfirmationView from './components/cart/ConfirmationView';
import EnhancedChatBot from './EnhancedChatBot';

const DEMO_MODE = false;
const API_URL = "/api";
const BUSINESS_PHONE = "523123099318";

const BACKUP_OPTIONS = {
  bases: ["Sabritas naturales", "Chips fuego", "Ruffles queso", "Doritos nacho", "Takis fuego", "Chips jalapeños", "Sabritas adobada", "Rancheritos", "Tostitos"],
  complements: ["Cueritos", "Pepino", "Jícama", "Salchicha", "Sandía (Temp)", "Piña", "Mango (Temp)", "Palomitas", "Churros de maíz", "Zanahoria rallada"],
  toppings: ["Manguitos", "Picafresas", "Lombrices", "Cacahuates", "Rellerindos", "Panditas", "Paletas", "Churro loko", "Sandías", "Lombrices ácidas", "Bolitochas de sandía", "Frutitas de gomita", "Tiburones de gomita", "Aros de durazno", "Cacahuate salado"]
};

export const CUSTOMIZABLE_IDS = [6];

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
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  // Re-added Checkout Modal state for mobile flow
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  const [checkoutFormData, setCheckoutFormData] = useState({
    name: '', phone: '', date: new Date().toISOString().split('T')[0], time: '16:00', peopleCount: '', eventLocation: ''
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
      fetch(`${API_URL}/orders`).then(r => r.json()).then(data => setOrders(data)).catch(console.error);
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
    const newOrder = { ...formData, customer: formData.name, items: cart, status: 'PENDING', createdAt: new Date().toISOString() };
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

  const handleSaveProduct = async (p) => {
    if (!DEMO_MODE) await fetch(`${API_URL}/products`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(p) });
    // Removed setIsProductModalOpen(false) as it's now handled by AdminDashboard or page reload
    window.location.reload();
  };

  const handleDeleteProduct = async (id) => { if (!DEMO_MODE && confirm("Borrar?")) await fetch(`${API_URL}/products/${id}`, { method: 'DELETE' }); window.location.reload(); };

  const handleAutoFillCheckout = (data) => {
    setCheckoutFormData(data);
    setIsBotOpen(false);
    // Open checkout modal if mobile, or scroll to form if desktop
    if (window.innerWidth < 1024) {
      setIsCartModalOpen(false);
      setIsCheckoutModalOpen(true);
    } else {
      document.getElementById('checkout-form')?.scrollIntoView({ behavior: 'smooth' });
    }
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

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${BUSINESS_PHONE}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');

    setIsCheckoutModalOpen(false);
    setCart([]);
    setCheckoutFormData({
      name: '', phone: '', date: new Date().toISOString().split('T')[0], time: '16:00', peopleCount: '', eventLocation: ''
    });
  };

  return (
    <div className="min-h-screen text-slate-900 flex flex-col relative overflow-x-hidden">
      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 blur-3xl opacity-60">
        <div className="w-80 h-80 bg-rose-200 absolute -top-10 -left-10 rounded-full"></div>
        <div className="w-64 h-64 bg-amber-200 absolute top-20 right-10 rounded-full"></div>
        <div className="w-72 h-72 bg-cyan-200 absolute bottom-0 left-1/3 rounded-full"></div>
      </div>

      <Navbar setView={setView} cart={cart} isAdmin={isAdmin} setIsAdmin={setIsAdmin} setShowLogin={setShowLogin} view={view} setIsCartModalOpen={setIsCartModalOpen} />

      <main className="flex-grow max-w-6xl mx-auto px-4 py-8 relative z-10 w-full">
        {loading && <div className="fixed inset-0 bg-white/80 z-[60] flex items-center justify-center backdrop-blur-sm"><Loader2 className="animate-spin text-rose-500 mb-2" size={48} /></div>}

        {view === 'home' && (
          <>
            <HeroSection openBot={() => setIsBotOpen(true)} />
            <div className="mt-10">
              <ProductGrid
                products={products} categories={categories} cart={cart}
                onProductClick={handleProductClick} removeFromCart={removeFromCart}
                onCheckout={handleCheckout} openBot={() => setIsBotOpen(true)}
                checkoutFormData={checkoutFormData} setCheckoutFormData={setCheckoutFormData}
                CUSTOMIZABLE_IDS={CUSTOMIZABLE_IDS}
              />
            </div>
          </>
        )}

        {view === 'confirmation' && lastOrder && <ConfirmationView order={lastOrder} onBack={() => setView('home')} />}

        {view === 'admin' && isAdmin && (
          <AdminDashboard
            products={products} categories={categories} orders={orders}
            onSaveProduct={handleSaveProduct} onDeleteProduct={handleDeleteProduct}
          />
        )}
      </main>

      <Footer />

      {/* Floating Buttons */}
      {cart.length > 0 && (
        <button onClick={() => setIsCartModalOpen(true)} className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-rose-500 to-rose-600 text-white p-4 rounded-full shadow-2xl hover:shadow-rose-300 transition-all hover:scale-110 active:scale-95">
          <ShoppingBag size={24} />
          <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg animate-pulse">{cart.length}</span>
        </button>
      )}

      {!isBotOpen && (
        <button onClick={() => setIsBotOpen(true)} className={`fixed z-40 bg-slate-900 text-white p-3 md:p-4 rounded-full shadow-2xl hover:shadow-slate-500/50 transition-all hover:scale-110 active:scale-95 flex items-center gap-2 group ${cart.length > 0 ? 'bottom-24 right-6' : 'bottom-6 right-6'}`}>
          <div className="relative">
            <Bot size={28} className="text-rose-300" />
            <span className="absolute top-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900 animate-pulse"></span>
          </div>
          <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out whitespace-nowrap text-sm font-bold text-rose-100">¿Ayuda?</span>
        </button>
      )}

      <EnhancedChatBot isOpen={isBotOpen} setIsOpen={setIsBotOpen} products={products} options={options} cart={cart} onAddProducts={addToCart} onAutoFillCheckout={handleAutoFillCheckout} />

      {/* Modals */}
      {customModalOpen && productToCustomize && <CustomizationModal product={productToCustomize} options={options} onClose={() => setCustomModalOpen(false)} onConfirm={(c) => { addToCart(productToCustomize, c); setCustomModalOpen(false); }} />}

      {galleryModalOpen && <GalleryModal images={galleryImages} onClose={() => setGalleryModalOpen(false)} />}

      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogin={(u, p) => { if (u === 'admin' && p === 'admin123') { setIsAdmin(true); setShowLogin(false); setView('admin'); } else alert("Credenciales incorrectas"); }} />}

      {isCartModalOpen && (
        <CartModal
          cart={cart} onClose={() => setIsCartModalOpen(false)} removeFromCart={(id) => removeFromCart(id)}
          onContinueCheckout={() => { setIsCartModalOpen(false); setIsCheckoutModalOpen(true); }}
        />
      )}

      {/* Re-added Checkout Modal for Mobile Flow */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in overflow-y-auto">
          {/* Re-using CheckoutForm logic manually here since we need it in a modal, 
                    OR we could extract the modal content to a CheckoutModal component. 
                    For now, I'll inline a simple wrapper or the form itself. 
                    Actually, we have ProductGrid -> CartSidebar -> CheckoutForm.
                    Maybe we should extract CheckoutForm to be reusable or just use it here?
                    I'll use `import CheckoutForm from './components/cart/CheckoutForm'` at top? 
                    I haven't imported it in App.jsx. I will duplicate the modal content for now or better, import CheckoutForm.
                    
                    Wait, I should import CheckoutForm!
                */}
          <div className="bg-white rounded-3xl max-w-lg w-full my-8 shadow-2xl relative">
            <button onClick={() => setIsCheckoutModalOpen(false)} className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 z-10"><Loader2 size={24} className="hidden" />X</button>
            {/* Wait, the X icon was imported as X from lucide-react. */}
            <button onClick={() => setIsCheckoutModalOpen(false)} className="absolute top-4 right-4 p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 z-10">✕</button>

            <div className="p-6">
              <h3 className="font-bold text-xl mb-4 text-center">Datos de Contacto</h3>
              {/* We can re-use CheckoutForm? No, CheckoutForm has its own styling. 
                            Let's just use the `sendToWhatsApp` function we have here and render inputs. 
                            Or better, import CheckoutForm. 
                        */}
              <div className="space-y-4">
                <input type="text" placeholder="Nombre" value={checkoutFormData.name} onChange={e => setCheckoutFormData({ ...checkoutFormData, name: e.target.value })} className="w-full p-3 border rounded-xl" />
                <input type="tel" placeholder="WhatsApp" value={checkoutFormData.phone} onChange={e => setCheckoutFormData({ ...checkoutFormData, phone: e.target.value })} className="w-full p-3 border rounded-xl" />
                <input type="number" placeholder="Personas" value={checkoutFormData.peopleCount} onChange={e => setCheckoutFormData({ ...checkoutFormData, peopleCount: e.target.value })} className="w-full p-3 border rounded-xl" />
                <input type="text" placeholder="Lugar" value={checkoutFormData.eventLocation} onChange={e => setCheckoutFormData({ ...checkoutFormData, eventLocation: e.target.value })} className="w-full p-3 border rounded-xl" />
                <div className="grid grid-cols-2 gap-3">
                  <input type="date" value={checkoutFormData.date} onChange={e => setCheckoutFormData({ ...checkoutFormData, date: e.target.value })} className="w-full p-3 border rounded-xl" />
                  <input type="time" min="14:00" max="20:00" value={checkoutFormData.time} onChange={e => setCheckoutFormData({ ...checkoutFormData, time: e.target.value })} className="w-full p-3 border rounded-xl" />
                </div>
                <button onClick={sendToWhatsApp} disabled={!checkoutFormData.name} className="w-full bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition">Enviar por WhatsApp</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
