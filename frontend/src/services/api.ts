import type { Task, TaskFilter, TimeFilter, Status } from '../types';

const API_BASE = 'http://localhost:4000/api/tasks';
const API_BASE_AUTH = 'http://localhost:4000/api/auth';

async function fetchJson(input: RequestInfo, init?: RequestInit) {
    const res = await fetch(input, { ...init, credentials: 'include' });
    if (res.status === 401) {
        const err = new Error('Unauthorized');
        (err as any).status = 401;
        throw err;
    }
    const text = await res.text();
    try {
        const data = text ? JSON.parse(text) : null;
        if (!res.ok) throw new Error(data?.error || 'Request failed');
        return data;
    } catch {
        if (!res.ok) throw new Error('Request failed');
        return null;
    }
}

export async function getTasks(filter: TaskFilter = 'all', timeFilter: TimeFilter = 'any'): Promise<Task[]> {
    const params = new URLSearchParams({ filter, time: timeFilter });
    return fetchJson(`${API_BASE}?${params.toString()}`);
}

export async function getTask(id: string): Promise<Task> {
    return fetchJson(`${API_BASE}/${id}`);
}

export async function createTask(data: { title: string; description?: string; dueDate?: string; status?: Status }): Promise<Task> {
    return fetchJson(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
}

export async function updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    return fetchJson(`${API_BASE}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
    });
}

export async function deleteTask(id: string): Promise<void> {
    await fetchJson(`${API_BASE}/${id}`, { method: 'DELETE' });
}

export async function addAttachment(taskId: string, file: File): Promise<void> {
    const formData = new FormData();
    formData.append('attachment', file);
    await fetchJson(`${API_BASE}/${taskId}/attachments`, {
        method: 'POST',
        body: formData,
    });
}

export async function deleteAttachment(taskId: string, filename: string): Promise<void> {
    await fetchJson(`${API_BASE}/${taskId}/attachments/${filename}`, {
        method: 'DELETE',
    });
}

export function getAttachmentUrl(taskId: string, filename: string): string {
    return `${API_BASE}/${taskId}/attachments/${filename}`;
}

export async function downloadAttachment(taskId: string, filename: string, originalName: string) {
    const url = getAttachmentUrl(taskId, filename);
    const res = await fetch(url, { credentials: 'include' });
    if (res.status === 401) throw new Error('Unauthorized');
    if (!res.ok) throw new Error('Failed to download');

    const blob = await res.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = blobUrl;
    a.download = originalName || filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(blobUrl);
}

export async function registerUser(username: string, password: string) {
    return fetchJson(`${API_BASE_AUTH}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });
}

export async function loginUser(username: string, password: string) {
    return fetchJson(`${API_BASE_AUTH}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
    });
}

export async function logoutUser() {
    return fetchJson(`${API_BASE_AUTH}/logout`, {
        method: 'POST',
    });
}

export async function getCurrentUser() {
    return fetchJson(`${API_BASE_AUTH}/me`, { method: 'GET' });
}
