'use server';

import { cookies } from 'next/headers';
import { User } from './auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function saveHisConfigAction(config: { url: string; apiKey: string }, user: User) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('radiora_token')?.value;

    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/api/integrations/his`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...config,
        user,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to save HIS configuration');
    }

    return { success: true };
  } catch (error) {
    console.error('Server Action - Save HIS Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to save HIS configuration' };
  }
}

export async function savePacsConfigAction(
  config: { url: string; username?: string; password?: string; pollIntervalSeconds?: number },
  user: User
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('radiora_token')?.value;

    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/api/integrations/pacs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        ...config,
        user,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to save PACS configuration');
    }

    return { success: true };
  } catch (error) {
    console.error('Server Action - Save PACS Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to save PACS configuration' };
  }
}

export async function getIntegrationStatusAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('radiora_token')?.value;

    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/api/integrations/status`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch integration status');
    }

    return await response.json();
  } catch (error) {
    console.error('Server Action - Get Status Error:', error);
    return { pacs: { active: false }, his: { active: false } };
  }
}

export async function activateHisAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('radiora_token')?.value;

    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/api/integrations/his/activate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to activate HIS');
    }

    return await response.json();
  } catch (error) {
    console.error('Server Action - Activate HIS Error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to activate HIS' };
  }
}

export async function activatePacsAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('radiora_token')?.value;

    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/api/integrations/pacs/activate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to activate PACS');
    }

    return await response.json();
  } catch (error) {
    console.error('Server Action - Activate PACS Error:', error);
    return { error: error instanceof Error ? error.message : 'Failed to activate PACS' };
  }
}

export async function getHisConfigAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('radiora_token')?.value;

    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/api/integrations/his`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch HIS configuration');
    }

    return await response.json();
  } catch (error) {
    console.error('Server Action - Get HIS Config Error:', error);
    return null;
  }
}

export async function getPacsConfigAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('radiora_token')?.value;

    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/api/integrations/pacs`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch PACS configuration');
    }

    return await response.json();
  } catch (error) {
    console.error('Server Action - Get PACS Config Error:', error);
    return null;
  }
}
