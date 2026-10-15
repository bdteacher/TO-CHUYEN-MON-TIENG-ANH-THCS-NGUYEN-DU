import React, { useState } from 'react';
import {
  BookOpenCheck,
  Calculator,
  AlertCircle,
  CheckCircle,
  FileSpreadsheet,
  Edit,
  Printer,
  Info,
  Send,
  Lock,
} from 'lucide-react';
import { Teacher, DepartmentSetting } from '../types';
import { useAuthRole } from '../context/AuthRoleContext';

interface AssignmentManagerProps {
  settings: DepartmentSetting;
  teachers: Teacher[];
  onUpdateTeacher: (updated: Teacher) => void;
  onOpenOfficialPrint: () => void;
  onOpenRequestModal?: () => void;
}

export const AssignmentManager: React.FC<AssignmentManagerProps> = ({
  settings,
  teachers,
  onUpdateTeacher,
  onOpenOfficialPrint,
  onOpenRequestModal,
}) => {
  const { role, isHead, isMember } = useAuthRole();
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const totalPeriods = teachers.reduce((sum, t) => sum + t.teachingPeriodsPerWeek, 0);
  const totalStandard = teachers.reduce((sum, t) => sum + t.standardQuota, 0);
  const balance = totalPeriods - totalStandard;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTeacher) {
      onUpdateTeacher(editingTeacher);
      setEditingTeacher(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Overview & Standard Quota Regulations */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BookOpenCheck className="w-6 h-6 text-indigo-600" />
              Bảng Phân Công Chuyên Môn & Định Mức Giảng Dạy (10 Giáo Viên)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Căn cứ Thông tư 28/2009/TT-BGDĐT và Thông tư 15/2017/TT-BGDĐT về chế độ làm việc của giáo viên phổ thông
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isHead && onOpenRequestModal && (
              <button
                onClick={onOpenRequestModal}
                className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>Gửi Đề Xuất Điều Chỉnh</span>
              </button>
            )}
            <button
              onClick={onOpenOfficialPrint}
              className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition"
            >
              <Printer className="w-4 h-4" />
              <span>In Bảng Phân Công Chuẩn A4</span>
            </button>
          </div>
        </div>

        {/* Regulation highlight */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl">
            <span className="text-slate-500 block">Định mức THCS cơ sở</span>
            <span className="text-base font-bold text-indigo-950">19 tiết / tuần</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Áp dụng giáo viên bộ môn chuẩn</span>
          </div>
          <div className="p-3 bg-amber-50/70 border border-amber-100 rounded-xl">
            <span className="text-slate-500 block">Giảm trừ Tổ trưởng / Tổ phó</span>
            <span className="text-base font-bold text-amber-950">TT: -3 tiết • TP: -1 tiết</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Tổ trưởng: 16t • Tổ phó: 18t</span>
          </div>
          <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl">
            <span className="text-slate-500 block">Giảm trừ Giáo viên Chủ nhiệm</span>
            <span className="text-base font-bold text-emerald-950">-4 tiết / tuần</span>
            <span className="text-[11px] text-slate-500 block mt-0.5">Định mức còn: 15 tiết / tuần</span>
          </div>
          <div className="p-3 bg-sky-50/70 border border-sky-100 rounded-xl">
            <span className="text-slate-500 block">Cân đối giờ dạy toàn tổ</span>
            <span className="text-base font-bold text-sky-950">
              {totalPeriods} / {totalStandard} tiết
            </span>
            <span className="text-[11px] font-semibold block mt-0.5 text-emerald-700">
              {balance === 0
                ? 'Đúng chuẩn định biên 100%'
                : balance > 0
                ? `Thừa +${balance} tiết (Dôi giờ)`
                : `Thiếu ${balance} tiết`}
            </span>
          </div>
        </div>
      </div>

      {/* Main Assignment Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Calculator className="w-5 h-5 text-indigo-600" />
            <h3 className="font-bold text-slate-800 text-sm">
              Chi Tiết Phân Công Giảng Dạy & Lớp Phụ Trách ({settings.departmentName})
            </h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">10/10 Giáo viên đã phân công</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-3 py-3 w-12 text-center">STT</th>
                <th className="px-3 py-3 w-48">Họ và tên</th>
                <th className="px-3 py-3 w-28">Chức vụ tổ</th>
                <th className="px-3 py-3 w-24">Chủ nhiệm</th>
                <th className="px-3 py-3 min-w-[200px]">Các lớp giảng dạy</th>
                <th className="px-3 py-3 text-center w-24">Số tiết thực dạy</th>
                <th className="px-3 py-3 text-center w-24">Định mức chuẩn</th>
                <th className="px-3 py-3 text-center w-28">Chênh lệch</th>
                <th className="px-3 py-3 min-w-[180px]">Nhiệm vụ kiêm nhiệm</th>
                <th className="px-3 py-3 text-center w-20">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {teachers.map((teacher, idx) => {
                const diff = teacher.teachingPeriodsPerWeek - teacher.standardQuota;
                return (
                  <tr
                    key={teacher.id}
                    className={`hover:bg-slate-50/80 transition ${
                      teacher.role === 'Tổ trưởng'
                        ? 'bg-amber-50/40'
                        : teacher.role === 'Tổ phó'
                        ? 'bg-indigo-50/30'
                        : ''
                    }`}
                  >
                    <td className="px-3 py-3 text-center font-mono text-slate-400 font-medium">
                      {idx + 1}
                    </td>
                    <td className="px-3 py-3 font-bold text-slate-900">
                      {teacher.fullName}
                      <span className="block text-[11px] text-slate-400 font-normal">
                        NTNS: {teacher.birthDate || (teacher.birthYear ? `01/01/${teacher.birthYear}` : '-')} • {teacher.degree}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                          teacher.role === 'Tổ trưởng'
                            ? 'bg-amber-100 text-amber-900'
                            : teacher.role === 'Tổ phó'
                            ? 'bg-indigo-100 text-indigo-900'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {teacher.role}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      {teacher.homeroomClass ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold text-xs">
                          {teacher.homeroomClass}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1">
                        {teacher.assignedClasses.map((cls, cIdx) => (
                          <span
                            key={cIdx}
                            className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 rounded text-slate-800 text-xs font-medium border border-slate-200"
                          >
                            {cls}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center font-bold text-slate-900 text-sm">
                      {teacher.teachingPeriodsPerWeek}
                    </td>
                    <td className="px-3 py-3 text-center text-slate-500 font-medium">
                      {teacher.standardQuota}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {diff === 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                          <CheckCircle className="w-3 h-3" /> Đủ định mức
                        </span>
                      ) : diff > 0 ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                          +{diff} tiết (Dôi)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                          {diff} tiết
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-600">
                      <div>{teacher.additionalTasks.join(' • ') || 'Không có'}</div>
                      {teacher.departmentTopic && (
                        <div className="text-[11px] text-indigo-700 font-medium mt-0.5 line-clamp-1" title={teacher.departmentTopic}>
                          📌 CĐ: {teacher.departmentTopic}
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-3 text-center">
                      {isHead ? (
                        <button
                          onClick={() => setEditingTeacher(teacher)}
                          className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition"
                          title="Tổ trưởng: Điều chỉnh phân công"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium italic">
                          Chỉ xem
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot className="bg-slate-50 font-bold border-t-2 border-slate-200 text-slate-900">
              <tr>
                <td colSpan={6} className="px-3 py-3 text-right uppercase text-xs">
                  Tổng cộng toàn tổ:
                </td>
                <td className="px-3 py-3 text-center text-indigo-700 text-sm">{totalPeriods} tiết</td>
                <td className="px-3 py-3 text-center text-slate-700">{totalStandard} tiết</td>
                <td className="px-3 py-3 text-center text-xs">
                  {balance === 0 ? 'Cân bằng' : balance > 0 ? `+${balance} tiết` : `${balance} tiết`}
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Edit Assignment Modal */}
      {editingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full text-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-indigo-900 px-6 py-4 text-white flex justify-between items-center">
              <div>
                <h3 className="font-bold text-base">Điều Chỉnh Phân Công Chuyên Môn</h3>
                <p className="text-xs text-indigo-200">
                  {editingTeacher.fullName} ({editingTeacher.role})
                </p>
              </div>
              <button
                onClick={() => setEditingTeacher(null)}
                className="text-slate-400 hover:text-white text-xl font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Danh sách lớp giảng dạy (phân cách bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  value={editingTeacher.assignedClasses.join(', ')}
                  onChange={(e) =>
                    setEditingTeacher({
                      ...editingTeacher,
                      assignedClasses: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="VD: 9A1, 9A2, 9A3"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Lớp chủ nhiệm
                  </label>
                  <input
                    type="text"
                    value={editingTeacher.homeroomClass || ''}
                    onChange={(e) =>
                      setEditingTeacher({
                        ...editingTeacher,
                        homeroomClass: e.target.value.trim() || undefined,
                      })
                    }
                    className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    placeholder="VD: 9A1 hoặc để trống"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Số tiết giảng dạy / tuần
                  </label>
                  <input
                    type="number"
                    value={editingTeacher.teachingPeriodsPerWeek}
                    onChange={(e) =>
                      setEditingTeacher({
                        ...editingTeacher,
                        teachingPeriodsPerWeek: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold text-slate-900"
                    min={0}
                    max={30}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Định mức tiết chuẩn quy định (Theo Thông tư 28/2009)
                </label>
                <input
                  type="number"
                  value={editingTeacher.standardQuota}
                  onChange={(e) =>
                    setEditingTeacher({
                      ...editingTeacher,
                      standardQuota: parseInt(e.target.value) || 19,
                    })
                  }
                  className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold"
                  required
                />
                <span className="text-[11px] text-slate-500 mt-1 block">
                  * Gợi ý: Giáo viên chuẩn: 19t | GVCN: 15t | Tổ trưởng: 16t | Tổ phó: 18t | Quản trị mạng: 16t
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1 text-indigo-900">
                  Chuyên đề tổ (Chuyên đề chuyên môn phân công)
                </label>
                <input
                  type="text"
                  value={editingTeacher.departmentTopic || ''}
                  onChange={(e) =>
                    setEditingTeacher({
                      ...editingTeacher,
                      departmentTopic: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 text-xs border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-indigo-50/20 font-medium"
                  placeholder="VD: Kỹ thuật xây dựng câu hỏi phân hóa ôn thi vào lớp 10..."
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Công tác kiêm nhiệm khác (phân cách bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  value={editingTeacher.additionalTasks.join(', ')}
                  onChange={(e) =>
                    setEditingTeacher({
                      ...editingTeacher,
                      additionalTasks: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
                    })
                  }
                  className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  placeholder="VD: Bồi dưỡng HSG, Thư ký tổ, Phụ trách phòng máy..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setEditingTeacher(null)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm"
                >
                  Cập nhật phân công
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
