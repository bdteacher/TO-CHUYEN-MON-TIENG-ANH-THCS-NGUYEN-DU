import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  CalendarDays,
  Upload,
  Image as ImageIcon,
  Maximize2,
  Trash2,
  Download,
  X,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Sparkles,
  Layers,
  ChevronLeft,
  ChevronRight,
  Plus,
  Grid3X3,
  Box,
  FileEdit,
  Eye,
  Check,
  FileSpreadsheet,
  FileText,
  FileUp,
  Search,
  Table,
  Printer,
  Sparkle,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { DepartmentSetting } from '../types';
import { parseScheduleFile, ParsedExcelSheet, formatFileSize } from '../utils/fileParser';

export interface ScheduleItem {
  id: string;
  type: 'image' | 'word' | 'excel';
  url: string;
  fileName?: string;
  title: string;
  tag?: string;
  createdAt: string;
  sheetsData?: ParsedExcelSheet[];
  wordHtml?: string;
  fileSizeStr?: string;
}

export type ScheduleImageItem = ScheduleItem;

interface TeacherScheduleCardProps {
  settings?: DepartmentSetting;
}

const STORAGE_KEYS = {
  IMAGES: 'thcs_nguyen_du_schedule_images',
  LEGACY_IMAGE: 'thcs_nguyen_du_schedule_image',
  LEGACY_TITLE: 'thcs_nguyen_du_schedule_title',
  LEGACY_UPDATED_AT: 'thcs_nguyen_du_schedule_updated_at',
};

// Generates an SVG timetable for Morning Session
const createMorningTimetableSvg = (deptName: string = 'TỔ TIẾNG ANH', schoolName: string = 'TRƯỜNG THCS NGUYỄN DU') => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 620" width="100%" height="100%">
    <defs>
      <linearGradient id="headerGradM" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#312e81"/>
        <stop offset="50%" stop-color="#1e3a8a"/>
        <stop offset="100%" stop-color="#0369a1"/>
      </linearGradient>
    </defs>
    <rect width="960" height="620" fill="#f8fafc" rx="16"/>
    <rect x="8" y="8" width="944" height="604" fill="#ffffff" rx="12" stroke="#e2e8f0" stroke-width="2"/>
    <rect x="16" y="16" width="928" height="85" fill="url(#headerGradM)" rx="10"/>
    <text x="35" y="42" fill="#fef08a" font-family="system-ui, sans-serif" font-size="13" font-weight="700" letter-spacing="1">${schoolName.toUpperCase()}</text>
    <text x="35" y="72" fill="#ffffff" font-family="system-ui, sans-serif" font-size="20" font-weight="800">TKB GIÁO VIÊN - BUỔI SÁNG (KHỐI 8, 9) - ${deptName.toUpperCase()}</text>
    <text x="920" y="42" text-anchor="end" fill="#93c5fd" font-family="system-ui, sans-serif" font-size="12">ÁP DỤNG: TUẦN 01 - 18 (HỌC KỲ I)</text>
    <text x="920" y="70" text-anchor="end" fill="#e0f2fe" font-family="system-ui, sans-serif" font-size="12" font-weight="600">Năm học 2025 - 2026</text>
    <rect x="16" y="112" width="100" height="36" fill="#1e293b" rx="6 0 0 0"/>
    <text x="66" y="135" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-size="12" font-weight="700">TIẾT / BUỔI</text>
    <rect x="120" y="112" width="130" height="36" fill="#0284c7"/>
    <text x="185" y="135" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-size="13" font-weight="700">THỨ HAI</text>
    <rect x="254" y="112" width="130" height="36" fill="#0284c7"/>
    <text x="319" y="135" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-size="13" font-weight="700">THỨ BA</text>
    <rect x="388" y="112" width="130" height="36" fill="#0284c7"/>
    <text x="453" y="135" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-size="13" font-weight="700">THỨ TƯ</text>
    <rect x="522" y="112" width="130" height="36" fill="#0284c7"/>
    <text x="587" y="135" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-size="13" font-weight="700">THỨ NĂM</text>
    <rect x="656" y="112" width="130" height="36" fill="#0284c7"/>
    <text x="721" y="135" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-size="13" font-weight="700">THỨ SÁU</text>
    <rect x="790" y="112" width="154" height="36" fill="#0284c7" rx="0 6 0 0"/>
    <text x="867" y="135" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-size="13" font-weight="700">THỨ BẢY</text>
    <rect x="16" y="152" width="928" height="24" fill="#f1f5f9"/>
    <text x="26" y="168" fill="#475569" font-family="system-ui, sans-serif" font-size="11" font-weight="800">☀️ BUỔI SÁNG (07:15 - 11:30)</text>
    <!-- Row 1 -->
    <rect x="16" y="180" width="100" height="42" fill="#f8fafc" stroke="#e2e8f0"/>
    <text x="66" y="205" text-anchor="middle" fill="#334155" font-family="system-ui, sans-serif" font-size="12" font-weight="600">Tiết 1 (07:15)</text>
    <rect x="120" y="180" width="130" height="42" fill="#eff6ff" stroke="#bfdbfe"/>
    <text x="185" y="198" text-anchor="middle" fill="#1e40af" font-family="system-ui, sans-serif" font-size="12" font-weight="700">9A1 • Cô Lan</text>
    <text x="185" y="214" text-anchor="middle" fill="#64748b" font-family="system-ui, sans-serif" font-size="10">Phòng 201</text>
    <rect x="254" y="180" width="130" height="42" fill="#f0fdf4" stroke="#bbf7d0"/>
    <text x="319" y="198" text-anchor="middle" fill="#166534" font-family="system-ui, sans-serif" font-size="12" font-weight="700">8A2 • Thầy Minh</text>
    <text x="319" y="214" text-anchor="middle" fill="#64748b" font-family="system-ui, sans-serif" font-size="10">Phòng 104</text>
    <rect x="388" y="180" width="130" height="42" fill="#fefce8" stroke="#fef08a"/>
    <text x="453" y="198" text-anchor="middle" fill="#854d0e" font-family="system-ui, sans-serif" font-size="12" font-weight="700">9A3 • Cô Hương</text>
    <text x="453" y="214" text-anchor="middle" fill="#64748b" font-family="system-ui, sans-serif" font-size="10">Phòng 203</text>
    <rect x="522" y="180" width="130" height="42" fill="#eff6ff" stroke="#bfdbfe"/>
    <text x="587" y="198" text-anchor="middle" fill="#1e40af" font-family="system-ui, sans-serif" font-size="12" font-weight="700">9A2 • Thầy Tuấn</text>
    <text x="587" y="214" text-anchor="middle" fill="#64748b" font-family="system-ui, sans-serif" font-size="10">Phòng 202</text>
    <rect x="656" y="180" width="130" height="42" fill="#fdf4ff" stroke="#f5d0fe"/>
    <text x="721" y="198" text-anchor="middle" fill="#86198f" font-family="system-ui, sans-serif" font-size="12" font-weight="700">8A1 • Cô Thảo</text>
    <text x="721" y="214" text-anchor="middle" fill="#64748b" font-family="system-ui, sans-serif" font-size="10">Phòng 103</text>
    <rect x="790" y="180" width="154" height="42" fill="#f8fafc" stroke="#e2e8f0"/>
    <text x="867" y="206" text-anchor="middle" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="11" font-style="italic">Chào cờ đầu tuần</text>
    <!-- Row 2 -->
    <rect x="16" y="226" width="100" height="42" fill="#f8fafc" stroke="#e2e8f0"/>
    <text x="66" y="251" text-anchor="middle" fill="#334155" font-family="system-ui, sans-serif" font-size="12" font-weight="600">Tiết 2 (08:05)</text>
    <rect x="120" y="226" width="130" height="42" fill="#eff6ff" stroke="#bfdbfe"/>
    <text x="185" y="244" text-anchor="middle" fill="#1e40af" font-family="system-ui, sans-serif" font-size="12" font-weight="700">9A1 • Cô Lan</text>
    <text x="185" y="260" text-anchor="middle" fill="#64748b" font-family="system-ui, sans-serif" font-size="10">Phòng 201</text>
    <rect x="254" y="226" width="130" height="42" fill="#eff6ff" stroke="#bfdbfe"/>
    <text x="319" y="244" text-anchor="middle" fill="#1e40af" font-family="system-ui, sans-serif" font-size="12" font-weight="700">9A3 • Cô Dung</text>
    <text x="319" y="260" text-anchor="middle" fill="#64748b" font-family="system-ui, sans-serif" font-size="10">Phòng 203</text>
    <rect x="388" y="226" width="130" height="42" fill="#f0fdf4" stroke="#bbf7d0"/>
    <text x="453" y="244" text-anchor="middle" fill="#166534" font-family="system-ui, sans-serif" font-size="12" font-weight="700">8A1 • Thầy Minh</text>
    <text x="453" y="260" text-anchor="middle" fill="#64748b" font-family="system-ui, sans-serif" font-size="10">Phòng 103</text>
    <rect x="522" y="226" width="130" height="42" fill="#fefce8" stroke="#fef08a"/>
    <text x="587" y="244" text-anchor="middle" fill="#854d0e" font-family="system-ui, sans-serif" font-size="12" font-weight="700">8A3 • Cô Mai</text>
    <text x="587" y="260" text-anchor="middle" fill="#64748b" font-family="system-ui, sans-serif" font-size="10">Phòng 105</text>
    <rect x="656" y="226" width="130" height="42" fill="#eff6ff" stroke="#bfdbfe"/>
    <text x="721" y="244" text-anchor="middle" fill="#1e40af" font-family="system-ui, sans-serif" font-size="12" font-weight="700">9A2 • Thầy Tuấn</text>
    <text x="721" y="260" text-anchor="middle" fill="#64748b" font-family="system-ui, sans-serif" font-size="10">Phòng 202</text>
    <rect x="790" y="226" width="154" height="42" fill="#fef2f2" stroke="#fecaca"/>
    <text x="867" y="244" text-anchor="middle" fill="#b91c1c" font-family="system-ui, sans-serif" font-size="11" font-weight="700">SH CHUYÊN MÔN</text>
    <text x="867" y="260" text-anchor="middle" fill="#64748b" font-family="system-ui, sans-serif" font-size="10">Phòng Hội đồng</text>
    <text x="35" y="580" fill="#0f172a" font-family="system-ui, sans-serif" font-size="12" font-weight="700">📌 BẢNG THỜI KHÓA BIỂU SÁNG - TIẾT 1 ĐẾN TIẾT 5 (GV CÓ MẶT TRƯỚC 15 PHÚT)</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

