import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Facebook, Instagram, Users, Plus, Trash2, Send, Edit, Copy, Check } from 'lucide-react';
import { fetchPosts, createPost, deletePost, publishPost, updatePost } from '../../services/marketingService';

const PLATFORM_CONFIG = {
    FACEBOOK_PAGE: { label: 'Facebook Página', icon: Facebook, color: 'blue', emoji: '📘' },
    FACEBOOK_STORY: { label: 'FB Story', icon: Facebook, color: 'indigo', emoji: '📸' },
    INSTAGRAM_STORY: { label: 'IG Story', icon: Instagram, color: 'pink', emoji: '📷' },
    INSTAGRAM_REEL: { label: 'IG Reel', icon: Instagram, color: 'purple', emoji: '🎬' },
};

const STATUS_CONFIG = {
    DRAFT: { label: 'Borrador', color: 'slate', emoji: '📝' },
    SCHEDULED: { label: 'Programado', color: 'amber', emoji: '⏰' },
    PUBLISHED: { label: 'Publicado', color: 'green', emoji: '✅' },
    FAILED: { label: 'Fallido', color: 'red', emoji: '❌' },
};

export default function ContentCalendar({ products }) {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingPost, setEditingPost] = useState(null);
    const [copiedId, setCopiedId] = useState(null);

    // New post form
    const [newPost, setNewPost] = useState({
        content: '',
        imageUrl: '',
        platform: 'FACEBOOK_PAGE',
        postType: 'POST',
        scheduledAt: '',
        status: 'DRAFT'
    });

    const loadPosts = async () => {
        try {
            setLoading(true);
            const data = await fetchPosts();
            setPosts(data);
        } catch (err) {
            console.error('Error cargando posts:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPosts();
    }, []);

    const handleCreate = async () => {
        try {
            const postData = { ...newPost };
            if (postData.scheduledAt) {
                postData.status = 'SCHEDULED';
            }
            await createPost(postData);
            setShowCreateModal(false);
            setNewPost({ content: '', imageUrl: '', platform: 'FACEBOOK_PAGE', postType: 'POST', scheduledAt: '', status: 'DRAFT' });
            loadPosts();
        } catch (err) {
            alert('Error creando post: ' + err.message);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('¿Eliminar este post?')) return;
        try {
            await deletePost(id);
            loadPosts();
        } catch (err) {
            alert('Error eliminando: ' + err.message);
        }
    };

    const handlePublish = async (id) => {
        if (!confirm('¿Publicar este post ahora?')) return;
        try {
            await publishPost(id);
            loadPosts();
        } catch (err) {
            alert('Error publicando: ' + err.message);
        }
    };

    const handleCopy = (content) => {
        navigator.clipboard.writeText(content);
        setCopiedId(content);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        return d.toLocaleDateString('es-MX', { weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white transition-colors duration-300">
                    📅 Calendario de Contenido
                </h3>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-purple-200 dark:shadow-purple-900/30 hover:shadow-xl transition-all"
                >
                    <Plus size={16} /> Nuevo Post
                </button>
            </div>

            {/* Posts List */}
            {loading ? (
                <div className="text-center py-12 text-slate-400">Cargando...</div>
            ) : posts.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 dark:bg-slate-800/50 rounded-2xl transition-colors duration-300">
                    <Calendar size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                    <h4 className="text-lg font-bold text-slate-700 dark:text-slate-300">No hay publicaciones aún</h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Crea tu primer post o usa el generador de IA</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {posts.map(post => {
                        const platform = PLATFORM_CONFIG[post.platform] || PLATFORM_CONFIG.FACEBOOK_PAGE;
                        const status = STATUS_CONFIG[post.status] || STATUS_CONFIG.DRAFT;
                        return (
                            <div key={post.id} className="bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-5 border border-slate-100 dark:border-slate-700/50 transition-colors duration-300 hover:shadow-md">
                                <div className="flex items-start gap-4">
                                    {/* Platform Badge */}
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0
                                        ${post.platform?.includes('FACEBOOK') ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-pink-100 dark:bg-pink-900/30'}`}>
                                        {platform.emoji}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold
                                                bg-${platform.color}-100 dark:bg-${platform.color}-900/30 text-${platform.color}-700 dark:text-${platform.color}-400`}>
                                                {platform.label}
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold
                                                bg-${status.color}-100 dark:bg-${status.color}-900/30 text-${status.color}-700 dark:text-${status.color}-400`}>
                                                {status.emoji} {status.label}
                                            </span>
                                        </div>
                                        <p className="text-sm text-slate-800 dark:text-slate-200 leading-relaxed line-clamp-3">{post.content}</p>
                                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                                            {post.scheduledAt && (
                                                <span className="flex items-center gap-1">
                                                    <Clock size={12} /> {formatDate(post.scheduledAt)}
                                                </span>
                                            )}
                                            {post.publishedAt && (
                                                <span className="flex items-center gap-1 text-green-500">
                                                    <Check size={12} /> Publicado {formatDate(post.publishedAt)}
                                                </span>
                                            )}
                                        </div>
                                        {post.errorMessage && (
                                            <p className="text-xs text-red-500 mt-1">⚠️ {post.errorMessage}</p>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            onClick={() => handleCopy(post.content)}
                                            className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                            title="Copiar"
                                        >
                                            {copiedId === post.content ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                                        </button>
                                        {(post.status === 'DRAFT' || post.status === 'SCHEDULED') && (
                                            <button
                                                onClick={() => handlePublish(post.id)}
                                                className="p-2 text-slate-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                                                title="Publicar ahora"
                                            >
                                                <Send size={16} />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(post.id)}
                                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                            title="Eliminar"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Create Post Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowCreateModal(false)}>
                    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-lg shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4">📝 Nuevo Post</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Plataforma</label>
                                <select
                                    value={newPost.platform}
                                    onChange={e => setNewPost({ ...newPost, platform: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-purple-300 transition-colors"
                                >
                                    <option value="FACEBOOK_PAGE">📘 Facebook Página (Post)</option>
                                    <option value="FACEBOOK_STORY">📸 Facebook Story</option>
                                    <option value="INSTAGRAM_STORY">📷 Instagram Story</option>
                                    <option value="INSTAGRAM_REEL">🎬 Instagram Reel</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Contenido</label>
                                <textarea
                                    value={newPost.content}
                                    onChange={e => setNewPost({ ...newPost, content: e.target.value })}
                                    rows={4}
                                    placeholder="Escribe tu post o usa el Generador IA..."
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 resize-none focus:ring-2 focus:ring-purple-300 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">URL de Imagen/Video (opcional)</label>
                                <input
                                    type="url"
                                    value={newPost.imageUrl}
                                    onChange={e => setNewPost({ ...newPost, imageUrl: e.target.value })}
                                    placeholder="https://..."
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-purple-300 transition-colors"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Programar para (opcional)</label>
                                <input
                                    type="datetime-local"
                                    value={newPost.scheduledAt}
                                    onChange={e => setNewPost({ ...newPost, scheduledAt: e.target.value })}
                                    className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-purple-300 transition-colors"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="flex-1 px-4 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-xl font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleCreate}
                                disabled={!newPost.content}
                                className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold text-sm shadow-lg disabled:opacity-50 transition-all"
                            >
                                {newPost.scheduledAt ? '⏰ Programar' : '📝 Guardar Borrador'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
