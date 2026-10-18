import React, { useState, useRef } from 'react';
import {
  Upload,
  Camera,
  X,
  Check,
  Image as ImageIcon,
  Link as LinkIcon,
  Sparkles,
  Trash2,
  User,
} from 'lucide-react';
import { Teacher } from '../types';
import { useToast } from '../context/ToastContext';

interface AvatarUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: Teacher | null;
  onSaveAvatar: (teacherId: string, avatarUrl: string | undefined) => void;
}

// Curated teacher preset avatars (SVG data URLs / pedagogical avatar styles)
const TEACHER_AVATAR_PRESETS = [
  {
    id: 'preset-male-1',
    gender: 'Nam',
    label: 'Thầy giáo (Âu phục xanh)',
    url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'preset-male-2',
    gender: 'Nam',
    label: 'Thầy giáo (Sơ mi trắng lịch lãm)',
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'preset-male-3',
    gender: 'Nam',
    label: 'Thầy giáo (Kính cận sư phạm)',
    url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'preset-male-4',
    gender: 'Nam',
    label: 'Thầy giáo (Âu phục xám trang trọng)',
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'preset-female-1',
    gender: 'Nữ',
    label: 'Cô giáo (Áo dài truyền thống)',
    url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'preset-female-2',
    gender: 'Nữ',
    label: 'Cô giáo (Âu phục công sở xanh)',
    url: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'preset-female-3',
    gender: 'Nữ',
    label: 'Cô giáo (Nụ cười thân thiện)',
    url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
  },
  {
    id: 'preset-female-4',
    gender: 'Nữ',
    label: 'Cô giáo (Kính sư phạm thanh lịch)',
    url: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&w=400&q=80',
  },
];

