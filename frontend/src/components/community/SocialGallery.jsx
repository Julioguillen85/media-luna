import React, { useState, useEffect, useRef } from 'react';
import { Image as ImageIcon, Facebook, Heart, X, ChevronDown, ChevronRight, ChevronLeft, Loader2 } from 'lucide-react';

const FACEBOOK_PAGE_URL = "https://www.facebook.com/medialuna.frutibar";
const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : "/api";

export default function SocialGallery() {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        const fetchGallery = async () => {
            try {
                const res = await fetch(`${API_URL}/gallery`);
                const data = await res.json();
                setImages(data);
            } catch (err) {
                console.error("Error fetching gallery:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchGallery();
    }, []);

    const openLightbox = (index) => {
        setCurrentImageIndex(index);
        setLightboxOpen(true);
    };

    const nextImage = (e) => {
        if (e) e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e) => {
        if (e) e.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const scrollLeft = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: -300, behavior: 'smooth' });
        }
    };

    const scrollRight = () => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollBy({ left: 300, behavior: 'smooth' });
        }
    };

    if (loading) {
        return (
            <div className="glass-panel p-6 rounded-3xl flex justify-center items-center h-48">
                <Loader2 className="animate-spin text-rose-500" size={32} />
            </div>
        );
    }

    if (images.length === 0) return null; // Don't show the section if it is empty

    return (
        <>
            <div className="glass-panel py-6 md:py-8 rounded-2xl md:rounded-3xl overflow-hidden relative group">
                <div className="px-4 md:px-6 flex justify-between items-end mb-4 md:mb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-0.5 md:mb-1">
                            <div className="bg-rose-100 dark:bg-rose-900/30 p-1.5 md:p-2 rounded-full">
                                <ImageIcon size={16} className="text-rose-600 md:w-5 md:h-5" />
                            </div>
                            <h3 className="text-xl md:text-2xl font-extrabold text-slate-900 dark:text-white">Galería 📸</h3>
                        </div>
                        <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400">Momentos Media Luna. Síguenos en FB.</p>
                    </div>
                    <a
                        href={FACEBOOK_PAGE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 md:px-4 md:py-2 bg-[#1877F2] text-white text-xs md:text-sm font-bold rounded-lg md:rounded-xl shadow-lg hover:bg-[#166fe5] transition-colors flex items-center gap-1.5 md:gap-2 shrink-0"
                    >
                        <Facebook size={16} className="md:w-[18px] md:h-[18px]" />
                        <span className="hidden xs:inline">Ver Facebook</span>
                    </a>
                </div>

                {/* Slider Container */}
                <div className="relative w-full px-4 md:px-6">
                    <button
                        onClick={scrollLeft}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 md:p-3 bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-white rounded-r-2xl shadow-xl hover:bg-white dark:hover:bg-slate-700 transition-all opacity-0 md:group-hover:opacity-100 -translate-x-full md:group-hover:translate-x-0"
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <div
                        ref={scrollContainerRef}
                        className="flex gap-3 md:gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {images.map((img, i) => (
                            <div
                                key={img.id}
                                onClick={() => openLightbox(i)}
                                className="snap-start shrink-0 w-[60vw] md:w-[280px] lg:w-[320px] aspect-square rounded-xl md:rounded-2xl overflow-hidden border-2 border-transparent hover:border-rose-500 shadow-sm transition-all duration-300 relative cursor-pointer group/item"
                            >
                                <img
                                    src={img.url}
                                    alt="Gallery"
                                    className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-700 ease-out"
                                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' }}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/item:opacity-100 transition-opacity flex items-end justify-center pb-6">
                                    <Heart className="text-white fill-white drop-shadow-md scale-0 group-hover/item:scale-100 transition-transform duration-300 w-8 h-8 md:w-10 md:h-10 animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={scrollRight}
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 md:p-3 bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-white rounded-l-2xl shadow-xl hover:bg-white dark:hover:bg-slate-700 transition-all opacity-0 md:group-hover:opacity-100 translate-x-full md:group-hover:translate-x-0"
                    >
                        <ChevronRight size={24} />
                    </button>
                </div>
            </div>

            {/* Lightbox Modal */}
            {lightboxOpen && (
                <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center animate-fade-in" onClick={() => setLightboxOpen(false)}>
                    <button className="absolute top-4 right-4 bg-white/10 dark:bg-slate-800/50 p-2 rounded-full text-white hover:bg-white/20 transition-colors z-[110]">
                        <X size={32} />
                    </button>

                    <button className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 dark:bg-slate-800/50 p-3 rounded-full text-white hover:bg-white/20 transition-colors hidden md:block z-[110]" onClick={prevImage}>
                        <ChevronLeft size={32} />
                    </button>

                    <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 dark:bg-slate-800/50 p-3 rounded-full text-white hover:bg-white/20 transition-colors hidden md:block z-[110]" onClick={nextImage}>
                        <ChevronRight size={32} />
                    </button>

                    <div className="relative w-full max-w-5xl px-4 flex justify-center items-center h-full">
                        <img
                            src={images[currentImageIndex]?.url}
                            alt="Gallery Fullscreen"
                            className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-lg animate-fade-in"
                            onClick={(e) => e.stopPropagation()}
                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }}
                        />
                    </div>

                    <p className="absolute bottom-6 text-white/50 text-sm font-medium tracking-widest bg-black/40 px-4 py-1.5 rounded-full backdrop-blur-sm">
                        {currentImageIndex + 1} / {images.length}
                    </p>
                </div>
            )}
        </>
    );
}
