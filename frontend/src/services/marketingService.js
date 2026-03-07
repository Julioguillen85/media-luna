import Logger from '../utils/logger';

const API_BASE = '/api/marketing';

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
}

async function apiCall(url, options, errorMsg) {
    try {
        const res = await fetch(url, { ...options, headers: getAuthHeaders() });
        if (!res.ok) {
            let detail = '';
            try {
                const data = await res.json();
                detail = data.error || data.message || '';
            } catch (e) { }
            const finalMsg = detail ? `${errorMsg}: ${detail}` : errorMsg;
            Logger.error(finalMsg, { status: res.status, url });
            throw new Error(finalMsg);
        }
        return res.json();
    } catch (error) {
        Logger.error(`Network or unexpected error: ${errorMsg}`, error, { url });
        throw error;
    }
}

// ==================== POSTS ====================

export async function fetchPosts(startDate, endDate) {
    let url = `${API_BASE}/posts`;
    if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    return apiCall(url, {}, 'Error cargando posts');
}

export async function createPost(post) {
    return apiCall(`${API_BASE}/posts`, {
        method: 'POST',
        body: JSON.stringify(post)
    }, 'Error creando post');
}

export async function updatePost(id, post) {
    return apiCall(`${API_BASE}/posts/${id}`, {
        method: 'PUT',
        body: JSON.stringify(post)
    }, 'Error actualizando post');
}

export async function deletePost(id) {
    return apiCall(`${API_BASE}/posts/${id}`, {
        method: 'DELETE'
    }, 'Error eliminando post');
}

export async function publishPost(id) {
    return apiCall(`${API_BASE}/posts/${id}/publish`, {
        method: 'POST'
    }, 'Error publicando post');
}

// ==================== STATS ====================

export async function fetchStats() {
    return apiCall(`${API_BASE}/stats`, {}, 'Error cargando estadísticas');
}

// ==================== AI CONTENT ====================

export async function generateContent({ tone, occasion, platform, products }) {
    return apiCall(`${API_BASE}/generate`, {
        method: 'POST',
        body: JSON.stringify({ tone, occasion, platform, products })
    }, 'Error generando contenido');
}

export async function getScheduleSuggestion() {
    return apiCall(`${API_BASE}/schedule-suggestion`, {}, 'Error obteniendo sugerencia');
}

export async function generateImage({ product, style, generatedText, images }) {
    return apiCall(`${API_BASE}/generate-image`, {
        method: 'POST',
        body: JSON.stringify({ product, style, generatedText, images })
    }, 'Error generando imagen');
}

export async function generateDesign({ tone, occasion, platform, products, productCount }) {
    return apiCall(`${API_BASE}/generate-design`, {
        method: 'POST',
        body: JSON.stringify({ tone, occasion, platform, products, productCount })
    }, 'Error generando diseño');
}

// ==================== CONFIG ====================

export async function fetchConfig() {
    return apiCall(`${API_BASE}/config`, {}, 'Error cargando configuración');
}

export async function updateConfig(config) {
    return apiCall(`${API_BASE}/config`, {
        method: 'PUT',
        body: JSON.stringify(config)
    }, 'Error guardando configuración');
}

// ==================== REPORTS ====================

export async function previewReport() {
    return apiCall(`${API_BASE}/report/preview`, {}, 'Error cargando reporte');
}

export async function sendReport(channel, to) {
    return apiCall(`${API_BASE}/report/send`, {
        method: 'POST',
        body: JSON.stringify({ channel, to })
    }, 'Error enviando reporte');
}
