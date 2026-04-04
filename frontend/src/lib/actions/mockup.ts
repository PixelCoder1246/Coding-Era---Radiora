'use server';

import { cookies } from 'next/headers';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export async function createPatientAction(payload: {
  name: string;
  dob: string;
  gender: string;
  email: string;
  phone: string;
}) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('radiora_token')?.value;

    const response = await fetch(`${API_URL}/api/his/patients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to create mockup patient');
    }

    return { success: true, data: await response.json() };
  } catch (error) {
    console.error('Server Action - Create Patient Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create patient' };
  }
}

export async function createOrderAction(payload: { patientId: string; modality: string; bodyPart: string }) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('radiora_token')?.value;

    const response = await fetch(`${API_URL}/api/his/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to create mockup order');
    }

    return { success: true, data: await response.json() };
  } catch (error) {
    console.error('Server Action - Create Order Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to create order' };
  }
}

export async function uploadDicomAction(formData: FormData) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('radiora_token')?.value;

    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_URL}/api/pacs/upload`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to upload DICOM');
    }

    return { success: true, data: await response.json() };
  } catch (error) {
    console.error('Server Action - Upload DICOM Error:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Failed to upload DICOM' };
  }
}
