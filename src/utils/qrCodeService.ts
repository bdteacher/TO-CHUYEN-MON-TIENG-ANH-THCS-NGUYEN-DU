import QRCode from 'qrcode';
import { Teacher } from '../types';

export interface QrCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark?: string;
    light?: string;
  };
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

/**
 * Generates an inspection URL for a specific teacher.
 * When scanned during a physical inspection session, this URL directly loads the teacher's
 * complete electronic professional development records (KHBĐ, dự giờ, thi đua, phân công).
 */
export const getTeacherInspectionUrl = (teacherId: string): string => {
  if (typeof window === 'undefined') return `https://ais-dev.local/?inspectTeacher=${teacherId}`;
  const origin = window.location.origin;
  const pathname = window.location.pathname;
  return `${origin}${pathname}?inspectTeacher=${encodeURIComponent(teacherId)}`;
};

/**
 * Generates a unique QR Code Data URL (PNG) for a teacher profile.
 */
export const generateTeacherQrDataUrl = async (
  teacherId: string,
  options: QrCodeOptions = {}
): Promise<string> => {
  const url = getTeacherInspectionUrl(teacherId);
  try {
    const dataUrl = await QRCode.toDataURL(url, {
      width: options.width || 360,
      margin: options.margin !== undefined ? options.margin : 2,
      color: {
        dark: options.color?.dark || '#1e1b4b', // Deep indigo
        light: options.color?.light || '#ffffff',
      },
      errorCorrectionLevel: options.errorCorrectionLevel || 'M',
    });
    return dataUrl;
  } catch (error) {
    console.error('Error generating QR code for teacher:', teacherId, error);
    throw error;
  }
};

/**
 * Downloads a QR code data URL as an image file.
 */
export const downloadQrCodeImage = (dataUrl: string, filename: string): void => {
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename.endsWith('.png') ? filename : `${filename}.png`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
