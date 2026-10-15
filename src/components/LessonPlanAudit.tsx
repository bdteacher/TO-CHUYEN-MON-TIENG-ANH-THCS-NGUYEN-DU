import React, { useState } from 'react';
import {
  FolderCheck,
  CheckCircle,
  AlertCircle,
  Clock,
  Search,
  CheckCheck,
  FileCheck2,
  Calendar,
  Sparkles,
  Download,
  Edit3,
  MessageSquare,
  Tag,
  Save,
  Check,
  Send,
  Lock,
} from 'lucide-react';
import { Teacher, LessonPlanReview, DepartmentSetting } from '../types';
import { useAuthRole } from '../context/AuthRoleContext';
import { useToast } from '../context/ToastContext';

interface LessonPlanAuditProps {
  settings: DepartmentSetting;
  teachers: Teacher[];
  lessonPlans: LessonPlanReview[];
  onUpdateLessonPlans: (updated: LessonPlanReview[]) => void;
  onOpenRequestModal?: () => void;
}

const QUICK_PRESETS = [
  'Đạt chuẩn CV 5512',
  'Khen ngợi',
  'Cần thêm phiếu học tập',
  'Phân hóa học sinh tốt',
  'Ứng dụng CNTT tốt',
  'Bổ sung phần tự học',
];

