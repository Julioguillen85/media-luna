import React, { useState, useRef } from 'react';
import { Sparkles, Copy, Check, Save, Loader2, Download, Facebook, Instagram, MessageCircle, RefreshCw, Upload, X } from 'lucide-react';
import { generateContent, generateImage, createPost } from '../../services/marketingService';

/* ══════════════════════════════════════════════ */
/*    GENERADOR DE BANNERS CON GEMINI            */
/* ══════════════════════════════════════════════ */

export default function ContentGenerator({ products }) {
    const [tone, setTone] = useState('divertido');
    const [occasion, setOccasion] = useState('');
    const [style, setStyle] = useState('moderno');
    const [platform, setPlatform] = useState('FACEBOOK_PAGE');

    // Admin-uploaded gallery photos
    const [galleryPhotos, setGalleryPhotos] = useState([]);
    const fileInputRef = useRef(null);

    const [generatedContent, setGeneratedContent] = useState('');
    const [generatedImageUrl, setGeneratedImageUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [saved, setSaved] = useState(false);

    const tones = [
        { id: 'divertido', label: '😄 Divertido' },
        { id: 'profesional', label: '💼 Profesional' },
        { id: 'urgente', label: '🔥 Urgente' },
        { id: 'amigable', label: '🤗 Amigable' },
        { id: 'creativo', label: '🎨 Creativo' },
        { id: 'elegante', label: '✨ Elegante' },
        { id: 'navideño', label: '🎄 Navideño' },
        { id: 'retro', label: '🕹️ Retro' },
    ];

    const occasions = [
        { id: '', label: '📌 General' },
        { id: 'Promo 2x1', label: '🏷️ Promo 2x1' },
        { id: 'Descuento especial', label: '💰 Descuento' },
        { id: 'Navidad', label: '🎄 Navidad' },
        { id: 'Halloween', label: '🎃 Halloween' },
        { id: 'San Valentín', label: '💕 San Valentín' },
        { id: 'Día de Muertos', label: '💀 Día de Muertos' },
        { id: 'Año Nuevo', label: '🎆 Año Nuevo' },
        { id: 'Día del Niño', label: '🧸 Día del Niño' },
        { id: 'Regreso a clases', label: '📚 Regreso a clases' },
        { id: 'Inauguración', label: '🎉 Inauguración' },
        { id: 'Nuevo producto', label: '🆕 Nuevo producto' },
        { id: 'Fin de semana', label: '🌮 Fin de semana' },
    ];

    const styles = [
        { id: 'moderno', label: '🖥️ Moderno' },
        { id: 'vibrante', label: '🌈 Vibrante' },
        { id: 'elegante', label: '🥂 Elegante' },
        { id: 'minimalista', label: '◻️ Minimalista' },
        { id: 'casual', label: '☕ Casual' },
        { id: 'promo', label: '📢 Promo' },
    ];

    // Photo upload handlers
    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files || []);
        if (galleryPhotos.length + files.length > 6) {
            alert('Máximo 6 fotos');
            return;
        }
        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                setGalleryPhotos(prev => [...prev, {
                    id: Date.now() + Math.random(),
                    img: ev.target.result,
                    name: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
                }]);
            };
            reader.readAsDataURL(file);
        });
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removePhoto = (id) => setGalleryPhotos(prev => prev.filter(p => p.id !== id));
    const updatePhotoName = (id, name) => setGalleryPhotos(prev => prev.map(p => p.id === id ? { ...p, name } : p));

    const handleGenerate = async () => {
        if (galleryPhotos.length === 0) {
            alert('Sube al menos 1 foto de producto para generar el banner');
            return;
        }
        try {
            setLoading(true);
            setImageLoading(true);
            setGeneratedContent('');
            setGeneratedImageUrl('');

            const productNames = galleryPhotos.map(p => p.name).filter(Boolean);
            const occasionText = occasion || 'publicación del día';
            const imageDataList = galleryPhotos.map(p => p.img);

            // Generate text and image in parallel
            const [contentData, imageData] = await Promise.all([
                generateContent({
                    tone,
                    occasion: occasionText,
                    platform,
                    products: productNames.length > 0 ? productNames : null
                }),
                generateImage({
                    product: productNames.join(', '),
                    style,
                    generatedText: occasionText + ' - ' + tone,
                    images: imageDataList
                })
            ]);

            setGeneratedContent(contentData.content);
            setLoading(false);

            if (imageData.imageUrl) {
                setGeneratedImageUrl(imageData.imageUrl);
            }
        } catch (err) {
            alert('Error generando: ' + err.message);
        } finally {
            setLoading(false);
            setImageLoading(false);
        }
    };

    const handleRegenerateImage = async () => {
        try {
            setImageLoading(true);
            const productNames = galleryPhotos.map(p => p.name).filter(Boolean);
            const imageDataList = galleryPhotos.map(p => p.img);
            const imageData = await generateImage({
                product: productNames.join(', '),
                style,
                generatedText: generatedContent || (occasion || 'publicación del día') + ' - ' + tone,
                images: imageDataList
            });
            if (imageData.imageUrl) {
                setGeneratedImageUrl(imageData.imageUrl);
            }
        } catch (err) {
            alert('Error regenerando banner: ' + err.message);
        } finally {
            setImageLoading(false);
        }
    };

    const handleDownload = async () => {
        if (!generatedImageUrl) return;
        try {
            // For data URLs, create a blob directly
            if (generatedImageUrl.startsWith('data:')) {
                const res = await fetch(generatedImageUrl);
                const blob = await res.blob();
                const link = document.createElement('a');
                link.download = `medialuna-banner-${Date.now()}.png`;
                link.href = URL.createObjectURL(blob);
                link.click();
                URL.revokeObjectURL(link.href);
            } else {
                window.open(generatedImageUrl, '_blank');
            }
        } catch {
            window.open(generatedImageUrl, '_blank');
        }
    };

    const handleCopy = () => { navigator.clipboard.writeText(generatedContent); setCopied(true); setTimeout(() => setCopied(false), 2000); };
    const handleSaveAsDraft = async () => {
        try {
            await createPost({ content: generatedContent, platform: platform === 'GROUP' ? 'FACEBOOK_PAGE' : platform, postType: 'POST', status: 'DRAFT' });
            setSaved(true); setTimeout(() => setSaved(false), 2000);
        } catch (err) { alert('Error guardando: ' + err.message); }
    };
    const handleShareWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(generatedContent)}`, '_blank');
    const handleShareFacebook = () => { navigator.clipboard.writeText(generatedContent); alert('✅ Texto copiado. Descarga el banner y publícalo en Facebook.'); };
    const handleShareInstagram = () => { navigator.clipboard.writeText(generatedContent); alert('✅ Texto copiado. Descarga el banner y súbelo a Instagram.'); };

    return (
        <div className="space-y-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">✨ Generador de Banners con Gemini AI</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 -mt-4">
                Sube tus fotos reales y Gemini crea banners publicitarios profesionales 🎨
            </p>

            {/* Step 1: Upload Photos */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/50">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">
                    1️⃣ Sube fotos de tus productos
                </label>

                <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-2xl p-6 text-center cursor-pointer hover:border-rose-400 dark:hover:border-rose-500 hover:bg-rose-50/50 dark:hover:bg-rose-900/10 transition-all group"
                >
                    <Upload size={32} className="mx-auto mb-2 text-slate-400 group-hover:text-rose-500 transition-colors" />
                    <p className="text-sm font-bold text-slate-600 dark:text-slate-400 group-hover:text-rose-600 transition-colors">
                        Toca para subir fotos de tu galería
                    </p>
                    <p className="text-xs text-slate-400 mt-1">Máximo 6 fotos · JPG, PNG, WebP</p>
                    <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFileUpload} className="hidden" />
                </div>

                {galleryPhotos.length > 0 && (
                    <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {galleryPhotos.map((photo) => (
                            <div key={photo.id} className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                                <img src={photo.img} alt={photo.name} className="w-full h-28 object-cover" />
                                <button onClick={() => removePhoto(photo.id)}
                                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs shadow-lg hover:bg-red-600 transition-colors">
                                    <X size={12} />
                                </button>
                                <input type="text" value={photo.name}
                                    onChange={(e) => updatePhotoName(photo.id, e.target.value)}
                                    placeholder="Nombre del producto"
                                    className="w-full px-2 py-1.5 bg-white dark:bg-slate-800 text-[11px] font-bold text-slate-700 dark:text-white border-t border-slate-200 dark:border-slate-700"
                                />
                            </div>
                        ))}
                    </div>
                )}

                <p className="text-xs text-slate-400 mt-2">
                    {galleryPhotos.length > 0
                        ? `${galleryPhotos.length} foto${galleryPhotos.length > 1 ? 's' : ''} · Gemini las usará para crear tu banner`
                        : '⚠️ Sube al menos 1 foto para generar el banner'
                    }
                </p>
            </div>

            {/* Step 2: Occasion */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/50">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">2️⃣ Ocasión del banner</label>
                <div className="flex flex-wrap gap-2 mb-3">
                    {occasions.map(o => (
                        <button key={o.id} onClick={() => setOccasion(o.id)}
                            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${occasion === o.id ? 'bg-rose-500 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-rose-50 dark:hover:bg-slate-600'}`}>
                            {o.label}
                        </button>
                    ))}
                </div>
                <input type="text" value={occasion} onChange={e => setOccasion(e.target.value)}
                    placeholder="O escribe tu propia ocasión..."
                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200" />
            </div>

            {/* Step 3: Tone + Style */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700/50">
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">3️⃣ Tono y estilo visual</label>
                <p className="text-xs text-slate-400 mb-2">Tono del texto:</p>
                <div className="flex flex-wrap gap-2 mb-4">
                    {tones.map(t => (
                        <button key={t.id} onClick={() => setTone(t.id)}
                            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${tone === t.id ? 'bg-purple-500 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                            {t.label}
                        </button>
                    ))}
                </div>
                <p className="text-xs text-slate-400 mb-2">Estilo del banner:</p>
                <div className="flex flex-wrap gap-2">
                    {styles.map(s => (
                        <button key={s.id} onClick={() => setStyle(s.id)}
                            className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all ${style === s.id ? 'bg-cyan-500 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                            {s.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Generate Button */}
            <button onClick={handleGenerate} disabled={loading || imageLoading || galleryPhotos.length === 0}
                className="w-full py-4 bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 text-white rounded-2xl font-bold text-base shadow-lg hover:shadow-xl disabled:opacity-60 transition-all flex items-center justify-center gap-3">
                {loading || imageLoading
                    ? <><Loader2 size={22} className="animate-spin" /> Gemini está creando tu banner... (puede tardar ~30s)</>
                    : <><Sparkles size={22} /> Generar Banner con Gemini 🎨</>
                }
            </button>

            {/* === GENERATED BANNER === */}
            {(generatedImageUrl || generatedContent) && (
                <>
                    {generatedImageUrl && (
                        <div className="space-y-3">
                            <div className="flex items-center justify-center gap-3 flex-wrap">
                                <p className="text-sm font-bold text-slate-500 dark:text-slate-400">
                                    👇 Tu banner generado por Gemini con tus fotos reales
                                </p>
                                <button onClick={handleRegenerateImage} disabled={imageLoading}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50">
                                    {imageLoading ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                                    {imageLoading ? 'Generando...' : '🔄 Generar Otro Banner'}
                                </button>
                            </div>

                            <div className="flex justify-center">
                                <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-700">
                                    {imageLoading && (
                                        <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 flex flex-col items-center justify-center z-10 backdrop-blur-sm">
                                            <Loader2 size={40} className="animate-spin text-blue-500 mb-3" />
                                            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Gemini está diseñando...</p>
                                            <p className="text-xs text-slate-400">Esto puede tardar ~30 segundos</p>
                                        </div>
                                    )}
                                    <img
                                        src={generatedImageUrl}
                                        alt="Banner generado por Gemini"
                                        className="w-full max-w-lg"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Text + Actions */}
                    <div className="max-w-xl mx-auto space-y-3">
                        {generatedContent && (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-slate-100 dark:border-slate-700/50">
                                <p className="text-xs font-bold text-slate-500 mb-2">📝 Texto generado por Lunita IA:</p>
                                <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">{generatedContent}</p>
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                            {generatedImageUrl && (
                                <button onClick={handleDownload}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all">
                                    <Download size={16} /> Descargar Banner
                                </button>
                            )}
                            {generatedContent && (
                                <button onClick={handleCopy}
                                    className="flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold text-sm">
                                    {copied ? <><Check size={16} className="text-green-500" /> ¡Copiado!</> : <><Copy size={16} /> Copiar Texto</>}
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            <button onClick={handleShareWhatsApp} className="flex items-center justify-center gap-2 px-3 py-2.5 bg-green-500 text-white rounded-xl font-bold text-xs"><MessageCircle size={14} /> WhatsApp</button>
                            <button onClick={handleShareFacebook} className="flex items-center justify-center gap-2 px-3 py-2.5 bg-blue-600 text-white rounded-xl font-bold text-xs"><Facebook size={14} /> Facebook</button>
                            <button onClick={handleShareInstagram} className="flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-xs"><Instagram size={14} /> Instagram</button>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <button onClick={handleSaveAsDraft} className="flex items-center justify-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-xl font-bold text-xs">
                                {saved ? <><Check size={14} /> ¡Guardado!</> : <><Save size={14} /> Guardar Borrador</>}
                            </button>
                            <button onClick={handleGenerate} disabled={loading || imageLoading} className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-xl font-bold text-xs">🔄 Regenerar Todo</button>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
