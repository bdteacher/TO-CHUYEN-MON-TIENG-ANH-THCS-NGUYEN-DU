import React, { useState, useEffect, useRef } from 'react';
import {
  QrCode,
  Download,
  Copy,
  Printer,
  X,
  ExternalLink,
  Award,
  BookOpen,
  Eye,
  CalendarCheck,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  FolderCheck,
  Sparkles,
  Users,
  School,
  Share2,
  ShieldCheck,
  Clock,
  ArrowRight,
  BadgeCheck,
  Camera,
} from 'lucide-react';
import {
  Teacher,
  LessonPlanReview,
  LessonObservation,
  SubstituteTeaching,
  DepartmentSetting,
} from '../types';
import {
  generateTeacherQrDataUrl,
  downloadQrCodeImage,
  getTeacherInspectionUrl,
} from '../utils/qrCodeService';
import { useToast } from '../context/ToastContext';
import { AvatarUploadModal } from './AvatarUploadModal';

interface TeacherInspectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  teacher: Teacher | null;
  teachers: Teacher[];
  lessonPlans: LessonPlanReview[];
  observations: LessonObservation[];
  substitutes: SubstituteTeaching[];
  settings: DepartmentSetting;
  onSelectTeacher?: (teacher: Teacher) => void;
  onUpdateTeacher?: (updated: Teacher) => void;
}

