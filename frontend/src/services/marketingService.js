const API_BASE = '/api/marketing';

function getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    };
}

// ==================== POSTS ====================

export async function fetchPosts(startDate, endDate) {
    let url = `${API_BASE}/posts`;
    if (startDate && endDate) {
        url += `?startDate=${startDate}&endDate=${endDate}`;
    }
    const res = await fetch(url, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Error cargando posts');
    return res.json();
}

export async function createPost(post) {
    const res = await fetch(`${API_BASE}/posts`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(post)
    });
    if (!res.ok) throw new Error('Error creando post');
    return res.json();
}

export async function updatePost(id, post) {
    const res = await fetch(`${API_BASE}/posts/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(post)
    });
    if (!res.ok) throw new Error('Error actualizando post');
    return res.json();
}

export async function deletePost(id) {
    const res = await fetch(`${API_BASE}/posts/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    });
    if (!res.ok) throw new Error('Error eliminando post');
    return res.json();
}

export async function publishPost(id) {
    const res = await fetch(`${API_BASE}/posts/${id}/publish`, {
        method: 'POST',
        headers: getAuthHeaders()
    });
    if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Error publicando post');
    }
    return res.json();
}

// ==================== STATS ====================

export async function fetchStats() {
    const res = await fetch(`${API_BASE}/stats`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Error cargando estadísticas');
    return res.json();
}

// ==================== AI CONTENT ====================

export async function generateContent({ tone, occasion, platform, products }) {
    const res = await fetch(`${API_BASE}/generate`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ tone, occasion, platform, products })
    });
    if (!res.ok) throw new Error('Error generando contenido');
    return res.json();
}

export async function getScheduleSuggestion() {
    const res = await fetch(`${API_BASE}/schedule-suggestion`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Error obteniendo sugerencia');
    return res.json();
}

export async function generateImage({ product, style, generatedText }) {
    const res = await fetch(`${API_BASE}/generate-image`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ product, style, generatedText })
    });
    if (!res.ok) throw new Error('Error generando imagen');
    return res.json();
}

export async function generateDesign({ tone, occasion, platform, products, productCount }) {
    const res = await fetch(`${API_BASE}/generate-design`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ tone, occasion, platform, products, productCount })
    });
    if (!res.ok) throw new Error('Error generando diseño');
    return res.json();
}

// ==================== CONFIG ====================

export async function fetchConfig() {
    const res = await fetch(`${API_BASE}/config`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Error cargando configuración');
    return res.json();
}

export async function updateConfig(config) {
    const res = await fetch(`${API_BASE}/config`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(config)
    });
    if (!res.ok) throw new Error('Error guardando configuración');
    return res.json();
}

// ==================== REPORTS ====================

export async function previewReport() {
    const res = await fetch(`${API_BASE}/report/preview`, { headers: getAuthHeaders() });
    if (!res.ok) throw new Error('Error cargando reporte');
    return res.json();
}

export async function sendReport(channel, to) {
    const res = await fetch(`${API_BASE}/report/send`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ channel, to })
    });
    if (!res.ok) throw new Error('Error enviando reporte');
    return res.json();
}
