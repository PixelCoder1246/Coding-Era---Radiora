'use server';

import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function addDoctorAction(payload: { name: string; email: string; maxConcurrentCases: number }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('radiora_token')?.value;

    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/api/admin/doctors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to add doctor');
    }

    return { success: true, data: await response.json() };
  } catch (error) {
    console.error('Server Action - Add Doctor Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to add doctor' };
  }
}

export async function listDoctorsAction() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('radiora_token')?.value;

    if (!token) {
      return [];
    }

    const response = await fetch(`${API_URL}/api/admin/doctors`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch doctors');
    }

    return await response.json();
  } catch (error) {
    console.error('Server Action - List Doctors Error:', error);
    return [];
  }
}

export async function deleteDoctorAction(doctorId: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('radiora_token')?.value;

    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/api/admin/doctors/${doctorId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to remove doctor');
    }

    return { success: true };
  } catch (error) {
    console.error('Server Action - Delete Doctor Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to remove doctor' };
  }
}

export async function resetDoctorPasswordAction(doctorId: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('radiora_token')?.value;

    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/api/admin/doctors/${doctorId}/reset-password`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to reset password');
    }

    return { success: true, data: await response.json() };
  } catch (error) {
    console.error('Server Action - Reset Password Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to reset password' };
  }
}
