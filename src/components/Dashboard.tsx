import React from 'react';
import {
  Users,
  Award,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  PlusCircle,
  FileText,
  UserCheck,
  HardDrive,
} from 'lucide-react';
import { Teacher, MeetingMinute, LessonObservation, SubstituteTeaching, LessonPlanReview, DepartmentSetting } from '../types';
import { TabType } from './NavigationTabs';
import { TeacherScheduleCard } from './TeacherScheduleCard';

interface DashboardProps {
  settings: DepartmentSetting;
  teachers: Teacher[];
  meetings: MeetingMinute[];
  observations: LessonObservation[];
  substitutes: SubstituteTeaching[];
  lessonPlans: LessonPlanReview[];
  onNavigate: (tab: TabType) => void;
  onOpenNewMeeting: () => void;
  onOpenNewObservation: () => void;
  onOpenNewSubstitute: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  settings,
  teachers,
  meetings,
  observations,
  substitutes,
  lessonPlans,
  onNavigate,
  onOpenNewMeeting,
  onOpenNewObservation,
  onOpenNewSubstitute,
}) => {
  const headTeacher = teachers.find((t) => t.role === 'Tổ trưởng') || teachers[0];
  const deputyHeadTeacher = teachers.find((t) => t.role === 'Tổ phó') || teachers[1];
  const memberTeachers = teachers.filter((t) => t.role === 'Tổ viên');

  const totalPeriodsPerWeek = teachers.reduce((sum, t) => sum + t.teachingPeriodsPerWeek, 0);
  const totalStandardQuota = teachers.reduce((sum, t) => sum + t.standardQuota, 0);
  const reviewedPlansCount = lessonPlans.filter((lp) => lp.status === 'Đã ký duyệt').length;
  const reviewedPercentage = Math.round((reviewedPlansCount / (lessonPlans.length || 1)) * 100);

  // Recent meeting
  const latestMeeting = meetings.length > 0 ? meetings[0] : null;

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-blue-800 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 opacity-10 pointer-events-none flex items-center pr-10">
          <Sparkles className="w-64 h-64 text-white" />
        </div>
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 text-amber-300 text-xs font-semibold backdrop-blur-xs mb-3 border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5" />
            Hệ thống Quản lý Chuyên môn Trường THCS Nguyễn Du
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Chào mừng đến với {settings.departmentName}
          </h2>
          <p className="mt-2 text-indigo-100 text-sm leading-relaxed">
            Năm học {settings.schoolYear} • Quản lý toàn diện nhân sự 10 giáo viên, phân công tiết dạy theo chuẩn định mức Bộ GD&ĐT, biên bản sinh hoạt tổ định kỳ 2 tuần/lần, hồ sơ kế hoạch bài dạy và dự giờ thao giảng.
          </p>

          <div className="mt-5 flex flex-wrap gap-2.5">
            <button
              onClick={onOpenNewMeeting}
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-slate-900 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Ghi Biên Bản Họp Mới</span>
            </button>
            <button
              onClick={onOpenNewObservation}
              className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-white/20 transition"
            >
              <PlusCircle className="w-4 h-4 text-sky-200" />
              <span>Tạo Phiếu Dự Giờ</span>
            </button>
            <button
              onClick={onOpenNewSubstitute}
              className="px-4 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-white/20 transition"
            >
              <PlusCircle className="w-4 h-4 text-sky-200" />
              <span>Đăng Ký Dạy Thay</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Teachers */}
        <div
          onClick={() => onNavigate('teachers')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Quy mô nhân sự</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-110 transition">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{teachers.length}</span>
            <span className="text-xs font-medium text-emerald-600">Giáo viên</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>1 Tổ trưởng • 1 Tổ phó</span>
            <span className="text-indigo-600 font-semibold group-hover:translate-x-0.5 transition">
              8 Tổ viên →
            </span>
          </div>
        </div>

        {/* Card 2: Teaching Periods */}
        <div
          onClick={() => onNavigate('assignments')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Tổng tiết giảng dạy/tuần</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-110 transition">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{totalPeriodsPerWeek}</span>
            <span className="text-xs font-medium text-slate-500">/ {totalStandardQuota} tiết định mức</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
            <span className="text-emerald-600 font-medium">Bình quân {(totalPeriodsPerWeek / (teachers.length || 1)).toFixed(1)} tiết/GV</span>
            <span className="text-sky-600 font-semibold group-hover:translate-x-0.5 transition">
              Chi tiết →
            </span>
          </div>
        </div>

        {/* Card 3: Observations */}
        <div
          onClick={() => onNavigate('observations')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Dự giờ & Thao giảng</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-110 transition">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{observations.length}</span>
            <span className="text-xs font-medium text-amber-600">tiết đã đánh giá</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>Chuẩn CV 5555/BGDĐT</span>
            <span className="text-amber-600 font-semibold group-hover:translate-x-0.5 transition">
              Xem sổ →
            </span>
          </div>
        </div>

        {/* Card 4: Lesson Plan Audit */}
        <div
          onClick={() => onNavigate('lessonPlans')}
          className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Duyệt giáo án (KHBĐ)</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-110 transition">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">{reviewedPercentage}%</span>
            <span className="text-xs font-medium text-purple-600">({reviewedPlansCount}/{lessonPlans.length} GV)</span>
          </div>
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between border-t border-slate-100 pt-2">
            <span>Tuần 6 tháng 10</span>
            <span className="text-purple-600 font-semibold group-hover:translate-x-0.5 transition">
              Kiểm tra →
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Structure of 10 Teachers & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Structure of 10 Teachers (Left 2 Columns) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-indigo-600" />
                  Cơ Cấu Ban Lãnh Đạo & 8 Tổ Viên ({settings.departmentName})
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Phân định rõ ràng trách nhiệm theo Điều lệ trường THCS
                </p>
              </div>
              <button
                onClick={() => onNavigate('teachers')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
              >
                Tất cả 10 giáo viên <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Leadership Duo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              {/* Tổ Trưởng */}
              {headTeacher && (
                <div
                  onClick={() => onNavigate('teachers')}
                  className="p-4 rounded-xl border-2 border-amber-300/80 bg-gradient-to-br from-amber-50/50 to-orange-50/30 hover:border-amber-400 transition cursor-pointer relative"
                >
                  <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider bg-amber-500 text-white px-2 py-0.5 rounded-full shadow-xs">
                    Tổ Trưởng
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                      {headTeacher.fullName.split(' ').pop()?.slice(0, 1)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{headTeacher.fullName}</h4>
                      <p className="text-xs text-amber-800 font-medium">{headTeacher.degree}</p>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-slate-600 space-y-1">
                    <p>• Phụ trách chung hoạt động chuyên môn toàn tổ</p>
                    <p>• Duyệt Kế hoạch bài dạy, chủ trì sinh hoạt tổ</p>
                    <p>• Giảng dạy: <strong>{headTeacher.assignedClasses.join(', ')}</strong> ({headTeacher.teachingPeriodsPerWeek} tiết/tuần)</p>
                    {headTeacher.departmentTopic && (
                      <p className="text-[11px] text-amber-900 font-medium truncate">
                        • CĐ: <em>{headTeacher.departmentTopic}</em>
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Tổ Phó */}
              {deputyHeadTeacher && (
                <div
                  onClick={() => onNavigate('teachers')}
                  className="p-4 rounded-xl border-2 border-indigo-200 bg-gradient-to-br from-indigo-50/40 to-sky-50/30 hover:border-indigo-300 transition cursor-pointer relative"
                >
                  <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white px-2 py-0.5 rounded-full shadow-xs">
                    Tổ Phó
                  </span>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-sm">
                      {deputyHeadTeacher.fullName.split(' ').pop()?.slice(0, 1)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{deputyHeadTeacher.fullName}</h4>
                      <p className="text-xs text-indigo-800 font-medium">{deputyHeadTeacher.degree}</p>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-slate-600 space-y-1">
                    <p>• Phụ trách công tác chuyên đề & Nghiên cứu bài học</p>
                    <p>• Quản lý thiết bị, đồ dùng dạy học bộ môn</p>
                    <p>• Giảng dạy: <strong>{deputyHeadTeacher.assignedClasses.join(', ')}</strong> ({deputyHeadTeacher.teachingPeriodsPerWeek} tiết/tuần)</p>
                    {deputyHeadTeacher.departmentTopic && (
                      <p className="text-[11px] text-indigo-900 font-medium truncate">
                        • CĐ: <em>{deputyHeadTeacher.departmentTopic}</em>
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 8 Members Preview */}
            <div className="mt-3">
              <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>8 Giáo Viên Tổ Viên</span>
                <span className="text-[11px] text-slate-500 font-normal">Giảng dạy Tiếng Anh các khối 6, 7, 8, 9</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {memberTeachers.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => onNavigate('teachers')}
                    className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-indigo-50/60 hover:border-indigo-200 transition cursor-pointer text-left"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-semibold flex items-center justify-center text-xs">
                        {t.fullName.split(' ').pop()?.slice(0, 1)}
                      </div>
                      <div className="truncate">
                        <div className="text-xs font-bold text-slate-800 truncate">{t.fullName}</div>
                        <div className="text-[11px] text-slate-500 truncate">{t.degree}</div>
                      </div>
                    </div>
                    <div className="mt-2 text-[11px] text-slate-600 flex justify-between">
                      <span className="truncate">{t.homeroomClass ? `CN: ${t.homeroomClass}` : 'BM'}</span>
                      <span className="font-semibold text-indigo-700">{t.teachingPeriodsPerWeek}t</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Teaching Load Distribution vs Standard Quota */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-800 text-base flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-sky-600" />
                  Định Mức Giảng Dạy Của 10 Giáo Viên (Thông tư 28/2009/TT-BGDĐT)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Định mức cơ bản 19 tiết (TT giảm 3, TP giảm 1, GVCN giảm 4, Quản trị mạng giảm 3)
                </p>
              </div>
              <button
                onClick={() => onNavigate('assignments')}
                className="text-xs text-sky-600 hover:text-sky-800 font-semibold flex items-center gap-1"
              >
                Chi tiết bảng phân công <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {teachers.map((teacher) => {
                const percentage = Math.min(100, Math.round((teacher.teachingPeriodsPerWeek / teacher.standardQuota) * 100));
                const diff = teacher.teachingPeriodsPerWeek - teacher.standardQuota;
                return (
                  <div key={teacher.id} className="text-xs flex items-center gap-3">
                    <div className="w-36 font-medium text-slate-800 truncate">
                      {teacher.fullName}
                      {teacher.role === 'Tổ trưởng' && ' (TT)'}
                      {teacher.role === 'Tổ phó' && ' (TP)'}
                    </div>
                    <div className="flex-1 bg-slate-100 rounded-full h-3 overflow-hidden relative">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          diff === 0
                            ? 'bg-emerald-500'
                            : diff > 0
                            ? 'bg-amber-500'
                            : 'bg-indigo-500'
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="w-24 text-right font-medium text-slate-700">
                      {teacher.teachingPeriodsPerWeek} / {teacher.standardQuota} tiết
                      {diff > 0 && <span className="text-amber-600 text-[10px] ml-1">(+{diff})</span>}
                      {diff < 0 && <span className="text-blue-600 text-[10px] ml-1">({diff})</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Latest Meeting & Upcoming Tasks */}
        <div className="space-y-4">
          {/* Latest Meeting Minute */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                Biên Bản Sinh Hoạt Gần Nhất
              </h3>
              <button
                onClick={() => onNavigate('meetings')}
                className="text-xs text-emerald-600 hover:text-emerald-800 font-semibold"
              >
                Xem tất cả
              </button>
            </div>

            {latestMeeting ? (
              <div className="p-3.5 bg-emerald-50/50 rounded-xl border border-emerald-200/60 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900">{latestMeeting.code}</span>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {latestMeeting.meetingDate}
                  </span>
                </div>
                <h4 className="font-semibold text-slate-900 line-clamp-2 transition-all duration-300 ease-in-out px-2 py-1 -mx-2 -my-1 rounded-lg hover:bg-white hover:shadow-xs hover:text-emerald-800 cursor-pointer">
                  {latestMeeting.title}
                </h4>
                <p className="text-slate-600 line-clamp-3 italic">
                  &ldquo;{latestMeeting.conclusion}&rdquo;
                </p>
                <div className="pt-2 border-t border-emerald-200/60 flex items-center justify-between text-slate-500 text-[11px]">
                  <span>Tham dự: 10/10 GV</span>
                  <span className="font-medium text-emerald-700">{latestMeeting.sessionType}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 italic">Chưa có biên bản nào được tạo.</p>
            )}
          </div>

          {/* Active Substitutions */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-amber-600" />
                Lịch Dạy Thay Sắp Tới
              </h3>
              <button
                onClick={() => onNavigate('substitutes')}
                className="text-xs text-amber-600 hover:text-amber-800 font-semibold"
              >
                Quản lý ({substitutes.length})
              </button>
            </div>

            <div className="space-y-2">
              {substitutes.slice(0, 3).map((sub) => {
                const absentTeacher = teachers.find((t) => t.id === sub.absentTeacherId);
                const subTeacher = teachers.find((t) => t.id === sub.substituteTeacherId);
                return (
                  <div key={sub.id} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 text-xs">
                    <div className="flex justify-between items-center text-slate-500 text-[11px] mb-1">
                      <span>{sub.date} • Tiết {sub.period} ({sub.className})</span>
                      <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-100 text-emerald-700 font-medium">
                        {sub.status}
                      </span>
                    </div>
                    <div className="font-medium text-slate-800">
                      <span className="text-red-700">{absentTeacher?.fullName}</span>
                      <span className="text-slate-400 mx-1">→</span>
                      <span className="text-emerald-700 font-bold">{subTeacher?.fullName} (dạy thay)</span>
                    </div>
                    <div className="text-slate-500 text-[11px] mt-1 truncate">
                      Lý do: {sub.reason}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Google Drive Integration Quick Card */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200/80 rounded-2xl p-4 shadow-xs text-xs space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-xs transition-all duration-300 ease-in-out px-2 py-0.5 -mx-2 -my-0.5 rounded-md hover:bg-blue-100/70 hover:shadow-xs hover:text-blue-900 cursor-pointer inline-block">
                    Kho Google Drive Tổ
                  </h4>
                  <p className="text-[11px] text-slate-500">Đồng bộ đám mây an toàn</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('drive')}
                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-[11px] flex items-center gap-1 transition shadow-xs hover:shadow-sm"
              >
                <span>Mở Drive</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Lưu trữ kế hoạch bài dạy (KHBĐ), biên bản sinh hoạt tổ và sao lưu toàn bộ dữ liệu 10 giáo viên lên Google Drive.
            </p>
          </div>

          {/* Teacher Schedule (Thời khóa biểu giáo viên) */}
          <TeacherScheduleCard settings={settings} />
        </div>
      </div>
    </div>
  );
};
