import React from 'react';
import {
  School,
  Users,
  Printer,
  Settings,
  RotateCcw,
  Download,
  Upload,
  HardDrive,
  Crown,
  UserCheck,
  Inbox,
  Send,
  Lock,
  Mail,
} from 'lucide-react';
import { DepartmentSetting, Teacher } from '../types';
import { User } from 'firebase/auth';
import { useAuthRole } from '../context/AuthRoleContext';
import { useToast } from '../context/ToastContext';

interface HeaderProps {
  settings: DepartmentSetting;
  onUpdateSettings: (settings: DepartmentSetting) => void;
  onResetData: () => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenOfficialPrint: () => void;
  currentUser?: User | null;
  onOpenDriveTab?: () => void;
  onOpenRequestsModal?: () => void;
  pendingRequestsCount?: number;
  teachers?: Teacher[];
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onUpdateSettings,
  onResetData,
  onExportData,
  onImportData,
  onOpenOfficialPrint,
  currentUser,
  onOpenDriveTab,
  onOpenRequestsModal,
  pendingRequestsCount = 0,
  teachers = [],
}) => {
  const { role, isHead, isMember, userEmail, displayName, photoURL } = useAuthRole();
  const toast = useToast();

  const [isEditingSettings, setIsEditingSettings] = React.useState(false);
  const [tempSettings, setTempSettings] = React.useState(settings);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Sync temp settings when prop changes
  React.useEffect(() => {
    setTempSettings(settings);
  }, [settings]);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isHead) {
      toast.warning('Chỉ Tổ trưởng mới có quyền lưu thay đổi cấu hình tổ chuyên môn.', 'Không đủ quyền');
      return;
    }
    onUpdateSettings(tempSettings);
    setIsEditingSettings(false);
  };

  const handleConfigClick = () => {
    if (!isHead) {
      toast.info(
        'Bạn đang ở vai trò Tổ viên (Chỉ xem). Chỉ Tổ trưởng mới có quyền chỉnh sửa cấu hình hệ thống.',
        'Quyền hạn Tổ viên'
      );
      return;
    }
    setIsEditingSettings(true);
  };

  const handleResetClick = () => {
    if (!isHead) {
      toast.warning(
        'Chỉ Tổ trưởng mới có quyền khôi phục dữ liệu ban đầu của tổ.',
        'Quyền hạn Tổ viên'
      );
      return;
    }
    onResetData();
  };

  const handleImportClick = () => {
    if (!isHead) {
      toast.warning(
        'Chỉ Tổ trưởng mới có quyền nhập và khôi phục dữ liệu hệ thống từ file sao lưu.',
        'Quyền hạn Tổ viên'
      );
      return;
    }
    fileInputRef.current?.click();
  };

  return (
    <header className="bg-gradient-to-r from-blue-900 via-indigo-900 to-sky-900 text-white shadow-lg border-b border-indigo-700/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          {/* Logo & School Title */}
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300 shadow-inner shrink-0">
              <School className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold tracking-wider uppercase text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  {settings.districtCity}
                </span>
                <span className="text-xs text-indigo-200">
                  Năm học {settings.schoolYear} • {settings.semester}
                </span>

                {/* Google Auth Role Indicator Pill in Header */}
                <div
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold shadow-xs ${
                    isHead
                      ? 'bg-amber-400 text-slate-900 border border-amber-300'
                      : 'bg-sky-400 text-slate-900 border border-sky-300'
                  }`}
                  title={`Phân quyền Google Auth: ${isHead ? 'Tổ trưởng (Toàn quyền)' : 'Tổ viên (Xem & Gửi yêu cầu)'}`}
                >
                  {isHead ? <Crown className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />}
                  <span>{isHead ? 'Tổ trưởng' : 'Tổ viên'}</span>
                </div>
              </div>

              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white mt-0.5 flex flex-wrap items-center gap-2">
                {settings.schoolName}
                <span className="text-indigo-300 font-normal">|</span>
                <span className="text-amber-300">{settings.departmentName}</span>
              </h1>

              <div className="flex flex-wrap items-center gap-3 text-xs text-indigo-200 mt-0.5">
                <span className="flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-sky-300" />
                  Cơ cấu định biên: <strong className="text-white">10 giáo viên</strong> (1 TT • 1 TP • 8 TV)
                </span>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-200">
                  <Mail className="w-3 h-3 text-amber-300" />
                  Tài khoản Google: <strong className="text-white font-mono text-[11px]">{userEmail || 'Chưa đăng nhập'}</strong>
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Quick Requests Modal trigger */}
            {onOpenRequestsModal && (
              <button
                onClick={onOpenRequestsModal}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition active:scale-95 ${
                  isHead
                    ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold'
                    : 'bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold'
                }`}
                title={isHead ? 'Xem danh sách yêu cầu từ tổ viên' : 'Gửi yêu cầu hoặc đề xuất tới Tổ trưởng'}
              >
                {isHead ? <Inbox className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                <span>{isHead ? 'Duyệt Yêu Cầu' : 'Gửi Yêu Cầu'}</span>
                {pendingRequestsCount > 0 && isHead && (
                  <span className="px-1.5 py-0.2 rounded-full bg-slate-900 text-white text-[10px] font-bold">
                    {pendingRequestsCount}
                  </span>
                )}
              </button>
            )}

            {onOpenDriveTab && (
              <button
                onClick={onOpenDriveTab}
                className={`px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition active:scale-95 ${
                  currentUser
                    ? 'bg-blue-600 hover:bg-blue-500 text-white border border-blue-400/40'
                    : 'bg-white/10 hover:bg-white/20 text-sky-200 hover:text-white border border-white/20'
                }`}
                title={
                  currentUser
                    ? `Google Drive: Đã kết nối (${currentUser.email})`
                    : 'Kết nối Google Drive để lưu trữ hồ sơ'
                }
              >
                <HardDrive className="w-4 h-4 text-sky-300" />
                <span>
                  {currentUser
                    ? `Drive: ${currentUser.displayName?.split(' ')[0] || 'Đã kết nối'}`
                    : 'Google Drive'}
                </span>
              </button>
            )}

            <button
              onClick={onOpenOfficialPrint}
              className="px-3.5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition active:scale-95"
              title="In mẫu văn bản hành chính A4"
            >
              <Printer className="w-4 h-4" />
              <span>In Báo Cáo</span>
            </button>

            {/* Config button: gated for Tổ trưởng */}
            <button
              onClick={handleConfigClick}
              className={`px-3 py-2 rounded-lg text-xs font-medium flex items-center gap-1.5 border transition ${
                isHead
                  ? 'bg-white/10 hover:bg-white/20 text-white border-white/15'
                  : 'bg-white/5 text-slate-400 border-white/10 cursor-pointer'
              }`}
              title={
                isHead
                  ? 'Tùy chỉnh thông tin tổ và năm học'
                  : 'Chỉ Tổ trưởng mới có quyền tùy chỉnh thông tin tổ'
              }
            >
              {isHead ? <Settings className="w-4 h-4 text-sky-200" /> : <Lock className="w-3.5 h-3.5 text-slate-400" />}
              <span>Cấu hình Tổ</span>
            </button>

            <div className="relative inline-flex items-center">
              <input
                type="file"
                ref={fileInputRef}
                onChange={onImportData}
                accept=".json"
                className="hidden"
              />
              <button
                onClick={handleImportClick}
                className={`p-2 rounded-lg transition ${
                  isHead
                    ? 'bg-white/10 hover:bg-white/20 text-indigo-200 hover:text-white'
                    : 'bg-white/5 text-slate-400'
                }`}
                title={
                  isHead
                    ? 'Nhập dữ liệu sao lưu (JSON)'
                    : 'Chỉ Tổ trưởng mới có quyền nhập dữ liệu sao lưu'
                }
              >
                <Upload className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={onExportData}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-indigo-200 hover:text-white transition"
              title="Sao lưu dữ liệu ra file JSON"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={handleResetClick}
              className={`p-2 rounded-lg transition border ${
                isHead
                  ? 'bg-red-500/20 hover:bg-red-500/30 text-red-200 hover:text-red-100 border-red-400/20'
                  : 'bg-white/5 text-slate-400 border-white/10'
              }`}
              title={
                isHead
                  ? 'Khôi phục dữ liệu chuẩn ban đầu'
                  : 'Chỉ Tổ trưởng mới có quyền khôi phục dữ liệu gốc'
              }
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Edit Settings Modal */}
      {isEditingSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full text-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-slate-900 px-6 py-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Settings className="w-5 h-5 text-amber-400" />
                Cấu Hình Tổ Chuyên Môn
              </h3>
              <button
                onClick={() => setIsEditingSettings(false)}
                className="text-slate-400 hover:text-white text-xl font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveSettings} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Tên trường học
                </label>
                <input
                  type="text"
                  value={tempSettings.schoolName}
                  onChange={(e) => setTempSettings({ ...tempSettings, schoolName: e.target.value })}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Cơ quan quản lý / Địa phương
                </label>
                <input
                  type="text"
                  value={tempSettings.districtCity}
                  onChange={(e) => setTempSettings({ ...tempSettings, districtCity: e.target.value })}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Tên tổ chuyên môn
                  </label>
                  <input
                    type="text"
                    value={tempSettings.departmentName}
                    onChange={(e) => setTempSettings({ ...tempSettings, departmentName: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="VD: TỔ TIẾNG ANH"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Năm học
                  </label>
                  <input
                    type="text"
                    value={tempSettings.schoolYear}
                    onChange={(e) => setTempSettings({ ...tempSettings, schoolYear: e.target.value })}
                    className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="2025 - 2026"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Học kỳ hiện tại
                </label>
                <select
                  value={tempSettings.semester}
                  onChange={(e) => setTempSettings({ ...tempSettings, semester: e.target.value as 'Học kỳ I' | 'Học kỳ II' })}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="Học kỳ I">Học kỳ I</option>
                  <option value="Học kỳ II">Học kỳ II</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Email Google Auth của Tổ trưởng (Toàn quyền)
                </label>
                <input
                  type="email"
                  value={tempSettings.headOfDepartmentEmail || ''}
                  onChange={(e) => setTempSettings({ ...tempSettings, headOfDepartmentEmail: e.target.value })}
                  className="w-full px-3 py-2 text-sm border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                  placeholder="VD: hung.nguyen@thcsnguyendu.edu.vn hoặc bdteacher@gmail.com"
                />
                <p className="text-[11px] text-slate-500 mt-1">
                  Tài khoản Google có email trùng khớp với email này sẽ tự động nhận quyền <strong>Tổ trưởng (Toàn quyền)</strong>. Các tài khoản khác sẽ có quyền <strong>Tổ viên (Chỉ xem và gửi yêu cầu)</strong>.
                </p>
              </div>

              <div className="bg-sky-50 border border-sky-200 rounded-lg p-3 text-xs text-sky-800">
                💡 <strong>Quy chuẩn cơ cấu:</strong> Tổ chuyên môn hiện quản lý 10 giáo viên. Số lượng và chức danh phân công chuẩn: 1 Tổ trưởng, 1 Tổ phó và 8 Tổ viên.
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingSettings(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                >
                  Lưu thay đổi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </header>
  );
};