// Generates an SVG timetable for Afternoon Session
const createAfternoonTimetableSvg = (deptName: string = 'TỔ TIẾNG ANH', schoolName: string = 'TRƯỜNG THCS NGUYỄN DU') => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 620" width="100%" height="100%">
    <defs>
      <linearGradient id="headerGradA" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#701a75"/>
        <stop offset="50%" stop-color="#4c1d95"/>
        <stop offset="100%" stop-color="#1d4ed8"/>
      </linearGradient>
    </defs>
    <rect width="960" height="620" fill="#fdf4ff" rx="16"/>
    <rect x="8" y="8" width="944" height="604" fill="#ffffff" rx="12" stroke="#f0abfc" stroke-width="2"/>
    <rect x="16" y="16" width="928" height="85" fill="url(#headerGradA)" rx="10"/>
    <text x="35" y="42" fill="#fde047" font-family="system-ui, sans-serif" font-size="13" font-weight="700" letter-spacing="1">${schoolName.toUpperCase()}</text>
    <text x="35" y="72" fill="#ffffff" font-family="system-ui, sans-serif" font-size="20" font-weight="800">TKB GIÁO VIÊN - BUỔI CHIỀU (KHỐI 6, 7) - ${deptName.toUpperCase()}</text>
    <text x="920" y="42" text-anchor="end" fill="#f5d0fe" font-family="system-ui, sans-serif" font-size="12">BUỔI CHIỀU &amp; BỒI DƯỠNG HSG</text>
    <text x="920" y="70" text-anchor="end" fill="#ffffff" font-family="system-ui, sans-serif" font-size="12" font-weight="600">Năm học 2025 - 2026</text>
    <rect x="16" y="112" width="100" height="36" fill="#3b0764" rx="6 0 0 0"/>
    <text x="66" y="135" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-size="12" font-weight="700">TIẾT / BUỔI</text>
    <rect x="120" y="112" width="130" height="36" fill="#9333ea"/>
    <text x="185" y="135" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-size="13" font-weight="700">THỨ HAI</text>
    <rect x="254" y="112" width="130" height="36" fill="#9333ea"/>
    <text x="319" y="135" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-size="13" font-weight="700">THỨ BA</text>
    <rect x="388" y="112" width="130" height="36" fill="#9333ea"/>
    <text x="453" y="135" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-size="13" font-weight="700">THỨ TƯ</text>
    <rect x="522" y="112" width="130" height="36" fill="#9333ea"/>
    <text x="587" y="135" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-size="13" font-weight="700">THỨ NĂM</text>
    <rect x="656" y="112" width="130" height="36" fill="#9333ea"/>
    <text x="721" y="135" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-size="13" font-weight="700">THỨ SÁU</text>
    <rect x="790" y="112" width="154" height="36" fill="#9333ea" rx="0 6 0 0"/>
    <text x="867" y="135" text-anchor="middle" fill="#ffffff" font-family="system-ui, sans-serif" font-size="13" font-weight="700">THỨ BẢY</text>
    <rect x="16" y="152" width="928" height="24" fill="#faf5ff"/>
    <text x="26" y="168" fill="#6b21a8" font-family="system-ui, sans-serif" font-size="11" font-weight="800">🌙 BUỔI CHIỀU (13:15 - 17:00)</text>
    <rect x="16" y="180" width="100" height="42" fill="#faf5ff" stroke="#e9d5ff"/>
    <text x="66" y="205" text-anchor="middle" fill="#581c87" font-family="system-ui, sans-serif" font-size="12" font-weight="600">Tiết 1 (13:15)</text>
    <rect x="120" y="180" width="130" height="42" fill="#fdf4ff" stroke="#f0abfc"/>
    <text x="185" y="198" text-anchor="middle" fill="#86198f" font-family="system-ui, sans-serif" font-size="12" font-weight="700">6A1 • Cô Phương</text>
    <text x="185" y="214" text-anchor="middle" fill="#64748b" font-family="system-ui, sans-serif" font-size="10">Phòng 101</text>
    <rect x="254" y="180" width="130" height="42" fill="#eff6ff" stroke="#bfdbfe"/>
    <text x="319" y="198" text-anchor="middle" fill="#1e40af" font-family="system-ui, sans-serif" font-size="12" font-weight="700">7A1 • Cô Hương</text>
    <text x="319" y="214" text-anchor="middle" fill="#64748b" font-family="system-ui, sans-serif" font-size="10">Phòng 108</text>
    <rect x="388" y="180" width="130" height="42" fill="#f0fdf4" stroke="#bbf7d0"/>
    <text x="453" y="198" text-anchor="middle" fill="#166534" font-family="system-ui, sans-serif" font-size="12" font-weight="700">6A2 • Cô Thảo</text>
    <text x="453" y="214" text-anchor="middle" fill="#64748b" font-family="system-ui, sans-serif" font-size="10">Phòng 102</text>
    <rect x="522" y="180" width="130" height="42" fill="#fefce8" stroke="#fef08a"/>
    <text x="587" y="198" text-anchor="middle" fill="#854d0e" font-family="system-ui, sans-serif" font-size="12" font-weight="700">7A2 • Cô Mai</text>
    <text x="587" y="214" text-anchor="middle" fill="#64748b" font-family="system-ui, sans-serif" font-size="10">Phòng 105</text>
    <rect x="656" y="180" width="130" height="42" fill="#fdf4ff" stroke="#f0abfc"/>
    <text x="721" y="198" text-anchor="middle" fill="#86198f" font-family="system-ui, sans-serif" font-size="12" font-weight="700">6A3 • Cô Lan</text>
    <text x="721" y="214" text-anchor="middle" fill="#64748b" font-family="system-ui, sans-serif" font-size="10">Phòng 104</text>
    <rect x="790" y="180" width="154" height="42" fill="#eff6ff" stroke="#bfdbfe"/>
    <text x="867" y="206" text-anchor="middle" fill="#1e40af" font-family="system-ui, sans-serif" font-size="11" font-weight="700">BỒI DƯỠNG HSG</text>
    <text x="35" y="580" fill="#0f172a" font-family="system-ui, sans-serif" font-size="12" font-weight="700">📌 BẢNG THỜI KHÓA BIỂU CHIỀU - KHỐI 6, 7 &amp; CÁC LỚP BỒI DƯỠNG</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

