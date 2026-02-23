// AnnouncementService.ts – talks to the Django announcements API

import { API_BASE_URL } from '../config/api';

export interface Announcement {
  id: number;
  title: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  created_by: number | null;
  created_by_name: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
}

class AnnouncementService {
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    const token = localStorage.getItem('authToken');
    if (token) {
      headers['Authorization'] = `Token ${token}`;
    }
    const authUser = localStorage.getItem('authUser');
    if (authUser) {
      try {
        const user = JSON.parse(authUser);
        if (user.email) {
          headers['X-Employee-Email'] = user.email;
        }
      } catch {}
    }
    return headers;
  }

  async getAnnouncements(): Promise<Announcement[]> {
    const response = await fetch(`${API_BASE_URL}/announcements/`, {
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch announcements');
    return response.json();
  }

  async createAnnouncement(data: { title: string; content: string; priority: string }): Promise<Announcement> {
    const response = await fetch(`${API_BASE_URL}/announcements/create/`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      const err = await response.json();
      throw new Error(err.detail || JSON.stringify(err));
    }
    return response.json();
  }

  async updateAnnouncement(id: number, data: Partial<Announcement>): Promise<Announcement> {
    const response = await fetch(`${API_BASE_URL}/announcements/${id}/update/`, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update announcement');
    return response.json();
  }

  async deleteAnnouncement(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/announcements/${id}/delete/`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });
    if (!response.ok) throw new Error('Failed to delete announcement');
  }
}

const announcementService = new AnnouncementService();
export default announcementService;
