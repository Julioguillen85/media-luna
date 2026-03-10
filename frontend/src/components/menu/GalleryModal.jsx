import React, { useState, useRef } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function GalleryModal({ images, onClose }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);

    const nextImage = (e) => {
        if (e) e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e) => {
        if (e) e.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e) => {
        touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = (e) => {
        e.stopPropagation();
        const diff = touchStartX.current - touchEndX.current;
        if (Math.abs(diff) > 50) {
            if (diff > 0) nextImage();
            else prevImage();
        }
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-md flex items-center justify-center animate-fade-in" onClick={onClose}>
            {/* Close */}
            <button onClick={onClose} className="absolute top-4 right-4 bg-white/15 p-2.5 rounded-full text-white hover:bg-white/25 transition-colors z-[110]">
                <X size={24} />
            </button>

            {/* Arrows - visible on all screens */}
            {images.length > 1 && (
                <>
                    <button
                        className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/15 p-2.5 rounded-full text-white hover:bg-white/25 active:scale-90 transition-all z-[110]"
                        onClick={prevImage}
                    >
                        <ChevronLeft size={24} />
                    </button>

                    <button
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/15 p-2.5 rounded-full text-white hover:bg-white/25 active:scale-90 transition-all z-[110]"
                        onClick={nextImage}
                    >
                        <ChevronRight size={24} />
                    </button>
                </>
            )}

            {/* Image with touch swipe */}
            <img
                src={images[currentImageIndex]}
                alt="Product Gallery"
                className="max-w-[90%] max-h-[80vh] object-contain shadow-2xl rounded-xl select-none"
                onClick={(e) => e.stopPropagation()}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                draggable={false}
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?ixlib=rb-4.0.3&auto=format&fit=crop&w=300&q=80' }}
            />

            {/* Dots indicator */}
            {images.length > 1 && (
                <div className="absolute bottom-8 flex items-center gap-2">
                    {images.map((_, idx) => (
                        <button
                            key={idx}
                            onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(idx); }}
                            className={`rounded-full transition-all ${idx === currentImageIndex
                                    ? 'w-6 h-2 bg-white'
                                    : 'w-2 h-2 bg-white/40 hover:bg-white/60'
                                }`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