// Generates sample Excel Timetable data (Sheets with rows)
const createSampleExcelData = (): ParsedExcelSheet[] => {
  return [
    {
      name: 'TKB Buổi Sáng (Khối 8,9)',
      rows: [
        ['TIẾT / BUỔI', 'THỨ HAI', 'THỨ BA', 'THỨ TƯ', 'THỨ NĂM', 'THỨ SÁU', 'THỨ BẢY'],
        ['Tiết 1 (07:15 - 08:00)', '9A1 - Cô Lan (P.201)', '8A2 - Thầy Minh (P.104)', '9A3 - Cô Hương (P.203)', '9A2 - Thầy Tuấn (P.202)', '8A1 - Cô Thảo (P.103)', 'Chào cờ đầu tuần'],
        ['Tiết 2 (08:05 - 08:50)', '9A1 - Cô Lan (P.201)', '9A3 - Cô Dung (P.203)', '8A1 - Thầy Minh (P.103)', '8A3 - Cô Mai (P.105)', '9A2 - Thầy Tuấn (P.202)', 'SH Chuyên môn'],
        ['Tiết 3 (09:10 - 09:55)', '8A3 - Cô Thảo (P.105)', '9A1 - Cô Lan (P.201)', '9A2 - Thầy Tuấn (P.202)', '8A2 - Thầy Minh (P.104)', '9A3 - Cô Hương (P.203)', 'Tự học có GVHD'],
        ['Tiết 4 (10:00 - 10:45)', '8A2 - Thầy Minh (P.104)', '8A1 - Cô Thảo (P.103)', '8A3 - Cô Mai (P.105)', '9A1 - Cô Lan (P.201)', 'Hoạt động trải nghiệm', 'Nghỉ'],
        ['Tiết 5 (10:50 - 11:35)', '9A2 - Thầy Tuấn (P.202)', 'Nghỉ', '9A1 - Cô Lan (P.201)', 'Nghỉ', 'Sinh hoạt lớp cuối tuần', 'Nghỉ'],
      ],
    },
    {
      name: 'TKB Buổi Chiều (Khối 6,7)',
      rows: [
        ['TIẾT / BUỔI', 'THỨ HAI', 'THỨ BA', 'THỨ TƯ', 'THỨ NĂM', 'THỨ SÁU', 'THỨ BẢY'],
        ['Tiết 1 (13:15 - 14:00)', '6A1 - Cô Phương (P.101)', '7A1 - Cô Hương (P.108)', '6A2 - Cô Thảo (P.102)', '7A2 - Cô Mai (P.105)', '6A3 - Cô Lan (P.104)', 'Bồi dưỡng HSG'],
        ['Tiết 2 (14:05 - 14:50)', '6A1 - Cô Phương (P.101)', '6A3 - Cô Lan (P.104)', '7A1 - Cô Hương (P.108)', '6A2 - Cô Thảo (P.102)', '7A2 - Cô Mai (P.105)', 'Bồi dưỡng HSG'],
        ['Tiết 3 (15:10 - 15:55)', '7A2 - Cô Mai (P.105)', '6A2 - Cô Thảo (P.102)', '6A1 - Cô Phương (P.101)', '7A1 - Cô Hương (P.108)', 'CLB Tiếng Anh', 'Nghỉ'],
        ['Tiết 4 (16:00 - 16:45)', '6A3 - Cô Lan (P.104)', '7A2 - Cô Mai (P.105)', 'CLB Kỹ năng', '6A1 - Cô Phương (P.101)', 'Nghỉ', 'Nghỉ'],
      ],
    },
  ];
};

