import React, { useState } from 'react';
import {
  X,
  Send,
  Inbox,
  CheckCircle2,
  Clock,
  AlertTriangle,
  MessageSquare,
  User,
  Calendar,
  Layers,
  Sparkles,
  Check,
  XCircle,
  FileCheck,
  CalendarClock,
  FileText,
  Eye,
  Filter,
} from 'lucide-react';
import { DepartmentRequest, Teacher, SubstituteTeaching } from '../types';
import { useAuthRole } from '../context/AuthRoleContext';
import { useToast } from '../context/ToastContext';

interface DepartmentRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  requests: DepartmentRequest[];
  teachers: Teacher[];
  onAddRequest: (request: DepartmentRequest) => void;
  onUpdateRequest: (request: DepartmentRequest) => void;
  onAutoAddSubstitute?: (sub: SubstituteTeaching) => void;
}

export const DepartmentRequestModal: React.FC<DepartmentRequestModalProps> = ({
  isOpen,
  onClose,
  requests,
  teachers,
  onAddRequest,
  onUpdateRequest,
  onAutoAddSubstitute,
}) => {
  const { role, isHead, isMember, displayName, userEmail, matchedTeacher } = useAuthRole();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState<'create' | 'list'>(isHead ? 'list' : 'create');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  // Form state
  const [reqType, setReqType] = useState<DepartmentRequest['type']>('Xin dạy thay / Báo vắng');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [urgency, setUrgency] = useState<DepartmentRequest['urgency']>('Bình thường');
  const [targetDate, setTargetDate] = useState(new Date().toISOString().split('T')[0]);

  // Substitute specific fields
  const [subTeacherId, setSubTeacherId] = useState(teachers[1]?.id || '');
  const [className, setClassName] = useState('9A1');
  const [period, setPeriod] = useState(2);
  const [lessonName, setLessonName] = useState('');
  const [reason, setReason] = useState('Bận việc gia đình có đơn');

  // Lesson plan specific fields
  const [lessonPlanWeek, setLessonPlanWeek] = useState(7);

  // Quick feedback response state for Tổ trưởng
  const [respondingReqId, setRespondingReqId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');

  if (!isOpen) return null;

  const currentTeacherId = matchedTeacher?.id || teachers[0]?.id;

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      toast.warning('Vui lòng điền tiêu đề và nội dung yêu cầu.', 'Thiếu thông tin');
      return;
    }

    const newRequest: DepartmentRequest = {
      id: `req-${Date.now()}`,
      senderName: displayName,
      senderEmail: userEmail || 'to-vien@thcsnguyendu.edu.vn',
      senderTeacherId: currentTeacherId,
      type: reqType,
      title: title.trim(),
      content: content.trim(),
      urgency,
      status: 'Chờ duyệt',
      createdAt: new Date().toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      targetDate: reqType === 'Xin dạy thay / Báo vắng' ? targetDate : undefined,
    };

    if (reqType === 'Xin dạy thay / Báo vắng') {
      newRequest.substituteData = {
        absentTeacherId: currentTeacherId,
        substituteTeacherId: subTeacherId,
        className,
        period,
        lessonName: lessonName || title,
        reason,
        date: targetDate,
      };

      // Also auto add to substitute list with 'Chờ duyệt' status if prop provided
      if (onAutoAddSubstitute) {
        onAutoAddSubstitute({
          id: `sub-req-${Date.now()}`,
          date: targetDate,
          absentTeacherId: currentTeacherId,
          substituteTeacherId: subTeacherId,
          className,
          period,
          subject: 'Tiếng Anh',
          lessonName: lessonName || title,
          reason,
          status: 'Chờ duyệt',
        });
      }
    } else if (reqType === 'Duyệt kế hoạch bài dạy') {
      newRequest.lessonPlanWeek = lessonPlanWeek;
    }

    onAddRequest(newRequest);
    toast.success(`Đã gửi yêu cầu "${title}" tới Tổ trưởng thành công!`, 'Gửi yêu cầu');

    // Reset form
    setTitle('');
    setContent('');
    setLessonName('');
    setActiveTab('list');
  };

  const handleApproveRequest = (req: DepartmentRequest) => {
    const updated: DepartmentRequest = {
      ...req,
      status: 'Đã chấp thuận',
      responseNote: responseText.trim() || 'Tổ trưởng đã đồng ý phê duyệt yêu cầu này.',
    };
    onUpdateRequest(updated);
    setRespondingReqId(null);
    setResponseText('');
    toast.success(`Đã chấp thuận yêu cầu "${req.title}"!`, 'Phê duyệt yêu cầu');
  };

  const handleRejectRequest = (req: DepartmentRequest) => {
    const updated: DepartmentRequest = {
      ...req,
      status: 'Từ chối',
      responseNote: responseText.trim() || 'Tổ trưởng chưa thể duyệt yêu cầu này vào thời điểm hiện tại.',
    };
    onUpdateRequest(updated);
    setRespondingReqId(null);
    setResponseText('');
    toast.info(`Đã từ chối yêu cầu "${req.title}".`, 'Từ chối yêu cầu');
  };

  const handleSendFeedback = (req: DepartmentRequest) => {
    if (!responseText.trim()) {
      toast.warning('Vui lòng nhập nội dung phản hồi cho tổ viên.', 'Phản hồi');
      return;
    }
    const updated: DepartmentRequest = {
      ...req,
      status: 'Đã phản hồi',
      responseNote: responseText.trim(),
    };
    onUpdateRequest(updated);
    setRespondingReqId(null);
    setResponseText('');
    toast.success(`Đã gửi phản hồi tới ${req.senderName}!`, 'Phản hồi thành công');
  };

  // Filter requests
  const filteredRequests = requests.filter((r) => {
    const matchStatus = filterStatus === 'all' || r.status === filterStatus;
    const matchType = filterType === 'all' || r.type === filterType;
    return matchStatus && matchType;
  });

  const pendingCount = requests.filter((r) => r.status === 'Chờ duyệt').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 px-6 py-4 text-white flex justify-between items-center border-b border-indigo-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-300">
              {isHead ? <Inbox className="w-5 h-5" /> : <Send className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  {isHead ? 'Kênh Quản Trị Tổ Trưởng' : 'Kênh Tương Tác Tổ Viên'}
                </span>
                <span className="text-xs text-indigo-200">
                  Phân quyền theo Google Auth
                </span>
              </div>
              <h3 className="text-lg font-bold text-white mt-0.5">
                {isHead ? 'Hộp Thư Tiếp Nhận Yêu Cầu Từ Tổ Viên' : 'Gửi Yêu Cầu & Đề Xuất Tới Tổ Trưởng'}
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-indigo-200 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="bg-slate-50 px-6 py-2.5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('list')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'list'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              <span>{isHead ? 'Tất Cả Yêu Cầu Của Tổ' : 'Danh Sách Yêu Cầu'}</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-900 text-[10px] font-bold">
                  {pendingCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('create')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition ${
                activeTab === 'create'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Gửi Yêu Cầu Mới</span>
            </button>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <span className="font-medium text-slate-700">Tài khoản:</span>
            <span className="px-2 py-0.5 rounded bg-slate-200/80 text-slate-800 font-mono text-[11px]">
              {userEmail || 'Chưa liên kết Google'}
            </span>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'create' ? (
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-3.5 text-xs text-blue-900 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="font-semibold">Quyền hạn Tổ viên:</strong> Thầy/Cô có quyền gửi yêu cầu xin dạy thay, duyệt kế hoạch bài dạy (KHBĐ) và đề xuất nội dung sinh hoạt chuyên môn trực tiếp đến Thầy Tổ trưởng.
                </div>
              </div>

              {/* Request Type Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase">
                  Loại yêu cầu / Đề xuất:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {[
                    { type: 'Xin dạy thay / Báo vắng' as const, icon: CalendarClock, desc: 'Báo vắng & nhờ dạy thay' },
                    { type: 'Duyệt kế hoạch bài dạy' as const, icon: FileCheck, desc: 'Đề nghị ký duyệt KHBĐ' },
                    { type: 'Đề xuất chuyên đề / Sinh hoạt' as const, icon: MessageSquare, desc: 'Góp ý nội dung họp tổ' },
                    { type: 'Đăng ký dự giờ thao giảng' as const, icon: Eye, desc: 'Đăng ký tiết dạy thao giảng' },
                    { type: 'Đề xuất phân công / Khác' as const, icon: FileText, desc: 'Ý kiến điều chỉnh khác' },
                  ].map((item) => {
                    const Icon = item.icon;
                    const isSelected = reqType === item.type;
                    return (
                      <button
                        type="button"
                        key={item.type}
                        onClick={() => setReqType(item.type)}
                        className={`p-2.5 rounded-xl border text-left transition flex items-start gap-2 ${
                          isSelected
                            ? 'bg-blue-50 border-blue-500 ring-2 ring-blue-500/20 text-blue-900 shadow-sm'
                            : 'bg-white border-slate-200 hover:border-slate-300 text-slate-700'
                        }`}
                      >
                        <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${isSelected ? 'text-blue-600' : 'text-slate-400'}`} />
                        <div>
                          <div className="text-xs font-semibold leading-tight">{item.type}</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">{item.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Conditional Fields: Xin dạy thay */}
              {reqType === 'Xin dạy thay / Báo vắng' && (
                <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200 space-y-3">
                  <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                    <CalendarClock className="w-4 h-4 text-amber-600" />
                    Thông tin tiết vắng & Giáo viên dạy thay đề xuất:
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Ngày vắng dạy:
                      </label>
                      <input
                        type="date"
                        value={targetDate}
                        onChange={(e) => setTargetDate(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Lớp & Tiết dạy:
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={className}
                          onChange={(e) => setClassName(e.target.value)}
                          className="w-1/2 px-2 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                        >
                          {['6A1', '6A2', '7A1', '7A2', '8A1', '8A2', '9A1', '9A2', '9A3'].map((c) => (
                            <option key={c} value={c}>
                              Lớp {c}
                            </option>
                          ))}
                        </select>
                        <select
                          value={period}
                          onChange={(e) => setPeriod(Number(e.target.value))}
                          className="w-1/2 px-2 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                        >
                          {[1, 2, 3, 4, 5].map((p) => (
                            <option key={p} value={p}>
                              Tiết {p}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Nhờ giáo viên dạy thay:
                      </label>
                      <select
                        value={subTeacherId}
                        onChange={(e) => setSubTeacherId(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                      >
                        {teachers.map((t) => (
                          <option key={t.id} value={t.id}>
                            {t.fullName} ({t.role})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Tên bài dạy:
                      </label>
                      <input
                        type="text"
                        placeholder="VD: Unit 3: Teen Stress - Skills 1"
                        value={lessonName}
                        onChange={(e) => setLessonName(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                        Lý do xin vắng:
                      </label>
                      <input
                        type="text"
                        placeholder="VD: Tập huấn chuyên môn Phòng GD&ĐT"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Conditional Fields: Duyệt KHBĐ */}
              {reqType === 'Duyệt kế hoạch bài dạy' && (
                <div className="p-4 rounded-xl bg-purple-50/60 border border-purple-200 space-y-2">
                  <div className="text-xs font-bold text-purple-900 flex items-center gap-1.5">
                    <FileCheck className="w-4 h-4 text-purple-600" />
                    Kế hoạch bài dạy đề nghị ký duyệt:
                  </div>
                  <div className="flex items-center gap-3">
                    <label className="text-xs text-slate-700 font-semibold">Chọn tuần duyệt:</label>
                    <select
                      value={lessonPlanWeek}
                      onChange={(e) => setLessonPlanWeek(Number(e.target.value))}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-purple-500"
                    >
                      {[5, 6, 7, 8, 9, 10, 11, 12].map((w) => (
                        <option key={w} value={w}>
                          Tuần {w} (Học kỳ I)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* General Title & Content */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tiêu đề yêu cầu: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="VD: Xin dạy thay tiết 2 lớp 9A1 ngày 16/10 do tập huấn chuyên môn"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mức độ ưu tiên:
                  </label>
                  <select
                    value={urgency}
                    onChange={(e) => setUrgency(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Bình thường">Bình thường</option>
                    <option value="Quan trọng">Quan trọng</option>
                    <option value="Khẩn cấp">Khẩn cấp (Cần xử lý trong ngày)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Người gửi yêu cầu:
                  </label>
                  <div className="px-3.5 py-2 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 font-medium">
                    {displayName} ({userEmail || 'Chưa đăng nhập'})
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nội dung chi tiết & Đề xuất: <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Kính gửi Thầy Tổ trưởng, em xin đề xuất nội dung..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-md flex items-center gap-1.5 transition active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span>Gửi Yêu Cầu Tới Tổ Trưởng</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              {/* Filter bar */}
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-200">
                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Tất cả trạng thái</option>
                    <option value="Chờ duyệt">Chờ duyệt</option>
                    <option value="Đã chấp thuận">Đã chấp thuận</option>
                    <option value="Đã phản hồi">Đã phản hồi</option>
                    <option value="Từ chối">Từ chối</option>
                  </select>

                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">Tất cả phân loại</option>
                    <option value="Xin dạy thay / Báo vắng">Xin dạy thay</option>
                    <option value="Duyệt kế hoạch bài dạy">Duyệt KHBĐ</option>
                    <option value="Đề xuất chuyên đề / Sinh hoạt">Đề xuất chuyên đề</option>
                    <option value="Đăng ký dự giờ thao giảng">Đăng ký dự giờ</option>
                  </select>
                </div>

                <div className="text-xs text-slate-500">
                  Hiển thị <strong className="text-slate-800">{filteredRequests.length}</strong> yêu cầu
                </div>
              </div>

              {filteredRequests.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Inbox className="w-12 h-12 mx-auto stroke-1 mb-2 text-slate-300" />
                  <p className="text-xs">Chưa có yêu cầu nào phù hợp điều kiện lọc.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredRequests.map((req) => {
                    const isPending = req.status === 'Chờ duyệt';
                    const isApproved = req.status === 'Đã chấp thuận';
                    const isRejected = req.status === 'Từ chối';
                    const isResponding = respondingReqId === req.id;

                    return (
                      <div
                        key={req.id}
                        className={`p-4 rounded-xl border transition ${
                          isPending
                            ? 'bg-amber-50/30 border-amber-200 shadow-sm'
                            : isApproved
                            ? 'bg-emerald-50/20 border-emerald-200'
                            : 'bg-white border-slate-200'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-blue-100 text-blue-800">
                                {req.type}
                              </span>
                              {req.urgency === 'Khẩn cấp' ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-red-100 text-red-700 flex items-center gap-1">
                                  <AlertTriangle className="w-3 h-3" />
                                  Khẩn cấp
                                </span>
                              ) : req.urgency === 'Quan trọng' ? (
                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                                  Quan trọng
                                </span>
                              ) : null}

                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  isApproved
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : isRejected
                                    ? 'bg-rose-100 text-rose-800'
                                    : isPending
                                    ? 'bg-amber-100 text-amber-800 animate-pulse'
                                    : 'bg-sky-100 text-sky-800'
                                }`}
                              >
                                {req.status}
                              </span>
                            </div>

                            <h4 className="text-sm font-bold text-slate-800 mt-1.5">{req.title}</h4>
                            <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-3">
                              <span>
                                Người gửi: <strong className="text-slate-700">{req.senderName}</strong> ({req.senderEmail})
                              </span>
                              <span>• {req.createdAt}</span>
                            </div>
                          </div>

                          {/* Action Buttons for Tổ trưởng */}
                          {isHead && isPending && !isResponding && (
                            <div className="flex items-center gap-1.5 shrink-0 mt-2 sm:mt-0">
                              <button
                                onClick={() => handleApproveRequest(req)}
                                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition active:scale-95"
                                title="Chấp thuận yêu cầu này"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Duyệt</span>
                              </button>
                              <button
                                onClick={() => {
                                  setRespondingReqId(req.id);
                                  setResponseText('');
                                }}
                                className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold flex items-center gap-1 shadow-sm transition active:scale-95"
                                title="Nhập ý kiến phản hồi"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                <span>Phản hồi</span>
                              </button>
                              <button
                                onClick={() => handleRejectRequest(req)}
                                className="px-2 py-1 rounded-lg bg-slate-200 hover:bg-rose-100 hover:text-rose-700 text-slate-600 text-xs font-semibold transition"
                                title="Từ chối yêu cầu này"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Request content */}
                        <div className="mt-2.5 p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                          {req.content}
                        </div>

                        {/* Substitute Details Payload if any */}
                        {req.substituteData && (
                          <div className="mt-2 p-2.5 rounded-lg bg-amber-50/80 border border-amber-200/70 text-[11px] text-amber-900 grid grid-cols-2 sm:grid-cols-4 gap-2">
                            <div>
                              <span className="text-slate-500">Ngày vắng:</span>{' '}
                              <strong>{req.substituteData.date}</strong>
                            </div>
                            <div>
                              <span className="text-slate-500">Lớp - Tiết:</span>{' '}
                              <strong>
                                {req.substituteData.className} - Tiết {req.substituteData.period}
                              </strong>
                            </div>
                            <div className="col-span-2">
                              <span className="text-slate-500">Dạy thay:</span>{' '}
                              <strong>
                                {teachers.find((t) => t.id === req.substituteData?.substituteTeacherId)?.fullName || 'Đã phân công'}
                              </strong>
                            </div>
                          </div>
                        )}

                        {/* Tổ trưởng Response display if already responded */}
                        {req.responseNote && (
                          <div className="mt-2 p-2.5 rounded-lg bg-blue-50 border border-blue-200 text-xs text-blue-950 flex items-start gap-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                              <div className="font-semibold text-blue-900 text-[11px]">
                                Ý kiến phản hồi từ Tổ trưởng:
                              </div>
                              <div className="mt-0.5">{req.responseNote}</div>
                            </div>
                          </div>
                        )}

                        {/* Interactive response editor for Tổ trưởng */}
                        {isResponding && (
                          <div className="mt-3 p-3 rounded-xl bg-blue-50/90 border border-blue-300 animate-in fade-in space-y-2">
                            <label className="block text-xs font-bold text-blue-900">
                              Nội dung phản hồi / Ghi chú phê duyệt của Tổ trưởng:
                            </label>
                            <textarea
                              rows={2}
                              value={responseText}
                              onChange={(e) => setResponseText(e.target.value)}
                              placeholder="Nhập ghi chú chỉ đạo hoặc lý do duyệt/từ chối..."
                              className="w-full p-2 rounded-lg border border-blue-300 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => setRespondingReqId(null)}
                                className="px-3 py-1 rounded-lg border border-slate-300 text-xs text-slate-600 hover:bg-white"
                              >
                                Đóng
                              </button>
                              <button
                                type="button"
                                onClick={() => handleSendFeedback(req)}
                                className="px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold"
                              >
                                Gửi Phản Hồi
                              </button>
                              <button
                                type="button"
                                onClick={() => handleApproveRequest(req)}
                                className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold"
                              >
                                Chấp Thuận Ngay
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
