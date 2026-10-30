import React, { useState, useRef } from 'react';
import {
  FileText,
  PlusCircle,
  Calendar,
  Clock,
  MapPin,
  UserCheck,
  Printer,
  Search,
  CheckCircle2,
  XCircle,
  Sparkles,
  BookOpen,
  FileDown,
  Loader2,
  Send,
  Lock,
  Edit3,
  Save,
} from 'lucide-react';
import { Teacher, MeetingMinute, DepartmentSetting } from '../types';
import { exportElementToPdf } from '../utils/pdfExport';
import { useToast } from '../context/ToastContext';
import { useAuthRole } from '../context/AuthRoleContext';

interface MeetingManagerProps {
  settings: DepartmentSetting;
  teachers: Teacher[];
  meetings: MeetingMinute[];
  onAddMeeting: (meeting: MeetingMinute) => void;
  onUpdateMeeting: (meeting: MeetingMinute) => void;
  onDeleteMeeting: (id: string) => void;
  onPrintMeeting: (meeting: MeetingMinute) => void;
  onOpenRequestModal?: () => void;
}

export const MeetingManager: React.FC<MeetingManagerProps> = ({
  settings,
  teachers,
  meetings,
  onAddMeeting,
  onUpdateMeeting,
  onDeleteMeeting,
  onPrintMeeting,
  onOpenRequestModal,
}) => {
  const { role, isHead, isMember, displayName } = useAuthRole();
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMeeting, setSelectedMeeting] = useState<MeetingMinute | null>(meetings[0] || null);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const meetingDocRef = useRef<HTMLDivElement>(null);

  // New Meeting Form
  const defaultHead = teachers.find((t) => t.role === 'Tổ trưởng')?.id || teachers[0]?.id || '';
  const defaultSecretary = teachers.find((t) => t.fullName.includes('Hạnh'))?.id || teachers[teachers.length - 1]?.id || '';

  const [form, setForm] = useState<Partial<MeetingMinute>>({
    code: `BB-TCM/0${meetings.length + 1}`,
    meetingDate: new Date().toISOString().split('T')[0],
    time: '14:00 - 16:30',
    location: 'Văn phòng Tổ chuyên môn (Phòng 204)',
    title: 'Sinh hoạt chuyên môn định kỳ & Thảo luận Nghiên cứu bài học',
    sessionType: 'Nghiên cứu bài học',
    chairpersonId: defaultHead,
    secretaryId: defaultSecretary,
    attendees: teachers.map((t) => ({ teacherId: t.id, present: true })),
    assessmentPastWork: '1. Toàn tổ thực hiện đúng tiến độ chương trình, nề nếp lên lớp tốt.\n2. Kiểm tra giáo án 10/10 GV đạt yêu cầu, soạn bài công phu.\n3. Các lớp thi đua sôi nổi, tích cực ứng dụng công nghệ thông tin.',
    upcomingPlan: '1. Tiếp tục triển khai kế hoạch giáo dục tuần tới.\n2. Chuẩn bị thao giảng chuyên đề NCBH cấp tổ.\n3. Rà soát ngân hàng câu hỏi đề kiểm tra giữa kỳ.\n4. Tăng cường bồi dưỡng học sinh giỏi và phụ đạo học sinh còn hạn chế.',
    discussionTopic: 'Thảo luận xây dựng kế hoạch bài dạy minh họa theo hướng phát triển phẩm chất và năng lực học sinh (Công văn 5512/BGDĐT).',
    teacherOpinions: [
      { teacherId: teachers[1]?.id || '', opinion: 'Đồng ý với cấu trúc bài giảng trực quan, cần tăng cường bài tập phân hóa.' },
      { teacherId: teachers[2]?.id || '', opinion: 'Đề xuất phân công hỗ trợ nhóm học sinh tiếp thu chậm sau mỗi bài học.' },
    ],
    conclusion: '1. Thống nhất kế hoạch công tác và giáo án minh họa đã thông qua.\n2. 100% thành viên trong tổ nhất trí thực hiện nghiêm túc kết luận cuộc họp.',
  });

  const filteredMeetings = meetings.filter(
    (m) =>
      m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.discussionTopic.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStartEdit = (meeting: MeetingMinute) => {
    setForm({
      code: meeting.code,
      meetingDate: meeting.meetingDate,
      time: meeting.time,
      location: meeting.location,
      title: meeting.title,
      sessionType: meeting.sessionType,
      chairpersonId: meeting.chairpersonId,
      secretaryId: meeting.secretaryId,
      attendees: meeting.attendees,
      assessmentPastWork: meeting.assessmentPastWork,
      upcomingPlan: meeting.upcomingPlan,
      discussionTopic: meeting.discussionTopic,
      teacherOpinions: meeting.teacherOpinions,
      conclusion: meeting.conclusion,
    });
    setIsEditing(true);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMeeting || !form.title || !form.chairpersonId || !form.secretaryId) return;

    const updated: MeetingMinute = {
      ...selectedMeeting,
      code: form.code || selectedMeeting.code,
      meetingDate: form.meetingDate || selectedMeeting.meetingDate,
      time: form.time || selectedMeeting.time,
      location: form.location || selectedMeeting.location,
      title: form.title,
      sessionType: form.sessionType || selectedMeeting.sessionType,
      chairpersonId: form.chairpersonId,
      secretaryId: form.secretaryId,
      attendees: form.attendees || selectedMeeting.attendees,
      assessmentPastWork: form.assessmentPastWork || '',
      upcomingPlan: form.upcomingPlan || '',
      discussionTopic: form.discussionTopic || '',
      conclusion: form.conclusion || '',
    };

    onUpdateMeeting(updated);
    setSelectedMeeting(updated);
    setIsEditing(false);
    toast.success('Đã cập nhật nội dung biên bản và nhiệm vụ trọng tâm thành công!', 'Cập nhật biên bản');
  };

  const handleSaveNew = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.chairpersonId || !form.secretaryId) return;

    const newMeeting: MeetingMinute = {
      id: `bb-${Date.now()}`,
      code: form.code || `BB-TCM/${Date.now().toString().slice(-3)}`,
      meetingDate: form.meetingDate || new Date().toISOString().split('T')[0],
      time: form.time || '14:00 - 16:30',
      location: form.location || 'Phòng họp tổ chuyên môn',
      title: form.title,
      sessionType: form.sessionType || 'Định kỳ 2 tuần/lần',
      chairpersonId: form.chairpersonId,
      secretaryId: form.secretaryId,
      attendees: form.attendees || teachers.map((t) => ({ teacherId: t.id, present: true })),
      assessmentPastWork: form.assessmentPastWork || '',
      upcomingPlan: form.upcomingPlan || '',
      discussionTopic: form.discussionTopic || '',
      teacherOpinions: form.teacherOpinions || [],
      conclusion: form.conclusion || '',
      createdAt: new Date().toISOString(),
    };

    onAddMeeting(newMeeting);
    setIsCreating(false);
    setSelectedMeeting(newMeeting);
  };

  const getTeacherName = (id: string) => {
    return teachers.find((t) => t.id === id)?.fullName || 'Không xác định';
  };

  const handleExportPdf = async () => {
    if (!meetingDocRef.current || !selectedMeeting) return;
    setIsExportingPdf(true);
    try {
      const cleanCode = selectedMeeting.code.replace(/[\/\\]/g, '_');
      await exportElementToPdf(meetingDocRef.current, {
        filename: `Bien_ban_sinh_hoat_${cleanCode}.pdf`,
        pageTitle: `Biên bản sinh hoạt tổ - ${selectedMeeting.code}`,
        leftMarginMm: 20,
        rightMarginMm: 15,
        topMarginMm: 15,
        bottomMarginMm: 15,
      });
      toast.success(`Đã xuất biên bản họp (${selectedMeeting.code}) sang PDF chuẩn hành chính thành công!`, 'Xuất PDF');
    } catch (err) {
      console.error('Lỗi xuất PDF biên bản:', err);
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
              <FileText className="w-6 h-6 text-indigo-600" />
              Sổ Biên Bản Sinh Hoạt Tổ Chuyên Môn Điện Tử
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Thực hiện quy định sinh hoạt định kỳ 2 tuần/lần & Nghiên cứu bài học (NCBH) theo Điều lệ trường THCS
            </p>
          </div>

          {isHead ? (
            <button
              onClick={() => setIsCreating(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Tạo Biên Bản Họp Mới (Toàn quyền)</span>
            </button>
          ) : onOpenRequestModal ? (
            <button
              onClick={onOpenRequestModal}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Gửi Đề Xuất / Ý Kiến Họp Tổ</span>
            </button>
          ) : null}
        </div>

        {/* Search */}
        <div className="pt-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Tìm kiếm biên bản họp theo số hiệu, chủ đề hoặc nội dung thảo luận..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none bg-slate-50/50"
            />
          </div>
        </div>
      </div>

      {/* Grid: List of Meetings & Preview Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: List of Meeting Minutes */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider flex items-center justify-between">
            <span>Danh Sách Biên Bản ({filteredMeetings.length})</span>
            <span className="text-[11px] text-slate-400 font-normal">Năm học {settings.schoolYear}</span>
          </div>

          <div className="space-y-3">
            {filteredMeetings.map((m) => {
              const isSelected = selectedMeeting?.id === m.id;
              const presentCount = m.attendees.filter((a) => a.present).length;

              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMeeting(m)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer text-xs space-y-2 ${
                    isSelected
                      ? 'bg-indigo-50/70 border-indigo-400 ring-2 ring-indigo-200/50 shadow-sm'
                      : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-900 bg-indigo-100/70 px-2 py-0.5 rounded font-mono">
                      {m.code}
                    </span>
                    <span className="text-slate-500 text-[11px] flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" /> {m.meetingDate}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug">
                    {m.title}
                  </h3>

                  <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
                    <span className="font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {m.sessionType}
                    </span>
                    <span>Có mặt: {presentCount}/10 GV</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right 2 columns: Formatted Official Vietnamese Meeting Minute */}
        <div className="lg:col-span-2">
          {selectedMeeting ? (
            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden text-xs text-slate-800">
              {/* Top toolbar */}
              <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex justify-between items-center no-print">
                <span className="font-semibold text-slate-600 text-xs">
                  Biên bản điện tử: <strong className="text-slate-900">{selectedMeeting.code}</strong>
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleStartEdit(selectedMeeting)}
                    className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold flex items-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer"
                    title="Chỉnh sửa nội dung biên bản và nhiệm vụ trọng tâm"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-300" />
                    <span>Sửa Nội Dung</span>
                  </button>
                  <button
                    onClick={handleExportPdf}
                    disabled={isExportingPdf}
                    className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-semibold flex items-center gap-1.5 shadow-2xs transition active:scale-95 cursor-pointer"
                    title="Xuất file PDF chuẩn hành chính theo Nghị định 30/2020/NĐ-CP"
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
                    onClick={() => onPrintMeeting(selectedMeeting)}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold flex items-center gap-1.5 shadow-2xs transition"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>In Mẫu Biên Bản Chuẩn A4</span>
                  </button>
                  {isHead && (
                    <button
                      onClick={() => {
                        if (confirm('Bạn có chắc muốn xóa biên bản này?')) {
                          onDeleteMeeting(selectedMeeting.id);
                          setSelectedMeeting(null);
                        }
                      }}
                      className="px-2.5 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 font-semibold"
                    >
                      Xóa
                    </button>
                  )}
                </div>
              </div>

              {/* Official Document Body */}
              <div ref={meetingDocRef} className="p-8 space-y-6 max-w-3xl mx-auto font-serif bg-white">
                {/* Header Republic of Vietnam */}
                <div className="grid grid-cols-2 text-center text-xs pb-4 border-b border-slate-300">
                  <div>
                    <p className="uppercase font-bold tracking-tight text-slate-800">{settings.districtCity}</p>
                    <p className="uppercase font-extrabold text-slate-900">{settings.schoolName}</p>
                    <p className="uppercase font-bold text-indigo-900 mt-1">{settings.departmentName}</p>
                    <div className="w-24 h-0.5 bg-slate-400 mx-auto mt-1" />
                  </div>
                  <div>
                    <p className="uppercase font-bold text-slate-900">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
                    <p className="font-bold text-slate-800">Độc lập - Tự do - Hạnh phúc</p>
                    <div className="w-32 h-0.5 bg-slate-400 mx-auto mt-1" />
                    <p className="italic text-[11px] text-slate-600 mt-2">
                      Ngày {selectedMeeting.meetingDate.split('-')[2]} tháng {selectedMeeting.meetingDate.split('-')[1]} năm {selectedMeeting.meetingDate.split('-')[0]}
                    </p>
                  </div>
                </div>

                {/* Title */}
                <div className="text-center space-y-1">
                  <h2 className="text-base font-extrabold uppercase tracking-wide text-slate-900">
                    BIÊN BẢN HỌP SINH HOẠT TỔ CHUYÊN MÔN
                  </h2>
                  <p className="text-xs font-semibold text-indigo-900">
                    {selectedMeeting.title}
                  </p>
                  <p className="text-[11px] text-slate-500 italic">
                    (Hình thức: {selectedMeeting.sessionType} • Năm học {settings.schoolYear})
                  </p>
                </div>

                {/* Section: Time & Location */}
                <div className="space-y-1 text-xs">
                  <p>
                    <strong>1. Thời gian:</strong> {selectedMeeting.time}, ngày {selectedMeeting.meetingDate}
                  </p>
                  <p>
                    <strong>2. Địa điểm:</strong> {selectedMeeting.location}
                  </p>
                  <p>
                    <strong>3. Chủ trì cuộc họp:</strong> {getTeacherName(selectedMeeting.chairpersonId)} (Tổ trưởng chuyên môn)
                  </p>
                  <p>
                    <strong>4. Thư ký ghi biên bản:</strong> {getTeacherName(selectedMeeting.secretaryId)}
                  </p>
                </div>

                {/* Attendees list */}
                <div className="space-y-1.5 text-xs">
                  <p>
                    <strong>5. Thành phần tham dự:</strong> Tổng số: 10/10 giáo viên.
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                    {selectedMeeting.attendees.map((a, idx) => (
                      <div key={idx} className="flex items-center gap-1.5 text-[11px]">
                        {a.present ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        )}
                        <span className={a.present ? 'text-slate-800' : 'text-red-700 italic'}>
                          {getTeacherName(a.teacherId)} {!a.present && '(Vắng)'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section I: Past work */}
                <div className="space-y-1.5 text-xs">
                  <h4 className="font-bold uppercase text-slate-900 border-b border-slate-200 pb-1 transition-all duration-300 ease-in-out px-2 py-0.5 -mx-2 -my-0.5 rounded hover:bg-slate-100/70 hover:shadow-xs cursor-pointer">
                    I. ĐÁNH GIÁ CÔNG TÁC 2 TUẦN QUA
                  </h4>
                  <div className="whitespace-pre-line text-slate-700 pl-2 leading-relaxed">
                    {selectedMeeting.assessmentPastWork}
                  </div>
                </div>

                {/* Section II: Upcoming Plan & Key Tasks */}
                <div className="space-y-1.5 text-xs">
                  <div className="flex items-center justify-between border-b border-slate-200 pb-1">
                    <h4 className="font-bold uppercase text-slate-900">
                      II. KẾ HOẠCH CÔNG TÁC & NHIỆM VỤ TRỌNG TÂM THỜI GIAN TỚI
                    </h4>
                    <button
                      onClick={() => handleStartEdit(selectedMeeting)}
                      className="text-[11px] font-sans font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 hover:underline no-print cursor-pointer"
                      title="Bấm để sửa nội dung kế hoạch & nhiệm vụ trọng tâm"
                    >
                      <Edit3 className="w-3 h-3 text-indigo-600" />
                      <span>Sửa nhiệm vụ</span>
                    </button>
                  </div>
                  <div className="whitespace-pre-line text-slate-700 pl-2 leading-relaxed">
                    {selectedMeeting.upcomingPlan}
                  </div>
                </div>

                {/* Section III: NCBH Discussion Topic */}
                <div className="space-y-1.5 text-xs">
                  <h4 className="font-bold uppercase text-slate-900 border-b border-slate-200 pb-1 transition-all duration-300 ease-in-out px-2 py-0.5 -mx-2 -my-0.5 rounded hover:bg-slate-100/70 hover:shadow-xs cursor-pointer">
                    III. NỘI DUNG SINH HOẠT CHUYÊN MÔN / NGHIÊN CỨU BÀI HỌC (NCBH)
                  </h4>
                  <p className="text-slate-800 pl-2 font-medium">{selectedMeeting.discussionTopic}</p>
                </div>

                {/* Section IV: Teacher Opinions */}
                {selectedMeeting.teacherOpinions.length > 0 && (
                  <div className="space-y-2 text-xs">
                    <h4 className="font-bold uppercase text-slate-900 border-b border-slate-200 pb-1 transition-all duration-300 ease-in-out px-2 py-0.5 -mx-2 -my-0.5 rounded hover:bg-slate-100/70 hover:shadow-xs cursor-pointer">
                      IV. Ý KIẾN THẢO LUẬN CỦA CÁC THÀNH VIÊN TRONG TỔ
                    </h4>
                    <div className="space-y-1.5 pl-2">
                      {selectedMeeting.teacherOpinions.map((op, idx) => (
                        <div key={idx} className="bg-slate-50 p-2 rounded border border-slate-100">
                          <span className="font-bold text-indigo-900">{getTeacherName(op.teacherId)}: </span>
                          <span className="text-slate-700">{op.opinion}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Section V: Conclusion */}
                <div className="space-y-1.5 text-xs">
                  <h4 className="font-bold uppercase text-slate-900 border-b border-slate-200 pb-1 transition-all duration-300 ease-in-out px-2 py-0.5 -mx-2 -my-0.5 rounded hover:bg-slate-100/70 hover:shadow-xs cursor-pointer">
                    V. KẾT LUẬN & BIỆN PHÁP THỰC HIỆN CỦA TỔ TRƯỞNG
                  </h4>
                  <div className="whitespace-pre-line text-slate-800 pl-2 leading-relaxed font-medium">
                    {selectedMeeting.conclusion}
                  </div>
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-2 text-center pt-8 text-xs font-sans">
                  <div>
                    <p className="font-bold uppercase text-slate-800">THƯ KÝ CUỘC HỌP</p>
                    <p className="text-[11px] italic text-slate-500">(Ký và ghi rõ họ tên)</p>
                    <div className="h-16 flex items-end justify-center">
                      <span className="font-bold text-slate-900">{getTeacherName(selectedMeeting.secretaryId)}</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-bold uppercase text-slate-800">TỔ TRƯỞNG CHUYÊN MÔN</p>
                    <p className="text-[11px] italic text-slate-500">(Ký và ghi rõ họ tên)</p>
                    <div className="h-16 flex items-end justify-center">
                      <span className="font-bold text-slate-900">{getTeacherName(selectedMeeting.chairpersonId)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-12 text-center text-slate-500 text-xs">
              <BookOpen className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              Chọn một biên bản họp ở danh sách bên trái để xem chi tiết hoặc bấm &quot;Tạo Biên Bản Họp Mới&quot;.
            </div>
          )}
        </div>
      </div>

      {/* Modal: Create New Meeting Minute */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full text-slate-800 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-indigo-900 px-6 py-4 text-white flex justify-between items-center">
              <h3 className="font-bold text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-300" />
                Lập Biên Bản Sinh Hoạt Tổ Chuyên Môn Mới
              </h3>
              <button
                onClick={() => setIsCreating(false)}
                className="text-slate-400 hover:text-white text-xl font-bold"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSaveNew} className="p-6 space-y-4 text-xs overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Số hiệu biên bản</label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Ngày họp</label>
                  <input
                    type="date"
                    value={form.meetingDate}
                    onChange={(e) => setForm({ ...form, meetingDate: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Thời gian</label>
                  <input
                    type="text"
                    value={form.time}
                    onChange={(e) => setForm({ ...form, time: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                    placeholder="14:00 - 16:30"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Chủ đề cuộc họp</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Hình thức sinh hoạt</label>
                  <select
                    value={form.sessionType}
                    onChange={(e) => setForm({ ...form, sessionType: e.target.value as any })}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium text-indigo-900"
                  >
                    <option value="Định kỳ 2 tuần/lần">Định kỳ 2 tuần/lần</option>
                    <option value="Nghiên cứu bài học">Nghiên cứu bài học (NCBH)</option>
                    <option value="Chuyên đề chuyên môn">Chuyên đề chuyên môn</option>
                    <option value="Đột xuất">Đột xuất</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Chủ trì cuộc họp</label>
                  <select
                    value={form.chairpersonId}
                    onChange={(e) => setForm({ ...form, chairpersonId: e.target.value })}
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
                  <label className="block font-semibold text-slate-700 mb-1">Thư ký ghi biên bản</label>
                  <select
                    value={form.secretaryId}
                    onChange={(e) => setForm({ ...form, secretaryId: e.target.value })}
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

              {/* Attendance Checklist for 10 Teachers */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Điểm danh 10 giáo viên tham dự cuộc họp:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                  {teachers.map((teacher) => {
                    const isPresent = form.attendees?.find((a) => a.teacherId === teacher.id)?.present ?? true;
                    return (
                      <label
                        key={teacher.id}
                        className="flex items-center gap-1.5 cursor-pointer text-xs p-1 rounded hover:bg-slate-100"
                      >
                        <input
                          type="checkbox"
                          checked={isPresent}
                          onChange={(e) => {
                            const updated = (form.attendees || []).map((a) =>
                              a.teacherId === teacher.id ? { ...a, present: e.target.checked } : a
                            );
                            setForm({ ...form, attendees: updated });
                          }}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="truncate font-medium">{teacher.fullName.split(' ').slice(-2).join(' ')}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  I. Đánh giá công tác 2 tuần qua
                </label>
                <textarea
                  rows={3}
                  value={form.assessmentPastWork}
                  onChange={(e) => setForm({ ...form, assessmentPastWork: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  II. Kế hoạch công tác 2 tuần tới
                </label>
                <textarea
                  rows={3}
                  value={form.upcomingPlan}
                  onChange={(e) => setForm({ ...form, upcomingPlan: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  III. Nội dung sinh hoạt chuyên môn / Nghiên cứu bài học
                </label>
                <textarea
                  rows={2}
                  value={form.discussionTopic}
                  onChange={(e) => setForm({ ...form, discussionTopic: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  V. Kết luận & Phân công của Tổ trưởng
                </label>
                <textarea
                  rows={2}
                  value={form.conclusion}
                  onChange={(e) => setForm({ ...form, conclusion: e.target.value })}
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 font-semibold rounded-lg shadow-sm"
                >
                  Lưu Biên Bản Họp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