// Generates sample Word Timetable Document HTML
const createSampleWordHtml = (deptName: string = 'TỔ TIẾNG ANH', schoolName: string = 'TRƯỜNG THCS NGUYỄN DU'): string => {
  return `
    <div style="font-family: 'Times New Roman', Times, serif; line-height: 1.6; color: #1e293b;">
      <div style="display: flex; justify-content: space-between; text-align: center; border-bottom: 2px solid #334155; padding-bottom: 12px; margin-bottom: 18px;">
        <div style="width: 48%;">
          <p style="text-transform: uppercase; font-size: 11px; margin: 0; font-weight: bold;">PHÒNG GD&ĐT QUẬN HAI BÀ TRƯNG</p>
          <p style="text-transform: uppercase; font-size: 12px; margin: 2px 0; font-weight: 800;">${schoolName.toUpperCase()}</p>
          <p style="text-transform: uppercase; font-size: 11px; margin: 0; font-weight: bold; color: #1e40af;">${deptName.toUpperCase()}</p>
        </div>
        <div style="width: 48%;">
          <p style="text-transform: uppercase; font-size: 11px; margin: 0; font-weight: bold;">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
          <p style="font-size: 11px; margin: 2px 0; font-weight: bold;">Độc lập - Tự do - Hạnh phúc</p>
          <p style="font-style: italic; font-size: 10px; margin: 4px 0 0 0; color: #64748b;">Hà Nội, ngày 05 tháng 09 năm 2025</p>
        </div>
      </div>

      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="text-transform: uppercase; font-size: 16px; font-weight: 800; margin: 0 0 4px 0; color: #0f172a;">
          KẾ HOẠCH &amp; BẢNG PHÂN CÔNG THỜI KHÓA BIỂU GIẢNG DẠY
        </h2>
        <p style="font-size: 12px; font-weight: 600; margin: 0; color: #4338ca;">
          Học kỳ I - Năm học 2025 - 2026 (Áp dụng từ tuần 01)
        </p>
        <p style="font-size: 11px; font-style: italic; margin: 2px 0 0 0; color: #64748b;">
          (Trích xuất từ file văn bản Word .docx của Tổ chuyên môn)
        </p>
      </div>

      <div style="margin-bottom: 16px;">
        <h4 style="text-transform: uppercase; font-size: 12px; font-weight: bold; border-left: 3px solid #3b82f6; padding-left: 8px; margin: 0 0 8px 0;">
          I. NGUYÊN TẮC THỰC HIỆN THỜI KHÓA BIỂU
        </h4>
        <p style="font-size: 12px; margin: 0 0 6px 0;">
          1. 100% giáo viên trong tổ thực hiện nghiêm túc quy chế chuyên môn, lên lớp đúng giờ, mang đầy đủ giáo án và thiết bị dạy học.
        </p>
        <p style="font-size: 12px; margin: 0 0 6px 0;">
          2. Khi có việc đột xuất cần nghỉ hoặc đổi giờ, phải báo cáo Tổ trưởng trước ít nhất 24 giờ để xếp lịch dạy thay kịp thời.
        </p>
        <p style="font-size: 12px; margin: 0 0 6px 0;">
          3. Chiều thứ Năm hàng tuần dành riêng cho sinh hoạt chuyên môn theo nghiên cứu bài học và bồi dưỡng thường xuyên.
        </p>
      </div>

      <div>
        <h4 style="text-transform: uppercase; font-size: 12px; font-weight: bold; border-left: 3px solid #3b82f6; padding-left: 8px; margin: 0 0 8px 0;">
          II. PHÂN CÔNG PHỤ TRÁCH KHỐI LỚP
        </h4>
        <table style="width: 100%; border-collapse: collapse; font-size: 11px; text-align: left;">
          <thead>
            <tr style="background-color: #f1f5f9; text-transform: uppercase; font-weight: bold;">
              <th style="border: 1px solid #cbd5e1; padding: 6px;">STT</th>
              <th style="border: 1px solid #cbd5e1; padding: 6px;">Họ và tên giáo viên</th>
              <th style="border: 1px solid #cbd5e1; padding: 6px;">Khối phụ trách</th>
              <th style="border: 1px solid #cbd5e1; padding: 6px;">Lớp giảng dạy</th>
              <th style="border: 1px solid #cbd5e1; padding: 6px; text-align: center;">Số tiết/tuần</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center;">1</td>
              <td style="border: 1px solid #cbd5e1; padding: 6px; font-weight: bold;">Nguyễn Thị Mai Lan</td>
              <td style="border: 1px solid #cbd5e1; padding: 6px;">Khối 9</td>
              <td style="border: 1px solid #cbd5e1; padding: 6px;">9A1, 9A2</td>
              <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; font-weight: bold;">16</td>
            </tr>
            <tr>
              <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center;">2</td>
              <td style="border: 1px solid #cbd5e1; padding: 6px; font-weight: bold;">Trần Văn Minh</td>
              <td style="border: 1px solid #cbd5e1; padding: 6px;">Khối 8</td>
              <td style="border: 1px solid #cbd5e1; padding: 6px;">8A1, 8A2</td>
              <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; font-weight: bold;">17</td>
            </tr>
            <tr>
              <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center;">3</td>
              <td style="border: 1px solid #cbd5e1; padding: 6px; font-weight: bold;">Lê Thị Thu Phương</td>
              <td style="border: 1px solid #cbd5e1; padding: 6px;">Khối 6</td>
              <td style="border: 1px solid #cbd5e1; padding: 6px;">6A1, 6A2</td>
              <td style="border: 1px solid #cbd5e1; padding: 6px; text-align: center; font-weight: bold;">17</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
};

export const TeacherScheduleCard: React.FC<TeacherScheduleCardProps> = ({ settings }) => {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const wordInputRef = useRef<HTMLInputElement>(null);
  const excelInputRef = useRef<HTMLInputElement>(null);
  const card3DStageRef = useRef<HTMLDivElement>(null);

  const [images, setImages] = useState<ScheduleItem[]>([]);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [viewMode, setViewMode] = useState<'3d-deck' | 'grid'>('3d-deck');
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [inputUrl, setInputUrl] = useState('');
  const [inputTitle, setInputTitle] = useState('');
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [currentEditTitle, setCurrentEditTitle] = useState('');
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isProcessingFiles, setIsProcessingFiles] = useState(false);

  // Excel View State (for lightbox / detail)
  const [activeSheetIndex, setActiveSheetIndex] = useState<number>(0);
  const [excelSearchTerm, setExcelSearchTerm] = useState<string>('');

  // 3D Tilt interactive state
  const [tiltStyle, setTiltStyle] = useState<React.CSSProperties>({});
  const [glarePosition, setGlarePosition] = useState<{ x: number; y: number; opacity: number }>({ x: 50, y: 50, opacity: 0 });

  // Load from localStorage on mount (with legacy migration support)
  useEffect(() => {
    try {
      const savedImagesJson = localStorage.getItem(STORAGE_KEYS.IMAGES);
      if (savedImagesJson) {
        const parsed = JSON.parse(savedImagesJson);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Normalize items with default 'image' type if undefined
          const normalized: ScheduleItem[] = parsed.map((item) => ({
            ...item,
            type: item.type || 'image',
          }));
          setImages(normalized);
          setActiveIndex(0);
          return;
        }
      }

      // Check legacy single-image key
      const legacyImg = localStorage.getItem(STORAGE_KEYS.LEGACY_IMAGE);
      const legacyTitle = localStorage.getItem(STORAGE_KEYS.LEGACY_TITLE);
      const legacyDate = localStorage.getItem(STORAGE_KEYS.LEGACY_UPDATED_AT);

      if (legacyImg) {
        const migratedItem: ScheduleItem = {
          id: 'legacy-1',
          type: 'image',
          url: legacyImg,
          title: legacyTitle || 'Thời khóa biểu giáo viên',
          createdAt: legacyDate || 'Học kỳ I',
          tag: 'TKB Tổ',
        };
        setImages([migratedItem]);
        localStorage.setItem(STORAGE_KEYS.IMAGES, JSON.stringify([migratedItem]));
      }
    } catch (e) {
      console.error('Failed to load schedule images', e);
    }
  }, []);

  // Save changes to localStorage
  const persistImages = (newImages: ScheduleItem[]) => {
    setImages(newImages);
    try {
      localStorage.setItem(STORAGE_KEYS.IMAGES, JSON.stringify(newImages));
      if (newImages.length > 0) {
        localStorage.setItem(STORAGE_KEYS.LEGACY_IMAGE, newImages[0].url);
        localStorage.setItem(STORAGE_KEYS.LEGACY_TITLE, newImages[0].title);
        localStorage.setItem(STORAGE_KEYS.LEGACY_UPDATED_AT, newImages[0].createdAt);
      } else {
        localStorage.removeItem(STORAGE_KEYS.LEGACY_IMAGE);
        localStorage.removeItem(STORAGE_KEYS.LEGACY_TITLE);
        localStorage.removeItem(STORAGE_KEYS.LEGACY_UPDATED_AT);
      }
    } catch (e) {
      console.error('Failed to persist schedule images', e);
    }
  };

  // Handle 3D Parallax Tilt on Mouse Move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!card3DStageRef.current) return;
    const rect = card3DStageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateX = ((y - centerY) / centerY) * -12; // Max 12deg tilt
    const rotateY = ((x - centerX) / centerX) * 14; // Max 14deg tilt

    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(1.025, 1.025, 1.025)`,
      transition: 'transform 0.08s ease-out',
    });

    const glareX = (x / rect.width) * 100;
    const glareY = (y / rect.height) * 100;
    setGlarePosition({ x: glareX, y: glareY, opacity: 0.28 });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.4s ease-out',
    });
    setGlarePosition((prev) => ({ ...prev, opacity: 0 }));
  };

  // Process multiple file uploads (images, Word, Excel)
  const processFiles = async (fileList: FileList | File[]) => {
    const rawFiles = Array.from(fileList);
    if (rawFiles.length === 0) return;

    setIsProcessingFiles(true);

    const nowStr = new Date().toLocaleDateString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    try {
      const newItems: ScheduleItem[] = [];

      for (let i = 0; i < rawFiles.length; i++) {
        const file = rawFiles[i];
        const parsed = await parseScheduleFile(file);

        let tag = 'Ảnh TKB';
        if (parsed.type === 'excel') tag = 'Bảng tính Excel';
        else if (parsed.type === 'word') tag = 'Văn bản Word';

        newItems.push({
          id: `sch-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
          type: parsed.type,
          url: parsed.dataUrl,
          fileName: parsed.fileName,
          title: parsed.title,
          tag,
          createdAt: nowStr,
          sheetsData: parsed.sheetsData,
          wordHtml: parsed.wordHtml,
          fileSizeStr: parsed.fileSizeStr,
        });
      }

      if (newItems.length > 0) {
        const combined = [...images, ...newItems];
        persistImages(combined);
        setActiveIndex(combined.length - 1);

        const excelCount = newItems.filter((it) => it.type === 'excel').length;
        const wordCount = newItems.filter((it) => it.type === 'word').length;
        const imgCount = newItems.filter((it) => it.type === 'image').length;

        const breakdown = [
          imgCount > 0 ? `${imgCount} ảnh` : null,
          wordCount > 0 ? `${wordCount} tệp Word (.docx)` : null,
          excelCount > 0 ? `${excelCount} tệp Excel (.xlsx)` : null,
        ]
          .filter(Boolean)
          .join(', ');

        toast.success(
          `Đã tải lên thành công ${newItems.length} thời khóa biểu (${breakdown || 'Tệp mới'})!`,
          'Thời khóa biểu giáo viên'
        );
      }
    } catch (err) {
      console.error('Lỗi xử lý file thời khóa biểu:', err);
      toast.error('Có lỗi xảy ra khi đọc tệp. Vui lòng kiểm tra lại!', 'Lỗi tải tệp');
    } finally {
      setIsProcessingFiles(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (wordInputRef.current) wordInputRef.current.value = '';
      if (excelInputRef.current) excelInputRef.current.value = '';
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  };

  // Drag and drop multiple files
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = () => {
    setIsDraggingOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  };

  // Load 3D Comprehensive Sample Pack (Images + Excel + Word)
  const handleLoadSamplePack = () => {
    const dept = settings?.departmentName || 'TỔ TIẾNG ANH';
    const school = settings?.schoolName || 'TRƯỜNG THCS NGUYỄN DU';
    const nowStr = new Date().toLocaleDateString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const morningSvg = createMorningTimetableSvg(dept, school);
    const afternoonSvg = createAfternoonTimetableSvg(dept, school);
    const sampleExcelSheets = createSampleExcelData();
    const sampleWordHtml = createSampleWordHtml(dept, school);

    const samplePack: ScheduleItem[] = [
      {
        id: `sample-morning-${Date.now()}`,
        type: 'image',
        url: morningSvg,
        title: `TKB Sáng - Khối 8,9 (${dept})`,
        tag: 'Buổi Sáng',
        createdAt: nowStr,
        fileSizeStr: '120 KB',
      },
      {
        id: `sample-excel-${Date.now()}`,
        type: 'excel',
        url: morningSvg, // Preview placeholder
        fileName: 'Thoi_khoa_bieu_HocKyI_2025_2026.xlsx',
        title: `Bảng Tính Excel - TKB Toàn Trường (${dept})`,
        tag: 'Bảng tính Excel',
        createdAt: nowStr,
        sheetsData: sampleExcelSheets,
        fileSizeStr: '45.8 KB',
      },
      {
        id: `sample-word-${Date.now()}`,
        type: 'word',
        url: morningSvg,
        fileName: 'Ke_hoach_giang_day_TKB.docx',
        title: `Văn Bản Word - Kế Hoạch & Phân Công TKB`,
        tag: 'Văn bản Word',
        createdAt: nowStr,
        wordHtml: sampleWordHtml,
        fileSizeStr: '32.4 KB',
      },
      {
        id: `sample-afternoon-${Date.now()}`,
        type: 'image',
        url: afternoonSvg,
        title: `TKB Chiều - Khối 6,7 & BD HSG (${dept})`,
        tag: 'Buổi Chiều',
        createdAt: nowStr,
        fileSizeStr: '118 KB',
      },
    ];

    const combined = [...images, ...samplePack];
    persistImages(combined);
    setActiveIndex(combined.length - samplePack.length);
    toast.success('Đã nạp bộ mẫu Thời khóa biểu đa định dạng (Ảnh SVG + File Excel + File Word)!', 'Bộ TKB Mẫu');
  };

  // Add via URL
  const handleSaveUrl = () => {
    if (!inputUrl.trim()) return;
    const nowStr = new Date().toLocaleDateString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const newItem: ScheduleItem = {
      id: `url-${Date.now()}`,
      type: 'image',
      url: inputUrl.trim(),
      title: inputTitle.trim() || `Thời khóa biểu #${images.length + 1}`,
      tag: 'URL Link',
      createdAt: nowStr,
    };

    const updated = [...images, newItem];
    persistImages(updated);
    setActiveIndex(updated.length - 1);
    setInputUrl('');
    setInputTitle('');
    setIsUrlModalOpen(false);
    toast.success('Đã thêm ảnh thời khóa biểu từ URL thành công!', 'Thời khóa biểu');
  };

  // Delete single image
  const handleDeleteImage = (indexToDelete: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    const itemToDelete = images[indexToDelete];
    if (window.confirm(`Bạn có chắc muốn xóa "${itemToDelete?.title || 'mục này'}" khỏi danh sách thời khóa biểu?`)) {
      const filtered = images.filter((_, idx) => idx !== indexToDelete);
      persistImages(filtered);
      if (activeIndex >= filtered.length) {
        setActiveIndex(Math.max(0, filtered.length - 1));
      }
      toast.info('Đã xóa thời khóa biểu.', 'Thời khóa biểu');
    }
  };

  // Delete all images
  const handleDeleteAll = () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tất cả thời khóa biểu giáo viên không?')) {
      persistImages([]);
      setActiveIndex(0);
      toast.info('Đã xóa toàn bộ thời khóa biểu.', 'Thời khóa biểu');
    }
  };

  // Save edited title
  const handleSaveTitle = () => {
    if (currentEditTitle.trim() && images[activeIndex]) {
      const updated = [...images];
      updated[activeIndex] = {
        ...updated[activeIndex],
        title: currentEditTitle.trim(),
      };
      persistImages(updated);
      toast.success('Đã cập nhật tiêu đề thời khóa biểu!', 'Thời khóa biểu');
    }
    setIsEditingTitle(false);
  };

  const openLightboxAt = (idx: number) => {
    setLightboxIndex(idx);
    setZoomLevel(1);
    setActiveSheetIndex(0);
    setExcelSearchTerm('');
    setIsLightboxOpen(true);
  };

  // Keyboard navigation for Lightbox
  const handleLightboxKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isLightboxOpen) return;
      if (e.key === 'ArrowRight') {
        setLightboxIndex((prev) => (prev + 1) % images.length);
        setZoomLevel(1);
        setActiveSheetIndex(0);
      } else if (e.key === 'ArrowLeft') {
        setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
        setZoomLevel(1);
        setActiveSheetIndex(0);
      } else if (e.key === 'Escape') {
        setIsLightboxOpen(false);
      }
    },
    [isLightboxOpen, images.length]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleLightboxKeyDown);
    return () => window.removeEventListener('keydown', handleLightboxKeyDown);
  }, [handleLightboxKeyDown]);

  const activeItem = images[activeIndex];

  // Helper renderers for 3D Cards
  const renderCardVisual = (item: ScheduleItem, isPeek: boolean = false) => {
    if (item.type === 'excel') {
      const firstSheet = item.sheetsData?.[0];
      const previewRows = (firstSheet?.rows || []).slice(0, 6);

      return (
        <div className="w-full h-full bg-slate-900 text-white flex flex-col justify-between p-3 select-none overflow-hidden relative font-sans">
          {/* Subtle Grid Accent Pattern */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:12px_12px]" />

          {/* Top Bar with Excel Badge */}
          <div className="relative z-10 flex items-center justify-between pb-2 border-b border-emerald-500/30">
            <div className="flex items-center gap-1.5">
              <span className="p-1 rounded bg-emerald-600 text-white shadow-xs">
                <FileSpreadsheet className="w-3.5 h-3.5" />
              </span>
              <span className="font-bold text-[11px] text-emerald-400 truncate max-w-[150px]">
                {item.fileName || 'Bảng tính Excel (.xlsx)'}
              </span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-mono">
              {item.sheetsData?.length || 1} Sheet
            </span>
          </div>

          {/* Mini Table Rows Preview */}
          <div className="relative z-10 flex-1 my-1.5 overflow-hidden text-[9px] bg-slate-950/60 rounded-lg p-1.5 border border-slate-800">
            {previewRows.length > 0 ? (
              <table className="w-full text-left border-collapse">
                <tbody>
                  {previewRows.map((r, ri) => (
                    <tr
                      key={ri}
                      className={ri === 0 ? 'bg-emerald-900/40 text-emerald-300 font-bold' : 'border-b border-slate-800/80 text-slate-300'}
                    >
                      {r.slice(0, 4).map((c, ci) => (
                        <td key={ci} className="p-1 truncate max-w-[80px]">
                          {String(c)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400">
                <p>Bảng tính thời khóa biểu Excel</p>
              </div>
            )}
          </div>

          {/* Bottom Footer */}
          <div className="relative z-10 flex items-center justify-between text-[10px] text-slate-400 pt-1">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <Table className="w-3 h-3" />
              <span>{firstSheet?.name || 'Sheet 1'}</span>
            </span>
            <span>{item.fileSizeStr || 'Tệp Excel'}</span>
          </div>
        </div>
      );
    }

    if (item.type === 'word') {
      return (
        <div className="w-full h-full bg-slate-50 text-slate-800 flex flex-col justify-between p-3 select-none overflow-hidden relative font-serif">
          {/* Top Bar with Word Badge */}
          <div className="relative z-10 flex items-center justify-between pb-1.5 border-b border-blue-300 font-sans">
            <div className="flex items-center gap-1.5">
              <span className="p-1 rounded bg-blue-600 text-white shadow-xs">
                <FileText className="w-3.5 h-3.5" />
              </span>
              <span className="font-bold text-[11px] text-blue-900 truncate max-w-[150px]">
                {item.fileName || 'Văn bản Word (.docx)'}
              </span>
            </div>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800 font-bold font-sans">
              DOCX
            </span>
          </div>

          {/* Word Document Excerpt Preview */}
          <div className="relative z-10 flex-1 my-1.5 overflow-hidden text-[9px] bg-white rounded-lg p-2 border border-slate-200 shadow-inner">
            {item.wordHtml ? (
              <div
                className="prose prose-xs max-w-none text-slate-700 leading-tight line-clamp-6 opacity-90 scale-95 origin-top-left"
                dangerouslySetInnerHTML={{ __html: item.wordHtml }}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 font-sans">
                <p>Tệp văn bản thời khóa biểu (Word)</p>
              </div>
            )}
          </div>

          {/* Bottom Footer */}
          <div className="relative z-10 flex items-center justify-between text-[10px] text-slate-500 font-sans pt-1">
            <span className="text-blue-700 font-medium">Văn bản hành chính</span>
            <span>{item.fileSizeStr || 'Tệp Word'}</span>
          </div>
        </div>
      );
    }

    // Default: Image
    return (
      <img
        src={item.url}
        alt={item.title}
        className="w-full h-full object-cover group-hover/active:scale-102 transition duration-500 ease-out"
      />
    );
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-white border border-indigo-100/80 shadow-[0_10px_30px_-10px_rgba(79,70,229,0.14)] p-4 sm:p-5 transition-all duration-300 hover:shadow-[0_16px_36px_-8px_rgba(79,70,229,0.22)] ${
        isDraggingOver ? 'ring-2 ring-indigo-500 bg-indigo-50/40' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* 3D Visual Accent Glows in background */}
      <div className="pointer-events-none absolute -top-16 -right-16 w-44 h-44 bg-gradient-to-br from-indigo-500/15 via-purple-500/10 to-pink-500/0 rounded-full blur-2xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 w-44 h-44 bg-gradient-to-tr from-blue-500/15 via-cyan-500/10 to-indigo-500/0 rounded-full blur-2xl" />

      {/* Hidden File Inputs for All Supported Formats */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,.doc,.docx,.xls,.xlsx,.csv,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />
      <input
        ref={wordInputRef}
        type="file"
        accept=".doc,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />
      <input
        ref={excelInputRef}
        type="file"
        accept=".xls,.xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
        multiple
        className="hidden"
        onChange={handleFileInputChange}
      />

      {/* Header Bar */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-2 pb-2">
        <div className="flex items-center gap-2.5">
          {/* 3D Floating Icon Box */}
          <div className="relative group/box flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 text-white shadow-[0_6px_14px_-2px_rgba(79,70,229,0.45)] transform-gpu transition-all duration-300 hover:rotate-6 hover:scale-105">
            <CalendarDays className="w-4.5 h-4.5" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 ring-2 ring-white" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm tracking-tight transition-all duration-300 hover:text-indigo-600 cursor-pointer">
                Thời khóa biểu giáo viên
              </h4>
              {/* 3D Badge Indicator */}
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-xs">
                <Box className="w-2.5 h-2.5" />
                3D &amp; Đa Định Dạng
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">
              {images.length > 0 ? (
                <span>
                  Đang có <strong className="text-indigo-600 font-bold">{images.length} tệp TKB</strong> (Hỗ trợ Ảnh, Word .docx, Excel .xlsx)
                </span>
              ) : (
                'Thêm TKB bằng ảnh, file Word (.docx) hoặc file Excel (.xlsx)'
              )}
            </p>
          </div>
        </div>

        {/* Action Controls in Header */}
        <div className="flex items-center gap-1.5">
          {images.length > 0 && (
            <>
              {/* View Mode Switcher (3D Coverflow vs Grid) */}
              <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80 text-slate-600 text-[11px]">
                <button
                  onClick={() => setViewMode('3d-deck')}
                  title="Chế độ Lật Thẻ 3D"
                  className={`px-2 py-1 rounded-md font-semibold flex items-center gap-1 transition ${
                    viewMode === '3d-deck'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'hover:text-slate-900 text-slate-500'
                  }`}
                >
                  <Box className="w-3 h-3" />
                  <span className="hidden sm:inline">Lật 3D</span>
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  title="Chế độ Lưới 3D"
                  className={`px-2 py-1 rounded-md font-semibold flex items-center gap-1 transition ${
                    viewMode === 'grid'
                      ? 'bg-white text-indigo-700 shadow-xs'
                      : 'hover:text-slate-900 text-slate-500'
                  }`}
                >
                  <Grid3X3 className="w-3 h-3" />
                  <span className="hidden sm:inline">Lưới</span>
                </button>
              </div>

              {/* Add more files dropdown or button */}
              <button
                onClick={() => fileInputRef.current?.click()}
                title="Thêm tệp thời khóa biểu (Ảnh, Word, Excel)"
                className="px-2.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center gap-1 transition border border-indigo-200/60 shadow-xs active:scale-95"
              >
                <Plus className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Thêm tệp</span>
              </button>

              {/* Clear all images */}
              <button
                onClick={handleDeleteAll}
                title="Xóa tất cả TKB"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {images.length > 0 ? (
        <div className="space-y-3 pt-2">
          {viewMode === '3d-deck' ? (
            /* 3D COVERFLOW / DECK VIEW */
            <div className="space-y-3">
              {/* 3D Interactive Stage */}
              <div
                ref={card3DStageRef}
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                className="relative py-2 px-1 select-none flex items-center justify-center min-h-[230px]"
                style={{ perspective: '1100px' }}
              >
                {/* 3D Stack / Behind Cards Peek Effect */}
                {images.length > 1 && (
                  <>
                    {/* Previous Card Peek */}
                    <div
                      onClick={() => setActiveIndex((prev) => (prev - 1 + images.length) % images.length)}
                      title="Chuyển sang tệp trước"
                      className="absolute left-1 sm:left-4 z-10 w-[78%] aspect-16/10 rounded-2xl bg-slate-800/10 border border-slate-300/60 overflow-hidden cursor-pointer shadow-lg transition-all duration-300 hover:opacity-100 opacity-60 backdrop-blur-2xs"
                      style={{
                        transform: 'perspective(1000px) translateX(-28px) translateZ(-60px) rotateY(18deg) scale(0.88)',
                      }}
                    >
                      {renderCardVisual(images[(activeIndex - 1 + images.length) % images.length], true)}
                      <div className="absolute inset-0 bg-slate-900/30" />
                    </div>

                    {/* Next Card Peek */}
                    <div
                      onClick={() => setActiveIndex((prev) => (prev + 1) % images.length)}
                      title="Chuyển sang tệp tiếp theo"
                      className="absolute right-1 sm:right-4 z-10 w-[78%] aspect-16/10 rounded-2xl bg-slate-800/10 border border-slate-300/60 overflow-hidden cursor-pointer shadow-lg transition-all duration-300 hover:opacity-100 opacity-60 backdrop-blur-2xs"
                      style={{
                        transform: 'perspective(1000px) translateX(28px) translateZ(-60px) rotateY(-18deg) scale(0.88)',
                      }}
                    >
                      {renderCardVisual(images[(activeIndex + 1) % images.length], true)}
                      <div className="absolute inset-0 bg-slate-900/30" />
                    </div>
                  </>
                )}

                {/* Main Active 3D Card */}
                {activeItem && (
                  <div
                    onClick={() => openLightboxAt(activeIndex)}
                    style={tiltStyle}
                    className="relative z-20 w-full max-w-lg aspect-16/10 rounded-2xl overflow-hidden cursor-pointer bg-white border-2 border-indigo-200/90 shadow-[0_20px_35px_-8px_rgba(79,70,229,0.3)] transition-shadow duration-300 group/active"
                  >
                    {renderCardVisual(activeItem)}

                    {/* Dynamic Holographic / Glare Layer */}
                    <div
                      className="pointer-events-none absolute inset-0 transition-opacity duration-150"
                      style={{
                        background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255,255,255,${glarePosition.opacity}), transparent 60%)`,
                      }}
                    />

                    {/* Top 3D floating tag */}
                    <div className="absolute top-2.5 left-2.5 z-30 flex items-center gap-1.5">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold text-white backdrop-blur-md shadow-xs border border-white/20 flex items-center gap-1 ${
                          activeItem.type === 'excel'
                            ? 'bg-emerald-700/85'
                            : activeItem.type === 'word'
                            ? 'bg-blue-700/85'
                            : 'bg-slate-950/75'
                        }`}
                      >
                        {activeItem.type === 'excel' && <FileSpreadsheet className="w-2.5 h-2.5" />}
                        {activeItem.type === 'word' && <FileText className="w-2.5 h-2.5" />}
                        {activeItem.type === 'image' && <ImageIcon className="w-2.5 h-2.5" />}
                        <span>{activeItem.tag || (activeItem.type === 'excel' ? 'Excel .xlsx' : activeItem.type === 'word' ? 'Word .docx' : 'Ảnh')}</span>
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-indigo-600/85 text-white backdrop-blur-md shadow-xs">
                        {activeIndex + 1} / {images.length}
                      </span>
                    </div>

                    {/* Hover Overlay with Action Prompt */}
                    <div className="absolute inset-0 bg-slate-950/45 opacity-0 group-hover/active:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center text-white p-3 backdrop-blur-2xs z-30">
                      <div className="p-2.5 bg-white/20 rounded-full mb-1.5 shadow-md">
                        <Maximize2 className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-bold tracking-wide">
                        {activeItem.type === 'excel'
                          ? 'Mở xem bảng tính Excel toàn màn hình'
                          : activeItem.type === 'word'
                          ? 'Mở xem văn bản Word toàn màn hình'
                          : 'Nhấn để phóng to toàn màn hình'}
                      </span>
                      <span className="text-[10px] text-white/80 mt-0.5">
                        Hỗ trợ chuyển đổi, tra cứu, in ấn &amp; tải tệp gốc về máy
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* 3D Deck Navigation Toolbar */}
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setActiveIndex((prev) => (prev - 1 + images.length) % images.length)}
                    className="p-1.5 rounded-xl bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 font-bold transition shadow-xs active:translate-y-0.5"
                    title="Mục trước (Phím mũi tên trái)"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  {/* Thumbnail Dots / Badges */}
                  <div className="flex items-center gap-1.5 max-w-[200px] overflow-x-auto py-1">
                    {images.map((item, idx) => (
                      <button
                        key={item.id}
                        onClick={() => setActiveIndex(idx)}
                        className={`h-2.5 rounded-full transition-all duration-200 flex items-center justify-center ${
                          idx === activeIndex
                            ? 'w-7 bg-indigo-600 shadow-xs'
                            : item.type === 'excel'
                            ? 'w-2.5 bg-emerald-300 hover:bg-emerald-400'
                            : item.type === 'word'
                            ? 'w-2.5 bg-blue-300 hover:bg-blue-400'
                            : 'w-2.5 bg-slate-300 hover:bg-slate-400'
                        }`}
                        title={`${item.title} (${item.type})`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={() => setActiveIndex((prev) => (prev + 1) % images.length)}
                    className="p-1.5 rounded-xl bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 font-bold transition shadow-xs active:translate-y-0.5"
                    title="Mục sau (Phím mũi tên phải)"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-1 text-[11px]">
                  <button
                    onClick={() => openLightboxAt(activeIndex)}
                    className="px-2 py-1 rounded-lg text-indigo-700 hover:bg-indigo-50 font-bold flex items-center gap-1 transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Xem lớn</span>
                  </button>

                  <button
                    onClick={(e) => handleDeleteImage(activeIndex, e)}
                    className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                    title="Xóa mục này"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* 3D GRID VIEW */
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1">
              {images.map((item, idx) => (
                <div
                  key={item.id}
                  onClick={() => openLightboxAt(idx)}
                  className={`group relative rounded-xl overflow-hidden border cursor-pointer aspect-16/10 bg-slate-100 shadow-xs transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 ${
                    idx === activeIndex
                      ? 'border-indigo-500 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  {renderCardVisual(item)}

                  {/* Format Indicator Badge */}
                  <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-slate-900/75 text-white backdrop-blur-xs flex items-center gap-1">
                    {item.type === 'excel' ? 'XLSX' : item.type === 'word' ? 'DOCX' : 'IMG'}
                  </div>

                  <div className="absolute inset-x-0 bottom-0 p-1.5 bg-gradient-to-t from-slate-950/85 to-transparent text-white">
                    <p className="text-[10px] font-semibold truncate">{item.title}</p>
                  </div>

                  <button
                    onClick={(e) => handleDeleteImage(idx, e)}
                    className="absolute top-1.5 right-1.5 p-1 rounded-md bg-rose-600/80 hover:bg-rose-600 text-white opacity-0 group-hover:opacity-100 transition shadow-xs"
                    title="Xóa mục này"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Active Item Metadata & Quick Edit Title */}
          {activeItem && (
            <div className="bg-slate-50/90 rounded-xl p-2.5 border border-slate-200/70 text-xs space-y-1">
              <div className="flex items-center justify-between">
                {isEditingTitle ? (
                  <div className="flex items-center gap-1.5 w-full">
                    <input
                      type="text"
                      value={currentEditTitle}
                      onChange={(e) => setCurrentEditTitle(e.target.value)}
                      placeholder="Nhập tên thời khóa biểu..."
                      className="flex-1 px-2 py-0.5 text-xs rounded border border-indigo-300 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      autoFocus
                    />
                    <button
                      onClick={handleSaveTitle}
                      className="px-2 py-0.5 bg-indigo-600 text-white rounded text-[11px] font-medium"
                    >
                      Lưu
                    </button>
                    <button
                      onClick={() => setIsEditingTitle(false)}
                      className="px-1.5 py-0.5 text-slate-500 hover:text-slate-700 text-[11px]"
                    >
                      Hủy
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between w-full">
                    <span
                      className="font-semibold text-slate-800 truncate flex items-center gap-1.5 cursor-pointer hover:text-indigo-600"
                      title="Bấm để chỉnh sửa tên"
                      onClick={() => {
                        setCurrentEditTitle(activeItem.title);
                        setIsEditingTitle(true);
                      }}
                    >
                      <span className="truncate">{activeItem.title}</span>
                      <FileEdit className="w-3 h-3 text-slate-400 opacity-70 hover:opacity-100 shrink-0" />
                    </span>
                    <span
                      className={`shrink-0 text-[10px] px-1.5 py-0.5 rounded-md font-semibold ${
                        activeItem.type === 'excel'
                          ? 'bg-emerald-100 text-emerald-800'
                          : activeItem.type === 'word'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      {activeItem.tag || 'TKB Tổ'}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                <span>Cập nhật: {activeItem.createdAt}</span>
                <span className="text-slate-400">
                  {images.length > 1 ? `Hiển thị ${activeIndex + 1}/${images.length}` : 'Đã lưu cục bộ'}
                </span>
              </div>
            </div>
          )}

          {/* Quick upload bar for more formats */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 mr-1">Thêm tệp:</span>
            <button
              onClick={() => wordInputRef.current?.click()}
              className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-[11px] font-bold flex items-center gap-1 transition"
            >
              <FileText className="w-3 h-3" />
              <span>Thêm Word (.docx)</span>
            </button>
            <button
              onClick={() => excelInputRef.current?.click()}
              className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[11px] font-bold flex items-center gap-1 transition"
            >
              <FileSpreadsheet className="w-3 h-3" />
              <span>Thêm Excel (.xlsx)</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold flex items-center gap-1 transition"
            >
              <ImageIcon className="w-3 h-3" />
              <span>Thêm ảnh</span>
            </button>
          </div>
        </div>
      ) : (
        /* Empty State & Multi-upload Dropzone */
        <div
          onClick={() => fileInputRef.current?.click()}
          className="group cursor-pointer border-2 border-dashed border-indigo-200 hover:border-indigo-500 rounded-2xl p-5 text-center transition-all duration-300 bg-gradient-to-b from-indigo-50/30 to-purple-50/20 hover:bg-indigo-50/60 space-y-3"
        >
          {/* 3D floating icon in empty state */}
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 text-white mx-auto flex items-center justify-center shadow-[0_8px_18px_-4px_rgba(79,70,229,0.4)] group-hover:scale-110 group-hover:rotate-3 transition duration-300">
            <Upload className="w-6 h-6" />
          </div>

          <div>
            <p className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition">
              Đưa thời khóa biểu giáo viên lên (Hỗ trợ Ảnh, Word &amp; Excel)
            </p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
              Kéo thả các tệp vào đây hoặc chọn: Ảnh (PNG, JPG), file Word (.docx, .doc), file Excel (.xlsx, .xls)
            </p>
          </div>

          {/* Action buttons inside empty state */}
          <div
            className="flex flex-wrap items-center justify-center gap-2 pt-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-[0_4px_12px_rgba(79,70,229,0.3)] transition active:scale-95 cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Chọn nhiều tệp</span>
            </button>

            <button
              onClick={() => wordInputRef.current?.click()}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Tệp Word (.docx)</span>
            </button>

            <button
              onClick={() => excelInputRef.current?.click()}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition active:scale-95 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Tệp Excel (.xlsx)</span>
            </button>

            <button
              onClick={() => setIsUrlModalOpen(true)}
              className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 transition"
            >
              <span>Chèn URL</span>
            </button>
          </div>

          <div className="pt-2 border-t border-indigo-100" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={handleLoadSamplePack}
              className="text-[11px] text-indigo-600 hover:text-indigo-800 font-bold hover:underline flex items-center justify-center gap-1.5 mx-auto"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              <span>Nạp ngay bộ TKB mẫu đa định dạng (Ảnh SVG + File Excel + File Word)</span>
            </button>
          </div>
        </div>
      )}

      {/* URL Insertion Modal */}
      {isUrlModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-indigo-600" />
                Chèn liên kết ảnh thời khóa biểu
              </h3>
              <button
                onClick={() => setIsUrlModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Tiêu đề (tùy chọn):
                </label>
                <input
                  type="text"
                  value={inputTitle}
                  onChange={(e) => setInputTitle(e.target.value)}
                  placeholder="Ví dụ: TKB Buổi Sáng - Áp dụng từ tuần 5"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Đường dẫn URL:
                </label>
                <input
                  type="url"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://example.com/thoi-khoa-bieu.png"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setIsUrlModalOpen(false)}
                className="px-3 py-1.5 rounded-xl text-xs text-slate-600 hover:bg-slate-100 font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveUrl}
                disabled={!inputUrl.trim()}
                className="px-3.5 py-1.5 rounded-xl text-xs bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold transition shadow-xs"
              >
                Thêm vào danh sách
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Fullscreen 3D Lightbox & Interactive Reader Modal */}
      {isLightboxOpen && images.length > 0 && images[lightboxIndex] && (
        <div className="fixed inset-0 z-50 bg-slate-950/92 backdrop-blur-md flex flex-col items-center justify-between p-3 sm:p-5 animate-in fade-in duration-200">
          {/* Top Control Bar */}
          <div className="w-full max-w-6xl flex items-center justify-between text-white pb-3 px-2 border-b border-white/10">
            <div className="flex items-center gap-2.5 truncate">
              <div
                className={`p-1.5 rounded-lg border text-white ${
                  images[lightboxIndex]?.type === 'excel'
                    ? 'bg-emerald-600/40 border-emerald-400/40 text-emerald-300'
                    : images[lightboxIndex]?.type === 'word'
                    ? 'bg-blue-600/40 border-blue-400/40 text-blue-300'
                    : 'bg-indigo-600/40 border-indigo-400/30 text-indigo-300'
                }`}
              >
                {images[lightboxIndex]?.type === 'excel' ? (
                  <FileSpreadsheet className="w-4.5 h-4.5" />
                ) : images[lightboxIndex]?.type === 'word' ? (
                  <FileText className="w-4.5 h-4.5" />
                ) : (
                  <Box className="w-4.5 h-4.5" />
                )}
              </div>
              <div className="truncate">
                <h3 className="font-bold text-sm truncate flex items-center gap-2">
                  <span>{images[lightboxIndex]?.title}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-white/15 text-slate-300 font-mono">
                    {lightboxIndex + 1} / {images.length}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-md font-bold uppercase ${
                      images[lightboxIndex]?.type === 'excel'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : images[lightboxIndex]?.type === 'word'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                    }`}
                  >
                    {images[lightboxIndex]?.type}
                  </span>
                </h3>
                <p className="text-[11px] text-slate-400">
                  {settings?.departmentName} • {settings?.schoolName} • {images[lightboxIndex]?.createdAt}
                </p>
              </div>
            </div>

            {/* Toolbar Buttons */}
            <div className="flex items-center gap-2">
              {/* Zoom controls for Image view */}
              {images[lightboxIndex]?.type === 'image' && (
                <div className="flex items-center bg-white/10 rounded-xl p-1 border border-white/10">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(0.6, z - 0.2))}
                    title="Thu nhỏ (-)"
                    className="p-1.5 hover:bg-white/15 rounded text-white transition"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-[11px] font-mono px-2 text-slate-300">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.2))}
                    title="Phóng to (+)"
                    className="p-1.5 hover:bg-white/15 rounded text-white transition"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setZoomLevel(1)}
                    title="Đặt lại kích thước"
                    className="p-1.5 hover:bg-white/15 rounded text-white transition border-l border-white/10 ml-1"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Download original file or image */}
              <a
                href={images[lightboxIndex]?.url}
                download={images[lightboxIndex]?.fileName || `${images[lightboxIndex]?.title.replace(/\s+/g, '_')}.png`}
                className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-xl transition border border-white/10 flex items-center gap-1.5 text-xs font-semibold"
                title="Tải tệp này về máy tính"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Tải về</span>
              </a>

              {/* Close Button */}
              <button
                onClick={() => {
                  setIsLightboxOpen(false);
                  setZoomLevel(1);
                }}
                className="p-2 bg-rose-600/80 hover:bg-rose-600 text-white rounded-xl transition cursor-pointer"
                title="Đóng (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Central Modal Content Area */}
          <div className="relative w-full max-w-6xl flex-1 my-3 bg-slate-900/60 rounded-2xl border border-white/10 overflow-hidden flex items-center justify-center p-2 sm:p-4 select-none">
            {/* Left arrow */}
            {images.length > 1 && (
              <button
                onClick={() => {
                  setLightboxIndex((prev) => (prev - 1 + images.length) % images.length);
                  setZoomLevel(1);
                  setActiveSheetIndex(0);
                }}
                className="absolute left-3 z-30 p-2.5 rounded-full bg-black/60 hover:bg-indigo-600 text-white transition backdrop-blur-sm border border-white/20 shadow-lg active:scale-95 cursor-pointer"
                title="Tệp trước (Mũi tên trái)"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}

            {/* Content Display: Excel vs Word vs Image */}
            <div className="w-full h-full flex items-center justify-center overflow-auto p-1 sm:p-3 select-auto">
              {images[lightboxIndex]?.type === 'excel' ? (
                /* EXCEL SPREADSHEET VIEWER */
                <div className="w-full h-full max-h-[74vh] bg-white text-slate-800 rounded-xl shadow-2xl flex flex-col overflow-hidden border border-slate-300">
                  {/* Excel Sheet Navigation Bar & Search */}
                  <div className="bg-slate-100 px-4 py-2.5 border-b border-slate-300 flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 overflow-x-auto max-w-md">
                      <span className="text-xs font-bold text-slate-600 mr-1 flex items-center gap-1">
                        <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                        Trang tính:
                      </span>
                      {(images[lightboxIndex]?.sheetsData || [{ name: 'Sheet 1', rows: [] }]).map((sheet, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => setActiveSheetIndex(sIdx)}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                            sIdx === activeSheetIndex
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-white text-slate-700 hover:bg-slate-200 border border-slate-200'
                          }`}
                        >
                          {sheet.name}
                        </button>
                      ))}
                    </div>

                    <div className="relative w-48 sm:w-64">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
                      <input
                        type="text"
                        placeholder="Tìm lớp, giáo viên, phòng..."
                        value={excelSearchTerm}
                        onChange={(e) => setExcelSearchTerm(e.target.value)}
                        className="w-full pl-8 pr-2.5 py-1 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 bg-white"
                      />
                    </div>
                  </div>

                  {/* Excel Table Data */}
                  <div className="flex-1 overflow-auto p-4 text-xs">
                    {(() => {
                      const curSheet = images[lightboxIndex]?.sheetsData?.[activeSheetIndex] || images[lightboxIndex]?.sheetsData?.[0];
                      if (!curSheet || !curSheet.rows || curSheet.rows.length === 0) {
                        return (
                          <div className="py-12 text-center text-slate-400">
                            <Table className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>Không có dữ liệu trong trang tính này.</p>
                          </div>
                        );
                      }

                      const filteredRows = excelSearchTerm
                        ? curSheet.rows.filter((row, idx) =>
                            idx === 0 || row.some((cell) => String(cell).toLowerCase().includes(excelSearchTerm.toLowerCase()))
                          )
                        : curSheet.rows;

                      return (
                        <table className="w-full text-left border-collapse border border-slate-300">
                          <thead>
                            {filteredRows.slice(0, 1).map((headRow, hIdx) => (
                              <tr key={hIdx} className="bg-emerald-50 text-emerald-950 font-bold uppercase text-[11px]">
                                <th className="p-2 border border-slate-300 w-10 text-center">STT</th>
                                {headRow.map((cell, cIdx) => (
                                  <th key={cIdx} className="p-2 border border-slate-300">
                                    {String(cell)}
                                  </th>
                                ))}
                              </tr>
                            ))}
                          </thead>
                          <tbody>
                            {filteredRows.slice(1).map((row, rIdx) => (
                              <tr
                                key={rIdx}
                                className={rIdx % 2 === 0 ? 'bg-white hover:bg-slate-50' : 'bg-slate-50/70 hover:bg-slate-100'}
                              >
                                <td className="p-2 border border-slate-300 text-center font-mono text-[10px] text-slate-500">
                                  {rIdx + 1}
                                </td>
                                {row.map((cell, cIdx) => (
                                  <td
                                    key={cIdx}
                                    className={`p-2 border border-slate-300 ${
                                      cIdx === 0 ? 'font-semibold text-slate-900' : 'text-slate-700'
                                    }`}
                                  >
                                    {String(cell)}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      );
                    })()}
                  </div>
                </div>
              ) : images[lightboxIndex]?.type === 'word' ? (
                /* WORD DOCUMENT VIEWER */
                <div className="w-full h-full max-h-[74vh] bg-white text-slate-800 rounded-xl shadow-2xl flex flex-col overflow-hidden border border-slate-300">
                  <div className="bg-slate-100 px-4 py-2 border-b border-slate-300 flex items-center justify-between">
                    <span className="font-bold text-xs text-blue-900 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-blue-600" />
                      Văn bản Thời khóa biểu Word (.docx)
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {images[lightboxIndex]?.fileName || 'Tài liệu hành chính'}
                    </span>
                  </div>

                  <div className="flex-1 overflow-auto p-6 sm:p-8 font-serif bg-slate-50/50">
                    <div className="max-w-3xl mx-auto bg-white p-6 sm:p-8 rounded-lg shadow-sm border border-slate-200">
                      {images[lightboxIndex]?.wordHtml ? (
                        <div
                          className="prose prose-sm max-w-none text-slate-800"
                          dangerouslySetInnerHTML={{ __html: images[lightboxIndex].wordHtml || '' }}
                        />
                      ) : (
                        <div className="py-12 text-center text-slate-500">
                          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p>Nội dung văn bản Word đã được lưu trữ an toàn.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                /* IMAGE VIEWER */
                <img
                  src={images[lightboxIndex]?.url}
                  alt={images[lightboxIndex]?.title}
                  style={{ transform: `scale(${zoomLevel})`, transition: 'transform 0.15s ease-out' }}
                  className="max-h-[72vh] w-auto max-w-full object-contain rounded-lg shadow-2xl select-none"
                />
              )}
            </div>

            {/* Right arrow */}
            {images.length > 1 && (
              <button
                onClick={() => {
                  setLightboxIndex((prev) => (prev + 1) % images.length);
                  setZoomLevel(1);
                  setActiveSheetIndex(0);
                }}
                className="absolute right-3 z-30 p-2.5 rounded-full bg-black/60 hover:bg-indigo-600 text-white transition backdrop-blur-sm border border-white/20 shadow-lg active:scale-95 cursor-pointer"
                title="Tệp sau (Mũi tên phải)"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Bottom Thumbnail Navigation Strip */}
          {images.length > 1 && (
            <div className="w-full max-w-4xl flex items-center justify-center gap-2 overflow-x-auto py-1 px-2">
              {images.map((item, idx) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setLightboxIndex(idx);
                    setZoomLevel(1);
                    setActiveSheetIndex(0);
                  }}
                  className={`relative shrink-0 w-16 h-11 rounded-lg overflow-hidden border-2 transition-all duration-200 cursor-pointer ${
                    idx === lightboxIndex
                      ? 'border-indigo-400 ring-2 ring-indigo-400/50 scale-105 shadow-md'
                      : 'border-white/20 opacity-60 hover:opacity-100'
                  }`}
                  title={`${item.title} (${item.type})`}
                >
                  {item.type === 'excel' ? (
                    <div className="w-full h-full bg-emerald-950 text-emerald-300 flex flex-col items-center justify-center text-[8px] font-bold">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                      <span>XLSX</span>
                    </div>
                  ) : item.type === 'word' ? (
                    <div className="w-full h-full bg-blue-950 text-blue-300 flex flex-col items-center justify-center text-[8px] font-bold">
                      <FileText className="w-4 h-4 text-blue-400" />
                      <span>DOCX</span>
                    </div>
                  ) : (
                    <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
                  )}
                  <span className="absolute bottom-0 inset-x-0 bg-black/70 text-[8px] text-white text-center font-mono">
                    #{idx + 1}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
