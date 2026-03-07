import React from 'react';
import { ShoppingBag, Sparkles, Utensils, CupSoda, CheckCircle, Bot, MapPin, Image as ImageIcon } from 'lucide-react';
import ProductCard from './ProductCard';
import CartSidebar from '../cart/CartSidebar';
import CommunitySection from '../community/CommunitySection';

export default function ProductGrid({
    products,
    categories,
    cart,
    onProductClick,
    removeFromCart,
    onCheckout,
    openBot,
    checkoutFormData,
    setCheckoutFormData,
    CUSTOMIZABLE_IDS
}) {
    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content: Products */}
            <div className="lg:col-span-2 space-y-10">
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
                                    {catProducts.map(product => (
                                        <ProductCard
                                            key={product.id}
                                            product={product}
                                            cart={cart}
                                            onProductClick={onProductClick}
                                            removeFromCart={removeFromCart}
                                            CUSTOMIZABLE_IDS={CUSTOMIZABLE_IDS}
                                        />
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Sidebar: Cart & Community */}
            <div className="lg:col-span-1">
                <CartSidebar
                    cart={cart}
                    removeFromCart={removeFromCart}
                    openBot={openBot}
                    onCheckout={onCheckout}
                    checkoutFormData={checkoutFormData}
                    setCheckoutFormData={setCheckoutFormData}
                />
                <CommunitySection />
            </div>
        </div>
    );
}