export const LessonPlanAudit: React.FC<LessonPlanAuditProps> = ({
  settings,
  teachers,
  lessonPlans,
  onUpdateLessonPlans,
  onOpenRequestModal,
}) => {
  const { role, isHead, isMember, displayName, userEmail } = useAuthRole();
  const toast = useToast();
  const [selectedWeek, setSelectedWeek] = useState(6);
  const [editingPlan, setEditingPlan] = useState<LessonPlanReview | null>(null);
  const [savedRowId, setSavedRowId] = useState<string | null>(null);

  const getTeacher = (id: string) => teachers.find((t) => t.id === id);

  const triggerSavedFeedback = (id: string) => {
    setSavedRowId(id);
    setTimeout(() => {
      setSavedRowId((prev) => (prev === id ? null : prev));
    }, 1800);
  };

  const handleStatusChange = (id: string, newStatus: 'Đã ký duyệt' | 'Yêu cầu bổ sung' | 'Chưa nộp') => {
    const updated = lessonPlans.map((lp) => (lp.id === id ? { ...lp, status: newStatus } : lp));
    onUpdateLessonPlans(updated);
    triggerSavedFeedback(id);
  };

  const handleDateChange = (id: string, newDate: string) => {
    const updated = lessonPlans.map((lp) => (lp.id === id ? { ...lp, submissionDate: newDate } : lp));
    onUpdateLessonPlans(updated);
    triggerSavedFeedback(id);
  };

  const handleFeedbackChange = (id: string, newFeedback: string) => {
    const updated = lessonPlans.map((lp) => (lp.id === id ? { ...lp, feedback: newFeedback } : lp));
    onUpdateLessonPlans(updated);
  };

  const handleQuickNoteChange = (id: string, newQuickNote: string) => {
    const updated = lessonPlans.map((lp) => (lp.id === id ? { ...lp, quickNote: newQuickNote } : lp));
    onUpdateLessonPlans(updated);
  };

  const handleApplyPreset = (id: string, preset: string) => {
    const updated = lessonPlans.map((lp) => {
      if (lp.id === id) {
        const current = lp.feedback ? `${lp.feedback}; ${preset}` : preset;
        return { ...lp, feedback: current };
      }
      return lp;
    });
    onUpdateLessonPlans(updated);
    triggerSavedFeedback(id);
  };

  const handleBatchApprove = () => {
    const updated = lessonPlans.map((lp) => ({ ...lp, status: 'Đã ký duyệt' as const }));
    onUpdateLessonPlans(updated);
  };

  const handleSaveFeedbackModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPlan) {
      const updated = lessonPlans.map((lp) => (lp.id === editingPlan.id ? editingPlan : lp));
      onUpdateLessonPlans(updated);
      triggerSavedFeedback(editingPlan.id);
      setEditingPlan(null);
    }
  };

  const approvedCount = lessonPlans.filter((lp) => lp.status === 'Đã ký duyệt').length;
  const pendingCount = lessonPlans.filter((lp) => lp.status === 'Yêu cầu bổ sung' || lp.status === 'Chưa nộp').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <FolderCheck className="w-6 h-6 text-indigo-600" />
              Sổ Theo Dõi Kiểm Tra Kế Hoạch Bài Dạy (Giáo Án - CV 5512)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Tổ trưởng & Tổ phó kiểm tra, ký duyệt định kỳ KHBĐ của 10 giáo viên; cho phép sửa ngày nộp và ghi chú nhanh kết quả đánh giá trực tiếp
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isHead ? (
              <button
                onClick={handleBatchApprove}
                className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition active:scale-95"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Ký Duyệt Tất Cả (10 GV)</span>
              </button>
            ) : onOpenRequestModal ? (
              <button
                onClick={onOpenRequestModal}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Gửi Yêu Cầu Duyệt KHBĐ Tuần {selectedWeek}</span>
              </button>
            ) : null}
          </div>
        </div>

        {/* Week Selector & Stats */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="font-semibold text-slate-700">Chọn tuần kiểm tra:</span>
            <select
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(Number(e.target.value))}
              className="px-3 py-1.5 border border-slate-200 rounded-lg bg-slate-50 font-bold text-indigo-900 focus:outline-none"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map((w) => (
                <option key={w} value={w}>
                  Tuần {w} (Tháng {Math.ceil(w / 4) + 8})
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-emerald-50 text-emerald-800 rounded-full font-bold border border-emerald-200">
              Đã ký duyệt: {approvedCount} / 10 GV
            </span>
            {pendingCount > 0 && (
              <span className="px-3 py-1 bg-amber-50 text-amber-800 rounded-full font-bold border border-amber-200">
                Cần bổ sung / Chưa nộp: {pendingCount} GV
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Review Table of 10 Teachers */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-4 py-3 w-12 text-center">STT</th>
                <th className="px-4 py-3 w-40">Giáo viên</th>
                <th className="px-4 py-3 w-28">Chức vụ tổ</th>
                <th className="px-4 py-3 w-36">Bộ môn / Khối</th>
                <th className="px-4 py-3 w-44">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Ngày nộp (Sửa được)</span>
                  </div>
                </th>
                <th className="px-4 py-3 w-36 text-center">Trạng thái duyệt</th>
                <th className="px-4 py-3 min-w-[340px]">
                  <div className="flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Nhận xét & Ghi chú đánh giá kết quả</span>
                  </div>
                </th>
                <th className="px-4 py-3 text-right w-24">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {lessonPlans.map((plan, index) => {
                const teacher = getTeacher(plan.teacherId);
                const reviewer = getTeacher(plan.reviewerId);
                const isJustSaved = savedRowId === plan.id;

                return (
                  <tr
                    key={plan.id}
                    className={`transition ${
                      isJustSaved ? 'bg-emerald-50/60' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="px-4 py-3 text-center font-mono text-slate-400 font-medium">
                      {index + 1}
                    </td>

                    {/* Cột Giáo viên */}
                    <td className="px-4 py-3 font-bold text-slate-900 whitespace-nowrap">
                      {teacher?.fullName}
                    </td>

                    {/* Cột Chức vụ tổ */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className="text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-medium">
                        {teacher?.role}
                      </span>
                    </td>

                    {/* Cột Bộ môn / Khối */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-indigo-900 text-xs sm:text-sm">Tiếng Anh</span>
                        <span className="px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200 text-[11px]">
                          Khối {plan.grade}
                        </span>
                      </div>
                    </td>

                    {/* Cột Ngày nộp (Có thể sửa ngày tháng trực tiếp) */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <input
                          type="date"
                          value={plan.submissionDate}
                          onChange={(e) => handleDateChange(plan.id, e.target.value)}
                          className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 hover:border-indigo-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-lg focus:outline-none transition cursor-pointer shadow-2xs font-mono"
                          title="Bấm vào để sửa ngày tháng nộp giáo án"
                        />
                      </div>
                    </td>

                    {/* Cột Trạng thái duyệt */}
                    <td className="px-4 py-3 text-center whitespace-nowrap">
                      {isHead ? (
                        <select
                          value={plan.status}
                          onChange={(e) => handleStatusChange(plan.id, e.target.value as any)}
                          className={`text-xs font-bold px-2.5 py-1.5 rounded-full border focus:outline-none cursor-pointer transition shadow-2xs ${
                            plan.status === 'Đã ký duyệt'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : plan.status === 'Yêu cầu bổ sung'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-red-50 text-red-800 border-red-300'
                          }`}
                        >
                          <option value="Đã ký duyệt">Đã ký duyệt</option>
                          <option value="Yêu cầu bổ sung">Yêu cầu bổ sung</option>
                          <option value="Chưa nộp">Chưa nộp</option>
                        </select>
                      ) : (
                        <span
                          className={`text-xs font-bold px-2.5 py-1.5 rounded-full border inline-block ${
                            plan.status === 'Đã ký duyệt'
                              ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                              : plan.status === 'Yêu cầu bổ sung'
                              ? 'bg-amber-50 text-amber-800 border-amber-300'
                              : 'bg-red-50 text-red-800 border-red-300'
                          }`}
                        >
                          {plan.status}
                        </span>
                      )}
                    </td>

                    {/* Cột & Trường nhập liệu bổ sung: Nhận xét cụ thể & Ghi chú nhanh */}
                    <td className="px-4 py-3 text-xs">
                      <div className="space-y-1.5">
                        {/* Trường nhận xét đánh giá kết quả cụ thể */}
                        <div className="relative">
                          {isHead ? (
                            <textarea
                              rows={2}
                              value={plan.feedback}
                              onChange={(e) => handleFeedbackChange(plan.id, e.target.value)}
                              onBlur={() => triggerSavedFeedback(plan.id)}
                              placeholder="Nhập nhận xét cụ thể về kết quả đánh giá bài soạn..."
                              className="w-full px-2.5 py-1.5 text-xs text-slate-800 bg-slate-50/70 hover:bg-white focus:bg-white border border-slate-200 hover:border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-lg transition focus:outline-none leading-relaxed resize-none"
                            />
                          ) : (
                            <div className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-700 italic">
                              {plan.feedback || 'Chưa có nhận xét'}
                            </div>
                          )}
                        </div>

                        {/* Trường nhập liệu bổ sung: Ghi chú nhanh cho giáo viên này */}
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 shrink-0">
                            Ghi chú nhanh:
                          </span>
                          {isHead ? (
                            <input
                              type="text"
                              value={plan.quickNote || ''}
                              onChange={(e) => handleQuickNoteChange(plan.id, e.target.value)}
                              onBlur={() => triggerSavedFeedback(plan.id)}
                              placeholder="Ghi chú nhanh (VD: hạn nộp lại thứ 5, bổ sung audio...)"
                              className="w-full px-2 py-1 text-[11px] text-slate-700 bg-amber-50/20 hover:bg-white focus:bg-white border border-amber-200/70 focus:border-amber-400 focus:ring-1 focus:ring-amber-200 rounded-md transition focus:outline-none"
                            />
                          ) : (
                            <span className="text-[11px] text-slate-600 font-medium">
                              {plan.quickNote || 'Không có ghi chú'}
                            </span>
                          )}
                        </div>

                        {/* Mẫu gợi ý nhanh 1 chạm: chỉ hiển thị cho Tổ trưởng */}
                        {isHead && (
                          <div className="flex flex-wrap items-center gap-1 pt-0.5">
                            <span className="text-[10px] text-slate-400 flex items-center gap-0.5">
                              <Tag className="w-3 h-3 text-slate-400" />
                              Gợi ý:
                            </span>
                            {QUICK_PRESETS.map((preset) => (
                              <button
                                key={preset}
                                type="button"
                                onClick={() => handleApplyPreset(plan.id, preset)}
                                className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 transition active:scale-95 border border-slate-200/60"
                                title={`Thêm "${preset}" vào nhận xét`}
                              >
                                +{preset}
                              </button>
                            ))}
                          </div>
                        )}

                        <div className="text-[10px] text-slate-400 flex items-center justify-between pt-0.5">
                          <span>Người duyệt: {reviewer?.fullName} ({reviewer?.role})</span>
                          {isJustSaved && (
                            <span className="text-emerald-600 font-semibold flex items-center gap-0.5 animate-in fade-in">
                              <Check className="w-3 h-3" /> Đã lưu
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Cột Thao tác */}
                    <td className="px-4 py-3 text-right whitespace-nowrap">
                      <button
                        onClick={() => setEditingPlan(plan)}
                        className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1.5 rounded-lg transition flex items-center gap-1 ml-auto"
                        title="Mở cửa sổ chi tiết để nhận xét sâu"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Chi tiết</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Guidelines on CV 5512 */}
      <div className="bg-sky-50/70 border border-sky-200 rounded-2xl p-4 text-xs text-sky-900 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-sky-600 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-sm text-sky-950 transition-all duration-300 ease-in-out px-2 py-0.5 -mx-2 -my-0.5 rounded-md hover:bg-white/80 hover:shadow-xs hover:text-sky-800 cursor-pointer inline-block">
            Quy định Kế hoạch bài dạy (KHBĐ) theo Công văn 5512/BGDĐT:
          </h4>
          <p className="leading-relaxed">
            Mỗi bài dạy cần thể hiện rõ 4 hoạt động: (1) Hoạt động Khởi động/Mở đầu; (2) Hoạt động Hình thành kiến thức mới; (3) Hoạt động Luyện tập; (4) Hoạt động Vận dụng. Chú trọng giao nhiệm vụ rõ ràng và dự kiến sản phẩm học tập của học sinh.
          </p>
        </div>
      </div>

      {/* Edit Feedback Modal */}
      {editingPlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full text-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-indigo-900 px-6 py-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-2">
                <FileCheck2 className="w-5 h-5 text-amber-300" />
                Ký Duyệt & Nhận Xét Kế Hoạch Bài Dạy
              </h3>
              <button
                onClick={() => setEditingPlan(null)}
                className="text-slate-400 hover:text-white text-xl font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveFeedbackModal} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                <div>
                  <span className="text-slate-500 block">Giáo viên soạn:</span>
                  <span className="font-bold text-slate-900 text-sm">
                    {getTeacher(editingPlan.teacherId)?.fullName}
                  </span>
                  <span className="text-indigo-700 block font-semibold text-xs mt-0.5">
                    Bộ môn / Khối: Tiếng Anh (Khối {editingPlan.grade})
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block">Tuần thực hiện:</span>
                  <span className="font-bold text-indigo-900 text-xs">Tuần {editingPlan.week} (Học kỳ I)</span>
                </div>
              </div>

              {/* Sửa ngày nộp trong modal */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                  Ngày nộp giáo án
                </label>
                <input
                  type="date"
                  value={editingPlan.submissionDate}
                  onChange={(e) => setEditingPlan({ ...editingPlan, submissionDate: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono text-xs font-semibold"
                  required
                />
              </div>

              {/* Trạng thái ký duyệt */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Trạng thái ký duyệt</label>
                <select
                  value={editingPlan.status}
                  onChange={(e) => setEditingPlan({ ...editingPlan, status: e.target.value as any })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 font-bold"
                >
                  <option value="Đã ký duyệt">Đã ký duyệt</option>
                  <option value="Yêu cầu bổ sung">Yêu cầu bổ sung</option>
                  <option value="Chưa nộp">Chưa nộp</option>
                </select>
              </div>

              {/* Nhận xét chuyên môn */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nhận xét chuyên môn / Yêu cầu chỉnh sửa cụ thể
                </label>
                <textarea
                  rows={4}
                  value={editingPlan.feedback}
                  onChange={(e) => setEditingPlan({ ...editingPlan, feedback: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                  placeholder="Nhận xét chi tiết về mục tiêu, phiếu học tập, phương tiện, hoạt động học sinh..."
                  required
                />
              </div>

              {/* Gợi ý mẫu nhanh trong modal */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-500">Mẫu nhanh:</span>
                {QUICK_PRESETS.map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => {
                      const cur = editingPlan.feedback ? `${editingPlan.feedback}; ${preset}` : preset;
                      setEditingPlan({ ...editingPlan, feedback: cur });
                    }}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 transition border border-slate-200"
                  >
                    +{preset}
                  </button>
                ))}
              </div>

              {/* Trường nhập liệu bổ sung: Ghi chú nhanh */}
              <div>
                <label className="block font-semibold text-amber-800 mb-1">
                  Trường bổ sung: Ghi chú nhanh / Lưu ý riêng cho giáo viên này
                </label>
                <input
                  type="text"
                  value={editingPlan.quickNote || ''}
                  onChange={(e) => setEditingPlan({ ...editingPlan, quickNote: e.target.value })}
                  className="w-full px-3 py-2 border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 bg-amber-50/20 text-xs"
                  placeholder="Ví dụ: Đã nhắc nhở nộp bản sửa vào sáng thứ 5; Cần đổi audio Unit 4..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingPlan(null)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 font-semibold rounded-lg shadow-sm flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Lưu Đánh Giá</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
