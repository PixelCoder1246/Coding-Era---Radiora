'use server';

import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function getCasesAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get('radiora_token')?.value;

  if (!token) return { success: false, error: 'Unauthorized' };

  try {
    const response = await fetch(`${API_URL}/api/cases`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!response.ok) throw new Error('Failed to fetch cases');
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function getCaseDetailsAction(caseId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get('radiora_token')?.value;

  if (!token) return { success: false, error: 'Unauthorized' };

  try {
    const response = await fetch(`${API_URL}/api/cases/${caseId}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });

    if (!response.ok) throw new Error('Failed to fetch case details');
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function updateCaseStatusAction(caseId: string, status: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get('radiora_token')?.value;

  if (!token) return { success: false, error: 'Unauthorized' };

  try {
    const response = await fetch(`${API_URL}/api/cases/${caseId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) throw new Error('Failed to update status');
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function deleteCaseAction(caseId: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get('radiora_token')?.value;

  if (!token) return { success: false, error: 'Unauthorized' };

  try {
    const response = await fetch(`${API_URL}/api/cases/${caseId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error((err as { error?: string }).error || 'Failed to delete case');
    }
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

