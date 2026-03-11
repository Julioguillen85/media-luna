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

    // Trim Modal State
    const [trimModalOpen, setTrimModalOpen] = useState(false);
    const [trimVideoUrl, setTrimVideoUrl] = useState('');
    const [trimDuration, setTrimDuration] = useState(0);
    const [trimStartTime, setTrimStartTime] = useState(0);
    const videoRef = useRef(null);

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
            let fileUrl = uploadData.url;

            // Cloudinary auto-transcodes .mov to .mp4 just by changing the extension
            if (fileUrl.toLowerCase().endsWith('.mov')) {
                fileUrl = fileUrl.replace(/\.mov$/i, '.mp4');
            }

            const isVid = fileUrl.toLowerCase().endsWith('.mp4') || fileUrl.toLowerCase().endsWith('.webm') || fileUrl.includes('/video/upload/');

            if (activeSection !== 'social' && isVid) {
                setTrimVideoUrl(fileUrl);
                setTrimStartTime(0);
                setTrimModalOpen(true);
                setUploading(false); // Stop loading, wait for modal
                if (fileInputRefBanners.current) fileInputRefBanners.current.value = "";
                return;
            }

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

    const handleTrimSave = async () => {
        setUploading(true);
        let finalUrl = trimVideoUrl;
        if (finalUrl.includes('/upload/')) {
            finalUrl = finalUrl.replace('/upload/', `/upload/so_${trimStartTime},eo_${trimStartTime + 5}/`);
        }

        const optionKey = activeSection === 'desktop' ? 'desktopBanners' : 'mobileBanners';
        const currentBanners = options?.[optionKey] || [];
        const newOptions = {
            ...options,
            [optionKey]: [...currentBanners, finalUrl]
        };

        try {
            await onSaveOptions(newOptions);
            setTrimModalOpen(false);
        } catch (err) {
            console.error("Error saving trimmed video:", err);
            alert("Error al guardar el video recortado");
        } finally {
            setUploading(false);
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
                    accept="image/*,video/mp4,video/webm,video/quicktime,.mov,.mp4,.webm"
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
                    {(options?.[activeSection === 'desktop' ? 'desktopBanners' : 'mobileBanners'] || []).map((url, idx) => {
                        const isVid = url && typeof url === 'string' && (url.toLowerCase().endsWith('.mp4') || url.toLowerCase().endsWith('.webm') || url.toLowerCase().endsWith('.mov') || url.includes('/video/upload/'));
                        return (
                            <div key={`banner-${idx}`} className={`relative group rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border-2 border-transparent hover:border-blue-500 transition-all shadow-sm ${activeSection === 'mobile' ? 'aspect-[9/16] w-64 mx-auto' : 'aspect-video w-full'}`}>
                                {isVid ? (
                                    <video
                                        src={url}
                                        className="w-full h-full object-cover"
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        onError={(e) => { console.error("Error playing video preview", e); }}
                                    />
                                ) : (
                                    <img
                                        src={url}
                                        alt="Banner"
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.src = '/images/hero-bg.jpg' }}
                                    />
                                )}
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
                        );
                    })}
                    {(options?.[activeSection === 'desktop' ? 'desktopBanners' : 'mobileBanners'] || []).length === 0 && (
                        <div className="col-span-full py-12 text-center text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                            <ImageIcon size={48} className="mx-auto mb-3 opacity-20" />
                            <p>No hay banners configurados para esta sección.</p>
                            <p className="text-sm">Se mostrará la imagen por defecto.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Video Trim Modal */}
            {trimModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
                    <div className="bg-white dark:bg-slate-900 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-fade-in-up">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Recortar a 5 Segundos</h3>
                            <button onClick={() => setTrimModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-2xl font-bold">×</button>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="aspect-video bg-black rounded-2xl overflow-hidden relative">
                                <video
                                    ref={videoRef}
                                    src={trimVideoUrl}
                                    className="w-full h-full object-contain"
                                    onLoadedMetadata={(e) => setTrimDuration(Math.floor(e.target.duration))}
                                    controls={false}
                                />
                            </div>

                            {trimDuration > 0 ? (
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm font-medium text-slate-500">
                                        <span>Segundo de inicio</span>
                                        <span className="text-rose-500 font-bold">{trimStartTime}s - {Math.min(trimStartTime + 5, trimDuration)}s</span>
                                    </div>
                                    <input
                                        type="range"
                                        min="0"
                                        max={Math.max(0, trimDuration - 5)}
                                        value={trimStartTime}
                                        onChange={(e) => {
                                            const val = parseInt(e.target.value);
                                            setTrimStartTime(val);
                                            if (videoRef.current) {
                                                videoRef.current.currentTime = val;
                                            }
                                        }}
                                        className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                                    />
                                    <div className="flex justify-between text-xs text-slate-400">
                                        <span>0s</span>
                                        <span>{trimDuration}s</span>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center text-sm text-slate-500 py-4">Cargando video...</div>
                            )}

                            <div className="flex justify-end gap-3 pt-4">
                                <button onClick={() => setTrimModalOpen(false)} className="px-6 py-3 rounded-xl font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleTrimSave}
                                    disabled={uploading || trimDuration === 0}
                                    className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold bg-rose-500 text-white hover:bg-rose-600 transition-colors disabled:opacity-50"
                                >
                                    {uploading ? <Loader2 className="animate-spin" size={18} /> : null}
                                    Recortar y Guardar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
