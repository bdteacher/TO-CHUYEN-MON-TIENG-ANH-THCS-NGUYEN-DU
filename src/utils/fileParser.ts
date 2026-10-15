import * as XLSX from 'xlsx';
import mammoth from 'mammoth';

export interface ParsedExcelSheet {
  name: string;
  rows: (string | number)[][];
}

export interface ParsedScheduleFile {
  type: 'image' | 'word' | 'excel';
  title: string;
  fileName: string;
  dataUrl: string;
  sheetsData?: ParsedExcelSheet[];
  wordHtml?: string;
  fileSizeStr?: string;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function parseScheduleFile(file: File): Promise<ParsedScheduleFile> {
  const fileName = file.name;
  const lowerName = fileName.toLowerCase();
  const rawTitle = fileName.replace(/\.[^/.]+$/, '');
  const cleanTitle = rawTitle.length > 2 ? rawTitle : 'Thời khóa biểu giáo viên';
  const fileSizeStr = formatFileSize(file.size);

  // Read base64 Data URL so the file can always be downloaded/re-opened
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve((e.target?.result as string) || '');
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

  // Check Excel (.xlsx, .xls, .csv)
  if (
    lowerName.endsWith('.xlsx') ||
    lowerName.endsWith('.xls') ||
    lowerName.endsWith('.csv') ||
    file.type.includes('spreadsheet') ||
    file.type.includes('excel')
  ) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetsData: ParsedExcelSheet[] = workbook.SheetNames.map((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const rows = (XLSX.utils.sheet_to_json(worksheet, {
          header: 1,
          defval: '',
        }) as (string | number)[][]) || [];
        return {
          name: sheetName,
          rows: rows.filter((r) => r && r.length > 0),
        };
      });

      return {
        type: 'excel',
        title: cleanTitle,
        fileName,
        dataUrl,
        sheetsData: sheetsData.length > 0 ? sheetsData : undefined,
        fileSizeStr,
      };
    } catch (err) {
      console.warn('Lỗi đọc cấu trúc Excel, giữ file để tải về:', err);
      return {
        type: 'excel',
        title: cleanTitle,
        fileName,
        dataUrl,
        fileSizeStr,
      };
    }
  }

  // Check Word (.docx, .doc)
  if (
    lowerName.endsWith('.docx') ||
    lowerName.endsWith('.doc') ||
    file.type.includes('word') ||
    file.type.includes('document')
  ) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      return {
        type: 'word',
        title: cleanTitle,
        fileName,
        dataUrl,
        wordHtml: result.value || '<p>Văn bản thời khóa biểu (Word)</p>',
        fileSizeStr,
      };
    } catch (err) {
      console.warn('Lỗi đọc nội dung Word, giữ file để tải về:', err);
      return {
        type: 'word',
        title: cleanTitle,
        fileName,
        dataUrl,
        wordHtml: `<div class="p-4 text-center text-slate-600"><p class="font-bold">${fileName}</p><p class="text-xs text-slate-500 mt-1">Tệp Word đã được lưu thành công. Bạn có thể tải về máy bất cứ lúc nào.</p></div>`,
        fileSizeStr,
      };
    }
  }

  // Default to Image
  return {
    type: 'image',
    title: cleanTitle,
    fileName,
    dataUrl,
    fileSizeStr,
  };
}
