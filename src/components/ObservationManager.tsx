import React, { useState, useRef } from 'react';
import {
  Eye,
  Award,
  PlusCircle,
  Search,
  Printer,
  Star,
  CheckCircle,
  BookOpen,
  Calendar,
  Layers,
  FileDown,
  Loader2,
} from 'lucide-react';
import { Teacher, LessonObservation, DepartmentSetting } from '../types';
import { exportElementToPdf } from '../utils/pdfExport';
import { useToast } from '../context/ToastContext';
import { useAuthRole } from '../context/AuthRoleContext';

interface ObservationManagerProps {
  settings: DepartmentSetting;
  teachers: Teacher[];
  observations: LessonObservation[];
  onAddObservation: (obs: LessonObservation) => void;
  onDeleteObservation: (id: string) => void;
  onPrintObservation: (obs: LessonObservation) => void;
}

export const ObservationManager: React.FC<ObservationManagerProps> = ({
  settings,
  teachers,
  observations,
  onAddObservation,
  onDeleteObservation,
  onPrintObservation,
}) => {
  const { role, isHead, isMember } = useAuthRole();
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [ratingFilter, setRatingFilter] = useState<string>('all');
  const [selectedObs, setSelectedObs] = useState<LessonObservation | null>(observations[0] || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const obsSheetRef = useRef<HTMLDivElement>(null);

  // New Observation Form State
  const defaultCriteria = [
    { id: 'c1', name: '1. Mức độ phù hợp của chuỗi hoạt động học với mục tiêu bài dạy', maxScore: 5, score: 5, comment: 'Thiết kế chuỗi hoạt động khoa học, bám sát yêu cầu cần đạt' },
    { id: 'c2', name: '2. Mức độ rõ ràng của mục tiêu, nội dung, kỹ thuật tổ chức các hoạt động', maxScore: 5, score: 4.5, comment: 'Lệnh học rõ ràng, chuyển giao nhiệm vụ tích cực' },
    { id: 'c3', name: '3. Hiệu quả sử dụng thiết bị dạy học, đồ dùng trực quan & ứng dụng CNTT', maxScore: 5, score: 4.5, comment: 'Ứng dụng phần mềm và hình ảnh sinh động' },
    { id: 'c4', name: '4. Mức độ tích cực, chủ động, sáng tạo và kết quả học tập của học sinh', maxScore: 5, score: 4.5, comment: 'Học sinh hào hứng trao đổi, trả lời tốt' },
  ];

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    teacherId: teachers[2]?.id || teachers[0]?.id || '',
    observerId: teachers[0]?.id || '',
    subject: 'Tiếng Anh',
    className: '8A1',
    period: 2,
    lessonName: 'Unit 4: Ethnic groups of Viet Nam - A closer look 1',
    lessonType: 'Tiết dạy thao giảng' as any,
    criteria: defaultCriteria,
    generalComments: 'Giáo viên bao quát lớp tốt, phát âm chuẩn, tổ chức hoạt động nhóm sôi nổi, học sinh tự tin giao tiếp.',
    suggestions: 'Có thể cho học sinh thực hành thuyết trình ngắn về phong tục tập quán để nâng cao kỹ năng Speaking.',
  });

  const getTeacher = (id: string) => teachers.find((t) => t.id === id);

  const filteredObservations = observations.filter((obs) => {
    const teacher = getTeacher(obs.teacherId);
    const observer = getTeacher(obs.observerId);

    const matchesSearch =
      (teacher?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (observer?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      obs.lessonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      obs.className.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesRating = ratingFilter === 'all' || obs.rating === ratingFilter;

    return matchesSearch && matchesRating;
  });

  const handleScoreChange = (index: number, newScore: number) => {
    const updated = [...form.criteria];
    updated[index].score = newScore;
    setForm({ ...form, criteria: updated });
  };

  const handleSaveObservation = (e: React.FormEvent) => {
    e.preventDefault();
    const totalScore = form.criteria.reduce((sum, c) => sum + Number(c.score), 0);

    let rating: 'Giỏi' | 'Khá' | 'Trung bình' | 'Chưa đạt' = 'Khá';
    if (totalScore >= 18) rating = 'Giỏi';
    else if (totalScore >= 14) rating = 'Khá';
    else if (totalScore >= 10) rating = 'Trung bình';
    else rating = 'Chưa đạt';

    const newObs: LessonObservation = {
      id: `obs-${Date.now()}`,
      date: form.date,
      teacherId: form.teacherId,
      observerId: form.observerId,
      subject: form.subject,
      className: form.className,
      period: Number(form.period),
      lessonName: form.lessonName,
      lessonType: form.lessonType,
      criteria: form.criteria,
      totalScore,
      rating,
      generalComments: form.generalComments,
      suggestions: form.suggestions,
    };

    onAddObservation(newObs);
    setIsModalOpen(false);
    setSelectedObs(newObs);
  };

  const handleExportPdf = async () => {
    if (!obsSheetRef.current || !selectedObs) return;
    setIsExportingPdf(true);
    try {
      const teacher = getTeacher(selectedObs.teacherId);
      const safeTeacher = teacher ? teacher.fullName.replace(/\s+/g, '_') : 'GV';
      const cleanDate = selectedObs.date.replace(/[\/\\]/g, '-');
      await exportElementToPdf(obsSheetRef.current, {
        filename: `Phieu_du_gio_${safeTeacher}_${cleanDate}.pdf`,
        pageTitle: `Phiếu dự giờ - ${teacher?.fullName || ''}`,
        leftMarginMm: 20,
        rightMarginMm: 15,
        topMarginMm: 15,
        bottomMarginMm: 15,
      });
      toast.success(`Đã xuất phiếu dự giờ (${teacher?.fullName}) sang PDF chuẩn hành chính!`, 'Xuất PDF');
    } catch (err) {
      console.error('Lỗi xuất PDF phiếu dự giờ:', err);
      toast.error('Không thể xuất file PDF. Vui lòng thử lại!', 'Lỗi xuất PDF');
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Eye className="w-6 h-6 text-indigo-600" />
              Sổ Quản Lý Dự Giờ, Thao Giảng & Đánh Giá Tiết Dạy
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Đánh giá tiết dạy chuẩn Công văn 5555/BGDĐT của Bộ GD&ĐT (Phát triển năng lực học sinh)
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className={`px-4 py-2 rounded-xl text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition active:scale-95 ${
              isHead ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isHead ? 'Tạo Phiếu Dự Giờ Mới (Toàn quyền)' : 'Đăng Ký Dự Giờ / Thao Giảng'}</span>
          </button>
        </div>

        {/* Filter & Search */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Tìm theo tên giáo viên dạy/dự, bài dạy, lớp..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <Award className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="text-xs bg-transparent border-none focus:outline-none text-slate-700 font-medium"
            >
              <option value="all">Tất cả xếp loại</option>
              <option value="Giỏi">Loại Giỏi (&gt;= 18đ)</option>
              <option value="Khá">Loại Khá (14 - 17.5đ)</option>
              <option value="Trung bình">Loại Trung bình</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid: Observations List & Selected Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Observations cards */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center justify-between">
            <span>Danh Sách Tiết Dự Giờ ({filteredObservations.length})</span>
            <span className="text-[11px] text-slate-400 font-normal">Học kỳ I</span>
          </div>

          <div className="space-y-3">
            {filteredObservations.map((obs) => {
              const teacher = getTeacher(obs.teacherId);
              const observer = getTeacher(obs.observerId);
              const isSelected = selectedObs?.id === obs.id;

              return (
                <div
                  key={obs.id}
                  onClick={() => setSelectedObs(obs)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer text-xs space-y-2 ${
                    isSelected
                      ? 'bg-indigo-50/70 border-indigo-400 ring-2 ring-indigo-200/50 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 flex items-center gap-1 text-[11px]">
                      <Calendar className="w-3 h-3 text-slate-400" /> {obs.date} • Tiết {obs.period} ({obs.className})
                    </span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded-full text-[11px] ${
                        obs.rating === 'Giỏi'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          : obs.rating === 'Khá'
                          ? 'bg-blue-100 text-blue-800 border border-blue-200'
                          : 'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}
                    >
                      Xếp loại: {obs.rating} ({obs.totalScore}/20đ)
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm line-clamp-2">
                    {obs.lessonName}
                  </h3>

                  <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-slate-400 block">GV Giảng dạy:</span>
                      <span className="font-bold text-slate-800">{teacher?.fullName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Người dự giờ:</span>
                      <span className="font-bold text-indigo-700">{observer?.fullName}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 cols: Official Evaluation Sheet (Phiếu đánh giá) */}
        <div className="lg:col-span-2">
          {selectedObs ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden text-xs text-slate-800">
              {/* Toolbar */}
              <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center no-print">
                <span className="font-semibold text-slate-600">
                  Phiếu Đánh Giá Tiết Dạy Chuẩn (Công văn 5555/BGDĐT)
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={handleExportPdf}
                    disabled={isExportingPdf}
                    className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-semibold flex items-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer"
                    title="Xuất phiếu dự giờ sang định dạng PDF chuẩn hành chính theo Công văn 5555/BGDĐT"
                  >
                    {isExportingPdf ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Đang tạo PDF...</span>
                      </>
                    ) : (
                      <>
                        <FileDown className="w-3.5 h-3.5" />
                        <span>Xuất PDF Chuẩn Hành Chính</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => onPrintObservation(selectedObs)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 shadow-2xs transition"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>In Phiếu Dự Giờ A4</span>
                  </button>
                  {isHead && (
                    <button
                      onClick={() => {
                        if (confirm('Xóa phiếu dự giờ này?')) {
                          onDeleteObservation(selectedObs.id);
                          setSelectedObs(null);
                        }
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-semibold"
                      title="Tổ trưởng: Xóa phiếu dự giờ"
                    >
                      Xóa
                    </button>
                  )}
                </div>
              </div>

              {/* Printable Evaluation Sheet */}
              <div ref={obsSheetRef} className="p-8 space-y-5 max-w-3xl mx-auto font-serif bg-white">
                {/* Header */}
                <div className="grid grid-cols-2 text-center text-xs pb-3 border-b border-slate-300">
                  <div>
                    <p className="uppercase font-bold text-slate-800">{settings.districtCity}</p>
                    <p className="uppercase font-extrabold text-slate-900">{settings.schoolName}</p>
                    <p className="uppercase font-semibold text-indigo-900">{settings.departmentName}</p>
                  </div>
                  <div>
                    <p className="uppercase font-bold text-slate-900">PHIẾU ĐÁNH GIÁ TIẾT DẠY</p>
                    <p className="text-[11px] italic text-slate-600">
                      (Kèm theo Công văn số 5555/BGDĐT-GDTrH)
                    </p>
                    <p className="text-[11px] text-slate-500 mt-1">Ngày dự: {selectedObs.date}</p>
                  </div>
                </div>

                {/* Lesson Info Box */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p><strong>Người dạy:</strong> {getTeacher(selectedObs.teacherId)?.fullName}</p>
                    <p><strong>Lớp:</strong> {selectedObs.className} • <strong>Tiết:</strong> {selectedObs.period}</p>
                    <p><strong>Môn:</strong> {selectedObs.subject}</p>
                  </div>
                  <div>
                    <p><strong>Người dự giờ:</strong> {getTeacher(selectedObs.observerId)?.fullName}</p>
                    <p><strong>Chức vụ:</strong> {getTeacher(selectedObs.observerId)?.role}</p>
                    <p><strong>Loại tiết dạy:</strong> {selectedObs.lessonType}</p>
                  </div>
                  <div className="col-span-2 pt-1 border-t border-slate-200">
                    <p><strong>Tên bài dạy:</strong> <span className="font-bold text-indigo-950">{selectedObs.lessonName}</span></p>
                  </div>
                </div>

                {/* Criteria Table */}
                <div className="space-y-2">
                  <h4 className="font-bold uppercase text-slate-900 text-xs transition-all duration-300 ease-in-out px-2 py-0.5 -mx-2 -my-0.5 rounded hover:bg-slate-100/80 hover:shadow-xs cursor-pointer inline-block">
                    Nội dung đánh giá theo các tiêu chí (Thang điểm 20):
                  </h4>
                  <table className="w-full text-left border border-slate-300 text-xs">
                    <thead className="bg-slate-100 uppercase text-[11px]">
                      <tr>
                        <th className="p-2 border border-slate-300 w-10 text-center">STT</th>
                        <th className="p-2 border border-slate-300">Tiêu chí đánh giá</th>
                        <th className="p-2 border border-slate-300 w-20 text-center">Điểm tối đa</th>
                        <th className="p-2 border border-slate-300 w-20 text-center">Điểm chấm</th>
                        <th className="p-2 border border-slate-300">Góp ý, phân tích</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedObs.criteria.map((c, i) => (
                        <tr key={c.id}>
                          <td className="p-2 border border-slate-300 text-center font-medium">{i + 1}</td>
                          <td className="p-2 border border-slate-300 font-medium text-slate-800">{c.name}</td>
                          <td className="p-2 border border-slate-300 text-center font-semibold">{c.maxScore}đ</td>
                          <td className="p-2 border border-slate-300 text-center font-bold text-indigo-900">{c.score}đ</td>
                          <td className="p-2 border border-slate-300 text-slate-600 text-[11px]">{c.comment}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-slate-50 font-bold">
                      <tr>
                        <td colSpan={2} className="p-2 border border-slate-300 text-right uppercase">
                          Tổng điểm và Xếp loại tiết dạy:
                        </td>
                        <td className="p-2 border border-slate-300 text-center">20.0đ</td>
                        <td className="p-2 border border-slate-300 text-center text-indigo-900 text-sm">
                          {selectedObs.totalScore}đ
                        </td>
                        <td className="p-2 border border-slate-300 text-emerald-800 text-sm font-extrabold uppercase">
                          XẾP LOẠI: {selectedObs.rating}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                {/* Qualitative Comments & Suggestions */}
                <div className="space-y-3 text-xs">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <h5 className="font-bold text-slate-900 mb-1">Nhận xét chung về ưu điểm:</h5>
                    <p className="text-slate-700 leading-relaxed">{selectedObs.generalComments}</p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                    <h5 className="font-bold text-slate-900 mb-1">Những điểm cần trao đổi, rút kinh nghiệm:</h5>
                    <p className="text-slate-700 leading-relaxed">{selectedObs.suggestions || 'Không có.'}</p>
                  </div>
                </div>

                {/* Signature Block */}
                <div className="grid grid-cols-2 text-center pt-8 text-xs font-sans">
                  <div>
                    <p className="font-bold uppercase text-slate-800">GIÁO VIÊN DẠY</p>
                    <p className="text-[11px] italic text-slate-500">(Ký và ghi rõ họ tên)</p>
                    <div className="h-16 flex items-end justify-center">
                      <span className="font-bold text-slate-900">{getTeacher(selectedObs.teacherId)?.fullName}</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-bold uppercase text-slate-800">NGƯỜI DỰ GIỜ / ĐÁNH GIÁ</p>
                    <p className="text-[11px] italic text-slate-500">(Ký và ghi rõ họ tên)</p>
                    <div className="h-16 flex items-end justify-center">
                      <span className="font-bold text-slate-900">{getTeacher(selectedObs.observerId)?.fullName}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500 text-xs">
              <Eye className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              Chọn một tiết dự giờ ở danh sách bên trái để xem phiếu đánh giá chi tiết hoặc bấm &quot;Tạo Phiếu Dự Giờ Mới&quot;.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create New Observation */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full text-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-indigo-900 px-6 py-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Eye className="w-5 h-5 text-amber-300" />
                Lập Phiếu Dự Giờ & Đánh Giá Tiết Dạy (CV 5555)
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-xl font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveObservation} className="p-6 space-y-4 text-xs overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Giáo viên giảng dạy</label>
                  <select
                    value={form.teacherId}
                    onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 font-bold"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.fullName} ({t.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Người dự giờ</label>
                  <select
                    value={form.observerId}
                    onChange={(e) => setForm({ ...form, observerId: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 font-bold"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.fullName} ({t.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ngày dự giờ</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lớp</label>
                  <input
                    type="text"
                    value={form.className}
                    onChange={(e) => setForm({ ...form, className: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tiết thứ</label>
                  <select
                    value={form.period}
                    onChange={(e) => setForm({ ...form, period: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 font-bold"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((p) => (
                      <option key={p} value={p}>
                        Tiết {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên bài dạy</label>
                <input
                  type="text"
                  value={form.lessonName}
                  onChange={(e) => setForm({ ...form, lessonName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium"
                  required
                />
              </div>

              {/* Criteria Scoring */}
              <div className="space-y-2 border-t pt-3">
                <span className="font-bold text-slate-900 block">
                  Chấm điểm 4 tiêu chí (Mỗi tiêu chí tối đa 5.0 điểm):
                </span>
                {form.criteria.map((c, i) => (
                  <div key={c.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-slate-800 text-[11px]">{c.name}</span>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="5"
                          value={c.score}
                          onChange={(e) => handleScoreChange(i, parseFloat(e.target.value) || 0)}
                          className="w-16 px-2 py-1 text-center font-bold border rounded focus:ring-2 focus:ring-indigo-500"
                        />
                        <span className="text-slate-500">/ 5.0đ</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nhận xét chung về ưu điểm</label>
                <textarea
                  rows={2}
                  value={form.generalComments}
                  onChange={(e) => setForm({ ...form, generalComments: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Ý kiến rút kinh nghiệm / gợi ý</label>
                <textarea
                  rows={2}
                  value={form.suggestions}
                  onChange={(e) => setForm({ ...form, suggestions: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 font-semibold rounded-lg shadow-sm"
                >
                  Lưu & Xếp Loại Tiết Dạy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
