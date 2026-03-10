import React, { useState, useEffect, useRef } from 'react';
import { Upload, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL ? `${import.meta.env.VITE_API_URL}/api` : "/api";

export default function GalleryTab({ options, onSaveOptions }) {
    const [images, setImages] = useState([]);
    const [activeSection, setActiveSection] = useState('social'); // 'social', 'desktop', 'mobile'
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef(null);

    const fileInputRefBanners = useRef(null);

    useEffect(() => {
        fetchImages();
    }, []);

    const fetchImages = async () => {
        try {
            setLoading(true);
            const res = await fetch(`${API_URL}/gallery`);
            const data = await res.json();
            setImages(data);
        } catch (err) {
            console.error("Error fetching gallery:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUploadClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const token = localStorage.getItem('token');
            const headers = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;

            // 1. Upload file
            const uploadRes = await fetch(`${API_URL}/upload`, {
                method: 'POST',
                headers,
                body: formData
            });

            if (!uploadRes.ok) throw new Error("Upload failed");
            const uploadData = await uploadRes.json();
            const fileUrl = uploadData.url;

            if (activeSection === 'social') {
                // 2. Save to gallery API
                headers['Content-Type'] = 'application/json';
                const saveRes = await fetch(`${API_URL}/gallery`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify({ url: fileUrl })
                });

                if (!saveRes.ok) throw new Error("Save gallery failed");
                await fetchImages();
            } else {
                // Save to options
                const optionKey = activeSection === 'desktop' ? 'desktopBanners' : 'mobileBanners';
                const currentBanners = options?.[optionKey] || [];
                if (currentBanners.length >= 5) {
                    alert('Límite de 5 banners alcanzado para esta sección.');
                    setUploading(false);
                    return;
                }
                const newOptions = {
                    ...options,
                    [optionKey]: [...currentBanners, fileUrl]
                };
                await onSaveOptions(newOptions);
            }

        } catch (err) {
            console.error("Error uploading image:", err);
            alert("Error al subir la imagen");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
            if (fileInputRefBanners.current) fileInputRefBanners.current.value = "";
        }
    };

    const handleDelete = async (id, url, isBanner) => {
        if (!confirm("¿Seguro que deseas eliminar esta imagen?")) return;

        if (isBanner) {
            const optionKey = activeSection === 'desktop' ? 'desktopBanners' : 'mobileBanners';
            const currentBanners = options?.[optionKey] || [];
            const newOptions = {
                ...options,
                [optionKey]: currentBanners.filter(b => b !== url)
            };
            await onSaveOptions(newOptions);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const headers = {};
            if (token) headers['Authorization'] = `Bearer ${token}`;

            const res = await fetch(`${API_URL}/gallery/${id}`, {
                method: 'DELETE',
                headers
            });

            if (!res.ok) throw new Error("Delete failed");

            // Refresh
            await fetchImages();
        } catch (err) {
            console.error("Error deleting image:", err);
            alert("Error al eliminar la imagen");
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8"><Loader2 className="animate-spin text-rose-500" size={32} /></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700/50 overflow-x-auto pb-1">
                <button
                    onClick={() => setActiveSection('social')}
                    className={`px-4 py-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeSection === 'social' ? 'border-rose-500 text-rose-600' : 'border-transparent text-slate-500'}`}
                >
                    <ImageIcon size={18} /> Galería Social
                </button>
                <button
                    onClick={() => setActiveSection('desktop')}
                    className={`px-4 py-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeSection === 'desktop' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500'}`}
                >
                    🖥️ Banners Escritorio
                </button>
                <button
                    onClick={() => setActiveSection('mobile')}
                    className={`px-4 py-3 font-bold text-sm flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${activeSection === 'mobile' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-500'}`}
                >
                    📱 Banners Móvil
                </button>
            </div>

            <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        {activeSection === 'social' && <><ImageIcon className="text-rose-500" /> Galería Social</>}
                        {activeSection === 'desktop' && <>🖥️ Banners Escritorio (16:9)</>}
                        {activeSection === 'mobile' && <>📱 Banners Móvil (9:16)</>}
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">
                        {activeSection === 'social' ? 'Estas imágenes aparecerán en el carrusel inferior de la tienda.' : `Sube hasta 5 imágenes para el fondo principal (${activeSection === 'desktop' ? 'computadoras' : 'teléfonos'}).`}
                    </p>
                </div>

                <input
                    type="file"
                    ref={activeSection === 'social' ? fileInputRef : fileInputRefBanners}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                />

                <button
                    onClick={() => activeSection === 'social' ? fileInputRef.current?.click() : fileInputRefBanners.current?.click()}
                    disabled={uploading}
                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-xl font-bold hover:bg-slate-800 transition-colors disabled:opacity-50"
                >
                    {uploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                    Subir Imagen
                </button>
            </div>

            {activeSection === 'social' ? (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {images.map(img => (
                        <div key={img.id} className="relative group aspect-square rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-transparent hover:border-rose-500 transition-all shadow-sm">
                            <img
                                src={img.url}
                                alt="Gallery item"
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?ixlib=rb-4.0.3' }}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <button
                                    onClick={() => handleDelete(img.id, img.url, false)}
                                    className="bg-white text-red-500 p-3 rounded-full hover:bg-red-50 hover:scale-110 transition-all shadow-lg"
                                    title="Eliminar foto"
                                >
                                    <Trash2 size={24} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {images.length === 0 && (
                        <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                            <ImageIcon size={48} className="mx-auto mb-3 opacity-20" />
                            <p>No hay imágenes en la galería.</p>
                            <p className="text-sm">Sube algunas para armar tu carrusel social.</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {(options?.[activeSection === 'desktop' ? 'desktopBanners' : 'mobileBanners'] || []).map((url, idx) => (
                        <div key={`banner-${idx}`} className={`relative group rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-transparent hover:border-blue-500 transition-all shadow-sm ${activeSection === 'mobile' ? 'aspect-[9/16] w-64 mx-auto' : 'aspect-video w-full'}`}>
                            <img
                                src={url}
                                alt="Banner"
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.src = '/images/hero-bg.jpg' }}
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                <button
                                    onClick={() => handleDelete(null, url, true)}
                                    className="bg-white text-red-500 p-3 rounded-full hover:bg-red-50 hover:scale-110 transition-all shadow-lg"
                                    title="Eliminar banner"
                                >
                                    <Trash2 size={24} />
                                </button>
                            </div>
                        </div>
                    ))}
                    {(options?.[activeSection === 'desktop' ? 'desktopBanners' : 'mobileBanners'] || []).length === 0 && (
                        <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                            <ImageIcon size={48} className="mx-auto mb-3 opacity-20" />
                            <p>No hay banners configurados para esta sección.</p>
                            <p className="text-sm">Se mostrará la imagen por defecto.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
