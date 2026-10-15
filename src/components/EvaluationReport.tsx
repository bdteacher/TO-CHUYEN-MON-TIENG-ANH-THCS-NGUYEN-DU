import React, { useState } from 'react';
import {
  Award,
  Printer,
  CheckCircle,
  FileText,
  Star,
  Sparkles,
  Download,
  Users,
  ShieldCheck,
} from 'lucide-react';
import { Teacher, DepartmentSetting } from '../types';

interface EvaluationReportProps {
  settings: DepartmentSetting;
  teachers: Teacher[];
  onUpdateTeacher: (updated: Teacher) => void;
  onOpenOfficialPrint: () => void;
}

export const EvaluationReport: React.FC<EvaluationReportProps> = ({
  settings,
  teachers,
  onUpdateTeacher,
  onOpenOfficialPrint,
}) => {
  const [selectedStandard, setSelectedStandard] = useState<'all' | 'Xuất sắc' | 'Tốt' | 'Khá' | 'Đạt'>('all');

  const filteredTeachers = teachers.filter((t) =>
    selectedStandard === 'all' ? true : t.professionalStandardRating === selectedStandard
  );

  const cstdCount = teachers.filter((t) => t.emulationTitle === 'Chiến sĩ thi đua cấp cơ sở').length;
  const ldttCount = teachers.filter((t) => t.emulationTitle === 'Lao động tiên tiến').length;
  const excellentRatingCount = teachers.filter((t) => t.professionalStandardRating === 'Xuất sắc').length;
  const goodRatingCount = teachers.filter((t) => t.professionalStandardRating === 'Tốt').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-6 h-6 text-indigo-600" />
              Đánh Giá Chuẩn Nghề Nghiệp & Danh Hiệu Thi Đua (10 Giáo Viên)
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Căn cứ Thông tư 20/2018/TT-BGDĐT ban hành Quy định chuẩn nghề nghiệp giáo viên THCS
            </p>
          </div>

          <button
            onClick={onOpenOfficialPrint}
            className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold flex items-center gap-1.5 shadow-sm transition active:scale-95"
          >
            <Printer className="w-4 h-4" />
            <span>In Báo Cáo Thi Đua A4</span>
          </button>
        </div>

        {/* Highlight Stats */}
        <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-xl">
            <span className="text-slate-500 block">Chiến sĩ thi đua cấp cơ sở</span>
            <span className="text-2xl font-extrabold text-amber-900">{cstdCount} đồng chí</span>
            <span className="text-[11px] text-amber-700 block mt-0.5">Tỷ lệ: {(cstdCount / teachers.length) * 100}%</span>
          </div>

          <div className="p-3.5 bg-blue-50/80 border border-blue-200 rounded-xl">
            <span className="text-slate-500 block">Lao động tiên tiến</span>
            <span className="text-2xl font-extrabold text-blue-900">{ldttCount} đồng chí</span>
            <span className="text-[11px] text-blue-700 block mt-0.5">100% đạt chỉ tiêu trường giao</span>
          </div>

          <div className="p-3.5 bg-purple-50/80 border border-purple-200 rounded-xl">
            <span className="text-slate-500 block">Chuẩn nghề nghiệp: Xuất sắc</span>
            <span className="text-2xl font-extrabold text-purple-900">{excellentRatingCount} giáo viên</span>
            <span className="text-[11px] text-purple-700 block mt-0.5">Tiêu biểu toàn diện</span>
          </div>

          <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl">
            <span className="text-slate-500 block">Chuẩn nghề nghiệp: Tốt</span>
            <span className="text-2xl font-extrabold text-emerald-900">{goodRatingCount} giáo viên</span>
            <span className="text-[11px] text-emerald-700 block mt-0.5">Vững vàng chuyên môn</span>
          </div>
        </div>
      </div>

      {/* Main Table: Professional Standards Matrix */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
          <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            Bảng Đánh Giá Xếp Loại Chuẩn Nghề Nghiệp 10 Giáo Viên
          </h3>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Lọc theo chuẩn:</span>
            <select
              value={selectedStandard}
              onChange={(e) => setSelectedStandard(e.target.value as any)}
              className="px-2.5 py-1 border border-slate-200 rounded-lg bg-white font-medium focus:outline-none"
            >
              <option value="all">Tất cả (10 GV)</option>
              <option value="Xuất sắc">Xuất sắc</option>
              <option value="Tốt">Tốt</option>
              <option value="Khá">Khá</option>
              <option value="Đạt">Đạt</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[11px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 w-12 text-center">STT</th>
                <th className="px-4 py-3 w-48">Họ và tên giáo viên</th>
                <th className="px-4 py-3 w-28">Chức vụ tổ</th>
                <th className="px-4 py-3 w-28">Trình độ SP</th>
                <th className="px-4 py-3 w-36">Danh hiệu thi đua</th>
                <th className="px-4 py-3 w-36 text-center">Xếp loại Chuẩn NN</th>
                <th className="px-4 py-3">Minh chứng & Thành tích nổi bật</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredTeachers.map((teacher, idx) => (
                <tr key={teacher.id} className="hover:bg-slate-50 transition">
                  <td className="px-4 py-3 text-center font-mono text-slate-400 font-medium">{idx + 1}</td>
                  <td className="px-4 py-3 font-bold text-slate-900">
                    {teacher.fullName}
                    <span className="block text-[11px] text-slate-400 font-normal">
                      NTNS: {teacher.birthDate || (teacher.birthYear ? `01/01/${teacher.birthYear}` : '-')}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded font-semibold bg-slate-100 text-slate-700">
                      {teacher.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">{teacher.degree}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                        teacher.emulationTitle === 'Chiến sĩ thi đua cấp cơ sở'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-blue-100 text-blue-900 border border-blue-200'
                      }`}
                    >
                      {teacher.emulationTitle}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <select
                      value={teacher.professionalStandardRating}
                      onChange={(e) =>
                        onUpdateTeacher({
                          ...teacher,
                          professionalStandardRating: e.target.value as any,
                        })
                      }
                      className={`text-xs font-extrabold px-3 py-1 rounded-full border cursor-pointer ${
                        teacher.professionalStandardRating === 'Xuất sắc'
                          ? 'bg-purple-50 text-purple-800 border-purple-300'
                          : teacher.professionalStandardRating === 'Tốt'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : 'bg-blue-50 text-blue-800 border-blue-300'
                      }`}
                    >
                      <option value="Xuất sắc">Xuất sắc</option>
                      <option value="Tốt">Tốt</option>
                      <option value="Khá">Khá</option>
                      <option value="Đạt">Đạt</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-600">
                    <p className="font-medium text-slate-800">{teacher.notes || 'Thực hiện tốt các tiêu chí theo Thông tư 20/2018/TT-BGDĐT'}</p>
                    {teacher.departmentTopic && (
                      <span className="text-[11px] text-indigo-700 block mt-0.5 font-medium">
                        • Chuyên đề tổ: {teacher.departmentTopic}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Official Guidelines Information Box */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white rounded-2xl p-6 shadow-xs text-xs space-y-3">
        <h4 className="text-sm font-bold text-amber-300 flex items-center gap-2 transition-all duration-300 ease-in-out px-2.5 py-1 -mx-2.5 -my-1 rounded-lg hover:bg-white/10 hover:shadow-sm cursor-pointer w-fit">
          <Star className="w-4 h-4 text-amber-400" />
          5 Tiêu Chuẩn Nghề Nghiệp Giáo Viên Cơ Sở Giáo Dục Phổ Thông (Thông tư 20/2018):
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-indigo-100 pt-1">
          <div className="bg-white/10 p-3 rounded-xl border border-white/10">
            <strong className="text-white block mb-0.5">Tiêu chuẩn 1:</strong>
            Phẩm chất nhà giáo (Đạo đức nhà giáo và Phong cách nhà giáo mẫu mực).
          </div>
          <div className="bg-white/10 p-3 rounded-xl border border-white/10">
            <strong className="text-white block mb-0.5">Tiêu chuẩn 2:</strong>
            Phát triển chuyên môn, nghiệp vụ (Xây dựng KH dạy học, đổi mới phương pháp kiểm tra).
          </div>
          <div className="bg-white/10 p-3 rounded-xl border border-white/10">
            <strong className="text-white block mb-0.5">Tiêu chuẩn 3:</strong>
            Xây dựng môi trường giáo dục (Xây dựng văn hóa nhà trường và trường học hạnh phúc).
          </div>
          <div className="bg-white/10 p-3 rounded-xl border border-white/10">
            <strong className="text-white block mb-0.5">Tiêu chuẩn 4:</strong>
            Phát triển mối quan hệ nhà trường, gia đình và cộng đồng xã hội.
          </div>
          <div className="bg-white/10 p-3 rounded-xl border border-white/10 col-span-1 md:col-span-2">
            <strong className="text-white block mb-0.5">Tiêu chuẩn 5:</strong>
            Sử dụng ngoại ngữ hoặc tiếng dân tộc, ứng dụng công nghệ thông tin và chuyển đổi số trong dạy học.
          </div>
        </div>
      </div>
    </div>
  );
};
