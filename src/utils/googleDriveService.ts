import { getAccessToken } from './googleAuth';

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  modifiedTime?: string;
  size?: string;
  webViewLink?: string;
  webContentLink?: string;
  iconLink?: string;
  thumbnailLink?: string;
  owners?: Array<{ displayName: string; emailAddress: string; photoLink?: string }>;
}

/**
 * List files and folders from Google Drive
 */
export async function listDriveFiles(options?: {
  folderId?: string;
  searchTerm?: string;
  mimeTypeFilter?: string;
  pageSize?: number;
}): Promise<{ files: DriveFileItem[]; nextPageToken?: string }> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Chưa đăng nhập hoặc phiên làm việc Google Drive đã hết hạn.');
  }

  const queryParts = ['trashed = false'];

  if (options?.folderId) {
    queryParts.push(`'${options.folderId}' in parents`);
  }

  if (options?.searchTerm?.trim()) {
    const escapedTerm = options.searchTerm.trim().replace(/['\\]/g, '\\$&');
    queryParts.push(`name contains '${escapedTerm}'`);
  }

  if (options?.mimeTypeFilter) {
    if (options.mimeTypeFilter === 'folder') {
      queryParts.push(`mimeType = 'application/vnd.google-apps.folder'`);
    } else if (options.mimeTypeFilter === 'document') {
      queryParts.push(
        `(mimeType = 'application/vnd.google-apps.document' or mimeType = 'application/pdf' or mimeType = 'application/msword' or mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')`
      );
    } else if (options.mimeTypeFilter === 'spreadsheet') {
      queryParts.push(
        `(mimeType = 'application/vnd.google-apps.spreadsheet' or mimeType = 'application/vnd.ms-excel' or mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')`
      );
    } else if (options.mimeTypeFilter === 'presentation') {
      queryParts.push(
        `(mimeType = 'application/vnd.google-apps.presentation' or mimeType = 'application/vnd.ms-powerpoint' or mimeType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation')`
      );
    }
  }

  const q = queryParts.join(' and ');
  const pageSize = options?.pageSize || 50;

  const url = new URL('https://www.googleapis.com/drive/v3/files');
  url.searchParams.set('q', q);
  url.searchParams.set('pageSize', pageSize.toString());
  url.searchParams.set(
    'fields',
    'nextPageToken, files(id, name, mimeType, modifiedTime, size, webViewLink, webContentLink, iconLink, thumbnailLink, owners)'
  );
  url.searchParams.set('orderBy', 'folder,modifiedTime desc');

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(errData?.error?.message || `Lỗi tải danh sách tệp Google Drive (${res.status})`);
  }

  return await res.json();
}

/**
 * Create a new folder on Google Drive
 */
export async function createDriveFolder(name: string, parentId?: string): Promise<DriveFileItem> {
  const token = await getAccessToken();
  if (!token) throw new Error('Chưa đăng nhập Google Drive');

  const metadata: { name: string; mimeType: string; parents?: string[] } = {
    name,
    mimeType: 'application/vnd.google-apps.folder',
  };
  if (parentId) {
    metadata.parents = [parentId];
  }

  const res = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(metadata),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Không thể tạo thư mục trên Google Drive');
  }

  return await res.json();
}

/**
 * Upload a JSON / text backup file to Google Drive
 */
export async function uploadJsonBackupToDrive(
  filename: string,
  content: string,
  parentId?: string
): Promise<DriveFileItem> {
  const token = await getAccessToken();
  if (!token) throw new Error('Chưa đăng nhập Google Drive');

  const metadata: any = {
    name: filename,
    mimeType: 'application/json',
    description: 'Bản sao lưu dữ liệu quản lý tổ chuyên môn - THCS Nguyễn Du',
  };
  if (parentId) {
    metadata.parents = [parentId];
  }

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const multipartRequestBody =
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    content +
    closeDelimiter;

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: multipartRequestBody,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Không thể sao lưu file lên Google Drive');
  }

  return await res.json();
}

/**
 * Read file text content from Google Drive (e.g. for restoring backup)
 */
export async function downloadDriveFileContent(fileId: string): Promise<string> {
  const token = await getAccessToken();
  if (!token) throw new Error('Chưa đăng nhập Google Drive');

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Không thể đọc nội dung tệp từ Google Drive (${res.status})`);
  }

  return await res.text();
}

/**
 * Delete a file or folder from Google Drive
 * Note: An explicit confirmation dialog MUST be shown in UI prior to calling this!
 */
export async function deleteDriveFile(fileId: string): Promise<void> {
  const token = await getAccessToken();
  if (!token) throw new Error('Chưa đăng nhập Google Drive');

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Không thể xóa tệp trên Google Drive');
  }
}

/**
 * Upload any general file (PDF, Docx, etc.) to Google Drive
 */
export async function uploadFileToDrive(file: File, parentId?: string): Promise<DriveFileItem> {
  const token = await getAccessToken();
  if (!token) throw new Error('Chưa đăng nhập Google Drive');

  const metadata: any = {
    name: file.name,
    mimeType: file.type || 'application/octet-stream',
  };
  if (parentId) {
    metadata.parents = [parentId];
  }

  const boundary = '-------foo_bar_baz_987654';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const reader = new FileReader();
  const fileData = await new Promise<ArrayBuffer>((resolve, reject) => {
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error);
    reader.readAsArrayBuffer(file);
  });

  // Construct multipart body
  const metadataBlob = new Blob([
    delimiter +
      'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
      JSON.stringify(metadata) +
      delimiter +
      `Content-Type: ${file.type || 'application/octet-stream'}\r\n\r\n`,
  ]);
  const endBlob = new Blob([closeDelimiter]);
  const fullBody = new Blob([metadataBlob, fileData, endBlob]);

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`,
    },
    body: fullBody,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || 'Không thể tải tệp lên Google Drive');
  }

  return await res.json();
}

/**
 * Format bytes into human readable format
 */
export function formatBytes(bytes?: string | number): string {
  if (!bytes) return '-';
  const num = typeof bytes === 'string' ? parseInt(bytes, 10) : bytes;
  if (isNaN(num) || num === 0) return '-';
  const units = ['B', 'KB', 'MB', 'GB'];
  let i = 0;
  let val = num;
  while (val >= 1024 && i < units.length - 1) {
    val /= 1024;
    i++;
  }
  return `${val.toFixed(1)} ${units[i]}`;
}
