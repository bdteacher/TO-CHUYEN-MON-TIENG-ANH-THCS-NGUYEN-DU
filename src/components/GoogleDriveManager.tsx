import React, { useState, useEffect, useRef } from 'react';
import {
  Folder,
  FileText,
  Upload,
  Plus,
  RefreshCw,
  Search,
  ExternalLink,
  Trash2,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
  FileCode,
  FileCheck,
  ChevronRight,
  Database,
  ArrowLeft,
  Sparkles,
  LogOut,
  Download,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { useToast } from '../context/ToastContext';
import { GoogleSignInButton } from './GoogleSignInButton';
import { googleSignIn, logout, getAccessToken } from '../utils/googleAuth';
import {
  listDriveFiles,
  createDriveFolder,
  uploadFileToDrive,
  uploadJsonBackupToDrive,
  downloadDriveFileContent,
  deleteDriveFile,
  formatBytes,
  DriveFileItem,
} from '../utils/googleDriveService';
import {
  DepartmentSetting,
  Teacher,
  MeetingMinute,
  LessonObservation,
  SubstituteTeaching,
  LessonPlanReview,
} from '../types';

interface GoogleDriveManagerProps {
  settings: DepartmentSetting;
  teachers: Teacher[];
  meetings: MeetingMinute[];
  observations: LessonObservation[];
  substitutes: SubstituteTeaching[];
  lessonPlans: LessonPlanReview[];
  onRestoreData?: (backupData: any) => void;
  currentUser: User | null;
  onUserChange: (user: User | null) => void;
}

interface BreadcrumbItem {
  id?: string;
  name: string;
}

export const GoogleDriveManager: React.FC<GoogleDriveManagerProps> = ({
  settings,
  teachers,
  meetings,
  observations,
  substitutes,
  lessonPlans,
  onRestoreData,
  currentUser,
  onUserChange,
}) => {
  const toast = useToast();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Files state
  const [files, setFiles] = useState<DriveFileItem[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([
    { name: 'Google Drive của tôi' },
  ]);

  // Modals & Action States
  const [isNewFolderOpen, setIsNewFolderOpen] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgressText, setUploadProgressText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Backup & Restore states
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [backupSuccessMessage, setBackupSuccessMessage] = useState<string | null>(null);

  // Destructive delete confirmation modal (MANDATORY per Workspace guidelines)
  const [itemToDelete, setItemToDelete] = useState<DriveFileItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Restore confirmation modal
  const [itemToRestore, setItemToRestore] = useState<DriveFileItem | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  const currentFolderId = breadcrumbs[breadcrumbs.length - 1].id;

  // Fetch files when user is authenticated or folder / filter changes
  useEffect(() => {
    if (currentUser) {
      loadFiles();
    }
  }, [currentUser, currentFolderId, typeFilter]);

  const loadFiles = async () => {
    setIsLoadingFiles(true);
    setAuthError(null);
    try {
      const res = await listDriveFiles({
        folderId: currentFolderId,
        searchTerm: searchTerm.trim() || undefined,
        mimeTypeFilter: typeFilter !== 'all' ? typeFilter : undefined,
      });
      setFiles(res.files || []);
    } catch (err: any) {
      console.error('Lỗi nạp file từ Drive:', err);
      setAuthError(err.message || 'Không thể tải danh sách tệp từ Google Drive.');
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleLogin = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      const result = await googleSignIn();
      if (result) {
        onUserChange(result.user);
      }
    } catch (err: any) {
      console.error('Đăng nhập thất bại:', err);
      setAuthError(err.message || 'Đăng nhập Google Drive thất bại.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    onUserChange(null);
    setFiles([]);
    setBreadcrumbs([{ name: 'Google Drive của tôi' }]);
  };

  const handleNavigateFolder = (folder: DriveFileItem) => {
    setBreadcrumbs((prev) => [...prev, { id: folder.id, name: folder.name }]);
    setSearchTerm('');
  };

  const handleNavigateBreadcrumb = (index: number) => {
    setBreadcrumbs((prev) => prev.slice(0, index + 1));
    setSearchTerm('');
  };

  const handleCreateFolder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;

    setIsCreatingFolder(true);
    try {
      await createDriveFolder(newFolderName.trim(), currentFolderId);
      toast.success(`Đã tạo thư mục "${newFolderName.trim()}" trên Google Drive!`, 'Google Drive');
      setNewFolderName('');
      setIsNewFolderOpen(false);
      await loadFiles();
    } catch (err: any) {
      toast.error(`Lỗi tạo thư mục: ${err.message}`, 'Google Drive');
    } finally {
      setIsCreatingFolder(false);
    }
  };

  // One-click structure setup
  const handleSetupStandardFolders = async () => {
    if (
      !confirm(
        'Bạn có muốn tự động tạo bộ 5 thư mục chuẩn cho Tổ Chuyên Môn THCS Nguyễn Du trên Google Drive không?\n- 01_KeHoachBaiDay_KHBD\n- 02_BienBan_SinhHoatTo\n- 03_PhieuDuGio_ThaoGiang\n- 04_ChuyenDe_BoiDuong\n- 05_SaoLuu_HeThong'
      )
    ) {
      return;
    }

    setIsLoadingFiles(true);
    try {
      // 1. Create main department folder
      const parentFolder = await createDriveFolder(
        `HoSo_ToChuyenMon_${settings.schoolName.replace(/\s+/g, '')}`,
        currentFolderId
      );

      // 2. Create subfolders
      const subFolders = [
        '01_KeHoachBaiDay_KHBD',
        '02_BienBan_SinhHoatTo',
        '03_PhieuDuGio_ThaoGiang',
        '04_ChuyenDe_BoiDuong',
        '05_SaoLuu_HeThong',
      ];

      for (const name of subFolders) {
        await createDriveFolder(name, parentFolder.id);
      }

      toast.success('Đã khởi tạo thành công cấu trúc thư mục Tổ Chuyên Môn trên Google Drive!', 'Khởi tạo thư mục');
      await loadFiles();
    } catch (err: any) {
      toast.error(`Lỗi khởi tạo thư mục: ${err.message}`, 'Khởi tạo thư mục');
    } finally {
      setIsLoadingFiles(false);
    }
  };

  // Upload file
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgressText(`Đang tải lên "${file.name}"...`);
    try {
      await uploadFileToDrive(file, currentFolderId);
      toast.success(`Tải lên tệp "${file.name}" thành công!`, 'Google Drive');
      setUploadProgressText('');
      await loadFiles();
    } catch (err: any) {
      toast.error(`Lỗi tải lên: ${err.message}`, 'Google Drive');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Backup whole department state to Google Drive
  const handleBackupToDrive = async () => {
    setIsBackingUp(true);
    setBackupSuccessMessage(null);
    try {
      const backupData = {
        settings,
        teachers,
        meetings,
        observations,
        substitutes,
        lessonPlans,
        exportDate: new Date().toISOString(),
        version: '1.0',
        author: currentUser?.displayName || 'Tổ trưởng chuyên môn',
      };

      const dateStr = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `SaoLuu_ToChuyenMon_${settings.schoolName.replace(/\s+/g, '')}_${dateStr.slice(0, 10)}.json`;

      const result = await uploadJsonBackupToDrive(
        filename,
        JSON.stringify(backupData, null, 2),
        currentFolderId
      );

      toast.success(`Đã sao lưu toàn bộ dữ liệu tổ chuyên môn lên Google Drive! (${result.name})`, 'Sao lưu Drive');
      setBackupSuccessMessage(`Đã sao lưu thành công tệp "${result.name}" lên Google Drive!`);
      setTimeout(() => setBackupSuccessMessage(null), 5000);
      await loadFiles();
    } catch (err: any) {
      toast.error(`Lỗi sao lưu lên Drive: ${err.message}`, 'Sao lưu Drive');
    } finally {
      setIsBackingUp(false);
    }
  };

  // Restore from Drive backup file
  const handleConfirmRestore = async () => {
    if (!itemToRestore) return;
    setIsRestoring(true);
    try {
      const jsonText = await downloadDriveFileContent(itemToRestore.id);
      const parsed = JSON.parse(jsonText);

      if (onRestoreData) {
        onRestoreData(parsed);
      } else {
        // Direct local storage reload fallback
        if (parsed.teachers) localStorage.setItem('teachers', JSON.stringify(parsed.teachers));
        if (parsed.settings) localStorage.setItem('department_settings', JSON.stringify(parsed.settings));
        if (parsed.meetings) localStorage.setItem('meetings', JSON.stringify(parsed.meetings));
        if (parsed.observations) localStorage.setItem('observations', JSON.stringify(parsed.observations));
        if (parsed.substitutes) localStorage.setItem('substitutes', JSON.stringify(parsed.substitutes));
        if (parsed.lessonPlans) localStorage.setItem('lesson_plans', JSON.stringify(parsed.lessonPlans));
        window.location.reload();
      }

      toast.success(`Đã khôi phục dữ liệu thành công từ tệp "${itemToRestore.name}"!`, 'Phục hồi dữ liệu');
      setItemToRestore(null);
    } catch (err: any) {
      toast.error(`Lỗi khôi phục dữ liệu: ${err.message}`, 'Phục hồi dữ liệu');
    } finally {
      setIsRestoring(false);
    }
  };

  // Delete file with mandatory confirmation dialog
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await deleteDriveFile(itemToDelete.id);
      toast.success(`Đã xóa tệp "${itemToDelete.name}" khỏi Google Drive!`, 'Xóa tệp Drive');
      setItemToDelete(null);
      await loadFiles();
    } catch (err: any) {
      toast.error(`Lỗi xóa tệp: ${err.message}`, 'Xóa tệp Drive');
    } finally {
      setIsDeleting(false);
    }
  };

  const getFileIcon = (file: DriveFileItem) => {
    if (file.mimeType === 'application/vnd.google-apps.folder') {
      return <Folder className="w-6 h-6 text-amber-500 fill-amber-100" />;
    }
    if (file.mimeType === 'application/vnd.google-apps.document' || file.name.endsWith('.docx')) {
      return <FileText className="w-6 h-6 text-blue-600" />;
    }
    if (file.mimeType === 'application/vnd.google-apps.spreadsheet' || file.name.endsWith('.xlsx')) {
      return <FileSpreadsheet className="w-6 h-6 text-emerald-600" />;
    }
    if (file.mimeType === 'application/vnd.google-apps.presentation' || file.name.endsWith('.pptx')) {
      return <FileText className="w-6 h-6 text-amber-600" />;
    }
    if (file.mimeType === 'application/pdf' || file.name.endsWith('.pdf')) {
      return <FileCheck className="w-6 h-6 text-rose-600" />;
    }
    if (file.name.endsWith('.json')) {
      return <FileCode className="w-6 h-6 text-purple-600" />;
    }
    return <FileText className="w-6 h-6 text-slate-500" />;
  };

  // If user is not signed in to Google Drive
  if (!currentUser) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Banner */}
        <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 p-8 text-white">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-amber-300 text-xs font-semibold mb-3 border border-white/20">
              <HardDrive className="w-3.5 h-3.5" />
              Tích Hợp Google Drive Tổ Chuyên Môn
            </div>
            <h2 className="text-2xl font-bold tracking-tight">
              Lưu Trữ & Đồng Bộ Hồ Sơ Tổ Chuyên Môn Trên Google Drive
            </h2>
            <p className="mt-2 text-indigo-100 text-sm leading-relaxed">
              Kết nối trực tiếp tài khoản Google Drive để quản trị hồ sơ kế hoạch bài dạy (KHBD),
              biên bản họp tổ, tài liệu sinh hoạt chuyên đề, đề cương kiểm tra và sao lưu an toàn
              dữ liệu 10 giáo viên theo đúng chuẩn Bộ GD&ĐT.
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-8 max-w-2xl mx-auto text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner">
              <HardDrive className="w-10 h-10" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Đăng nhập để liên kết Google Drive
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Ứng dụng sẽ yêu cầu quyền truy cập Google Drive với sự cho phép của bạn để đọc, tải lên
              và sao lưu các tệp hồ sơ công tác chuyên môn.
            </p>
          </div>

          {authError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{authError}</span>
            </div>
          )}

          <div className="pt-2 flex justify-center">
            <GoogleSignInButton
              onClick={handleLogin}
              isLoading={isSigningIn}
              text="Đăng nhập với Google Drive"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 text-left border-t border-slate-100">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 transition-all duration-300 hover:shadow-sm hover:border-blue-200">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs mb-2">
                1
              </div>
              <h4 className="font-semibold text-xs text-slate-800 transition-all duration-300 ease-in-out px-2 py-0.5 -mx-2 -my-0.5 rounded-md hover:bg-white hover:shadow-xs hover:text-blue-700 inline-block cursor-pointer">
                Kho Kế Hoạch Bài Dạy
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Lưu trữ giáo án Tiếng Anh 4 khối 6, 7, 8, 9 của 10 giáo viên trực tiếp trên Drive.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 transition-all duration-300 hover:shadow-sm hover:border-emerald-200">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-bold text-xs mb-2">
                2
              </div>
              <h4 className="font-semibold text-xs text-slate-800 transition-all duration-300 ease-in-out px-2 py-0.5 -mx-2 -my-0.5 rounded-md hover:bg-white hover:shadow-xs hover:text-emerald-700 inline-block cursor-pointer">
                Sao Lưu Toàn Bộ Dữ Liệu
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Sao lưu phân công, biên bản, dự giờ thành file JSON lên Drive chỉ với 1 click.
              </p>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 transition-all duration-300 hover:shadow-sm hover:border-amber-200">
              <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-bold text-xs mb-2">
                3
              </div>
              <h4 className="font-semibold text-xs text-slate-800 transition-all duration-300 ease-in-out px-2 py-0.5 -mx-2 -my-0.5 rounded-md hover:bg-white hover:shadow-xs hover:text-amber-700 inline-block cursor-pointer">
                An Toàn & Bảo Mật
              </h4>
              <p className="text-[11px] text-slate-500 mt-1">
                Token xác thực được lưu trên bộ nhớ tạm thời, xác nhận rõ ràng trước mọi thao tác xóa.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // When signed in to Google Drive
  return (
    <div className="space-y-6">
      {/* Top Banner with User Profile & Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            {currentUser.photoURL ? (
              <img
                src={currentUser.photoURL}
                alt={currentUser.displayName || 'Google User'}
                className="w-12 h-12 rounded-full border-2 border-indigo-200 shadow-sm"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                {(currentUser.displayName || currentUser.email || 'G')[0].toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-base">
                  {currentUser.displayName || 'Tài khoản Google'}
                </h3>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Đã liên kết Drive
                </span>
              </div>
              <p className="text-xs text-slate-500">{currentUser.email}</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleBackupToDrive}
              disabled={isBackingUp}
              className="px-3.5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition active:scale-95 disabled:opacity-50"
              title="Sao lưu phân công, giáo viên, biên bản và KHBD lên Google Drive"
            >
              <Database className="w-4 h-4 text-indigo-200" />
              <span>{isBackingUp ? 'Đang sao lưu...' : 'Sao Lưu Dữ Liệu Lên Drive'}</span>
            </button>

            <button
              onClick={handleSetupStandardFolders}
              className="px-3 py-2 rounded-lg bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-medium flex items-center gap-1.5 border border-sky-200 transition"
              title="Tạo sẵn 5 thư mục chuẩn của Tổ trên Google Drive"
            >
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span>Khởi Tạo 5 Thư Mục Chuẩn</span>
            </button>

            <button
              onClick={() => setIsNewFolderOpen(true)}
              className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition"
            >
              <Plus className="w-4 h-4" />
              <span>Thư mục mới</span>
            </button>

            <div className="relative inline-block">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium flex items-center gap-1.5 transition disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                <span>{isUploading ? 'Đang tải...' : 'Tải tệp lên'}</span>
              </button>
            </div>

            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
              title="Đăng xuất tài khoản Google"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Backup success alert */}
        {backupSuccessMessage && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{backupSuccessMessage}</span>
          </div>
        )}

        {/* Upload status */}
        {isUploading && (
          <div className="mt-4 p-3 bg-sky-50 border border-sky-200 rounded-xl text-xs text-sky-800 flex items-center gap-2 animate-pulse">
            <RefreshCw className="w-4 h-4 text-sky-600 animate-spin" />
            <span>{uploadProgressText}</span>
          </div>
        )}
      </div>

      {/* Explorer Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Navigation Breadcrumbs & Filter Bar */}
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Breadcrumbs */}
          <div className="flex items-center space-x-1.5 text-xs text-slate-600 overflow-x-auto py-1">
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={crumb.id || 'root'}>
                {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />}
                <button
                  onClick={() => handleNavigateBreadcrumb(idx)}
                  className={`px-2 py-1 rounded-md font-medium transition hover:bg-white hover:shadow-xs ${
                    idx === breadcrumbs.length - 1
                      ? 'text-indigo-600 font-bold bg-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {idx === 0 && <HardDrive className="w-3.5 h-3.5 inline mr-1 text-slate-400" />}
                  {crumb.name}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* Search & Type filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Tìm tệp hoặc thư mục..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && loadFiles()}
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-44 sm:w-56"
              />
            </div>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="text-xs bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="all">Tất cả định dạng</option>
              <option value="folder">Chỉ Thư mục</option>
              <option value="document">Tài liệu (Docs / PDF / Word)</option>
              <option value="spreadsheet">Bảng tính (Sheets / Excel)</option>
              <option value="presentation">Trình chiếu (Slides / PPT)</option>
            </select>

            <button
              onClick={loadFiles}
              disabled={isLoadingFiles}
              className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
              title="Làm mới danh sách"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Files & Folders List */}
        <div className="overflow-x-auto">
          {isLoadingFiles ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <RefreshCw className="w-8 h-8 mx-auto animate-spin text-indigo-500" />
              <p className="text-xs">Đang tải danh sách tệp từ Google Drive...</p>
            </div>
          ) : files.length === 0 ? (
            <div className="py-16 text-center text-slate-400 space-y-3">
              <Folder className="w-12 h-12 mx-auto text-slate-300" />
              <p className="text-sm font-medium text-slate-600">Thư mục trống</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Chưa có tệp nào trong thư mục này. Bạn có thể bấm "Tải tệp lên" hoặc "Khởi Tạo 5 Thư
                Mục Chuẩn".
              </p>
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 uppercase font-semibold border-b border-slate-200">
                  <th className="px-4 py-3 w-12 text-center">STT</th>
                  <th className="px-4 py-3">Tên Tệp / Thư Mục</th>
                  <th className="px-4 py-3 w-36">Cập Nhật</th>
                  <th className="px-4 py-3 w-28 text-right">Dung Lượng</th>
                  <th className="px-4 py-3 w-36 text-center">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {files.map((file, idx) => {
                  const isFolder = file.mimeType === 'application/vnd.google-apps.folder';
                  const isJsonBackup = file.name.endsWith('.json');

                  return (
                    <tr
                      key={file.id}
                      className="hover:bg-indigo-50/40 transition group"
                    >
                      <td className="px-4 py-3 text-center text-slate-400 font-mono">
                        {idx + 1}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">{getFileIcon(file)}</div>
                          <div className="min-w-0">
                            {isFolder ? (
                              <button
                                onClick={() => handleNavigateFolder(file)}
                                className="font-semibold text-slate-900 hover:text-indigo-600 text-left truncate block max-w-md group-hover:underline cursor-pointer"
                              >
                                {file.name}
                              </button>
                            ) : (
                              <div className="flex items-center gap-2">
                                <a
                                  href={file.webViewLink || '#'}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="font-medium text-slate-800 hover:text-indigo-600 truncate max-w-md"
                                >
                                  {file.name}
                                </a>
                                {isJsonBackup && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-100 text-purple-700 font-medium border border-purple-200">
                                    Bản sao lưu
                                  </span>
                                )}
                              </div>
                            )}
                            <span className="text-[11px] text-slate-400 block truncate">
                              {file.owners?.[0]?.displayName ? `Chủ sở hữu: ${file.owners[0].displayName}` : ''}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                        {file.modifiedTime
                          ? new Date(file.modifiedTime).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : '-'}
                      </td>

                      <td className="px-4 py-3 text-right text-slate-500 font-mono whitespace-nowrap">
                        {isFolder ? 'Thư mục' : formatBytes(file.size)}
                      </td>

                      <td className="px-4 py-3 text-center whitespace-nowrap">
                        <div className="inline-flex items-center space-x-1.5">
                          {isJsonBackup && (
                            <button
                              onClick={() => setItemToRestore(file)}
                              className="px-2 py-1 rounded bg-purple-50 hover:bg-purple-100 text-purple-700 text-[11px] font-medium border border-purple-200 flex items-center gap-1 transition"
                              title="Khôi phục dữ liệu toàn bộ tổ từ tệp này"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>Khôi phục</span>
                            </button>
                          )}

                          {file.webViewLink && (
                            <a
                              href={file.webViewLink}
                              target="_blank"
                              rel="noreferrer"
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition"
                              title="Mở trên Google Drive"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}

                          {/* Delete button (triggers explicit confirmation modal) */}
                          <button
                            onClick={() => setItemToDelete(file)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition"
                            title="Xóa tệp khỏi Google Drive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* New Folder Modal */}
      {isNewFolderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <h3 className="font-bold text-base text-slate-900 flex items-center gap-2">
              <Folder className="w-5 h-5 text-indigo-600" />
              Tạo Thư Mục Mới
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Nhập tên thư mục muốn tạo trong "{breadcrumbs[breadcrumbs.length - 1].name}"
            </p>

            <form onSubmit={handleCreateFolder} className="mt-4 space-y-4">
              <input
                type="text"
                autoFocus
                placeholder="Ví dụ: 01_KeHoachBaiDay_HK1"
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                required
              />

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewFolderOpen(false)}
                  className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={isCreatingFolder}
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs disabled:opacity-50"
                >
                  {isCreatingFolder ? 'Đang tạo...' : 'Tạo thư mục'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mandatory Explicit Confirmation Dialog for File Deletion */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="font-bold text-base text-slate-900">
              Xác Nhận Xóa Tệp Trên Google Drive
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Bạn có chắc chắn muốn xóa{' '}
              <strong className="text-slate-900">"{itemToDelete.name}"</strong> khỏi Google Drive
              không? Thao tác này sẽ xóa tệp vĩnh viễn và không thể hoàn tác.
            </p>

            <div className="flex justify-end gap-2.5 mt-6">
              <button
                type="button"
                onClick={() => setItemToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
              >
                {isDeleting ? 'Đang xóa...' : 'Xác nhận xóa tệp'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Restoring Data from Backup */}
      {itemToRestore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
              <RefreshCw className="w-6 h-6" />
            </div>

            <h3 className="font-bold text-base text-slate-900">
              Khôi Phục Dữ Liệu Từ Google Drive
            </h3>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Dữ liệu hiện tại của tổ (danh sách giáo viên, lịch dạy bù, biên bản, KHBD) sẽ được ghi
              đè bằng dữ liệu lưu trong tệp sao lưu{' '}
              <strong className="text-slate-900">"{itemToRestore.name}"</strong>.
            </p>

            <div className="flex justify-end gap-2.5 mt-6">
              <button
                type="button"
                onClick={() => setItemToRestore(null)}
                disabled={isRestoring}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition"
              >
                Hủy bỏ
              </button>
              <button
                type="button"
                onClick={handleConfirmRestore}
                disabled={isRestoring}
                className="px-4 py-2 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
              >
                {isRestoring ? 'Đang nạp...' : 'Xác nhận khôi phục'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
