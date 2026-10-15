import React, { useState } from 'react';
import {
  Users,
  Search,
  Filter,
  Phone,
  Mail,
  GraduationCap,
  Calendar,
  Award,
  BookOpen,
  Edit,
  Eye,
  CheckCircle,
  Briefcase,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Teacher, TeacherRole, AcademicDegree, EmulationTitle } from '../types';
import { useAuthRole } from '../context/AuthRoleContext';
import { useToast } from '../context/ToastContext';

interface TeacherListProps {
  teachers: Teacher[];
  onUpdateTeacher: (updated: Teacher) => void;
}

export const TeacherList: React.FC<TeacherListProps> = ({ teachers, onUpdateTeacher }) => {
  const { role, isHead, isMember } = useAuthRole();
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modal states
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.phone.includes(searchTerm) ||
      (teacher.departmentTopic && teacher.departmentTopic.toLowerCase().includes(searchTerm.toLowerCase())) ||
      teacher.assignedClasses.some((c) => c.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = roleFilter === 'all' || teacher.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const getRoleBadge = (role: TeacherRole) => {
    switch (role) {
      case 'Tổ trưởng':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300 shadow-2xs">
            👑 Tổ trưởng
          </span>
        );
      case 'Tổ phó':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-100 text-indigo-900 border border-indigo-300 shadow-2xs">
            ⭐ Tổ phó
          </span>
        );
      case 'Tổ viên':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-300">
            👤 Tổ viên
          </span>
        );
    }
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTeacher) {
      onUpdateTeacher(editingTeacher);
      setEditingTeacher(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Summary of Structure */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-indigo-600" />
              Danh Sách Nhân Sự Tổ Chuyên Môn (10 Giáo Viên)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Định biên chính thức Trường THCS Nguyễn Du: 01 Tổ trưởng, 01 Tổ phó, 08 Tổ viên
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-medium">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  viewMode === 'grid' ? 'bg-white shadow-xs font-bold text-indigo-600' : 'text-slate-600'
                }`}
              >
                Dạng Thẻ (Grid)
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg transition ${
                  viewMode === 'table' ? 'bg-white shadow-xs font-bold text-indigo-600' : 'text-slate-600'
                }`}
              >
                Dạng Bảng (Table)
              </button>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="pt-4 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Tìm theo tên giáo viên, số điện thoại, lớp phụ trách, chuyên đề..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/50"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="text-xs bg-transparent border-none focus:outline-none text-slate-700 font-medium"
              >
                <option value="all">Tất cả chức danh (10 GV)</option>
                <option value="Tổ trưởng">Tổ trưởng (1)</option>
                <option value="Tổ phó">Tổ phó (1)</option>
                <option value="Tổ viên">Tổ viên (8)</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredTeachers.map((teacher) => {
            const isHead = teacher.role === 'Tổ trưởng';
            const isDeputy = teacher.role === 'Tổ phó';

            return (
              <div
                key={teacher.id}
                className={`bg-white rounded-2xl border transition-all duration-200 p-5 shadow-xs hover:shadow-md flex flex-col justify-between relative ${
                  isHead
                    ? 'border-amber-300 ring-2 ring-amber-200/50 bg-gradient-to-b from-amber-50/20 to-white'
                    : isDeputy
                    ? 'border-indigo-300 ring-2 ring-indigo-200/50 bg-gradient-to-b from-indigo-50/20 to-white'
                    : 'border-slate-200/90'
                }`}
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-12 h-12 rounded-2xl font-bold flex items-center justify-center text-base shadow-sm ${
                          isHead
                            ? 'bg-amber-500 text-white'
                            : isDeputy
                            ? 'bg-indigo-600 text-white'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {teacher.fullName.split(' ').pop()?.slice(0, 1)}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-slate-900 text-base">{teacher.fullName}</h3>
                          <span className="text-[11px] font-mono text-slate-400">({teacher.code})</span>
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <span>{teacher.gender === 'Nam' ? 'Thầy' : 'Cô'}</span>
                          <span>•</span>
                          <span>NTNS: <strong>{teacher.birthDate || (teacher.birthYear ? `01/01/${teacher.birthYear}` : '')}</strong></span>
                          <span>•</span>
                          <span className="font-medium text-slate-700">{teacher.teachingYears} năm KN</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Role Badge & Emulation */}
                  <div className="mt-3.5 flex flex-wrap items-center gap-2">
                    {getRoleBadge(teacher.role)}
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium border border-slate-200">
                      {teacher.degree}
                    </span>
                    {teacher.homeroomClass && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold border border-emerald-200">
                        CN: {teacher.homeroomClass}
                      </span>
                    )}
                  </div>

                  {/* Chuyên đề tổ */}
                  {teacher.departmentTopic && (
                    <div className="mt-3 p-2.5 bg-indigo-50/60 rounded-xl border border-indigo-100 text-xs">
                      <div className="text-[11px] font-bold text-indigo-900 flex items-center gap-1 mb-0.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        Chuyên đề tổ:
                      </div>
                      <p className="text-slate-800 font-medium line-clamp-2 italic text-[11px] leading-relaxed">
                        &ldquo;{teacher.departmentTopic}&rdquo;
                      </p>
                    </div>
                  )}

                  {/* Teaching info */}
                  <div className="mt-3 p-3 bg-slate-50 rounded-xl space-y-1.5 text-xs text-slate-700 border border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Các lớp dạy:</span>
                      <span className="font-semibold text-slate-900">
                        {teacher.assignedClasses.join(', ') || 'Chưa phân công'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Số tiết dạy / tuần:</span>
                      <span className="font-bold text-slate-900">
                        {teacher.teachingPeriodsPerWeek} tiết{' '}
                        <span className="text-[11px] font-normal text-slate-500">
                          (Định mức: {teacher.standardQuota})
                        </span>
                      </span>
                    </div>
                  </div>

                  {/* Additional Tasks */}
                  {teacher.additionalTasks.length > 0 && (
                    <div className="mt-3">
                      <div className="text-[11px] font-semibold text-slate-500 mb-1">Kiêm nhiệm:</div>
                      <div className="flex flex-wrap gap-1">
                        {teacher.additionalTasks.map((task, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-100"
                          >
                            {task}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card Footer: Action Buttons */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="text-slate-500 text-[11px] truncate max-w-[150px]">
                    {teacher.phone}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedTeacher(teacher)}
                      className="p-1.5 rounded-lg text-slate-600 hover:text-indigo-600 hover:bg-slate-100 transition"
                      title="Xem chi tiết hồ sơ"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    {isHead && (
                      <button
                        onClick={() => setEditingTeacher(teacher)}
                        className="p-1.5 rounded-lg text-slate-600 hover:text-amber-600 hover:bg-slate-100 transition"
                        title="Tổ trưởng: Chỉnh sửa hồ sơ"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase text-[11px] tracking-wider">
                <tr>
                  <th className="px-3 py-3 text-center">STT</th>
                  <th className="px-4 py-3">Họ và Tên</th>
                  <th className="px-3 py-3">Chức vụ tổ</th>
                  <th className="px-3 py-3">NTNS</th>
                  <th className="px-3 py-3">Trình độ</th>
                  <th className="px-3 py-3">Chủ nhiệm</th>
                  <th className="px-4 py-3 min-w-[220px]">Chuyên đề tổ</th>
                  <th className="px-3 py-3">Lớp dạy</th>
                  <th className="px-3 py-3 text-center">Tiết/Tuần</th>
                  <th className="px-3 py-3">Điện thoại</th>
                  <th className="px-3 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredTeachers.map((teacher, index) => (
                  <tr
                    key={teacher.id}
                    className={`hover:bg-slate-50 transition ${
                      teacher.role === 'Tổ trưởng'
                        ? 'bg-amber-50/30'
                        : teacher.role === 'Tổ phó'
                        ? 'bg-indigo-50/20'
                        : ''
                    }`}
                  >
                    <td className="px-3 py-3 text-center text-slate-400 font-mono font-medium">{index + 1}</td>
                    <td className="px-4 py-3 font-bold text-slate-900 whitespace-nowrap">
                      {teacher.fullName}
                      <span className="block text-[11px] text-slate-400 font-normal">
                        {teacher.teachingYears} năm kinh nghiệm
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">{getRoleBadge(teacher.role)}</td>
                    <td className="px-3 py-3 font-mono text-xs font-semibold text-slate-700 whitespace-nowrap">
                      {teacher.birthDate || (teacher.birthYear ? `01/01/${teacher.birthYear}` : '-')}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">{teacher.degree}</td>
                    <td className="px-3 py-3 whitespace-nowrap">
                      {teacher.homeroomClass ? (
                        <span className="font-bold text-emerald-700 px-2 py-0.5 rounded bg-emerald-50 border border-emerald-200">
                          {teacher.homeroomClass}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs">
                      <div className="font-medium text-indigo-950 max-w-[280px] line-clamp-2" title={teacher.departmentTopic}>
                        {teacher.departmentTopic || <span className="text-slate-400 italic">Chưa đăng ký</span>}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs">{teacher.assignedClasses.join(', ')}</td>
                    <td className="px-3 py-3 text-center font-bold whitespace-nowrap">
                      {teacher.teachingPeriodsPerWeek} / {teacher.standardQuota}
                    </td>
                    <td className="px-3 py-3 font-mono text-xs whitespace-nowrap">{teacher.phone}</td>
                    <td className="px-3 py-3 text-right whitespace-nowrap">
                      <div className="inline-flex gap-1">
                        <button
                          onClick={() => setSelectedTeacher(teacher)}
                          className="p-1 rounded text-slate-500 hover:text-indigo-600 hover:bg-slate-200/50"
                          title="Xem chi tiết"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {isHead && (
                          <button
                            onClick={() => setEditingTeacher(teacher)}
                            className="p-1 rounded text-slate-500 hover:text-amber-600 hover:bg-slate-200/50"
                            title="Tổ trưởng: Chỉnh sửa"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full text-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-indigo-900 to-blue-900 px-6 py-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 text-white font-bold flex items-center justify-center text-lg">
                  {selectedTeacher.fullName.split(' ').pop()?.slice(0, 1)}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{selectedTeacher.fullName}</h3>
                  <p className="text-xs text-indigo-200">{selectedTeacher.role} • {selectedTeacher.degree}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedTeacher(null)}
                className="text-slate-300 hover:text-white text-2xl font-bold leading-none"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 overflow-y-auto">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block">Mã giáo viên</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{selectedTeacher.code}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block">NTNS / Giới tính</span>
                  <span className="font-semibold text-slate-900">
                    {selectedTeacher.birthDate || (selectedTeacher.birthYear ? `01/01/${selectedTeacher.birthYear}` : '-')} ({selectedTeacher.gender})
                  </span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block">Trình độ chuyên môn</span>
                  <span className="font-semibold text-slate-900">{selectedTeacher.degree}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block">Số năm giảng dạy</span>
                  <span className="font-semibold text-slate-900">{selectedTeacher.teachingYears} năm</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block">Lớp chủ nhiệm</span>
                  <span className="font-bold text-emerald-700">{selectedTeacher.homeroomClass || 'Không có'}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block">Định mức tiết chuẩn</span>
                  <span className="font-bold text-indigo-700">{selectedTeacher.standardQuota} tiết/tuần</span>
                </div>
              </div>

              {/* Chuyên đề tổ */}
              <div className="p-4 bg-indigo-50/70 rounded-xl border border-indigo-200/80 text-xs space-y-1.5">
                <h4 className="font-bold text-indigo-950 flex items-center gap-1.5 text-xs transition-all duration-300 ease-in-out px-2 py-0.5 -mx-2 -my-0.5 rounded-md hover:bg-white/80 hover:shadow-xs hover:text-indigo-700 cursor-pointer w-fit">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Chuyên Đề Tổ Phân Công Thực Hiện
                </h4>
                <p className="text-slate-800 font-semibold leading-relaxed">
                  {selectedTeacher.departmentTopic || 'Chưa đăng ký chuyên đề'}
                </p>
              </div>

              {/* Contact info */}
              <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs space-y-2">
                <h4 className="font-bold text-indigo-950 flex items-center gap-1.5 transition-all duration-300 ease-in-out px-2 py-0.5 -mx-2 -my-0.5 rounded-md hover:bg-white/80 hover:shadow-xs hover:text-indigo-700 cursor-pointer w-fit">
                  <Phone className="w-3.5 h-3.5 text-indigo-600" /> Thông tin liên hệ
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700">
                  <div>Số điện thoại: <strong>{selectedTeacher.phone}</strong></div>
                  <div>Email: <strong>{selectedTeacher.email}</strong></div>
                </div>
              </div>

              {/* Assignment & Tasks */}
              <div className="space-y-3 text-xs">
                <div>
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5 mb-1.5 transition-all duration-300 ease-in-out px-2 py-0.5 -mx-2 -my-0.5 rounded-md hover:bg-slate-100/80 hover:shadow-xs hover:text-slate-900 cursor-pointer w-fit">
                    <BookOpen className="w-4 h-4 text-sky-600" />
                    Phân công giảng dạy ({selectedTeacher.teachingPeriodsPerWeek} tiết/tuần)
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTeacher.assignedClasses.map((cls, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-sky-50 text-sky-800 font-semibold border border-sky-200"
                      >
                        Lớp {cls}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5 mb-1.5 transition-all duration-300 ease-in-out px-2 py-0.5 -mx-2 -my-0.5 rounded-md hover:bg-slate-100/80 hover:shadow-xs hover:text-slate-900 cursor-pointer w-fit">
                    <Briefcase className="w-4 h-4 text-amber-600" />
                    Nhiệm vụ kiêm nhiệm & Phụ trách
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-slate-600">
                    {selectedTeacher.additionalTasks.map((task, idx) => (
                      <li key={idx}>{task}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5 mb-1.5 transition-all duration-300 ease-in-out px-2 py-0.5 -mx-2 -my-0.5 rounded-md hover:bg-slate-100/80 hover:shadow-xs hover:text-slate-900 cursor-pointer w-fit">
                    <Award className="w-4 h-4 text-purple-600" />
                    Danh hiệu thi đua & Đánh giá chuẩn nghề nghiệp
                  </h4>
                  <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-purple-900">{selectedTeacher.emulationTitle}</div>
                      <div className="text-[11px] text-slate-500">Chuẩn nghề nghiệp GV: <strong>{selectedTeacher.professionalStandardRating}</strong></div>
                    </div>
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                  </div>
                </div>

                {selectedTeacher.notes && (
                  <div className="p-3 bg-slate-100 rounded-xl text-slate-600 italic">
                    Ghi chú: {selectedTeacher.notes}
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex justify-between items-center">
              <span className="text-xs text-slate-500">Hồ sơ giáo viên THCS Nguyễn Du</span>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingTeacher(selectedTeacher);
                    setSelectedTeacher(null);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold"
                >
                  Chỉnh sửa
                </button>
                <button
                  onClick={() => setSelectedTeacher(null)}
                  className="px-3 py-1.5 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Teacher Modal */}
      {editingTeacher && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full text-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 px-6 py-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Edit className="w-5 h-5 text-amber-400" />
                Cập Nhật Hồ Sơ: {editingTeacher.fullName}
              </h3>
              <button
                onClick={() => setEditingTeacher(null)}
                className="text-slate-400 hover:text-white text-2xl font-bold leading-none"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Họ và tên</label>
                  <input
                    type="text"
                    value={editingTeacher.fullName}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, fullName: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Chức danh trong tổ</label>
                  <select
                    value={editingTeacher.role}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, role: e.target.value as TeacherRole })}
                    className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold text-indigo-900"
                  >
                    <option value="Tổ trưởng">Tổ trưởng (Phụ trách chung)</option>
                    <option value="Tổ phó">Tổ phó (Phụ trách chuyên đề)</option>
                    <option value="Tổ viên">Tổ viên</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Trình độ chuyên môn</label>
                  <select
                    value={editingTeacher.degree}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, degree: e.target.value as AcademicDegree })}
                    className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Cử nhân Sư phạm">Cử nhân Sư phạm</option>
                    <option value="Thạc sĩ">Thạc sĩ</option>
                    <option value="Tiến sĩ">Tiến sĩ</option>
                    <option value="Cao đẳng Sư phạm">Cao đẳng Sư phạm</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Số điện thoại</label>
                  <input
                    type="text"
                    value={editingTeacher.phone}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Email công vụ</label>
                  <input
                    type="email"
                    value={editingTeacher.email}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, email: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Lớp chủ nhiệm (nếu có)</label>
                  <input
                    type="text"
                    value={editingTeacher.homeroomClass || ''}
                    placeholder="VD: 9A1 hoặc để trống"
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, homeroomClass: e.target.value || undefined })}
                    className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    NTNS (Ngày tháng năm sinh)
                  </label>
                  <input
                    type="text"
                    value={editingTeacher.birthDate || ''}
                    placeholder="DD/MM/YYYY (VD: 15/08/1980)"
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, birthDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Số năm công tác</label>
                  <input
                    type="number"
                    value={editingTeacher.teachingYears}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, teachingYears: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Số tiết dạy thực tế / tuần</label>
                  <input
                    type="number"
                    value={editingTeacher.teachingPeriodsPerWeek}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, teachingPeriodsPerWeek: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Định mức tiết chuẩn (TT 28/2009)</label>
                  <input
                    type="number"
                    value={editingTeacher.standardQuota}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, standardQuota: parseInt(e.target.value) || 19 })}
                    className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1 text-indigo-900">
                  Chuyên đề tổ (Chuyên đề chuyên môn phân công chủ trì / báo cáo)
                </label>
                <input
                  type="text"
                  value={editingTeacher.departmentTopic || ''}
                  onChange={(e) => setEditingTeacher({ ...editingTeacher, departmentTopic: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-indigo-50/20 font-medium text-slate-900"
                  placeholder="VD: Kỹ thuật xây dựng câu hỏi phân hóa ôn thi vào lớp 10..."
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Các lớp được phân công dạy (cách nhau bởi dấu phẩy)
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
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Kiêm nhiệm / Phụ trách chuyên môn (cách nhau bởi dấu phẩy)
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
                  placeholder="VD: Bồi dưỡng HSG, Phụ trách phòng máy, Thư ký tổ..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Danh hiệu thi đua đăng ký</label>
                  <select
                    value={editingTeacher.emulationTitle}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, emulationTitle: e.target.value as EmulationTitle })}
                    className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Chiến sĩ thi đua cấp cơ sở">Chiến sĩ thi đua cấp cơ sở</option>
                    <option value="Lao động tiên tiến">Lao động tiên tiến</option>
                    <option value="Chiến sĩ thi đua cấp Tỉnh/TP">Chiến sĩ thi đua cấp Tỉnh/TP</option>
                    <option value="Hoàn thành tốt nhiệm vụ">Hoàn thành tốt nhiệm vụ</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Chuẩn nghề nghiệp</label>
                  <select
                    value={editingTeacher.professionalStandardRating}
                    onChange={(e) => setEditingTeacher({ ...editingTeacher, professionalStandardRating: e.target.value as any })}
                    className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Xuất sắc">Xuất sắc</option>
                    <option value="Tốt">Tốt</option>
                    <option value="Khá">Khá</option>
                    <option value="Đạt">Đạt</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Ghi chú & Đánh giá năng lực</label>
                <textarea
                  rows={2}
                  value={editingTeacher.notes || ''}
                  onChange={(e) => setEditingTeacher({ ...editingTeacher, notes: e.target.value })}
                  className="w-full px-3 py-2 text-xs border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t">
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
                  Lưu thay đổi hồ sơ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