export const TeacherInspectionModal: React.FC<TeacherInspectionModalProps> = ({
  isOpen,
  onClose,
  teacher,
  teachers,
  lessonPlans,
  observations,
  substitutes,
  settings,
  onSelectTeacher,
  onUpdateTeacher,
}) => {
  const toast = useToast();
  const printCardRef = useRef<HTMLDivElement>(null);

  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'overview' | 'lessonPlans' | 'observations' | 'substitutes'>('overview');
  const [selectedTeacherId, setSelectedTeacherId] = useState<string>(teacher?.id || '');
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  // Current active teacher
  const activeTeacher = teachers.find((t) => t.id === selectedTeacherId) || teacher || teachers[0];

  const handleSaveAvatar = (teacherId: string, avatarUrl: string | undefined) => {
    const t = teachers.find((item) => item.id === teacherId);
    if (t && onUpdateTeacher) {
      onUpdateTeacher({ ...t, avatarUrl });
    }
  };

  useEffect(() => {
    if (teacher) {
      setSelectedTeacherId(teacher.id);
    }
  }, [teacher]);

  // Generate QR code whenever active teacher changes
  useEffect(() => {
    if (!activeTeacher) return;
    let isCancelled = false;

    generateTeacherQrDataUrl(activeTeacher.id, {
      width: 400,
      margin: 2,
      color: {
        dark: '#1e1b4b', // deep indigo
        light: '#ffffff',
      },
    })
      .then((url) => {
        if (!isCancelled) {
          setQrDataUrl(url);
        }
      })
      .catch((err) => {
        console.error('Lỗi tạo mã QR:', err);
      });

    return () => {
      isCancelled = true;
    };
  }, [activeTeacher?.id]);

  if (!isOpen || !activeTeacher) return null;

  // Filter records for this teacher
  const teacherPlans = lessonPlans.filter((lp) => lp.teacherId === activeTeacher.id);
  const teacherObservationsAsTeacher = observations.filter((o) => o.teacherId === activeTeacher.id);
  const teacherObservationsAsObserver = observations.filter((o) => o.observerId === activeTeacher.id);
  const teacherSubstitutesDone = substitutes.filter((s) => s.substituteTeacherId === activeTeacher.id);
  const teacherSubstitutesAbsent = substitutes.filter((s) => s.absentTeacherId === activeTeacher.id);

  const approvedPlansCount = teacherPlans.filter((lp) => lp.status === 'Đã ký duyệt').length;
  const goodObservationsCount = teacherObservationsAsTeacher.filter((o) => o.rating === 'Giỏi').length;

  const handleDownloadQr = () => {
    if (!qrDataUrl) return;
    downloadQrCodeImage(
      qrDataUrl,
      `QR_KiemTra_HoSo_${activeTeacher.code}_${activeTeacher.fullName.replace(/\s+/g, '_')}`
    );
    toast.success(`Đã tải file ảnh mã QR của giáo viên ${activeTeacher.fullName}!`, 'Tải mã QR');
  };

  const handleCopyLink = () => {
    const url = getTeacherInspectionUrl(activeTeacher.id);
    navigator.clipboard
      .writeText(url)
      .then(() => {
        toast.success('Đã sao chép liên kết hồ sơ chuyên môn vào bộ nhớ tạm!', 'Sao chép link');
      })
      .catch(() => {
        toast.info(url, 'Đường dẫn hồ sơ');
      });
  };

  const handlePrintBadge = () => {
    window.print();
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    return parts[parts.length - 1]?.slice(0, 1) || 'GV';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full text-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[94vh]">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 px-6 py-4 text-white flex justify-between items-center border-b border-indigo-800/60 no-print shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-300/40 flex items-center justify-center text-amber-300 shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  Tiện ích Thanh Tra & Kiểm Tra Chuyên Môn
                </span>
                <span className="text-xs text-indigo-200">
                  Chuẩn hóa theo CV 5512 & CV 5555
                </span>
              </div>
              <h3 className="font-bold text-base text-white mt-0.5">
                Mã QR & Hồ Sơ Năng Lực Phát Triển Chuyên Môn Giáo Viên
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Switch Teacher Selector */}
            <select
              value={selectedTeacherId}
              onChange={(e) => {
                setSelectedTeacherId(e.target.value);
                const found = teachers.find((t) => t.id === e.target.value);
                if (found && onSelectTeacher) onSelectTeacher(found);
              }}
              className="hidden sm:block text-xs bg-white/10 hover:bg-white/20 text-white font-medium border border-white/20 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id} className="text-slate-900">
                  {t.fullName} ({t.code} - {t.role})
                </option>
              ))}
            </select>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-indigo-200 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 bg-slate-50/50">
          {/* Left Column: Physical Inspection Desk Card (Thẻ Đặt Bàn Kiểm Tra) */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div
              ref={printCardRef}
              className="w-full bg-white rounded-3xl border-2 border-indigo-200/90 p-5 shadow-lg flex flex-col items-center text-center relative overflow-hidden group hover:border-indigo-400 transition"
            >
              {/* Corner Watermark */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-indigo-500/10 to-transparent pointer-events-none rounded-bl-full" />

              {/* School & Department Header */}
              <div className="border-b-2 border-indigo-900/10 pb-3 w-full mb-3">
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center justify-center gap-1">
                  <School className="w-3 h-3 text-indigo-600" />
                  {settings.schoolName}
                </div>
                <div className="text-xs font-black text-indigo-950 uppercase tracking-wide mt-0.5">
                  {settings.departmentName}
                </div>
                <div className="text-[10px] text-amber-700 font-semibold uppercase mt-0.5 bg-amber-50 rounded py-0.5 border border-amber-200">
                  ★ THẺ KIỂM TRA HỒ SƠ CHUYÊN MÔN ĐIỆN TỬ ★
                </div>
              </div>

              {/* Teacher Avatar & Identity */}
              <div className="flex items-center gap-3 w-full p-2.5 bg-slate-50 rounded-2xl border border-slate-100 mb-3 text-left">
                <div
                  onClick={() => setIsAvatarModalOpen(true)}
                  className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-indigo-400 shadow-xs bg-white shrink-0 flex items-center justify-center cursor-pointer relative group/ia hover:ring-2 hover:ring-indigo-400 transition"
                  title="Nhấp để chèn / đổi ảnh avatar giáo viên"
                >
                  {activeTeacher.avatarUrl ? (
                    <img
                      src={activeTeacher.avatarUrl}
                      alt={activeTeacher.fullName}
                      className="w-full h-full object-cover group-hover/ia:scale-105 transition"
                    />
                  ) : (
                    <div
                      className={`w-full h-full flex items-center justify-center font-bold text-lg text-white ${
                        activeTeacher.role === 'Tổ trưởng'
                          ? 'bg-amber-500'
                          : activeTeacher.role === 'Tổ phó'
                          ? 'bg-indigo-600'
                          : 'bg-slate-600'
                      }`}
                    >
                      {getInitials(activeTeacher.fullName)}
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/ia:opacity-100 flex flex-col items-center justify-center text-white text-[8px] font-bold transition">
                    <Camera className="w-3.5 h-3.5 mb-0.5" />
                    <span>Chèn ảnh</span>
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-mono font-bold text-indigo-600">
                    {activeTeacher.code}
                  </div>
                  <h4 className="text-sm font-extrabold text-slate-900 truncate">
                    {activeTeacher.fullName}
                  </h4>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className={`text-[10px] px-2 py-0.2 rounded font-bold uppercase ${
                        activeTeacher.role === 'Tổ trưởng'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : activeTeacher.role === 'Tổ phó'
                          ? 'bg-indigo-100 text-indigo-900 border border-indigo-300'
                          : 'bg-slate-200 text-slate-800'
                      }`}
                    >
                      {activeTeacher.role}
                    </span>
                    <span className="text-[11px] text-slate-500 truncate">
                      {activeTeacher.degree}
                    </span>
                  </div>
                </div>
              </div>

              {/* Unique QR Code Container */}
              <div className="p-3 bg-white rounded-2xl border-2 border-slate-200/90 shadow-inner flex flex-col items-center">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt={`Mã QR Hồ sơ của ${activeTeacher.fullName}`}
                    className="w-48 h-48 sm:w-52 sm:h-52 object-contain"
                  />
                ) : (
                  <div className="w-48 h-48 sm:w-52 sm:h-52 flex items-center justify-center text-slate-400 bg-slate-50 rounded-xl">
                    Đang tạo mã QR...
                  </div>
                )}
                <div className="text-[10px] font-bold text-indigo-950 uppercase tracking-wider mt-1.5 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  MÃ ĐỊNH DANH HỒ SƠ CHUYÊN MÔN
                </div>
              </div>

              {/* Instructions & Seal */}
              <p className="text-[11px] text-slate-500 mt-3 leading-relaxed">
                Đoàn kiểm tra / Ban giám hiệu dùng Camera điện thoại hoặc Zalo quét mã QR để tra cứu tức thì hồ sơ KHBĐ (CV 5512), dự giờ (CV 5555) và phân công giảng dạy.
              </p>

              <div className="mt-2.5 pt-2 border-t border-slate-100 w-full flex items-center justify-between text-[10px] text-slate-400 font-medium">
                <span>Năm học: {settings.schoolYear}</span>
                <span className="text-emerald-700 font-bold flex items-center gap-0.5">
                  <BadgeCheck className="w-3.5 h-3.5" /> Đã Ký Duyệt Số
                </span>
              </div>
            </div>

            {/* Action Bar for Inspection Card */}
            <div className="w-full mt-3 flex flex-wrap gap-2 justify-center no-print">
              <button
                onClick={handleDownloadQr}
                className="flex-1 min-w-[120px] px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Tải Mã QR (PNG)</span>
              </button>

              <button
                onClick={handleCopyLink}
                className="px-3 py-2 rounded-xl bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1.5 transition"
                title="Sao chép đường dẫn hồ sơ"
              >
                <Copy className="w-3.5 h-3.5 text-slate-500" />
                <span>Copy Link</span>
              </button>

              <button
                onClick={handlePrintBadge}
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs flex items-center gap-1.5 transition active:scale-95"
                title="In thẻ kiểm tra để đặt tại bàn kiểm tra hồ sơ thực tế"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>In Thẻ Bàn</span>
              </button>

              <button
                onClick={() => setIsAvatarModalOpen(true)}
                className="w-full py-1.5 px-3 rounded-xl border border-indigo-200 hover:bg-indigo-50 text-indigo-700 text-xs font-semibold flex items-center justify-center gap-1.5 transition active:scale-95 shadow-2xs"
              >
                <Camera className="w-3.5 h-3.5 text-indigo-600" />
                <span>{activeTeacher.avatarUrl ? 'Đổi Ảnh Đại Diện (Avatar)' : 'Chèn Ảnh Đại Diện Vào Thẻ'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Complete Electronic Professional Development Dossier */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            {/* Quick Record Navigation Tabs */}
            <div className="flex border-b border-slate-200 gap-1 overflow-x-auto pb-1 no-print">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
                  activeTab === 'overview'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-white border border-transparent'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>Tổng quan & Chuẩn nghề nghiệp</span>
              </button>

              <button
                onClick={() => setActiveTab('lessonPlans')}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
                  activeTab === 'lessonPlans'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-white border border-transparent'
                }`}
              >
                <FolderCheck className="w-3.5 h-3.5" />
                <span>Giáo án KHBĐ (CV 5512)</span>
                <span className="px-1.5 py-0.2 rounded-full bg-indigo-100 text-indigo-900 text-[10px]">
                  {approvedPlansCount}/{teacherPlans.length || 1}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('observations')}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
                  activeTab === 'observations'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-white border border-transparent'
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Dự giờ & Thao giảng (CV 5555)</span>
                <span className="px-1.5 py-0.2 rounded-full bg-emerald-100 text-emerald-900 text-[10px]">
                  {teacherObservationsAsTeacher.length} tiết
                </span>
              </button>

              <button
                onClick={() => setActiveTab('substitutes')}
                className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition whitespace-nowrap ${
                  activeTab === 'substitutes'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-white border border-transparent'
                }`}
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                <span>Dạy thay & Bù</span>
              </button>
            </div>

            {/* Tab 1: Overview & Professional Standards */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
                    <span className="text-[11px] text-slate-500 block">Thâm niên sư phạm</span>
                    <span className="text-base font-bold text-slate-900">
                      {activeTeacher.teachingYears} năm KN
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Giảng dạy chính khóa</span>
                  </div>

                  <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
                    <span className="text-[11px] text-slate-500 block">Số tiết / tuần</span>
                    <span className="text-base font-bold text-indigo-700">
                      {activeTeacher.teachingPeriodsPerWeek} tiết
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Định mức: {activeTeacher.standardQuota}
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
                    <span className="text-[11px] text-slate-500 block">Lớp chủ nhiệm</span>
                    <span className="text-base font-bold text-emerald-700">
                      {activeTeacher.homeroomClass || 'Không có'}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Phụ trách lớp</span>
                  </div>

                  <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-2xs">
                    <span className="text-[11px] text-slate-500 block">Chuẩn nghề nghiệp</span>
                    <span className="text-base font-bold text-purple-700">
                      {activeTeacher.professionalStandardRating}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {activeTeacher.emulationTitle}
                    </span>
                  </div>
                </div>

                {/* Professional Assignment & Topics */}
                <div className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-3">
                  <div className="flex items-center gap-2 font-bold text-xs uppercase tracking-wider text-slate-700">
                    <Sparkles className="w-4 h-4 text-amber-500" />
                    Chuyên đề đổi mới phương pháp giảng dạy & Nghiên cứu bài học
                  </div>
                  <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs text-indigo-950 font-semibold leading-relaxed">
                    &ldquo;{activeTeacher.departmentTopic || 'Đổi mới phương pháp giảng dạy tích cực'}&rdquo;
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
                    <div>
                      <span className="text-slate-500 block text-[11px]">Các lớp phân công:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {activeTeacher.assignedClasses.map((cls) => (
                          <span
                            key={cls}
                            className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 font-bold border border-sky-200 text-xs"
                          >
                            Lớp {cls}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-500 block text-[11px]">Nhiệm vụ kiêm nhiệm:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {activeTeacher.additionalTasks.map((t, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs border border-slate-200"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Inspection Verification Checklist */}
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-xs space-y-2">
                  <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Xác Nhận Đạt Chuẩn Hồ Sơ Kiểm Tra Thực Tế (CV 5512 & CV 5555):
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-emerald-950">
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Kế hoạch bài dạy soạn đủ và đúng tiến độ chương trình
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Đạt định mức dự giờ đồng nghiệp theo quy định
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Có ứng dụng CNTT và thiết bị dạy học số
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      Đã được Tổ trưởng & Tổ phó ký duyệt điện tử
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Tab 2: Lesson Plan Reviews (CV 5512) */}
            {activeTab === 'lessonPlans' && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <FolderCheck className="w-4 h-4 text-indigo-600" />
                    Nhật ký Kế hoạch bài dạy đã ký duyệt (CV 5512)
                  </h4>
                  <span className="text-xs text-slate-500">
                    Tuần 1 - 18 • Học kỳ I
                  </span>
                </div>

                {teacherPlans.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-4 text-center">
                    Chưa có biên bản kiểm tra kế hoạch bài dạy cụ thể cho giáo viên này.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[10px]">
                        <tr>
                          <th className="px-3 py-2">Tuần</th>
                          <th className="px-3 py-2">Môn / Khối</th>
                          <th className="px-3 py-2">Ngày nộp</th>
                          <th className="px-3 py-2">Trạng thái</th>
                          <th className="px-3 py-2">Nhận xét của Tổ trưởng</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {teacherPlans.map((lp) => (
                          <tr key={lp.id} className="hover:bg-slate-50/60">
                            <td className="px-3 py-2.5 font-bold text-indigo-900">
                              Tuần {lp.week}
                            </td>
                            <td className="px-3 py-2.5">
                              {lp.subject} {lp.grade}
                            </td>
                            <td className="px-3 py-2.5 font-mono text-[11px] text-slate-600">
                              {lp.submissionDate}
                            </td>
                            <td className="px-3 py-2.5 whitespace-nowrap">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  lp.status === 'Đã ký duyệt'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {lp.status}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-slate-700 italic max-w-xs">
                              {lp.feedback || 'Đạt chuẩn 5512'}
                              {lp.quickNote && (
                                <span className="ml-1 text-amber-700 font-semibold not-italic">
                                  ({lp.quickNote})
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Observations & Demonstration Lessons (CV 5555) */}
            {activeTab === 'observations' && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <Eye className="w-4 h-4 text-emerald-600" />
                    Hồ sơ Dự giờ & Đánh giá Tiết Dạy (Công văn 5555/BGDĐT)
                  </h4>
                  <span className="text-xs text-slate-500">
                    Đã xếp loại: <strong className="text-emerald-700">{goodObservationsCount} Giỏi</strong>
                  </span>
                </div>

                {teacherObservationsAsTeacher.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-4 text-center">
                    Chưa có phiếu dự giờ tiết dạy của giáo viên này trong học kỳ.
                  </p>
                ) : (
                  <div className="space-y-2.5">
                    {teacherObservationsAsTeacher.map((obs) => {
                      const observer = teachers.find((t) => t.id === obs.observerId);
                      return (
                        <div
                          key={obs.id}
                          className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs space-y-1.5"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-1.5">
                            <div className="font-bold text-slate-900">
                              {obs.lessonName} • Lớp {obs.className} (Tiết {obs.period})
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded font-bold text-[11px] bg-emerald-100 text-emerald-800">
                                Xếp loại: {obs.rating} ({obs.totalScore}/20 điểm)
                              </span>
                              <span className="text-slate-400 text-[11px] font-mono">{obs.date}</span>
                            </div>
                          </div>
                          <div className="text-[11px] text-slate-600">
                            Người dự: <strong>{observer?.fullName || 'Tổ chuyên môn'}</strong> ({observer?.role}) • {obs.lessonType}
                          </div>
                          <p className="text-slate-700 italic bg-white p-2 rounded-lg border border-slate-100">
                            &ldquo;{obs.generalComments}&rdquo;
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Substitutes & Additional Records */}
            {activeTab === 'substitutes' && (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-4 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <CalendarCheck className="w-4 h-4 text-sky-600" />
                  Nhật ký Dạy thay & Hoạt động Hỗ trợ Chuyên môn
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-emerald-50/50 rounded-xl border border-emerald-200">
                    <span className="text-slate-500 block text-[11px]">Đã dạy thay cho đồng nghiệp</span>
                    <span className="text-lg font-bold text-emerald-800">
                      {teacherSubstitutesDone.length} tiết
                    </span>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Tích cực hỗ trợ các trường hợp ốm đau, công tác
                    </p>
                  </div>

                  <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200">
                    <span className="text-slate-500 block text-[11px]">Số tiết nhờ dạy thay</span>
                    <span className="text-lg font-bold text-amber-800">
                      {teacherSubstitutesAbsent.length} tiết
                    </span>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Có đơn xin phép & đã được Tổ trưởng phê duyệt
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 no-print">
          <span>
            Hồ sơ điện tử chuẩn hóa • Liên kết mã QR: <strong className="font-mono text-slate-700">{activeTeacher.code}</strong>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold transition"
          >
            Đóng cửa sổ
          </button>
        </div>
      </div>

      {/* Avatar Upload Modal */}
      <AvatarUploadModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
        teacher={activeTeacher}
        onSaveAvatar={handleSaveAvatar}
      />
    </div>
  );
};
