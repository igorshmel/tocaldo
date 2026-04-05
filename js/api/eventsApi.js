import { API_BASE } from '../config/constants.js';

function apiRequest(path, options) {
    return fetch(`${API_BASE}${path}`, options).then((res) => {
        if (!res.ok) {
            return res.text().then((txt) => {
                throw new Error(txt || `request failed: ${res.status}`);
            });
        }
        return res;
    });
}

export function loadEvents(from, to) {
    const query = from && to ? `?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}` : '';
    return apiRequest(`/api/events${query}`, { method: 'GET' }).then((res) => res.json());
}

export function createEventOnServer(event) {
    return apiRequest('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
    }).then((res) => res.json());
}

export function updateEventOnServer(event) {
    return apiRequest(`/api/events/${event.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
    });
}

export function deleteEventOnServer(id) {
    return apiRequest(`/api/events/${id}`, { method: 'DELETE' });
}
