import React, { useState } from 'react';
import {
  ShieldCheck,
  UserCheck,
  Send,
  Inbox,
  LogOut,
  Sparkles,
  ChevronDown,
  Info,
  Lock,
  RefreshCw,
  Crown,
  User as UserIcon,
} from 'lucide-react';
import { useAuthRole } from '../context/AuthRoleContext';
import { Teacher, DepartmentRequest } from '../types';
import { GoogleSignInButton } from './GoogleSignInButton';

interface RolePermissionBannerProps {
  teachers: Teacher[];
  pendingRequestsCount: number;
  onOpenRequestsModal: () => void;
}

export const RolePermissionBanner: React.FC<RolePermissionBannerProps> = ({
  teachers,
  pendingRequestsCount,
  onOpenRequestsModal,
}) => {
  const {
    currentUser,
    userEmail,
    displayName,
    role,
    isHead,
    isMember,
    roleOverride,
    setRoleOverride,
    signInWithGoogle,
    signOut,
    simulateTeacherLogin,
    isSigningIn,
  } = useAuthRole();

  const [showTeacherPicker, setShowTeacherPicker] = useState(false);

  return (
    <div className="mb-6 rounded-2xl bg-white border border-slate-200 shadow-xs overflow-hidden">
      <div
        className={`px-4 sm:px-6 py-3.5 border-b flex flex-col md:flex-row md:items-center md:justify-between gap-3 ${
          isHead
            ? 'bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-blue-500/10 border-amber-200/80'
            : 'bg-gradient-to-r from-sky-500/10 via-indigo-500/10 to-slate-500/10 border-sky-200/80'
        }`}
      >
        {/* Left: Role Info */}
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-xs ${
              isHead
                ? 'bg-amber-500 text-white shadow-amber-200'
                : 'bg-blue-600 text-white shadow-blue-200'
            }`}
          >
            {isHead ? <Crown className="w-5 h-5" /> : <UserCheck className="w-5 h-5" />}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                  isHead
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-sky-100 text-sky-900 border border-sky-300'
                }`}
              >
                {isHead ? '👑 Tổ trưởng (Toàn quyền)' : '👤 Tổ viên (Chỉ xem & Gửi yêu cầu)'}
              </span>

              {roleOverride && (
                <span className="text-[11px] px-2 py-0.5 rounded bg-purple-100 text-purple-800 font-medium">
                  Đang giả lập kiểm thử
                </span>
              )}

              <span className="text-xs text-slate-500">
                Xác thực qua: <strong className="font-semibold text-slate-800 font-mono text-[11px]">{userEmail || 'Khách truy cập'}</strong>
              </span>
            </div>

            <p className="text-xs text-slate-600 mt-0.5">
              {isHead ? (
                <span>
                  Đang thao tác với tư cách <strong>{displayName}</strong>. Có toàn quyền quản trị, thêm/sửa/xóa biên bản, ký duyệt KHBĐ, xếp lịch dạy thay và phê duyệt yêu cầu của tổ viên.
                </span>
              ) : (
                <span>
                  Đang thao tác với tư cách <strong>{displayName}</strong>. Chế độ xem dữ liệu chuyên môn và gửi yêu cầu (xin dạy thay, duyệt giáo án, ý kiến sinh hoạt) trực tiếp tới Tổ trưởng.
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Right: Quick Role Switcher & Action buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* Quick Request action */}
          {isHead ? (
            <button
              onClick={onOpenRequestsModal}
              className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition active:scale-95"
            >
              <Inbox className="w-4 h-4" />
              <span>Hộp Thư Yêu Cầu</span>
              {pendingRequestsCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-white text-amber-900 text-[10px] font-bold">
                  {pendingRequestsCount} chờ
                </span>
              )}
            </button>
          ) : (
            <button
              onClick={onOpenRequestsModal}
              className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Gửi Yêu Cầu Tới Tổ Trưởng</span>
            </button>
          )}

          {/* Role Toggle Switcher for immediate testing */}
          <div className="bg-white/80 p-0.5 rounded-xl border border-slate-300 flex items-center shadow-2xs">
            <button
              onClick={() => setRoleOverride('Tổ trưởng')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                isHead
                  ? 'bg-amber-500 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Chuyển sang vai trò Tổ trưởng (Toàn quyền)"
            >
              Tổ trưởng
            </button>
            <button
              onClick={() => setRoleOverride('Tổ viên')}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                isMember
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Chuyển sang vai trò Tổ viên (Chỉ xem và gửi yêu cầu)"
            >
              Tổ viên
            </button>
          </div>

          {/* Google Auth Button or Logout */}
          {currentUser ? (
            <button
              onClick={signOut}
              className="px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-medium flex items-center gap-1 transition"
              title="Đăng xuất tài khoản Google"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500" />
              <span>Đăng xuất</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5">
              <GoogleSignInButton
                onClick={signInWithGoogle}
                isLoading={isSigningIn}
                text="Đăng nhập Google"
                className="scale-90 origin-right"
              />
            </div>
          )}

          {/* Quick Teacher simulator dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowTeacherPicker(!showTeacherPicker)}
              className="p-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 text-xs font-medium flex items-center gap-1"
              title="Chọn nhanh tài khoản giáo viên mẫu trong tổ"
            >
              <UserIcon className="w-3.5 h-3.5 text-slate-500" />
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {showTeacherPicker && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-slate-200 p-2 z-40 text-xs">
                <div className="px-2 py-1 font-bold text-slate-700 border-b border-slate-100 mb-1">
                  Chọn giáo viên mẫu kiểm thử:
                </div>
                <div className="max-h-60 overflow-y-auto space-y-1">
                  {teachers.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => {
                        simulateTeacherLogin(t);
                        setShowTeacherPicker(false);
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-lg hover:bg-slate-100 flex items-center justify-between text-slate-700"
                    >
                      <div className="truncate">
                        <div className="font-semibold truncate">{t.fullName}</div>
                        <div className="text-[10px] text-slate-400 truncate">{t.email}</div>
                      </div>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-bold shrink-0 ${
                          t.role === 'Tổ trưởng'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {t.role}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
