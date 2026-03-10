import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Image as ImageIcon, Facebook, Heart, X, ChevronRight, ChevronLeft, Loader2, ArrowLeft, Share2, Download } from 'lucide-react';

const FACEBOOK_PAGE_URL = "https://www.facebook.com/medialuna.frutibar";
const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : "/api";

export default function SocialGallery({ fullScreen = false, onBack, onViewFullScreen }) {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [imageLoaded, setImageLoaded] = useState({});
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);
    const scrollContainerRef = useRef(null);
    const lightboxRef = useRef(null);

    // Minimum swipe distance
    const minSwipeDistance = 50;

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

    // Keyboard navigation
    useEffect(() => {
        if (!lightboxOpen) return;
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
            if (e.key === 'Escape') setLightboxOpen(false);
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [lightboxOpen, images.length]);

    // Lock body scroll when lightbox open
    useEffect(() => {
        if (lightboxOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [lightboxOpen]);

    const openLightbox = (index) => {
        setCurrentImageIndex(index);
        setLightboxOpen(true);
    };

    const nextImage = useCallback((e) => {
        if (e) e.stopPropagation();
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
        setTimeout(() => setIsAnimating(false), 300);
    }, [images.length, isAnimating]);

    const prevImage = useCallback((e) => {
        if (e) e.stopPropagation();
        if (isAnimating) return;
        setIsAnimating(true);
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
        setTimeout(() => setIsAnimating(false), 300);
    }, [images.length, isAnimating]);

    // Touch handlers for swipe
    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;
        const distance = touchStart - touchEnd;
        if (Math.abs(distance) < minSwipeDistance) return;
        if (distance > 0) nextImage();
        else prevImage();
    };

    const handleImageLoad = (id) => {
        setImageLoaded(prev => ({ ...prev, [id]: true }));
    };

    const handleShare = async (e) => {
        e.stopPropagation();
        const img = images[currentImageIndex];
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'Media Luna Snack Bar 🌙',
                    text: '¡Mira esta foto de Media Luna!',
                    url: img.url
                });
            } catch (err) { /* cancelled */ }
        }
    };

    // Inline scrolling for non-fullscreen mode
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
            <div className={`flex justify-center items-center ${fullScreen ? 'h-screen bg-slate-950' : 'glass-panel p-6 rounded-3xl h-48'}`}>
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="animate-spin text-rose-500" size={36} />
                    <span className="text-sm text-slate-400 font-medium tracking-wide">Cargando galería...</span>
                </div>
            </div>
        );
    }

    if (images.length === 0) {
        if (fullScreen) {
            return (
                <div className="h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
                    <ImageIcon size={48} className="text-slate-600 mb-4" />
                    <p className="text-slate-400">No hay fotos aún</p>
                    {onBack && (
                        <button onClick={onBack} className="mt-6 text-rose-400 underline text-sm">Volver</button>
                    )}
                </div>
            );
        }
        return null;
    }

    // ═══════════════════════════════════════════
    // FULL SCREEN MODE — Dedicated gallery page
    // ═══════════════════════════════════════════
    if (fullScreen) {
        return (
            <>
                <div className="min-h-screen bg-slate-950 text-white">
                    {/* ── Header ── */}
                    <div className="sticky top-0 z-30 bg-slate-950/80 backdrop-blur-xl border-b border-white/5">
                        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                {onBack && (
                                    <button
                                        onClick={onBack}
                                        className="p-2 -ml-2 rounded-xl hover:bg-white/5 transition-colors"
                                    >
                                        <ArrowLeft size={20} />
                                    </button>
                                )}
                                <div>
                                    <h1 className="text-lg font-bold tracking-tight flex items-center gap-2">
                                        <span>Galería</span>
                                        <span className="text-base">📸</span>
                                    </h1>
                                    <p className="text-[11px] text-slate-500">{images.length} fotos • Media Luna Snack Bar</p>
                                </div>
                            </div>
                            <a
                                href={FACEBOOK_PAGE_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 px-3 py-1.5 bg-[#1877F2] rounded-lg text-xs font-bold hover:bg-[#166fe5] transition-colors shadow-lg shadow-blue-500/20"
                            >
                                <Facebook size={14} />
                                <span className="hidden sm:inline">Síguenos</span>
                            </a>
                        </div>
                    </div>

                    {/* ── Masonry Grid ── */}
                    <div className="max-w-7xl mx-auto px-3 py-4 pb-20">
                        <div className="columns-2 sm:columns-3 lg:columns-4 gap-2.5 sm:gap-3">
                            {images.map((img, i) => (
                                <div
                                    key={img.id}
                                    onClick={() => openLightbox(i)}
                                    className="break-inside-avoid mb-2.5 sm:mb-3 cursor-pointer group relative rounded-xl sm:rounded-2xl overflow-hidden"
                                    style={{
                                        animationDelay: `${i * 60}ms`,
                                        animation: 'galleryFadeIn 0.5s ease-out both'
                                    }}
                                >
                                    {/* Skeleton */}
                                    {!imageLoaded[img.id] && (
                                        <div className="absolute inset-0 bg-slate-800 animate-pulse rounded-xl sm:rounded-2xl" />
                                    )}

                                    <img
                                        src={img.url}
                                        alt={img.caption || 'Media Luna'}
                                        className={`w-full object-cover rounded-xl sm:rounded-2xl transition-all duration-500 group-hover:scale-105 group-hover:brightness-110 ${imageLoaded[img.id] ? 'opacity-100' : 'opacity-0'}`}
                                        loading="lazy"
                                        onLoad={() => handleImageLoad(img.id)}
                                        onError={(e) => {
                                            e.target.src = 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80';
                                            handleImageLoad(img.id);
                                        }}
                                    />

                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 rounded-xl sm:rounded-2xl flex items-end justify-center pb-4">
                                        <Heart className="text-white fill-white drop-shadow-lg w-6 h-6 scale-0 group-hover:scale-100 transition-transform duration-300 delay-100" />
                                    </div>

                                    {/* Subtle border glow on hover */}
                                    <div className="absolute inset-0 rounded-xl sm:rounded-2xl ring-0 group-hover:ring-2 ring-rose-500/50 transition-all duration-300 pointer-events-none" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* ── Bottom CTA Bar ── */}
                    <div className="fixed bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-slate-950 via-slate-950/95 to-transparent pt-8 pb-4 px-4">
                        <div className="max-w-sm mx-auto">
                            <a
                                href={FACEBOOK_PAGE_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-rose-600 to-amber-500 rounded-2xl text-sm font-bold shadow-xl shadow-rose-500/20 hover:shadow-rose-500/30 transition-all active:scale-[0.98]"
                            >
                                <Facebook size={18} />
                                Ver más en Facebook
                            </a>
                        </div>
                    </div>
                </div>

                {/* ── Lightbox ── */}
                {lightboxOpen && (
                    <div
                        ref={lightboxRef}
                        className="fixed inset-0 z-[100] bg-black flex flex-col"
                        onTouchStart={onTouchStart}
                        onTouchMove={onTouchMove}
                        onTouchEnd={onTouchEnd}
                    >
                        {/* Lightbox top bar */}
                        <div className="flex items-center justify-between px-4 py-3 bg-black/50 backdrop-blur-sm z-10">
                            <button
                                onClick={() => setLightboxOpen(false)}
                                className="p-2 rounded-full hover:bg-white/10 transition-colors"
                            >
                                <X size={22} className="text-white" />
                            </button>

                            <span className="text-white/60 text-xs font-medium tracking-widest">
                                {currentImageIndex + 1} / {images.length}
                            </span>

                            <div className="flex items-center gap-1">
                                {navigator.share && (
                                    <button
                                        onClick={handleShare}
                                        className="p-2 rounded-full hover:bg-white/10 transition-colors"
                                    >
                                        <Share2 size={18} className="text-white/70" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Image area */}
                        <div className="flex-1 flex items-center justify-center relative overflow-hidden">
                            {/* Desktop arrows */}
                            <button
                                className="absolute left-3 top-1/2 -translate-y-1/2 p-3 bg-white/5 hover:bg-white/15 rounded-full text-white transition-all hidden md:block z-10 backdrop-blur-sm"
                                onClick={prevImage}
                            >
                                <ChevronLeft size={28} />
                            </button>

                            <button
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-3 bg-white/5 hover:bg-white/15 rounded-full text-white transition-all hidden md:block z-10 backdrop-blur-sm"
                                onClick={nextImage}
                            >
                                <ChevronRight size={28} />
                            </button>

                            {/* Current image */}
                            <img
                                key={currentImageIndex}
                                src={images[currentImageIndex]?.url}
                                alt={images[currentImageIndex]?.caption || 'Media Luna'}
                                className="max-w-full max-h-full object-contain px-2"
                                style={{ animation: 'lightboxFadeIn 0.25s ease-out' }}
                                onClick={(e) => e.stopPropagation()}
                                onError={(e) => {
                                    e.target.src = 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';
                                }}
                            />
                        </div>

                        {/* Thumbnail strip */}
                        <div className="bg-black/80 backdrop-blur-sm px-4 py-3 overflow-x-auto">
                            <div className="flex gap-2 justify-center max-w-2xl mx-auto">
                                {images.map((img, i) => (
                                    <button
                                        key={img.id}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentImageIndex(i);
                                        }}
                                        className={`shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden transition-all duration-200 ${i === currentImageIndex
                                            ? 'ring-2 ring-rose-500 scale-110 brightness-100'
                                            : 'opacity-40 hover:opacity-70 brightness-75'
                                            }`}
                                    >
                                        <img
                                            src={img.url}
                                            alt=""
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.src = 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=60';
                                            }}
                                        />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* CSS Animations */}
                <style>{`
                    @keyframes galleryFadeIn {
                        from { opacity: 0; transform: translateY(16px) scale(0.97); }
                        to { opacity: 1; transform: translateY(0) scale(1); }
                    }
                    @keyframes lightboxFadeIn {
                        from { opacity: 0; transform: scale(0.96); }
                        to { opacity: 1; transform: scale(1); }
                    }
                `}</style>
            </>
        );
    }

    // ═══════════════════════════════════════════
    // INLINE MODE — Embedded in landing page (original)
    // ═══════════════════════════════════════════
    return (
        <>
            <div className="glass-panel py-6 md:py-12 rounded-2xl md:rounded-none md:w-[100vw] md:relative md:left-1/2 md:-translate-x-1/2 md:border-x-0 overflow-hidden relative group">
                <div className="max-w-6xl mx-auto px-4 md:px-4 flex justify-between items-end mb-4 md:mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-0.5 md:mb-1">
                            <div className="bg-rose-100 dark:bg-rose-900/30 p-1.5 md:p-2 rounded-full">
                                <ImageIcon size={16} className="text-rose-600 md:w-5 md:h-5" />
                            </div>
                            <h3 className="text-xl md:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white">Galería 📸</h3>
                        </div>
                        <p className="text-xs md:text-sm lg:text-base text-slate-500 dark:text-slate-400">Momentos Media Luna. Síguenos en FB.</p>
                    </div>
                    <a
                        href={FACEBOOK_PAGE_URL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 md:px-5 md:py-2.5 bg-[#1877F2] text-white text-xs md:text-sm font-bold rounded-lg md:rounded-xl shadow-lg hover:bg-[#166fe5] transition-colors flex items-center gap-1.5 md:gap-2 shrink-0"
                    >
                        <Facebook size={16} className="md:w-5 md:h-5" />
                        <span className="hidden xs:inline">Ver Facebook</span>
                    </a>
                </div>

                {/* Slider Container */}
                <div className="relative w-full px-4 md:px-8 lg:px-12">
                    <button
                        onClick={scrollLeft}
                        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 md:p-4 bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-white rounded-r-2xl shadow-xl hover:bg-white dark:hover:bg-slate-700 transition-all opacity-0 md:group-hover:opacity-100 -translate-x-full md:group-hover:translate-x-0"
                    >
                        <ChevronLeft size={24} className="md:w-8 md:h-8" />
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
                        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 md:p-4 bg-white/90 dark:bg-slate-800/90 text-slate-800 dark:text-white rounded-l-2xl shadow-xl hover:bg-white dark:hover:bg-slate-700 transition-all opacity-0 md:group-hover:opacity-100 translate-x-full md:group-hover:translate-x-0"
                    >
                        <ChevronRight size={24} className="md:w-8 md:h-8" />
                    </button>
                </div>

                {/* View full gallery button */}
                {onViewFullScreen && images.length > 0 && (
                    <div className="px-4 md:px-6 mt-3">
                        <button
                            onClick={onViewFullScreen}
                            className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                        >
                            <ImageIcon size={14} />
                            Ver galería completa ({images.length} fotos)
                        </button>
                    </div>
                )}
            </div>
            {lightboxOpen && (
                <div
                    className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center"
                    onClick={() => setLightboxOpen(false)}
                    onTouchStart={onTouchStart}
                    onTouchMove={onTouchMove}
                    onTouchEnd={onTouchEnd}
                >
                    <button className="absolute top-4 right-4 bg-white/10 p-2 rounded-full text-white hover:bg-white/20 transition-colors z-[110]">
                        <X size={28} />
                    </button>

                    <button
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/10 p-3 rounded-full text-white hover:bg-white/20 transition-colors hidden md:block z-[110]"
                        onClick={prevImage}
                    >
                        <ChevronLeft size={28} />
                    </button>

                    <button
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/10 p-3 rounded-full text-white hover:bg-white/20 transition-colors hidden md:block z-[110]"
                        onClick={nextImage}
                    >
                        <ChevronRight size={28} />
                    </button>

                    <div className="relative w-full max-w-5xl px-4 flex justify-center items-center h-full">
                        <img
                            key={currentImageIndex}
                            src={images[currentImageIndex]?.url}
                            alt="Gallery Fullscreen"
                            className="max-w-full max-h-[85vh] object-contain shadow-2xl rounded-lg"
                            style={{ animation: 'lightboxFadeIn 0.25s ease-out' }}
                            onClick={(e) => e.stopPropagation()}
                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80' }}
                        />
                    </div>

                    <p className="absolute bottom-6 text-white/50 text-sm font-medium tracking-widest bg-black/40 px-4 py-1.5 rounded-full backdrop-blur-sm">
                        {currentImageIndex + 1} / {images.length}
                    </p>
                </div>
            )}

            <style>{`
                @keyframes lightboxFadeIn {
                    from { opacity: 0; transform: scale(0.96); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </>
    );
}