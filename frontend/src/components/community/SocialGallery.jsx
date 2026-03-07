import React, { useState } from 'react';
import { Image as ImageIcon, Facebook, Heart, X, ChevronDown } from 'lucide-react';

const FACEBOOK_PAGE_URL = "https://www.facebook.com/medialuna.frutibar";

const galleryPhotos = [
    "/images/tostilocos.jpeg",
    "/images/bowl_un_medio.jpeg",
    "/images/michelada.jpeg",
    "/images/waffles.jpeg",
    "/images/duro_preparado.jpeg",
    "/images/azulito.jpeg"
];

export default function SocialGallery() {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

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
        <>
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
        </>
    );
}
