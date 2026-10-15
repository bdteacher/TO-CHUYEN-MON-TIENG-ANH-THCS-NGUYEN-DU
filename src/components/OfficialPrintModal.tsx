import React, { useState, useRef } from 'react';
import { Printer, X, FileText, CheckCircle, School, FileDown, Loader2 } from 'lucide-react';
import { Teacher, MeetingMinute, LessonObservation, SubstituteTeaching, DepartmentSetting } from '../types';
import { exportElementToPdf } from '../utils/pdfExport';

interface OfficialPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: DepartmentSetting;
  teachers: Teacher[];
  meetings: MeetingMinute[];
  observations: LessonObservation[];
  substitutes: SubstituteTeaching[];
}

export const OfficialPrintModal: React.FC<OfficialPrintModalProps> = ({
  isOpen,
  onClose,
  settings,
  teachers,
  meetings,
  observations,
  substitutes,
}) => {
  const [docType, setDocType] = useState<'assignment' | 'summary' | 'meetings' | 'substitutes'>('assignment');
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const headTeacher = teachers.find((t) => t.role === 'Tổ trưởng') || teachers[0];
  const totalPeriods = teachers.reduce((sum, t) => sum + t.teachingPeriodsPerWeek, 0);
  const totalStandard = teachers.reduce((sum, t) => sum + t.standardQuota, 0);

  const handlePrint = () => {
    window.print();
  };

  const handleExportPdf = async () => {
    if (!contentRef.current) return;
    setIsExportingPdf(true);
    try {
      const docNames: Record<string, string> = {
        assignment: `Bang_phan_cong_chuyen_mon_${settings.schoolYear.replace(/\s+/g, '_')}`,
        summary: `Bao_cao_tong_ket_${settings.departmentName.replace(/\s+/g, '_')}`,
        meetings: `Bien_ban_sinh_hoat_to_${meetings[0]?.code?.replace(/[\/\\]/g, '_') || 'ky_moi'}`,
        substitutes: `So_theo_doi_day_thay_${settings.schoolYear.replace(/\s+/g, '_')}`,
      };
      const filename = `${docNames[docType] || 'Bao_cao'}.pdf`;
      await exportElementToPdf(contentRef.current, {
        filename,
        pageTitle: settings.schoolName,
        leftMarginMm: 20,
        rightMarginMm: 15,
        topMarginMm: 15,
        bottomMarginMm: 15,
      });
    } catch (err) {
      console.error('Lỗi xuất PDF:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full text-slate-800 shadow-2xl overflow-hidden my-6 flex flex-col max-h-[92vh]">
        {/* Modal Top Control Bar (Hidden when printing) */}
        <div className="bg-slate-900 px-6 py-4 text-white flex justify-between items-center no-print">
          <div className="flex items-center gap-3">
            <School className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold text-base">In & Xuất Báo Cáo Hành Chính Chuẩn PDF / A4</h3>
              <p className="text-xs text-slate-400">Trường THCS Nguyễn Du • {settings.departmentName} (Nghị định 30/2020/NĐ-CP)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-60 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
              title="Xuất file PDF với bố cục chuẩn văn bản hành chính theo Nghị định 30/2020/NĐ-CP"
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang tạo PDF...</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4" />
                  <span>Xuất File PDF (jsPDF)</span>
                </>
              )}
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>In Văn Bản (Ctrl + P)</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg text-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Document Type Selector (Hidden when printing) */}
        <div className="bg-slate-100 p-3 border-b border-slate-200 flex flex-wrap gap-2 no-print text-xs">
          <span className="font-semibold text-slate-600 flex items-center pr-2">Chọn mẫu văn bản:</span>
          <button
            onClick={() => setDocType('assignment')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              docType === 'assignment'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            Mẫu 01: Bảng phân công 10 GV
          </button>
          <button
            onClick={() => setDocType('summary')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              docType === 'summary'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            Mẫu 02: Báo cáo công tác tổ
          </button>
          <button
            onClick={() => setDocType('meetings')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              docType === 'meetings'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            Mẫu 03: Biên bản sinh hoạt tổ
          </button>
          <button
            onClick={() => setDocType('substitutes')}
            className={`px-3 py-1.5 rounded-lg font-medium transition ${
              docType === 'substitutes'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-white text-slate-700 hover:bg-slate-200'
            }`}
          >
            Mẫu 04: Sổ dạy thay / bù
          </button>
        </div>

        {/* Printable Official Vietnamese Document Content */}
        <div ref={contentRef} className="p-8 overflow-y-auto flex-1 font-serif text-slate-900 bg-white">
          {/* Header */}
          <div className="grid grid-cols-2 text-center text-xs pb-4 border-b border-slate-400">
            <div>
              <p className="uppercase font-bold text-slate-800">{settings.districtCity}</p>
              <p className="uppercase font-extrabold text-slate-900">{settings.schoolName}</p>
              <p className="uppercase font-bold text-indigo-950 mt-0.5">{settings.departmentName}</p>
              <div className="w-24 h-0.5 bg-slate-400 mx-auto mt-1" />
              <p className="text-[11px] text-slate-600 mt-1 font-sans">Số: .... /QĐ-THCSND</p>
            </div>
            <div>
              <p className="uppercase font-bold text-slate-900">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</p>
              <p className="font-bold text-slate-800">Độc lập - Tự do - Hạnh phúc</p>
              <div className="w-32 h-0.5 bg-slate-400 mx-auto mt-1" />
              <p className="italic text-[11px] text-slate-600 mt-2 font-sans">
                Ngày .... tháng .... năm 2026
              </p>
            </div>
          </div>

          {/* DOCUMENT 1: BẢNG PHÂN CÔNG CHUYÊN MÔN */}
          {docType === 'assignment' && (
            <div className="space-y-5 pt-4">
              <div className="text-center space-y-1">
                <h2 className="text-base font-extrabold uppercase tracking-wide">
                  BẢNG PHÂN CÔNG CHUYÊN MÔN & ĐỊNH MỨC GIẢNG DẠY
                </h2>
                <p className="text-xs font-semibold text-slate-700">
                  Năm học: {settings.schoolYear} • Áp dụng: {settings.semester}
                </p>
                <p className="text-[11px] text-slate-500 italic font-sans">
                  (Cơ cấu tổ: 10 giáo viên - gồm 01 Tổ trưởng, 01 Tổ phó, 08 Tổ viên)
                </p>
              </div>

              <table className="w-full text-left border-collapse border border-slate-400 text-xs">
                <thead>
                  <tr className="bg-slate-100 font-bold uppercase text-[10px] text-center">
                    <th className="border border-slate-400 p-2 w-8">STT</th>
                    <th className="border border-slate-400 p-2 w-36">Họ và tên</th>
                    <th className="border border-slate-400 p-2 w-16">Chức vụ</th>
                    <th className="border border-slate-400 p-2 w-20">NTNS</th>
                    <th className="border border-slate-400 p-2 w-12">CN</th>
                    <th className="border border-slate-400 p-2 min-w-[150px]">Chuyên đề tổ</th>
                    <th className="border border-slate-400 p-2">Lớp giảng dạy</th>
                    <th className="border border-slate-400 p-2 w-14 text-center">Tiết dạy</th>
                    <th className="border border-slate-400 p-2 w-14 text-center">Định mức</th>
                    <th className="border border-slate-400 p-2">Kiêm nhiệm khác</th>
                  </tr>
                </thead>
                <tbody>
                  {teachers.map((t, idx) => (
                    <tr key={t.id}>
                      <td className="border border-slate-400 p-1.5 text-center font-sans font-medium">{idx + 1}</td>
                      <td className="border border-slate-400 p-1.5 font-bold whitespace-nowrap">{t.fullName}</td>
                      <td className="border border-slate-400 p-1.5 text-center">{t.role}</td>
                      <td className="border border-slate-400 p-1.5 text-center font-sans text-[11px] whitespace-nowrap">
                        {t.birthDate || (t.birthYear ? `01/01/${t.birthYear}` : '-')}
                      </td>
                      <td className="border border-slate-400 p-1.5 text-center font-bold text-emerald-800">
                        {t.homeroomClass || '-'}
                      </td>
                      <td className="border border-slate-400 p-1.5 text-[11px] text-slate-800">
                        {t.departmentTopic || '-'}
                      </td>
                      <td className="border border-slate-400 p-1.5 font-sans text-[11px]">
                        {t.assignedClasses.join(', ')}
                      </td>
                      <td className="border border-slate-400 p-1.5 text-center font-bold font-sans">
                        {t.teachingPeriodsPerWeek}
                      </td>
                      <td className="border border-slate-400 p-1.5 text-center font-sans">{t.standardQuota}</td>
                      <td className="border border-slate-400 p-1.5 text-[11px]">
                        {t.additionalTasks.join('; ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-100 font-bold text-center">
                    <td colSpan={8} className="border border-slate-400 p-2 text-right uppercase text-[11px]">
                      Tổng cộng tiết dạy toàn tổ:
                    </td>
                    <td className="border border-slate-400 p-2 font-sans text-sm">{totalPeriods}</td>
                    <td className="border border-slate-400 p-2 font-sans">{totalStandard}</td>
                    <td className="border border-slate-400 p-2 text-[11px] text-emerald-800 font-sans">
                      100% đúng chuẩn định biên
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}

          {/* DOCUMENT 2: BÁO CÁO CÔNG TÁC TỔ */}
          {docType === 'summary' && (
            <div className="space-y-4 pt-4 text-xs">
              <div className="text-center space-y-1">
                <h2 className="text-base font-extrabold uppercase tracking-wide">
                  BÁO CÁO TỔNG KẾT HOẠT ĐỘNG CHUYÊN MÔN
                </h2>
                <p className="font-semibold text-slate-700">
                  {settings.departmentName} • Trường THCS Nguyễn Du
                </p>
                <p className="text-[11px] text-slate-500 italic font-sans">
                  Học kỳ: {settings.semester} • Năm học: {settings.schoolYear}
                </p>
              </div>

              <div className="space-y-3 leading-relaxed">
                <h4 className="font-bold uppercase text-slate-900 border-b border-slate-300 pb-1">
                  1. TÌNH HÌNH ĐỘI NGŨ NHÂN SỰ
                </h4>
                <p>
                  - Tổng số cán bộ, giáo viên trong tổ: <strong>10 đồng chí</strong>.
                </p>
                <p>
                  - Cơ cấu ban lãnh đạo và thành viên: <strong>01 Tổ trưởng</strong> ({headTeacher?.fullName}), <strong>01 Tổ phó</strong> (Trần Thị Mai Lan), <strong>08 Tổ viên</strong>.
                </p>
                <p>
                  - Trình độ đào tạo: 100% đạt chuẩn và trên chuẩn (Thạc sĩ: 4 đồng chí; Cử nhân ĐH Sư phạm: 6 đồng chí).
                </p>

                <h4 className="font-bold uppercase text-slate-900 border-b border-slate-300 pb-1 mt-4">
                  2. THỰC HIỆN QUY CHẾ CHUYÊN MÔN
                </h4>
                <p>
                  - Thực hiện nghiêm túc chương trình GDPT 2018 theo đúng phân phối chương trình của Bộ GD&ĐT.
                </p>
                <p>
                  - Kiểm tra kế hoạch bài dạy (KHBĐ): 10/10 giáo viên soạn bài đầy đủ theo Công văn 5512/BGDĐT, ký duyệt định kỳ hàng tuần.
                </p>
                <p>
                  - Công tác dự giờ thao giảng: Toàn tổ đã thực hiện <strong>{observations.length} tiết dự giờ</strong>, trong đó 100% đạt loại Khá và Giỏi.
                </p>
                <p>
                  - Sinh hoạt chuyên môn: Tổ chức đều đặn 2 tuần/lần, đẩy mạnh sinh hoạt chuyên môn theo phương pháp Nghiên cứu bài học (NCBH).
                </p>

                <h4 className="font-bold uppercase text-slate-900 border-b border-slate-300 pb-1 mt-4">
                  3. KẾT QUẢ THI ĐUA VÀ PHƯƠNG HƯỚNG
                </h4>
                <p>
                  - 10/10 giáo viên được đánh giá Chuẩn nghề nghiệp đạt mức Tốt và Xuất sắc.
                </p>
                <p>
                  - Tiếp tục duy trì nền nếp chuyên môn, chuẩn bị tốt cho các kỳ thi học sinh giỏi và ôn thi vào lớp 10 THPT.
                </p>
              </div>
            </div>
          )}

          {/* DOCUMENT 3: BIÊN BẢN HỌP GẦN NHẤT */}
          {docType === 'meetings' && meetings.length > 0 && (
            <div className="space-y-4 pt-4 text-xs">
              <div className="text-center space-y-1">
                <h2 className="text-base font-extrabold uppercase tracking-wide">
                  BIÊN BẢN SINH HOẠT TỔ CHUYÊN MÔN
                </h2>
                <p className="font-bold text-indigo-950">{meetings[0].title}</p>
                <p className="text-[11px] text-slate-500 italic font-sans">
                  Số hiệu: {meetings[0].code} • Ngày họp: {meetings[0].meetingDate}
                </p>
              </div>

              <div className="space-y-3 leading-relaxed">
                <p><strong>Thời gian & địa điểm:</strong> {meetings[0].time}, tại {meetings[0].location}</p>
                <p><strong>Thành phần:</strong> 10/10 giáo viên có mặt đầy đủ.</p>
                <p><strong>Chủ trì:</strong> {teachers.find((t) => t.id === meetings[0].chairpersonId)?.fullName} (Tổ trưởng)</p>
                <p><strong>Thư ký:</strong> {teachers.find((t) => t.id === meetings[0].secretaryId)?.fullName}</p>

                <h4 className="font-bold uppercase border-b border-slate-300 pb-1 mt-3">I. Đánh giá công tác:</h4>
                <p className="whitespace-pre-line pl-2">{meetings[0].assessmentPastWork}</p>

                <h4 className="font-bold uppercase border-b border-slate-300 pb-1 mt-3">II. Kế hoạch thời gian tới:</h4>
                <p className="whitespace-pre-line pl-2">{meetings[0].upcomingPlan}</p>

                <h4 className="font-bold uppercase border-b border-slate-300 pb-1 mt-3">III. Thảo luận chuyên môn / NCBH:</h4>
                <p className="pl-2">{meetings[0].discussionTopic}</p>

                <h4 className="font-bold uppercase border-b border-slate-300 pb-1 mt-3">IV. Kết luận của Tổ trưởng:</h4>
                <p className="whitespace-pre-line pl-2 font-medium">{meetings[0].conclusion}</p>
              </div>
            </div>
          )}

          {/* DOCUMENT 4: SỔ THEO DÕI DẠY THAY */}
          {docType === 'substitutes' && (
            <div className="space-y-4 pt-4 text-xs">
              <div className="text-center space-y-1">
                <h2 className="text-base font-extrabold uppercase tracking-wide">
                  BẢNG THEO DÕI DẠY THAY & DẠY BÙ CHUYÊN MÔN
                </h2>
                <p className="font-semibold text-slate-700">
                  Căn cứ thanh toán phụ cấp dạy vượt giờ và hồ sơ chuyên môn
                </p>
              </div>

              <table className="w-full text-left border-collapse border border-slate-400 text-xs">
                <thead>
                  <tr className="bg-slate-100 font-bold uppercase text-[10px] text-center">
                    <th className="border border-slate-400 p-2 w-8">STT</th>
                    <th className="border border-slate-400 p-2 w-24">Ngày</th>
                    <th className="border border-slate-400 p-2 w-16">Tiết / Lớp</th>
                    <th className="border border-slate-400 p-2 w-32">Giáo viên nghỉ</th>
                    <th className="border border-slate-400 p-2 w-32">Giáo viên dạy thay</th>
                    <th className="border border-slate-400 p-2">Tên bài dạy</th>
                    <th className="border border-slate-400 p-2">Lý do</th>
                  </tr>
                </thead>
                <tbody>
                  {substitutes.map((s, idx) => (
                    <tr key={s.id}>
                      <td className="border border-slate-400 p-1.5 text-center font-sans">{idx + 1}</td>
                      <td className="border border-slate-400 p-1.5 font-sans">{s.date}</td>
                      <td className="border border-slate-400 p-1.5 text-center font-sans">
                        Tiết {s.period} ({s.className})
                      </td>
                      <td className="border border-slate-400 p-1.5 text-red-800 font-bold">
                        {teachers.find((t) => t.id === s.absentTeacherId)?.fullName}
                      </td>
                      <td className="border border-slate-400 p-1.5 text-emerald-800 font-bold">
                        {teachers.find((t) => t.id === s.substituteTeacherId)?.fullName}
                      </td>
                      <td className="border border-slate-400 p-1.5">{s.lessonName}</td>
                      <td className="border border-slate-400 p-1.5 text-[11px] italic">{s.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Official Signature Section */}
          <div className="grid grid-cols-2 text-center pt-10 text-xs font-sans border-t border-slate-300 mt-8">
            <div>
              <p className="font-bold uppercase text-slate-800">TỔ TRƯỞNG CHUYÊN MÔN</p>
              <p className="text-[11px] italic text-slate-500">(Ký và ghi rõ họ tên)</p>
              <div className="h-20 flex items-end justify-center">
                <span className="font-bold text-slate-900">{headTeacher?.fullName}</span>
              </div>
            </div>
            <div>
              <p className="font-bold uppercase text-slate-800">HIỆU TRƯỞNG PHÊ DUYỆT</p>
              <p className="text-[11px] italic text-slate-500">(Ký tên và đóng dấu)</p>
              <div className="h-20 flex items-end justify-center">
                <span className="font-bold text-slate-900">Ban Giám Hiệu THCS Nguyễn Du</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
