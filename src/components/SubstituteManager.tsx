import React, { useState } from 'react';
import {
  CalendarClock,
  PlusCircle,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  User,
  ArrowRight,
  Filter,
  Send,
  Lock,
} from 'lucide-react';
import { Teacher, SubstituteTeaching } from '../types';
import { useAuthRole } from '../context/AuthRoleContext';
import { useToast } from '../context/ToastContext';

interface SubstituteManagerProps {
  teachers: Teacher[];
  substitutes: SubstituteTeaching[];
  onAddSubstitute: (sub: SubstituteTeaching) => void;
  onUpdateSubstitute: (sub: SubstituteTeaching) => void;
  onDeleteSubstitute: (id: string) => void;
}

export const SubstituteManager: React.FC<SubstituteManagerProps> = ({
  teachers,
  substitutes,
  onAddSubstitute,
  onUpdateSubstitute,
  onDeleteSubstitute,
}) => {
  const { role, isHead, isMember, displayName, matchedTeacher } = useAuthRole();
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Substitute Form State
  const [newSub, setNewSub] = useState<Partial<SubstituteTeaching>>({
    date: new Date().toISOString().split('T')[0],
    absentTeacherId: teachers[0]?.id || '',
    substituteTeacherId: teachers[1]?.id || '',
    className: '9A1',
    period: 1,
    subject: 'Tiếng Anh',
    lessonName: '',
    reason: '',
    status: 'Đã duyệt',
  });

  const filteredSubstitutes = substitutes.filter((sub) => {
    const absentTeacher = teachers.find((t) => t.id === sub.absentTeacherId);
    const subTeacher = teachers.find((t) => t.id === sub.substituteTeacherId);
    const matchSearch =
      (absentTeacher?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (subTeacher?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      sub.className.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.lessonName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.reason.toLowerCase().includes(searchTerm.toLowerCase());

    const matchStatus = statusFilter === 'all' || sub.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSub.absentTeacherId || !newSub.substituteTeacherId || !newSub.lessonName) {
      return;
    }

    const created: SubstituteTeaching = {
      id: `sub-${Date.now()}`,
      date: newSub.date || new Date().toISOString().split('T')[0],
      absentTeacherId: newSub.absentTeacherId,
      substituteTeacherId: newSub.substituteTeacherId,
      className: newSub.className || '9A1',
      period: Number(newSub.period) || 1,
      subject: newSub.subject || 'Tiếng Anh',
      lessonName: newSub.lessonName,
      reason: newSub.reason || 'Bận công tác',
      status: isHead ? ((newSub.status as any) || 'Đã duyệt') : 'Chờ duyệt',
    };

    onAddSubstitute(created);
    setIsModalOpen(false);
    if (isHead) {
      toast.success('Đã xếp lịch dạy thay thành công!', 'Phân công dạy thay');
    } else {
      toast.success('Đã gửi yêu cầu xin dạy thay tới Tổ trưởng để phê duyệt!', 'Gửi yêu cầu dạy thay');
    }

    setNewSub({
      date: new Date().toISOString().split('T')[0],
      absentTeacherId: teachers[0]?.id || '',
      substituteTeacherId: teachers[1]?.id || '',
      className: '9A1',
      period: 1,
      subject: 'Tiếng Anh',
      lessonName: '',
      reason: '',
      status: isHead ? 'Đã duyệt' : 'Chờ duyệt',
    });
  };

  // Substitute count per teacher
  const substituteStats = teachers.map((t) => {
    const count = substitutes.filter((s) => s.substituteTeacherId === t.id).length;
    const absentCount = substitutes.filter((s) => s.absentTeacherId === t.id).length;
    return { teacher: t, substituteCount: count, absentCount };
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <CalendarClock className="w-6 h-6 text-indigo-600" />
              Sổ Theo Dõi Dạy Thay & Dạy Bù Chuyên Môn
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Quản lý phân công dạy thay khi giáo viên nghỉ ốm, công tác, tập huấn chuyên môn (Căn cứ thanh toán phụ cấp dạy thay)
            </p>
          </div>

          <button
            onClick={() => {
              if (isMember && matchedTeacher) {
                setNewSub((prev) => ({ ...prev, absentTeacherId: matchedTeacher.id }));
              }
              setIsModalOpen(true);
            }}
            className={`px-4 py-2 rounded-xl text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition active:scale-95 ${
              isHead ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isHead ? <PlusCircle className="w-4 h-4" /> : <Send className="w-4 h-4" />}
            <span>{isHead ? 'Xếp Lịch Dạy Thay (Toàn quyền)' : 'Gửi Yêu Cầu Xin Dạy Thay'}</span>
          </button>
        </div>

        {/* Search & Filter */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Tìm theo tên giáo viên, lớp, tên bài dạy hoặc lý do..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/50"
            />
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs bg-transparent border-none focus:outline-none text-slate-700 font-medium"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="Đã duyệt">Đã duyệt</option>
              <option value="Chờ duyệt">Chờ duyệt</option>
              <option value="Đã hoàn thành">Đã hoàn thành</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid: Substitutes list + Statistics per teacher */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Substitutes Records List (Left 2 cols) */}
        <div className="lg:col-span-2 space-y-3">
          <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center justify-between">
            <span>Danh Sách Tiết Dạy Thay ({filteredSubstitutes.length})</span>
            <span className="text-[11px] text-slate-400 font-normal">Học kỳ I • Năm học 2025 - 2026</span>
          </div>

          {filteredSubstitutes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-8 text-center text-slate-500 text-xs">
              Không có dữ liệu dạy thay phù hợp với bộ lọc.
            </div>
          ) : (
            filteredSubstitutes.map((sub) => {
              const absentTeacher = teachers.find((t) => t.id === sub.absentTeacherId);
              const subTeacher = teachers.find((t) => t.id === sub.substituteTeacherId);

              return (
                <div
                  key={sub.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs hover:shadow-sm transition text-xs space-y-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{sub.date}</span>
                      <span className="text-slate-300">•</span>
                      <span className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold">
                        Tiết {sub.period} - Lớp {sub.className}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-600 font-medium">{sub.subject}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      {isHead ? (
                        <select
                          value={sub.status}
                          onChange={(e) =>
                            onUpdateSubstitute({ ...sub, status: e.target.value as any })
                          }
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full border cursor-pointer ${
                            sub.status === 'Đã hoàn thành'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : sub.status === 'Đã duyệt'
                              ? 'bg-blue-50 text-blue-700 border-blue-300'
                              : 'bg-amber-50 text-amber-700 border-amber-300'
                          }`}
                          title="Tổ trưởng: Chọn thay đổi trạng thái phê duyệt"
                        >
                          <option value="Chờ duyệt">Chờ duyệt</option>
                          <option value="Đã duyệt">Đã duyệt</option>
                          <option value="Đã hoàn thành">Đã hoàn thành</option>
                        </select>
                      ) : (
                        <span
                          className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${
                            sub.status === 'Đã hoàn thành'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                              : sub.status === 'Đã duyệt'
                              ? 'bg-blue-50 text-blue-700 border-blue-300'
                              : 'bg-amber-50 text-amber-700 border-amber-300'
                          }`}
                        >
                          {sub.status}
                        </span>
                      )}

                      {isHead && (
                        <button
                          onClick={() => onDeleteSubstitute(sub.id)}
                          className="text-slate-400 hover:text-red-600 text-xs px-1"
                          title="Tổ trưởng: Xóa phiếu dạy thay"
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Flow: Absent -> Substitute */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100 gap-2">
                    <div>
                      <span className="text-[11px] text-slate-500 block">Giáo viên nghỉ:</span>
                      <span className="font-bold text-red-700 text-sm">
                        {absentTeacher?.fullName || 'Chưa chọn'}
                      </span>
                      <span className="text-[11px] text-slate-400 block">{absentTeacher?.role}</span>
                    </div>

                    <div className="hidden sm:flex items-center text-slate-400">
                      <ArrowRight className="w-5 h-5 text-indigo-400" />
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-500 block">Giáo viên dạy thay:</span>
                      <span className="font-bold text-emerald-700 text-sm">
                        {subTeacher?.fullName || 'Chưa chọn'}
                      </span>
                      <span className="text-[11px] text-slate-400 block">{subTeacher?.role}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div>
                      <span className="font-semibold text-slate-700">Tên bài dạy: </span>
                      <span className="text-slate-900 font-medium">{sub.lessonName}</span>
                    </div>
                    <div>
                      <span className="font-semibold text-slate-700">Lý do nghỉ / điều động: </span>
                      <span className="text-slate-600 italic">{sub.reason}</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right Col: Teaching Substitute Summary per Teacher */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2 mb-3">
              <User className="w-4 h-4 text-indigo-600" />
              Thống Kê Tiết Dạy Thay (10 Giáo Viên)
            </h3>
            <p className="text-xs text-slate-500 mb-3">
              Tổng hợp số tiết dạy thay hỗ trợ đồng nghiệp để tính giờ vượt mức
            </p>

            <div className="space-y-2">
              {substituteStats.map(({ teacher, substituteCount, absentCount }) => (
                <div
                  key={teacher.id}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs border border-slate-100"
                >
                  <div className="truncate">
                    <span className="font-semibold text-slate-800">{teacher.fullName}</span>
                    <span className="text-[11px] text-slate-400 block">{teacher.role}</span>
                  </div>
                  <div className="text-right">
                    <span
                      className={`font-bold px-2 py-0.5 rounded ${
                        substituteCount > 0 ? 'bg-emerald-100 text-emerald-800' : 'text-slate-400'
                      }`}
                    >
                      Dạy thay: {substituteCount} tiết
                    </span>
                    {absentCount > 0 && (
                      <span className="text-[10px] text-red-500 block">Nghỉ/Công tác: {absentCount}t</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: New Substitute */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full text-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-indigo-900 px-6 py-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-2">
                <CalendarClock className="w-5 h-5 text-amber-300" />
                {isHead ? 'Xếp Lịch Phân Công Dạy Thay (Toàn quyền)' : 'Gửi Yêu Cầu Xin Dạy Thay / Báo Vắng'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-white text-xl font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-3.5 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ngày dạy thay</label>
                  <input
                    type="date"
                    value={newSub.date}
                    onChange={(e) => setNewSub({ ...newSub, date: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tiết thứ</label>
                  <select
                    value={newSub.period}
                    onChange={(e) => setNewSub({ ...newSub, period: Number(e.target.value) })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((p) => (
                      <option key={p} value={p}>
                        Tiết {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Lớp dạy</label>
                  <input
                    type="text"
                    value={newSub.className}
                    onChange={(e) => setNewSub({ ...newSub, className: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="VD: 9A1"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Môn học</label>
                  <input
                    type="text"
                    value={newSub.subject}
                    onChange={(e) => setNewSub({ ...newSub, subject: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-red-700">
                  Giáo viên nghỉ (Cần người dạy thay)
                </label>
                <select
                  value={newSub.absentTeacherId}
                  onChange={(e) => setNewSub({ ...newSub, absentTeacherId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-medium"
                  required
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.fullName} ({t.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-emerald-700">
                  Giáo viên được phân công dạy thay
                </label>
                <select
                  value={newSub.substituteTeacherId}
                  onChange={(e) => setNewSub({ ...newSub, substituteTeacherId: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold text-emerald-900"
                  required
                >
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.fullName} ({t.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tên bài dạy</label>
                <input
                  type="text"
                  value={newSub.lessonName}
                  onChange={(e) => setNewSub({ ...newSub, lessonName: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="VD: Luyện tập hình thang cân / Thực hành lập trình Python"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Lý do xin nghỉ / cử đi công tác
                </label>
                <input
                  type="text"
                  value={newSub.reason}
                  onChange={(e) => setNewSub({ ...newSub, reason: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="VD: Đi tập huấn chương trình GDPT 2018 tại Phòng GD&ĐT"
                  required
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
                  className={`px-4 py-2 text-white font-semibold rounded-lg shadow-sm ${
                    isHead ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isHead ? 'Lưu & Phê Duyệt Tiết Dạy Thay' : 'Gửi Yêu Cầu Tới Tổ Trưởng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
