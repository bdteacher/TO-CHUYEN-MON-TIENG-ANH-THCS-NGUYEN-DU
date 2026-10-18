import React, { useState, useEffect } from 'react';
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
  QrCode,
  Camera,
  Download,
  Share2,
  FileCheck2,
  CalendarClock,
  Printer,
  ShieldCheck,
} from 'lucide-react';
import {
  Teacher,
  TeacherRole,
  AcademicDegree,
  EmulationTitle,
  LessonPlanReview,
  LessonObservation,
  SubstituteTeaching,
  DepartmentSetting,
} from '../types';
import { useAuthRole } from '../context/AuthRoleContext';
import { useToast } from '../context/ToastContext';
import { AvatarUploadModal } from './AvatarUploadModal';
import { TeacherInspectionModal } from './TeacherInspectionModal';

interface TeacherListProps {
  teachers: Teacher[];
  onUpdateTeacher: (updated: Teacher) => void;
  lessonPlans?: LessonPlanReview[];
  observations?: LessonObservation[];
  substitutes?: SubstituteTeaching[];
  settings?: DepartmentSetting;
  initialInspectTeacherId?: string | null;
}

export const TeacherList: React.FC<TeacherListProps> = ({
  teachers,
  onUpdateTeacher,
  lessonPlans = [],
  observations = [],
  substitutes = [],
  settings = {
    schoolName: 'TRƯỜNG THCS NGUYỄN DU',
    districtCity: 'Phòng GD&ĐT - Trường THCS Nguyễn Du',
    departmentName: 'TỔ TIẾNG ANH',
    schoolYear: '2025 - 2026',
    semester: 'Học kỳ I',
    headOfDepartmentId: 'gv-01',
    deputyHeadId: 'gv-02',
    totalTeachers: 10,
  },
  initialInspectTeacherId = null,
}) => {
  const { role, isHead, isMember } = useAuthRole();
  const toast = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Modals state
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [avatarModalTeacher, setAvatarModalTeacher] = useState<Teacher | null>(null);
  const [inspectionModalTeacher, setInspectionModalTeacher] = useState<Teacher | null>(null);

  // Check URL parameter or initialInspectTeacherId on mount
  useEffect(() => {
    if (initialInspectTeacherId) {
      const found = teachers.find((t) => t.id === initialInspectTeacherId);
      if (found) {
        setInspectionModalTeacher(found);
      }
    }
  }, [initialInspectTeacherId, teachers]);

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
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
            Tổ viên
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

  const handleSaveAvatar = (teacherId: string, avatarUrl: string | undefined) => {
    const t = teachers.find((item) => item.id === teacherId);
    if (t) {
      const updated = { ...t, avatarUrl };
      onUpdateTeacher(updated);
      if (selectedTeacher?.id === teacherId) setSelectedTeacher(updated);
      if (editingTeacher?.id === teacherId) setEditingTeacher(updated);
    }
  };

  const getInitials = (name: string) => {
    const parts = name.trim().split(' ');
    return parts[parts.length - 1]?.slice(0, 1) || 'GV';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Statistics */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-6 h-6 text-indigo-600" />
              Danh Sách Đội Ngũ 10 Giáo Viên Tổ Chuyên Môn
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Quản lý định biên, chèn ảnh đại diện (avatar) và tạo mã QR liên kết hồ sơ kiểm tra chuyên môn (CV 5512 & CV 5555)
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2">
            <div className="bg-slate-100 p-1 rounded-xl flex items-center text-xs">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  viewMode === 'grid'
                    ? 'bg-white text-indigo-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Dạng Thẻ
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg font-medium transition ${
                  viewMode === 'table'
                    ? 'bg-white text-indigo-900 font-bold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Dạng Bảng
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
                className={`bg-white rounded-2xl border transition-all duration-200 p-5 shadow-xs hover:shadow-md flex flex-col justify-between relative group/card ${
                  isHead
                    ? 'border-amber-300 ring-2 ring-amber-200/50 bg-gradient-to-b from-amber-50/20 to-white'
                    : isDeputy
                    ? 'border-indigo-300 ring-2 ring-indigo-200/50 bg-gradient-to-b from-indigo-50/20 to-white'
                    : 'border-slate-200/90'
                }`}
              >
                <div>
                  {/* Card Header with Interactive Avatar */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                      {/* Avatar with Camera insert icon overlay */}
                      <div
                        className="relative group/avatar cursor-pointer shrink-0"
                        onClick={() => setAvatarModalTeacher(teacher)}
                        title="Bấm để chèn / đổi ảnh đại diện giáo viên"
                      >
                        <div
                          className={`w-14 h-14 rounded-2xl overflow-hidden font-bold flex items-center justify-center text-lg shadow-sm border-2 transition duration-200 ${
                            isHead
                              ? 'border-amber-400 bg-amber-500 text-white'
                              : isDeputy
                              ? 'border-indigo-400 bg-indigo-600 text-white'
                              : 'border-slate-200 bg-slate-600 text-white'
                          }`}
                        >
                          {teacher.avatarUrl ? (
                            <img
                              src={teacher.avatarUrl}
                              alt={teacher.fullName}
                              className="w-full h-full object-cover group-hover/avatar:scale-105 transition"
                            />
                          ) : (
                            getInitials(teacher.fullName)
                          )}
                        </div>

                        {/* Hover Overlay Camera Badge */}
                        <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover/avatar:opacity-100 transition flex flex-col items-center justify-center text-white text-[9px] font-bold">
                          <Camera className="w-4 h-4 mb-0.5" />
                          <span>Chèn ảnh</span>
                        </div>
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h3 className="font-bold text-slate-900 text-base truncate">
                            {teacher.fullName}
                          </h3>
                          <span className="text-[11px] font-mono text-slate-400">({teacher.code})</span>
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 flex-wrap">
                          <span>{teacher.gender === 'Nam' ? 'Thầy' : 'Cô'}</span>
                          <span>•</span>
                          <span>NTNS: <strong>{teacher.birthDate || (teacher.birthYear ? `01/01/${teacher.birthYear}` : '')}</strong></span>
                          <span>•</span>
                          <span className="font-medium text-slate-700">{teacher.teachingYears} năm KN</span>
                        </p>
                      </div>
                    </div>

                    {/* Quick QR Inspection Badge Button on top right */}
                    <button
                      onClick={() => setInspectionModalTeacher(teacher)}
                      className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition shadow-2xs active:scale-95 shrink-0"
                      title="Mã QR & Thẻ Kiểm Tra Hồ Sơ Chuyên Môn (Bàn Kiểm Tra)"
                    >
                      <QrCode className="w-4 h-4" />
                    </button>
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
                  {/* Left: Quick QR Inspection Button */}
                  <button
                    onClick={() => setInspectionModalTeacher(teacher)}
                    className="px-2.5 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold text-[11px] flex items-center gap-1.5 border border-indigo-200 transition active:scale-95"
                    title="Mã QR tra cứu hồ sơ thanh tra chuyên môn"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Mã QR Hồ Sơ</span>
                  </button>

                  <div className="flex items-center gap-1.5">
                    {/* Insert Avatar Button */}
                    <button
                      onClick={() => setAvatarModalTeacher(teacher)}
                      className="px-2 py-1 rounded-lg text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 border border-slate-200 hover:border-indigo-200 transition flex items-center gap-1 text-[11px] font-semibold"
                      title="Chèn / Đổi ảnh đại diện (Avatar)"
                    >
                      <Camera className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Chèn Avatar</span>
                    </button>

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
                  <th className="px-3 py-3 w-14 text-center">Avatar</th>
                  <th className="px-4 py-3">Họ và Tên</th>
                  <th className="px-3 py-3">Chức vụ tổ</th>
                  <th className="px-3 py-3">NTNS</th>
                  <th className="px-3 py-3">Trình độ</th>
                  <th className="px-3 py-3">Chủ nhiệm</th>
                  <th className="px-3 py-3">Lớp dạy</th>
                  <th className="px-3 py-3 text-center">Tiết/tuần</th>
                  <th className="px-3 py-3 text-center">Định mức</th>
                  <th className="px-3 py-3">Điện thoại</th>
                  <th className="px-3 py-3 text-center">Mã QR</th>
                  <th className="px-3 py-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTeachers.map((teacher, index) => (
                  <tr key={teacher.id} className="hover:bg-slate-50 transition">
                    <td className="px-3 py-3 text-center font-mono text-slate-400 font-medium">
                      {index + 1}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <div
                        onClick={() => setAvatarModalTeacher(teacher)}
                        className="w-9 h-9 rounded-xl overflow-hidden border border-slate-200 shadow-2xs mx-auto cursor-pointer hover:ring-2 hover:ring-indigo-400 transition flex items-center justify-center bg-slate-100"
                        title="Bấm để chèn/đổi avatar"
                      >
                        {teacher.avatarUrl ? (
                          <img
                            src={teacher.avatarUrl}
                            alt={teacher.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="font-bold text-xs text-slate-600">
                            {getInitials(teacher.fullName)}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">
                      {teacher.fullName}
                      <span className="block text-[11px] text-slate-400 font-normal font-mono">
                        {teacher.code}
                      </span>
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">{getRoleBadge(teacher.role)}</td>
                    <td className="px-3 py-3 font-mono text-xs whitespace-nowrap">
                      {teacher.birthDate || (teacher.birthYear ? `01/01/${teacher.birthYear}` : '-')}
                    </td>
                    <td className="px-3 py-3 whitespace-nowrap">{teacher.degree}</td>
                    <td className="px-3 py-3 font-bold text-emerald-700 whitespace-nowrap">
                      {teacher.homeroomClass || '-'}
                    </td>
                    <td className="px-3 py-3 text-xs">{teacher.assignedClasses.join(', ')}</td>
                    <td className="px-3 py-3 text-center font-bold text-indigo-700">
                      {teacher.teachingPeriodsPerWeek}
                    </td>
                    <td className="px-3 py-3 text-center font-medium text-slate-600">
                      {teacher.standardQuota}
                    </td>
                    <td className="px-3 py-3 font-mono text-xs whitespace-nowrap">{teacher.phone}</td>
                    <td className="px-3 py-3 text-center whitespace-nowrap">
                      <button
                        onClick={() => setInspectionModalTeacher(teacher)}
                        className="p-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 transition"
                        title="Mở mã QR kiểm tra chuyên môn"
                      >
                        <QrCode className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="px-3 py-3 text-right whitespace-nowrap">
                      <div className="inline-flex gap-1">
                        <button
                          onClick={() => setAvatarModalTeacher(teacher)}
                          className="p-1 rounded text-slate-500 hover:text-indigo-600 hover:bg-slate-200/50"
                          title="Chèn ảnh đại diện"
                        >
                          <Camera className="w-4 h-4" />
                        </button>
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
                <div
                  onClick={() => setAvatarModalTeacher(selectedTeacher)}
                  className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white/40 shadow-xs bg-white/20 text-white font-bold flex items-center justify-center text-lg cursor-pointer hover:border-amber-300 transition relative group"
                  title="Nhấp để chèn / đổi ảnh đại diện"
                >
                  {selectedTeacher.avatarUrl ? (
                    <img
                      src={selectedTeacher.avatarUrl}
                      alt={selectedTeacher.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    getInitials(selectedTeacher.fullName)
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition">
                    <Camera className="w-4 h-4" />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg">{selectedTeacher.fullName}</h3>
                  <p className="text-xs text-indigo-200">
                    {selectedTeacher.role} • {selectedTeacher.degree}
                  </p>
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
              {/* Prominent Avatar Insertion Box */}
              <div className="p-4 bg-gradient-to-r from-indigo-50/90 via-sky-50/70 to-blue-50/80 rounded-2xl border border-indigo-200/90 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div
                    onClick={() => setAvatarModalTeacher(selectedTeacher)}
                    className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-indigo-500 shadow-md bg-white cursor-pointer hover:ring-2 hover:ring-indigo-400 transition shrink-0 relative group"
                    title="Bấm để tải lên hoặc đổi ảnh đại diện"
                  >
                    {selectedTeacher.avatarUrl ? (
                      <img
                        src={selectedTeacher.avatarUrl}
                        alt={selectedTeacher.fullName}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                    ) : (
                      <div className="w-full h-full bg-slate-600 text-white flex items-center justify-center font-bold text-xl">
                        {getInitials(selectedTeacher.fullName)}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white text-[9px] font-bold transition">
                      <Camera className="w-4 h-4 mb-0.5" />
                      <span>Đổi ảnh</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                      <span>Mục Chèn Ảnh Giáo Viên Vào Avatar</span>
                      {selectedTeacher.avatarUrl ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                          ✓ Đã có ảnh chân dung
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold border border-amber-200">
                          Chưa có ảnh (đang dùng chữ cái)
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Chèn ảnh đại diện chân dung từ máy tính/điện thoại, dán liên kết URL hoặc chọn mẫu sư phạm sẵn có.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setAvatarModalTeacher(selectedTeacher)}
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition active:scale-95 shrink-0"
                >
                  <Camera className="w-4 h-4 text-amber-300" />
                  <span>Chèn / Đổi Ảnh Avatar</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-slate-500 block">Mã giáo viên</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {selectedTeacher.code}
                  </span>
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
                <h4 className="font-bold text-indigo-950 flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Chuyên Đề Tổ Phân Công Thực Hiện
                </h4>
                <p className="text-slate-800 font-semibold leading-relaxed">
                  {selectedTeacher.departmentTopic || 'Chưa đăng ký chuyên đề'}
                </p>
              </div>

              {/* Contact info */}
              <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 text-xs space-y-2">
                <h4 className="font-bold text-indigo-950 flex items-center gap-1.5">
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
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
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
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
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
                  <h4 className="font-bold text-slate-800 flex items-center gap-1.5 mb-1.5">
                    <Award className="w-4 h-4 text-purple-600" />
                    Danh hiệu thi đua & Đánh giá chuẩn nghề nghiệp
                  </h4>
                  <div className="p-3 bg-purple-50/50 rounded-xl border border-purple-100 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-purple-900">{selectedTeacher.emulationTitle}</div>
                      <div className="text-[11px] text-slate-500">
                        Chuẩn nghề nghiệp GV: <strong>{selectedTeacher.professionalStandardRating}</strong>
                      </div>
                    </div>
                    <CheckCircle className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-3 border-t border-slate-100 flex flex-wrap justify-between items-center gap-2">
              <button
                onClick={() => {
                  setInspectionModalTeacher(selectedTeacher);
                  setSelectedTeacher(null);
                }}
                className="px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-xs"
              >
                <QrCode className="w-4 h-4" />
                <span>Mã QR & Thẻ Kiểm Tra Chuyên Môn</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setAvatarModalTeacher(selectedTeacher)}
                  className="px-3 py-1.5 rounded-lg border border-indigo-200 hover:bg-indigo-50 text-indigo-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Chèn ảnh đại diện</span>
                </button>
                {isHead && (
                  <button
                    onClick={() => {
                      setEditingTeacher(selectedTeacher);
                      setSelectedTeacher(null);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold"
                  >
                    Chỉnh sửa
                  </button>
                )}
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
              {/* Avatar Insertion Banner inside Edit Modal */}
              <div className="p-3.5 bg-indigo-50/70 border border-indigo-200 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl overflow-hidden border border-indigo-300 bg-white shadow-2xs shrink-0 flex items-center justify-center">
                    {editingTeacher.avatarUrl ? (
                      <img
                        src={editingTeacher.avatarUrl}
                        alt={editingTeacher.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="font-bold text-indigo-700 text-base">
                        {getInitials(editingTeacher.fullName)}
                      </span>
                    )}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-indigo-950 block">Ảnh đại diện giáo viên</span>
                    <span className="text-[11px] text-slate-500">
                      {editingTeacher.avatarUrl ? 'Đã có ảnh chân dung riêng' : 'Chưa có ảnh, đang dùng chữ cái'}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setAvatarModalTeacher(editingTeacher)}
                  className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-2xs shrink-0"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Chèn / Đổi ảnh avatar</span>
                </button>
              </div>

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

      {/* Avatar Upload Modal */}
      <AvatarUploadModal
        isOpen={Boolean(avatarModalTeacher)}
        onClose={() => setAvatarModalTeacher(null)}
        teacher={avatarModalTeacher}
        onSaveAvatar={handleSaveAvatar}
      />

      {/* Teacher Professional Inspection & QR Code Modal */}
      <TeacherInspectionModal
        isOpen={Boolean(inspectionModalTeacher)}
        onClose={() => setInspectionModalTeacher(null)}
        teacher={inspectionModalTeacher}
        teachers={teachers}
        lessonPlans={lessonPlans}
        observations={observations}
        substitutes={substitutes}
        settings={settings}
        onSelectTeacher={(t) => setInspectionModalTeacher(t)}
        onUpdateTeacher={onUpdateTeacher}
      />
    </div>
  );
};
