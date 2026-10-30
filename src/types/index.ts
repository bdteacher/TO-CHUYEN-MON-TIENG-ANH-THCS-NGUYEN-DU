export type TeacherRole = 'Tổ trưởng' | 'Tổ phó' | 'Tổ viên';

export type AcademicDegree = 'Cử nhân Sư phạm' | 'Thạc sĩ' | 'Tiến sĩ' | 'Cao đẳng Sư phạm';

export type EmulationTitle = 'Chiến sĩ thi đua cấp cơ sở' | 'Lao động tiên tiến' | 'Chiến sĩ thi đua cấp Tỉnh/TP' | 'Hoàn thành tốt nhiệm vụ';

export interface Teacher {
  id: string;
  code: string; // VD: GV-01
  fullName: string;
  role: TeacherRole;
  gender: 'Nam' | 'Nữ';
  birthDate: string; // NTNS (Ngày tháng năm sinh, VD: 15/08/1980)
  birthYear?: number; // Hỗ trợ tương thích ngược
  phone: string;
  email: string;
  degree: AcademicDegree;
  majorSubject: string; // Môn chính (Toán, Tin học...)
  secondarySubject?: string;
  departmentTopic: string; // Chuyên đề tổ (Chuyên đề chuyên môn phân công)
  teachingYears: number;
  homeroomClass?: string; // Lớp chủ nhiệm (VD: 9A1)
  assignedClasses: string[]; // Các lớp dạy (VD: ['9A1', '9A2', '9A3'])
  teachingPeriodsPerWeek: number; // Số tiết dạy thực tế
  standardQuota: number; // Định mức chuẩn (VD: 19 tiết, trừ chủ nhiệm còn 15, trừ tổ trưởng còn 16...)
  additionalTasks: string[]; // Kiêm nhiệm: Bồi dưỡng HSG, Thư ký tổ, Phụ trách phòng máy...
  emulationTitle: EmulationTitle;
  professionalStandardRating: 'Xuất sắc' | 'Tốt' | 'Khá' | 'Đạt';
  avatarUrl?: string;
  notes?: string;
}

export interface SubstituteTeaching {
  id: string;
  date: string;
  absentTeacherId: string;
  substituteTeacherId: string;
  className: string;
  period: number; // Tiết 1, 2, 3...
  subject: string;
  lessonName: string;
  reason: string;
  status: 'Đã duyệt' | 'Chờ duyệt' | 'Đã hoàn thành';
}

export interface MeetingAttendee {
  teacherId: string;
  present: boolean;
  reasonIfAbsent?: string;
}

export interface MeetingMinute {
  id: string;
  code: string; // VD: BB-2026-01
  meetingDate: string;
  time: string;
  location: string;
  title: string;
  sessionType: 'Định kỳ 2 tuần/lần' | 'Nghiên cứu bài học' | 'Chuyên đề chuyên môn' | 'Đột xuất';
  chairpersonId: string; // Người chủ trì (thường là Tổ trưởng)
  secretaryId: string; // Thư ký cuộc họp
  attendees: MeetingAttendee[];
  assessmentPastWork: string; // Đánh giá công tác 2 tuần qua
  upcomingPlan: string; // Kế hoạch 2 tuần tới
  discussionTopic: string; // Nội dung thảo luận chuyên môn / chuyên đề
  teacherOpinions: { teacherId: string; opinion: string }[];
  conclusion: string; // Kết luận của Tổ trưởng
  createdAt: string;
}

export interface ObservationCriterion {
  id: string;
  name: string;
  maxScore: number;
  score: number;
  comment: string;
}

export interface LessonObservation {
  id: string;
  date: string;
  teacherId: string; // Giáo viên dạy
  observerId: string; // Giáo viên dự giờ
  subject: string;
  className: string;
  period: number;
  lessonName: string;
  lessonType: 'Tiết dạy thao giảng' | 'Dự giờ định kỳ' | 'Chuyên đề cụm trường' | 'Hội thi GV Giỏi';
  criteria: ObservationCriterion[];
  totalScore: number;
  rating: 'Giỏi' | 'Khá' | 'Trung bình' | 'Chưa đạt';
  generalComments: string;
  suggestions: string;
}

export interface LessonPlanReview {
  id: string;
  week: number;
  month: number;
  teacherId: string;
  subject: string;
  grade: number; // 6, 7, 8, 9
  submissionDate: string;
  reviewerId: string; // Người ký duyệt (Tổ trưởng hoặc Tổ phó)
  status: 'Đã ký duyệt' | 'Yêu cầu bổ sung' | 'Chưa nộp';
  feedback: string;
  quickNote?: string; // Ghi chú nhanh hoặc nhận xét cụ thể
}

export type UserRole = 'Tổ trưởng' | 'Tổ viên';

export interface DepartmentRequest {
  id: string;
  senderName: string;
  senderEmail: string;
  senderTeacherId?: string;
  type:
    | 'Xin dạy thay / Báo vắng'
    | 'Duyệt kế hoạch bài dạy'
    | 'Đề xuất chuyên đề / Sinh hoạt'
    | 'Đăng ký dự giờ thao giảng'
    | 'Đề xuất phân công / Khác';
  title: string;
  content: string;
  urgency: 'Bình thường' | 'Quan trọng' | 'Khẩn cấp';
  status: 'Chờ duyệt' | 'Đã chấp thuận' | 'Đã phản hồi' | 'Từ chối';
  responseNote?: string;
  createdAt: string;
  targetDate?: string;
  // Specific payload if request relates to a substitute or lesson plan
  substituteData?: Partial<SubstituteTeaching>;
  lessonPlanWeek?: number;
}

export interface DepartmentSetting {
  schoolName: string; // Trường THCS Nguyễn Du
  districtCity: string; // Quận 1, TP. Hồ Chí Minh (hoặc trường chuẩn quốc gia)
  departmentName: string; // Tổ Tiếng Anh / Tổ chuyên môn
  schoolYear: string; // 2025 - 2026
  semester: 'Học kỳ I' | 'Học kỳ II';
  headOfDepartmentId: string;
  headOfDepartmentEmail?: string; // Email Google đăng nhập của Tổ trưởng
  deputyHeadId: string;
  totalTeachers: number; // 10
}

export interface MonthlyTaskItem {
  id: string;
  title: string;
  category: 'Chuyên môn' | 'Hồ sơ 5512' | 'Dự giờ NCBH' | 'Kiểm tra KSCL' | 'Bồi dưỡng HSG' | 'Chuyển đổi số';
  deadline: string;
  assignee: string; // VD: Thầy Hưng (TT), Cô Lan (TP), Toàn tổ...
  status: 'Đang thực hiện' | 'Hoàn thành' | 'Chưa bắt đầu';
  details?: string;
}

export interface MonthlyPlan {
  month: number; // 9, 10, 11, 12, 1, 2, 3, 4, 5
  year: number; // 2025, 2026
  schoolYear: string; // '2025 - 2026'
  generalGoal: string; // Mục tiêu trọng tâm của tháng
  tasks: MonthlyTaskItem[];
  updatedAt?: string;
}

