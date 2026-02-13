import React, { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';

export default function GalleryModal({ images, onClose }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    const nextImage = (e) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e) => {
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center animate-fade-in" onClick={onClose}>
            <button className="absolute top-4 right-4 bg-white/10 p-2 rounded-full text-white hover:bg-white/20 transition-colors z-[110]">
                <X size={32} />
            </button>

            {images.length > 1 && (
                <>
                    <button className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 p-3 rounded-full text-white hover:bg-white/20 transition-colors hidden md:block z-[110]" onClick={prevImage}>
                        <ChevronDown className="rotate-90" size={32} />
                    </button>

                    <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 p-3 rounded-full text-white hover:bg-white/20 transition-colors hidden md:block z-[110]" onClick={nextImage}>
                        <ChevronDown className="-rotate-90" size={32} />
                    </button>
                </>
            )}

            <img
                src={images[currentImageIndex]}
                alt="Product Gallery"
                className="max-w-full max-h-[90vh] object-contain shadow-2xl rounded-lg"
                onClick={(e) => e.stopPropagation()}
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' }}
            />

            {images.length > 1 && (
                <p className="absolute bottom-6 text-white/50 text-sm font-medium">
                    {currentImageIndex + 1} / {images.length}
                </p>
            )}
        </div>
    );
}