export const AvatarUploadModal: React.FC<AvatarUploadModalProps> = ({
  isOpen,
  onClose,
  teacher,
  onSaveAvatar,
}) => {
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'presets'>('upload');
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(teacher?.avatarUrl);
  const [urlInput, setUrlInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);

  React.useEffect(() => {
    if (teacher) {
      setPreviewUrl(teacher.avatarUrl);
      setUrlInput(teacher.avatarUrl || '');
    }
  }, [teacher]);

  if (!isOpen || !teacher) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.warning('Vui lòng chọn một tệp hình ảnh (JPG, PNG, WebP).', 'Định dạng không đúng');
      return;
    }

    // Limit to 5MB
    if (file.size > 5 * 1024 * 1024) {
      toast.warning('Dung lượng ảnh tối đa là 5MB để đảm bảo tốc độ tải.', 'Tệp quá lớn');
      return;
    }

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPreviewUrl(dataUrl);
      setIsProcessing(false);
      toast.success('Đã tải ảnh lên thành công. Bấm "Lưu Ảnh Đại Diện" để áp dụng!', 'Tải ảnh');
    };
    reader.onerror = () => {
      setIsProcessing(false);
      toast.error('Lỗi khi đọc file ảnh. Vui lòng thử lại!', 'Lỗi tệp');
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = () => {
    if (!urlInput.trim()) {
      toast.warning('Vui lòng nhập đường link ảnh hợp lệ.', 'Chưa nhập URL');
      return;
    }
    setPreviewUrl(urlInput.trim());
    toast.success('Đã áp dụng link ảnh xem trước!', 'Xem trước');
  };

  const handleSelectPreset = (url: string) => {
    setPreviewUrl(url);
    setUrlInput(url);
  };

  const handleRemoveAvatar = () => {
    setPreviewUrl(undefined);
    setUrlInput('');
    toast.info('Đã xóa ảnh đại diện. Hệ thống sẽ hiển thị chữ cái viết tắt.', 'Xóa ảnh');
  };

  const handleSave = () => {
    onSaveAvatar(teacher.id, previewUrl);
    toast.success(`Đã cập nhật ảnh đại diện của giáo viên ${teacher.fullName}!`, 'Ảnh đại diện');
    onClose();
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    return parts[parts.length - 1]?.slice(0, 1) || 'GV';
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-xl w-full text-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 px-6 py-4 text-white flex justify-between items-center border-b border-indigo-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-300 shadow-xs">
              <Camera className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Chèn Ảnh Đại Diện Giáo Viên</h3>
              <p className="text-xs text-indigo-200">
                {teacher.fullName} ({teacher.code}) • {teacher.role}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-indigo-200 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Avatar Preview Section */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-slate-50 rounded-2xl border border-slate-200/80">
            <div className="relative group shrink-0">
              <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-indigo-200 shadow-md bg-white flex items-center justify-center">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={teacher.fullName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80';
                    }}
                  />
                ) : (
                  <div
                    className={`w-full h-full flex items-center justify-center font-bold text-2xl text-white ${
                      teacher.role === 'Tổ trưởng'
                        ? 'bg-amber-500'
                        : teacher.role === 'Tổ phó'
                        ? 'bg-indigo-600'
                        : 'bg-slate-600'
                    }`}
                  >
                    {getInitials(teacher.fullName)}
                  </div>
                )}
              </div>
              {previewUrl && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="absolute -top-2 -right-2 p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-md transition"
                  title="Xóa ảnh đại diện"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Xem trước ảnh đại diện
              </div>
              <h4 className="text-sm font-bold text-slate-900">{teacher.fullName}</h4>
              <p className="text-xs text-slate-500">
                {previewUrl
                  ? 'Ảnh đã sẵn sàng. Bấm "Lưu Thay Đổi" để cập nhật vào hồ sơ tổ.'
                  : 'Chưa có ảnh đại diện riêng, đang hiển thị chữ cái viết tắt chuẩn.'}
              </p>
            </div>
          </div>

          {/* Source Tabs */}
          <div>
            <div className="flex border-b border-slate-200 gap-2 mb-4">
              <button
                type="button"
                onClick={() => setActiveTab('upload')}
                className={`pb-2 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition ${
                  activeTab === 'upload'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Upload className="w-4 h-4" />
                <span>Tải ảnh từ máy tính</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('presets')}
                className={`pb-2 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition ${
                  activeTab === 'presets'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>Ảnh mẫu chuẩn sư phạm</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('url')}
                className={`pb-2 px-3 text-xs font-semibold flex items-center gap-1.5 border-b-2 transition ${
                  activeTab === 'url'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-700'
                }`}
              >
                <LinkIcon className="w-4 h-4" />
                <span>Nhập liên kết (URL)</span>
              </button>
            </div>

            {/* Tab 1: Upload from Computer */}
            {activeTab === 'upload' && (
              <div className="space-y-3">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  className="hidden"
                />

                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-indigo-200 hover:border-indigo-500 hover:bg-indigo-50/30 rounded-2xl p-6 text-center cursor-pointer transition flex flex-col items-center justify-center gap-2 group"
                >
                  <div className="w-12 h-12 rounded-full bg-indigo-50 group-hover:bg-indigo-100 text-indigo-600 flex items-center justify-center transition">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-indigo-600 group-hover:underline">
                      Nhấp để chọn ảnh từ máy tính hoặc điện thoại
                    </span>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Hỗ trợ JPG, PNG, WebP (Tối đa 5MB) • Tự động căn chỉnh vuông tỉ lệ 1:1
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Pedagogical Presets Gallery */}
            {activeTab === 'presets' && (
              <div className="space-y-3">
                <p className="text-xs text-slate-500">
                  Chọn nhanh ảnh chân dung trang trọng theo giới tính{' '}
                  <strong className="text-slate-800">
                    {teacher.gender === 'Nam' ? 'Thầy giáo' : 'Cô giáo'}
                  </strong>:
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {TEACHER_AVATAR_PRESETS.filter(
                    (p) => !teacher.gender || p.gender === teacher.gender
                  ).map((preset) => {
                    const isSelected = previewUrl === preset.url;
                    return (
                      <button
                        type="button"
                        key={preset.id}
                        onClick={() => handleSelectPreset(preset.url)}
                        className={`p-2 rounded-xl border text-left transition relative group overflow-hidden ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/30'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="aspect-square rounded-lg overflow-hidden bg-slate-100 mb-1.5">
                          <img
                            src={preset.url}
                            alt={preset.label}
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                        </div>
                        <div className="text-[11px] font-semibold text-slate-800 line-clamp-1">
                          {preset.label}
                        </div>
                        {isSelected && (
                          <div className="absolute top-3 right-3 w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 3: URL Paste */}
            {activeTab === 'url' && (
              <div className="space-y-3">
                <label className="block text-xs font-semibold text-slate-700">
                  Dán đường dẫn ảnh chân dung (URL):
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://example.com/avatar.jpg"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleApplyUrl}
                    className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-semibold"
                  >
                    Áp dụng
                  </button>
                </div>
                <p className="text-[11px] text-slate-400">
                  Dán link ảnh từ Google Photos, Imgur, trang web trường học hoặc kho lưu trữ ảnh trực tuyến.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex justify-between items-center">
          <button
            type="button"
            onClick={handleRemoveAvatar}
            className="text-xs text-red-600 hover:text-red-700 font-semibold flex items-center gap-1"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Xóa ảnh (dùng chữ cái viết tắt)</span>
          </button>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-white"
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isProcessing}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>Lưu Ảnh Đại Diện</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
