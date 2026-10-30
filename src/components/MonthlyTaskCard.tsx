import React, { useState } from 'react';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Edit3,
  Plus,
  Trash2,
  Sparkles,
  Target,
  UserCheck,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  Save,
  X,
  AlertCircle,
  Tag,
  Check,
  Layers,
  Send,
  Lock,
  ArrowUp,
  ArrowDown,
  Copy,
  Calendar,
  CheckSquare,
  ListTodo,
} from 'lucide-react';
import { MonthlyPlan, MonthlyTaskItem, Teacher } from '../types';
import { useAuthRole } from '../context/AuthRoleContext';
import { useToast } from '../context/ToastContext';
import { initialMonthlyPlan } from '../data/initialData';

// Standard realistic templates for each month of the school year (Secondary School English Department)
export const MONTHLY_TEMPLATES: Record<
  number,
  { label: string; goal: string; tasks: Omit<MonthlyTaskItem, 'id'>[] }
> = {
  9: {
    label: 'Tháng 9 - Khai giảng & Ổn định nề nếp',
    goal: 'Kiện toàn tổ chức, xây dựng Kế hoạch giáo dục môn Tiếng Anh (CV 5512) và ổn định nề nếp dạy học ngay từ tuần đầu năm học 2025 - 2026.',
    tasks: [
      {
        title: 'Xây dựng và phê duyệt Kế hoạch dạy học môn Tiếng Anh 6, 7, 8, 9',
        category: 'Hồ sơ 5512',
        deadline: '10/09/2026',
        assignee: 'Thầy Hưng (TT) & Tổ phó',
        status: 'Hoàn thành',
        details: 'Phân phối chương trình chi tiết theo chuẩn GDPT 2018 (Global Success & Friends Plus), tích hợp bài học STEM và hoạt động trải nghiệm.',
      },
      {
        title: 'Khảo sát chất lượng đầu năm môn Tiếng Anh 4 khối lớp',
        category: 'Kiểm tra KSCL',
        deadline: '18/09/2026',
        assignee: 'Nhóm trưởng các khối & Toàn tổ',
        status: 'Hoàn thành',
        details: 'Tổ chức làm bài khảo sát 45 phút kỹ năng Nghe - Đọc - Viết để phân loại đối tượng học sinh và xây dựng kế hoạch bồi dưỡng/phụ đạo.',
      },
      {
        title: 'Kiểm tra thiết bị phòng máy Lab ngoại ngữ và học liệu số',
        category: 'Chuyển đổi số',
        deadline: '12/09/2026',
        assignee: 'Thầy Đức (Quản trị) & Thầy Tuấn',
        status: 'Hoàn thành',
        details: 'Bảo trì tai nghe, máy tính phòng Lab, cài đặt phần mềm luyện phát âm và tài khoản học liệu số cho học sinh.',
      },
      {
        title: 'Thành lập câu lạc bộ Tiếng Anh (English Club) và tuyển sinh',
        category: 'Chuyên môn',
        deadline: '25/09/2026',
        assignee: 'Cô Lan (TP) & GV trẻ',
        status: 'Hoàn thành',
        details: 'Lập ban chủ nhiệm CLB, xây dựng khung sinh hoạt 2 tuần/lần với các chủ đề giao tiếp thực tế và văn hóa các nước nói tiếng Anh.',
      },
    ],
  },
  10: {
    label: 'Tháng 10 - Thi đua 20/10 & Giữa kỳ I',
    goal: 'Thi đua Dạy tốt - Học tốt chào mừng ngày Phụ nữ Việt Nam 20/10; tăng cường nề nếp kiểm tra KHBĐ (CV 5512), tổ chức thao giảng NCBH (CV 5555) và chuẩn bị kiểm tra giữa Học kỳ I.',
    tasks: [
      {
        title: 'Duy trì nề nếp soạn giảng & Ký duyệt kế hoạch bài dạy (KHBĐ)',
        category: 'Hồ sơ 5512',
        deadline: 'Hàng tuần (Thứ Sáu)',
        assignee: 'Thầy Hưng (TT) & Cô Lan (TP)',
        status: 'Đang thực hiện',
        details: '100% giáo viên soạn giáo án theo đúng cấu trúc 4 hoạt động học của Công văn 5512/BGDĐT, nộp duyệt đúng hạn, chú trọng dự kiến sản phẩm của học sinh.',
      },
      {
        title: 'Tổ chức sinh hoạt chuyên môn theo Nghiên cứu bài học (NCBH)',
        category: 'Dự giờ NCBH',
        deadline: '20/10/2026',
        assignee: 'Cô Lan (thể hiện) & Toàn tổ',
        status: 'Đang thực hiện',
        details: 'Dạy minh họa Unit 4 (Tiếng Anh 8) tại phòng bộ môn; tổ chức trao đổi phân tích hoạt động học tập của học sinh theo 4 tiêu chí Công văn 5555/BGDĐT.',
      },
      {
        title: 'Xây dựng ma trận, đặc tả và đề kiểm tra định kỳ giữa Học kỳ I',
        category: 'Kiểm tra KSCL',
        deadline: '24/10/2026',
        assignee: 'Thầy Tuấn, Cô Hạnh & Nhóm trưởng khối',
        status: 'Đang thực hiện',
        details: 'Rà soát ngân hàng câu hỏi môn Tiếng Anh 6, 7, 8, 9 đảm bảo 4 mức độ nhận thức (Nhận biết 40%, Thông hiểu 30%, Vận dụng 20%, Vận dụng cao 10%).',
      },
      {
        title: 'Bồi dưỡng đội tuyển HSG Tiếng Anh 9 & Phụ đạo học sinh yếu',
        category: 'Bồi dưỡng HSG',
        deadline: 'Cả tháng 10/2026',
        assignee: 'Thầy Hưng, Thầy Nam & GV bộ môn',
        status: 'Đang thực hiện',
        details: 'Luyện đề chuyên sâu 3 buổi/tuần cho đội tuyển 8 em HSG lớp 9. Đồng thời rà soát danh sách học sinh có kết quả kiểm tra thường xuyên dưới trung bình để phụ đạo.',
      },
      {
        title: 'Ứng dụng chuyển đổi số & Đồng bộ học liệu lên Google Drive',
        category: 'Chuyển đổi số',
        deadline: '30/10/2026',
        assignee: 'Thầy Đức (Quản trị) & Toàn tổ',
        status: 'Hoàn thành',
        details: 'Ứng dụng Quizizz và Canva giáo dục tạo bài học tương tác; sao lưu 100% KHBĐ và biên bản sinh hoạt tổ lên thư mục Google Drive chung của tổ.',
      },
    ],
  },
  11: {
    label: 'Tháng 11 - Tri ân 20/11 & Thao giảng',
    goal: 'Đợt thi đua cao điểm chào mừng Ngày Nhà giáo Việt Nam 20/11; tổ chức Hội thao giảng giáo viên dạy giỏi cấp trường và kiểm tra toàn diện hồ sơ sư phạm.',
    tasks: [
      {
        title: 'Phát động đợt thao giảng chào mừng 20/11 (100% GV tham gia)',
        category: 'Dự giờ NCBH',
        deadline: '15/11/2026',
        assignee: 'Toàn thể 10 giáo viên',
        status: 'Chưa bắt đầu',
        details: 'Mỗi giáo viên đăng ký ít nhất 1 tiết dạy đổi mới phương pháp, ứng dụng công nghệ thông tin hoặc dạy học dự án.',
      },
      {
        title: 'Kiểm tra toàn diện hồ sơ sư phạm và giờ dạy 3 giáo viên',
        category: 'Hồ sơ 5512',
        deadline: '18/11/2026',
        assignee: 'Thầy Hưng (TT) & Ban kiểm tra',
        status: 'Chưa bắt đầu',
        details: 'Kiểm tra giáo án, sổ dự giờ, sổ theo dõi đánh giá học sinh và dự 2 tiết dạy trên lớp.',
      },
      {
        title: 'Tổ chức Ngày hội Tiếng Anh (English Day Festival) cấp trường',
        category: 'Chuyên môn',
        deadline: '20/11/2026',
        assignee: 'Cô Yến, Cô Mai & Nhóm Đoàn Đội',
        status: 'Chưa bắt đầu',
        details: 'Thi hát tiếng Anh, đố vui Rung chuông vàng và triển lãm báo tường tri ân thầy cô bằng tiếng Anh.',
      },
      {
        title: 'Bồi dưỡng học sinh giỏi chuẩn bị thi cấp Quận/Thành phố',
        category: 'Bồi dưỡng HSG',
        deadline: '28/11/2026',
        assignee: 'Thầy Nam & Cô Trang',
        status: 'Chưa bắt đầu',
        details: 'Tăng cường luyện kỹ năng Nghe và Nói chuyên sâu theo format bài thi HSG mới.',
      },
    ],
  },
  12: {
    label: 'Tháng 12 - Ôn tập & Kiểm tra cuối HKI',
    goal: 'Hoàn thành chương trình Học kỳ I, tổ chức ôn tập có hệ thống và kiểm tra đánh giá cuối kỳ I đảm bảo nghiêm túc, khách quan, đúng quy chế.',
    tasks: [
      {
        title: 'Xây dựng đề cương ôn tập và ma trận đặc tả đề kiểm tra cuối HKI',
        category: 'Kiểm tra KSCL',
        deadline: '05/12/2026',
        assignee: 'Nhóm trưởng khối 6, 7, 8, 9',
        status: 'Chưa bắt đầu',
        details: 'Thống nhất cấu trúc đề, phân bổ ngân hàng câu hỏi trắc nghiệm khách quan 70% và tự luận 30%.',
      },
      {
        title: 'Tổ chức kiểm tra cuối HKI, coi thi và chấm chéo bài thi',
        category: 'Kiểm tra KSCL',
        deadline: '22/12/2026',
        assignee: 'Toàn thể giáo viên trong tổ',
        status: 'Chưa bắt đầu',
        details: 'Chấm bài nghiêm túc theo barem, vào điểm SMAS đúng hạn và báo cáo phổ điểm về Tổ trưởng.',
      },
      {
        title: 'Rà soát tiến độ chương trình và hoàn thành dạy bù nếu có',
        category: 'Chuyên môn',
        deadline: '25/12/2026',
        assignee: 'Tổ phó & GV bộ môn',
        status: 'Chưa bắt đầu',
        details: 'Đảm bảo 100% các lớp học đúng phân phối chương trình, không cắt xén, không dạy dồn.',
      },
      {
        title: 'Họp sơ kết công tác chuyên môn tổ Học kỳ I và xếp loại thi đua',
        category: 'Chuyên môn',
        deadline: '30/12/2026',
        assignee: 'Thầy Hưng (TT) & Toàn tổ',
        status: 'Chưa bắt đầu',
        details: 'Đánh giá kết quả thực hiện chỉ tiêu đầu năm, bình xét thi đua HKI và rút kinh nghiệm chuyên môn.',
      },
    ],
  },
  1: {
    label: 'Tháng 1 - Sơ kết HKI & Triển khai HKII',
    goal: 'Sơ kết Học kỳ I, bàn giao phân công và triển khai kế hoạch giáo dục Học kỳ II; tập trung cao độ cho kỳ thi HSG cấp Quận.',
    tasks: [
      {
        title: 'Triển khai Kế hoạch giáo dục và thời khóa biểu Học kỳ II',
        category: 'Chuyên môn',
        deadline: '08/01/2027',
        assignee: 'Thầy Hưng (TT) & Cô Lan (TP)',
        status: 'Chưa bắt đầu',
        details: 'Cập nhật phân công chuyên môn, phân phối chương trình HKII và nộp sổ sách theo quy định.',
      },
      {
        title: 'Đưa đội tuyển tham dự kỳ thi Học sinh giỏi Tiếng Anh 9 cấp Quận',
        category: 'Bồi dưỡng HSG',
        deadline: '15/01/2027',
        assignee: 'Thầy Hưng & Thầy Nam',
        status: 'Chưa bắt đầu',
        details: 'Chuẩn bị hồ sơ, thẻ dự thi, động viên tinh thần và hướng dẫn học sinh kỹ năng làm bài đạt giải cao.',
      },
      {
        title: 'Ký duyệt kế hoạch bài dạy đầu Học kỳ II cho 10 giáo viên',
        category: 'Hồ sơ 5512',
        deadline: '12/01/2027',
        assignee: 'Ban kiểm tra tổ',
        status: 'Chưa bắt đầu',
        details: 'Đảm bảo giáo viên có giáo án đầy đủ trước khi lên lớp ít nhất 3 ngày.',
      },
    ],
  },
  2: {
    label: 'Tháng 2 - Nghiên cứu bài học đầu xuân',
    goal: 'Thi đua Mừng Đảng - Mừng Xuân, duy trì nghiêm túc nề nếp dạy học sau Tết Nguyên đán và đẩy mạnh sinh hoạt chuyên môn NCBH.',
    tasks: [
      {
        title: 'Ổn định nề nếp dạy học ngay sau kỳ nghỉ Tết Nguyên đán',
        category: 'Chuyên môn',
        deadline: '10/02/2027',
        assignee: 'Toàn tổ giáo viên',
        status: 'Chưa bắt đầu',
        details: 'Kiểm tra sĩ số học sinh, bắt nhịp chương trình bài học, tổ chức các trò chơi khởi động vui vẻ đầu xuân.',
      },
      {
        title: 'Sinh hoạt NCBH chuyên đề: Rèn kỹ năng Nghe - Nói theo GDPT 2018',
        category: 'Dự giờ NCBH',
        deadline: '22/02/2027',
        assignee: 'Thầy Tuấn (thể hiện) & Toàn tổ',
        status: 'Chưa bắt đầu',
        details: 'Tiết dạy thực nghiệm Unit 7 (Tiếng Anh 7), thảo luận kỹ thuật chuyển giao nhiệm vụ học tập theo nhóm.',
      },
      {
        title: 'Hướng dẫn học sinh tham gia kỳ thi IOE cấp Quận',
        category: 'Chuyển đổi số',
        deadline: '26/02/2027',
        assignee: 'Thầy Đức & GV chủ nhiệm',
        status: 'Chưa bắt đầu',
        details: 'Chuẩn bị phòng máy, đường truyền internet ổn định cho các vòng tự luyện và thi cấp trường/quận.',
      },
    ],
  },
  3: {
    label: 'Tháng 3 - Thi đua 26/3 & Ôn thi vào 10',
    goal: 'Thi đua lập thành tích chào mừng ngày 8/3 và 26/3; tổ chức kiểm tra giữa HKII và tăng cường công tác tư vấn ôn thi vào lớp 10.',
    tasks: [
      {
        title: 'Xây dựng ma trận đặc tả và tổ chức kiểm tra giữa Học kỳ II',
        category: 'Kiểm tra KSCL',
        deadline: '16/03/2027',
        assignee: 'Nhóm trưởng khối 6, 7, 8, 9',
        status: 'Chưa bắt đầu',
        details: 'Đề kiểm tra bám sát chuẩn kiến thức kỹ năng, chấm và trả bài đúng quy chế.',
      },
      {
        title: 'Tổ chức hội thảo tư vấn ôn thi môn Tiếng Anh vào lớp 10 cho học sinh khối 9',
        category: 'Chuyên môn',
        deadline: '24/03/2027',
        assignee: 'Nhóm GV dạy khối 9 & Tổ trưởng',
        status: 'Chưa bắt đầu',
        details: 'Phân tích cấu trúc đề thi tuyển sinh vào 10 các năm trước, chia sẻ bí quyết làm bài ngữ pháp và từ vựng.',
      },
      {
        title: 'Dự giờ trao đổi kinh nghiệm sư phạm và đánh giá tiết dạy',
        category: 'Dự giờ NCBH',
        deadline: '28/03/2027',
        assignee: 'Các cặp giáo viên trong tổ',
        status: 'Chưa bắt đầu',
        details: 'Dự giờ chéo ít nhất 2 tiết/giáo viên, ghi biên bản góp ý xây dựng.',
      },
    ],
  },
  4: {
    label: 'Tháng 4 - Ôn thi cao điểm & Kiểm tra cuối năm',
    goal: 'Tăng tốc ôn tập cho học sinh khối 9 thi vào lớp 10; hoàn thành chương trình môn học và chuẩn bị kiểm tra học kỳ II.',
    tasks: [
      {
        title: 'Luyện đề thi thử vào lớp 10 môn Tiếng Anh định kỳ hàng tuần',
        category: 'Chuyên môn',
        deadline: 'Cả tháng 4/2027',
        assignee: 'Thầy Hưng, Thầy Nam, Thầy Tuấn',
        status: 'Chưa bắt đầu',
        details: 'Cho học sinh làm quen áp lực phòng thi, chấm chữa chi tiết từng lỗi sai thường gặp.',
      },
      {
        title: 'Kiểm tra toàn diện hồ sơ giáo án, sổ sách chuyên môn trước tổng kết',
        category: 'Hồ sơ 5512',
        deadline: '22/04/2027',
        assignee: 'Ban kiểm tra tổ chuyên môn',
        status: 'Chưa bắt đầu',
        details: 'Ký duyệt đầy đủ giáo án, sổ điểm cá nhân, kế hoạch sử dụng thiết bị dạy học.',
      },
      {
        title: 'Biên soạn đề kiểm tra cuối Học kỳ II cho 4 khối lớp',
        category: 'Kiểm tra KSCL',
        deadline: '26/04/2027',
        assignee: 'Nhóm biên soạn đề thi',
        status: 'Chưa bắt đầu',
        details: 'Bảo mật đề thi tuyệt đối, gửi ma trận và đáp án chi tiết về Ban giám hiệu.',
      },
    ],
  },
  5: {
    label: 'Tháng 5 - Kiểm tra HKII, Chuẩn nghề nghiệp & Tổng kết',
    goal: 'Hoàn thành kiểm tra HKII, đánh giá Chuẩn nghề nghiệp giáo viên (Thông tư 20/2018), bình xét thi đua và tổng kết năm học 2025 - 2026.',
    tasks: [
      {
        title: 'Tổ chức kiểm tra cuối HKII, hoàn tất nhập điểm SMAS và tổng kết điểm',
        category: 'Kiểm tra KSCL',
        deadline: '10/05/2027',
        assignee: 'Toàn thể 10 giáo viên',
        status: 'Chưa bắt đầu',
        details: 'Khóa sổ điểm học bạ điện tử, kiểm tra đối chiếu dữ liệu điểm chính xác 100%.',
      },
      {
        title: 'Tự đánh giá và đánh giá Chuẩn nghề nghiệp giáo viên (Thông tư 20/2018)',
        category: 'Chuyên môn',
        deadline: '18/05/2027',
        assignee: '10 giáo viên & Tổ trưởng',
        status: 'Chưa bắt đầu',
        details: 'Thu thập minh chứng 15 tiêu chí, lập phiếu tự đánh giá và họp tổ đánh giá xếp loại.',
      },
      {
        title: 'Họp bình xét thi đua cuối năm (LĐTT, CSTĐ cấp cơ sở)',
        category: 'Chuyên môn',
        deadline: '22/05/2027',
        assignee: 'Thầy Hưng (TT) & Toàn tổ',
        status: 'Chưa bắt đầu',
        details: 'Bình xét công khai, dân chủ dựa trên kết quả giảng dạy và phong trào thi đua cả năm học.',
      },
      {
        title: 'Bàn giao hồ sơ chuyên môn và lưu trữ tài liệu lên Google Drive',
        category: 'Chuyển đổi số',
        deadline: '28/05/2027',
        assignee: 'Thầy Đức & Toàn tổ',
        status: 'Chưa bắt đầu',
        details: 'Đóng gói toàn bộ giáo án, biên bản họp tổ và đề thi nộp lưu trữ văn thư và sao lưu Drive.',
      },
    ],
  },
};

interface MonthlyTaskCardProps {
  monthlyPlan: MonthlyPlan;
  onUpdateMonthlyPlan: (updatedPlan: MonthlyPlan) => void;
  teachers?: Teacher[];
  onOpenRequestModal?: () => void;
}

export const MonthlyTaskCard: React.FC<MonthlyTaskCardProps> = ({
  monthlyPlan,
  onUpdateMonthlyPlan,
  teachers = [],
  onOpenRequestModal,
}) => {
  const { isHead, isMember } = useAuthRole();
  const toast = useToast();

  // Full Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MonthlyPlan>(monthlyPlan);

  // Quick Single-Task Edit Modal State
  const [quickEditTask, setQuickEditTask] = useState<MonthlyTaskItem | null>(null);

  // Quick General Goal Edit Inline State
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [goalText, setGoalText] = useState(monthlyPlan.generalGoal);

  // Expanded task details in view mode
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);

  // Open Full Edit Modal
  const handleOpenEditModal = () => {
    setEditingPlan(JSON.parse(JSON.stringify(monthlyPlan)));
    setIsEditModalOpen(true);
  };

  // Open Single Task Quick Edit
  const handleOpenQuickEditTask = (task: MonthlyTaskItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setQuickEditTask(JSON.parse(JSON.stringify(task)));
  };

  const completedCount = monthlyPlan.tasks.filter((t) => t.status === 'Hoàn thành').length;
  const inProgressCount = monthlyPlan.tasks.filter((t) => t.status === 'Đang thực hiện').length;
  const percentComplete =
    monthlyPlan.tasks.length > 0
      ? Math.round((completedCount / monthlyPlan.tasks.length) * 100)
      : 0;

  // Toggle single task completion directly from checkbox
  const handleToggleTaskStatus = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedTasks = monthlyPlan.tasks.map((task) => {
      if (task.id === taskId) {
        const nextStatus: MonthlyTaskItem['status'] =
          task.status === 'Hoàn thành' ? 'Đang thực hiện' : 'Hoàn thành';
        return { ...task, status: nextStatus };
      }
      return task;
    });

    const updatedPlan: MonthlyPlan = {
      ...monthlyPlan,
      tasks: updatedTasks,
      updatedAt: new Date().toISOString(),
    };

    onUpdateMonthlyPlan(updatedPlan);
    toast.success('Đã cập nhật trạng thái nhiệm vụ trọng tâm!', 'Nhiệm vụ tháng');
  };

  // Save changes from Full Edit Modal
  const handleSaveEditPlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPlan.generalGoal.trim()) {
      toast.warning('Vui lòng nhập mục tiêu chung của tháng.', 'Thiếu thông tin');
      return;
    }

    const updated: MonthlyPlan = {
      ...editingPlan,
      updatedAt: new Date().toISOString(),
    };

    onUpdateMonthlyPlan(updated);
    setIsEditModalOpen(false);
    toast.success(
      `Đã lưu nội dung Nhiệm vụ trọng tâm Tháng ${updated.month}/${updated.year}!`,
      'Cập nhật thành công'
    );
  };

  // Save changes from Quick Single Task Edit Modal
  const handleSaveQuickTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickEditTask) return;
    if (!quickEditTask.title.trim()) {
      toast.warning('Vui lòng nhập tên nhiệm vụ.', 'Thiếu thông tin');
      return;
    }

    const updatedTasks = monthlyPlan.tasks.map((t) =>
      t.id === quickEditTask.id ? quickEditTask : t
    );

    const updatedPlan: MonthlyPlan = {
      ...monthlyPlan,
      tasks: updatedTasks,
      updatedAt: new Date().toISOString(),
    };

    onUpdateMonthlyPlan(updatedPlan);
    setQuickEditTask(null);
    toast.success(`Đã cập nhật nhiệm vụ "${quickEditTask.title}"!`, 'Sửa nhiệm vụ');
  };

  // Delete task from Quick Modal
  const handleDeleteQuickTask = () => {
    if (!quickEditTask) return;
    if (monthlyPlan.tasks.length <= 1) {
      toast.warning('Cần giữ lại ít nhất 1 nhiệm vụ trọng tâm.', 'Không thể xóa');
      return;
    }
    const updatedTasks = monthlyPlan.tasks.filter((t) => t.id !== quickEditTask.id);
    const updatedPlan: MonthlyPlan = {
      ...monthlyPlan,
      tasks: updatedTasks,
      updatedAt: new Date().toISOString(),
    };
    onUpdateMonthlyPlan(updatedPlan);
    setQuickEditTask(null);
    toast.info('Đã xóa nhiệm vụ khỏi danh sách.', 'Xóa nhiệm vụ');
  };

  // Save quick goal inline edit
  const handleSaveGoalInline = () => {
    if (!goalText.trim()) {
      toast.warning('Mục tiêu tháng không được để trống.', 'Cảnh báo');
      return;
    }
    const updatedPlan: MonthlyPlan = {
      ...monthlyPlan,
      generalGoal: goalText.trim(),
      updatedAt: new Date().toISOString(),
    };
    onUpdateMonthlyPlan(updatedPlan);
    setIsEditingGoal(false);
    toast.success('Đã cập nhật mục tiêu trọng tâm tháng!', 'Lưu mục tiêu');
  };

  // Add new task inside edit modal
  const handleAddNewTask = () => {
    const newTask: MonthlyTaskItem = {
      id: `task-${Date.now()}`,
      title: 'Nhiệm vụ chuyên môn trọng tâm mới',
      category: 'Chuyên môn',
      deadline: 'Trong tháng',
      assignee: 'Toàn tổ',
      status: 'Đang thực hiện',
      details: 'Ghi chú hướng dẫn chi tiết yêu cầu công việc...',
    };
    setEditingPlan({
      ...editingPlan,
      tasks: [...editingPlan.tasks, newTask],
    });
  };

  // Quick direct add task from card
  const handleDirectAddTask = () => {
    const newTask: MonthlyTaskItem = {
      id: `task-${Date.now()}`,
      title: 'Nhiệm vụ trọng tâm mới',
      category: 'Chuyên môn',
      deadline: 'Trong tháng',
      assignee: 'Toàn tổ',
      status: 'Đang thực hiện',
      details: 'Hướng dẫn cụ thể nội dung thực hiện nhiệm vụ.',
    };
    const updatedPlan: MonthlyPlan = {
      ...monthlyPlan,
      tasks: [...monthlyPlan.tasks, newTask],
      updatedAt: new Date().toISOString(),
    };
    onUpdateMonthlyPlan(updatedPlan);
    // Open quick edit on newly created task immediately!
    setQuickEditTask(newTask);
    toast.success('Đã thêm nhiệm vụ mới. Vui lòng chỉnh sửa nội dung chi tiết!', 'Thêm nhiệm vụ');
  };

  // Remove task in full edit modal
  const handleRemoveTask = (taskId: string) => {
    if (editingPlan.tasks.length <= 1) {
      toast.warning('Cần giữ lại ít nhất 1 nhiệm vụ trọng tâm.', 'Không thể xóa');
      return;
    }
    setEditingPlan({
      ...editingPlan,
      tasks: editingPlan.tasks.filter((t) => t.id !== taskId),
    });
  };

  // Move task up/down in edit modal
  const handleMoveTask = (index: number, direction: 'up' | 'down') => {
    const newTasks = [...editingPlan.tasks];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newTasks.length) return;
    const temp = newTasks[index];
    newTasks[index] = newTasks[targetIndex];
    newTasks[targetIndex] = temp;
    setEditingPlan({ ...editingPlan, tasks: newTasks });
  };

  // Load template for a specific month in edit modal
  const handleLoadTemplateForMonth = (monthNumber: number) => {
    const tmpl = MONTHLY_TEMPLATES[monthNumber];
    if (!tmpl) return;

    if (
      confirm(
        `Nạp mẫu kế hoạch chuẩn ${tmpl.label}? Các nội dung hiện tại trong bảng chỉnh sửa sẽ được thay thế bằng mẫu chuẩn.`
      )
    ) {
      const newTasks: MonthlyTaskItem[] = tmpl.tasks.map((t, idx) => ({
        ...t,
        id: `task-m${monthNumber}-${Date.now()}-${idx}`,
      }));

      setEditingPlan({
        ...editingPlan,
        month: monthNumber,
        generalGoal: tmpl.goal,
        tasks: newTasks,
      });
      toast.info(`Đã nạp mẫu chuẩn ${tmpl.label}!`, 'Nạp mẫu thành công');
    }
  };

  // Direct switch month from Card header
  const handleSelectMonthDirectly = (selectedMonth: number) => {
    if (selectedMonth === monthlyPlan.month) return;
    const tmpl = MONTHLY_TEMPLATES[selectedMonth];
    if (tmpl) {
      const newTasks: MonthlyTaskItem[] = tmpl.tasks.map((t, idx) => ({
        ...t,
        id: `task-m${selectedMonth}-${Date.now()}-${idx}`,
      }));

      const newPlan: MonthlyPlan = {
        ...monthlyPlan,
        month: selectedMonth,
        generalGoal: tmpl.goal,
        tasks: newTasks,
        updatedAt: new Date().toISOString(),
      };
      onUpdateMonthlyPlan(newPlan);
      toast.info(`Đã chuyển sang xem kế hoạch Tháng ${selectedMonth}!`, 'Chuyển tháng');
    }
  };

  // Category badge styling helper
  const getCategoryBadgeClass = (category: MonthlyTaskItem['category']) => {
    switch (category) {
      case 'Hồ sơ 5512':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Dự giờ NCBH':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'Kiểm tra KSCL':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Bồi dưỡng HSG':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'Chuyển đổi số':
        return 'bg-sky-50 text-sky-800 border-sky-200';
      default:
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
  };

  return (
    <>
      <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-xs transition hover:shadow-md">
        {/* Card Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 animate-pulse" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 flex items-center gap-1">
                <Target className="w-3 h-3 text-indigo-600" />
                Kế Hoạch Công Tác Trọng Tâm
              </span>
              <span className="text-[11px] text-slate-500 font-medium">
                Năm học {monthlyPlan.schoolYear}
              </span>
            </div>

            <div className="flex items-center gap-2 mt-1">
              <h3 className="font-extrabold text-slate-900 text-base sm:text-lg flex items-center gap-2">
                Nhiệm Vụ Trọng Tâm Tháng {monthlyPlan.month}/{monthlyPlan.year}
              </h3>
            </div>

            {/* General Goal (Click to edit inline) */}
            <div className="mt-1">
              {isEditingGoal ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={goalText}
                    onChange={(e) => setGoalText(e.target.value)}
                    className="flex-1 px-2.5 py-1 text-xs border border-indigo-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-medium"
                    placeholder="Nhập mục tiêu trọng tâm tháng..."
                    autoFocus
                  />
                  <button
                    onClick={handleSaveGoalInline}
                    className="px-2.5 py-1 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition"
                  >
                    Lưu
                  </button>
                  <button
                    onClick={() => {
                      setGoalText(monthlyPlan.generalGoal);
                      setIsEditingGoal(false);
                    }}
                    className="px-2.5 py-1 bg-slate-200 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-300 transition"
                  >
                    Hủy
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => setIsEditingGoal(true)}
                  className="group/goal flex items-center gap-1.5 cursor-pointer rounded-lg px-1.5 py-0.5 -mx-1.5 hover:bg-indigo-50/60 transition"
                  title="Bấm để sửa nhanh mục tiêu tháng"
                >
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {monthlyPlan.generalGoal}
                  </p>
                  <Edit3 className="w-3 h-3 text-slate-400 group-hover/goal:text-indigo-600 opacity-60 group-hover/goal:opacity-100 shrink-0" />
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons: Prominent Edit Button */}
          <div className="shrink-0 flex flex-wrap items-center gap-1.5">
            {/* Quick Month Dropdown / Selector */}
            <select
              value={monthlyPlan.month}
              onChange={(e) => handleSelectMonthDirectly(Number(e.target.value))}
              className="text-xs font-bold text-indigo-900 bg-indigo-50/80 border border-indigo-200 rounded-xl px-2.5 py-1.5 focus:ring-2 focus:ring-indigo-500 cursor-pointer"
              title="Chọn tháng xem hoặc nạp kế hoạch"
            >
              {[9, 10, 11, 12, 1, 2, 3, 4, 5].map((m) => (
                <option key={m} value={m}>
                  Tháng {m} {m === 10 ? '(Hiện tại)' : ''}
                </option>
              ))}
            </select>

            {/* MAIN BUTTON: SỬA NỘI DUNG */}
            <button
              onClick={handleOpenEditModal}
              className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer hover:shadow-md"
              title="Bấm để chỉnh sửa toàn diện nội dung, thêm/xóa nhiệm vụ trọng tâm tháng"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-300" />
              <span>Sửa Nội Dung</span>
            </button>

            {/* Quick Add Button */}
            <button
              onClick={handleDirectAddTask}
              className="px-2.5 py-1.5 rounded-xl border border-indigo-200 hover:bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center gap-1 transition active:scale-95 cursor-pointer"
              title="Thêm nhanh một nhiệm vụ mới"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Thêm Việc</span>
            </button>

            {/* Member Request Button */}
            {onOpenRequestModal && !isHead && (
              <button
                onClick={onOpenRequestModal}
                className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-xs flex items-center gap-1 transition"
                title="Gửi ý kiến / đề xuất điều chỉnh nhiệm vụ đến Tổ trưởng"
              >
                <Send className="w-3.5 h-3.5 text-indigo-500" />
                <span className="hidden sm:inline">Đề Xuất</span>
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar & Summary */}
        <div className="mt-3.5 p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs">
          <div className="flex items-center justify-between text-slate-600 font-medium mb-1.5">
            <span className="flex items-center gap-1.5 text-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>
                Tiến độ thực hiện: <strong>{completedCount}/{monthlyPlan.tasks.length}</strong> hoàn thành
              </span>
            </span>
            <span className="font-extrabold text-indigo-700 text-sm">{percentComplete}%</span>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 via-blue-500 to-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1.5">
            <span>
              Đang thực hiện: <strong>{inProgressCount}</strong> việc • Chưa xong: <strong>{monthlyPlan.tasks.length - completedCount}</strong>
            </span>
            <span className="italic flex items-center gap-1">
              <CheckSquare className="w-3 h-3 text-emerald-600" />
              Bấm nút <span className="font-semibold text-indigo-700">Sửa</span> trên từng việc để thay đổi nhanh
            </span>
          </div>
        </div>

        {/* Task List */}
        <div className="mt-3.5 space-y-2.5">
          {monthlyPlan.tasks.map((task, idx) => {
            const isCompleted = task.status === 'Hoàn thành';
            const isExpanded = expandedTaskId === task.id;

            return (
              <div
                key={task.id}
                onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                className={`p-3 rounded-xl border text-xs transition cursor-pointer group/item ${
                  isCompleted
                    ? 'bg-slate-50/70 border-slate-200 hover:border-slate-300'
                    : 'bg-white border-slate-200/90 hover:border-indigo-300 hover:bg-indigo-50/20 shadow-2xs'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {/* Status Toggle Checkbox */}
                  <button
                    type="button"
                    onClick={(e) => handleToggleTaskStatus(task.id, e)}
                    className={`mt-0.5 w-5 h-5 rounded-lg border flex items-center justify-center shrink-0 transition ${
                      isCompleted
                        ? 'bg-emerald-600 border-emerald-600 text-white shadow-2xs'
                        : 'border-slate-300 bg-white hover:border-indigo-500 text-transparent'
                    }`}
                    title={isCompleted ? 'Đánh dấu chưa xong' : 'Đánh dấu đã hoàn thành'}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </button>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span className="font-mono text-[10px] font-bold text-slate-400">
                        #{idx + 1}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.2 rounded border uppercase tracking-wider ${getCategoryBadgeClass(
                          task.category
                        )}`}
                      >
                        {task.category}
                      </span>
                      {isCompleted ? (
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/70 px-1.5 py-0.2 rounded">
                          ✓ Đã xong
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                          {task.status}
                        </span>
                      )}
                    </div>

                    <h4
                      className={`font-semibold text-slate-900 leading-snug ${
                        isCompleted ? 'line-through text-slate-500 font-normal' : ''
                      }`}
                    >
                      {task.title}
                    </h4>

                    {/* Metadata line */}
                    <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                      <span className="flex items-center gap-1 font-medium text-slate-700">
                        <UserCheck className="w-3.5 h-3.5 text-indigo-500" />
                        <span>{task.assignee}</span>
                      </span>
                      <span className="flex items-center gap-1 text-slate-600 font-sans">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Hạn: {task.deadline}</span>
                      </span>
                    </div>

                    {/* Expandable Details */}
                    {isExpanded && task.details && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-slate-600 bg-slate-50/80 p-2.5 rounded-lg leading-relaxed">
                        <strong className="text-slate-800 block mb-0.5 font-sans">
                          Hướng dẫn & Chi tiết thực hiện:
                        </strong>
                        <p>{task.details}</p>
                      </div>
                    )}
                  </div>

                  {/* Actions on Task Row: Quick Edit Pencil Button & Expand Arrow */}
                  <div className="flex items-center gap-1 shrink-0">
                    {/* BUTTON SỬA NHANH TỪNG NHIỆM VỤ */}
                    <button
                      type="button"
                      onClick={(e) => handleOpenQuickEditTask(task, e)}
                      className="px-2 py-1 rounded-lg border border-slate-200 hover:border-indigo-400 bg-white hover:bg-indigo-50 text-indigo-600 font-semibold text-[11px] flex items-center gap-1 shadow-2xs transition opacity-90 group-hover/item:opacity-100"
                      title="Sửa nội dung nhiệm vụ này"
                    >
                      <Edit3 className="w-3 h-3 text-indigo-600" />
                      <span>Sửa</span>
                    </button>

                    <ChevronDown
                      className={`w-4 h-4 text-slate-400 transition-transform ${
                        isExpanded ? 'rotate-180 text-indigo-600' : ''
                      }`}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Footer Controls */}
        <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-sans">
          <span>Áp dụng toàn bộ 10 giáo viên trong tổ</span>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDirectAddTask}
              className="text-slate-600 hover:text-indigo-600 font-medium flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>+ Thêm việc mới</span>
            </button>

            <button
              onClick={handleOpenEditModal}
              className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1 hover:underline cursor-pointer"
            >
              <Edit3 className="w-3 h-3" />
              <span>Sửa danh sách & mục tiêu</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* MODAL 1: SỬA NHANH 1 NHIỆM VỤ CỤ THỂ */}
      {quickEditTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full text-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 px-6 py-4 text-white flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-300">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-white">
                    Sửa Nội Dung Nhiệm Vụ
                  </h3>
                  <p className="text-[11px] text-indigo-200">
                    Cập nhật chi tiết nhiệm vụ và phân công thực hiện
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setQuickEditTask(null)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-indigo-200 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSaveQuickTask} className="p-5 space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Tên nhiệm vụ trọng tâm: <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={quickEditTask.title}
                  onChange={(e) =>
                    setQuickEditTask({ ...quickEditTask, title: e.target.value })
                  }
                  required
                  placeholder="VD: Kiểm tra hồ sơ giáo án 5512 định kỳ"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Danh mục phân loại:
                  </label>
                  <select
                    value={quickEditTask.category}
                    onChange={(e) =>
                      setQuickEditTask({
                        ...quickEditTask,
                        category: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 font-medium"
                  >
                    <option value="Hồ sơ 5512">Hồ sơ 5512</option>
                    <option value="Dự giờ NCBH">Dự giờ NCBH</option>
                    <option value="Kiểm tra KSCL">Kiểm tra KSCL</option>
                    <option value="Bồi dưỡng HSG">Bồi dưỡng HSG</option>
                    <option value="Chuyên môn">Chuyên môn</option>
                    <option value="Chuyển đổi số">Chuyển đổi số</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Trạng thái:
                  </label>
                  <select
                    value={quickEditTask.status}
                    onChange={(e) =>
                      setQuickEditTask({
                        ...quickEditTask,
                        status: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 font-semibold"
                  >
                    <option value="Đang thực hiện">Đang thực hiện</option>
                    <option value="Hoàn thành">Hoàn thành</option>
                    <option value="Chưa bắt đầu">Chưa bắt đầu</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Người phụ trách:
                  </label>
                  <input
                    type="text"
                    value={quickEditTask.assignee}
                    onChange={(e) =>
                      setQuickEditTask({ ...quickEditTask, assignee: e.target.value })
                    }
                    placeholder="VD: Thầy Hưng (TT) & Toàn tổ"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                  {/* Quick Teacher Picker Chips */}
                  <div className="mt-1.5 flex flex-wrap gap-1">
                    {['Toàn tổ', 'Thầy Hưng (TT)', 'Cô Lan (TP)'].map((name) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() =>
                          setQuickEditTask({ ...quickEditTask, assignee: name })
                        }
                        className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-600 transition"
                      >
                        +{name}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">
                    Thời hạn (Deadline):
                  </label>
                  <input
                    type="text"
                    value={quickEditTask.deadline}
                    onChange={(e) =>
                      setQuickEditTask({ ...quickEditTask, deadline: e.target.value })
                    }
                    placeholder="VD: 20/10/2026 hoặc Hàng tuần"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 font-sans"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Chi tiết nội dung & Hướng dẫn thực hiện:
                </label>
                <textarea
                  rows={3}
                  value={quickEditTask.details || ''}
                  onChange={(e) =>
                    setQuickEditTask({ ...quickEditTask, details: e.target.value })
                  }
                  placeholder="Ghi chú cụ thể các yêu cầu tiêu chuẩn, địa điểm, thành phần tham gia..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500 leading-relaxed"
                />
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleDeleteQuickTask}
                  className="px-3 py-1.5 rounded-xl border border-rose-200 hover:bg-rose-50 text-rose-600 font-semibold text-xs flex items-center gap-1 transition"
                  title="Xóa nhiệm vụ này"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Xóa việc này</span>
                </button>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setQuickEditTask(null)}
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Lưu Nhiệm Vụ</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: TOÀN BỘ CHỈNH SỬA NỘI DUNG NHIỆM VỤ TRỌNG TÂM THÁNG */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full text-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 px-6 py-4 text-white flex justify-between items-center border-b border-indigo-700/60 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-300 shadow-xs">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">
                    Chỉnh Sửa Toàn Bộ Nội Dung Nhiệm Vụ Trọng Tâm Tháng
                  </h3>
                  <p className="text-xs text-indigo-200">
                    Tháng {editingPlan.month}/{editingPlan.year} • Năm học {editingPlan.schoolYear}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-indigo-200 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Body */}
            <form onSubmit={handleSaveEditPlan} className="p-6 overflow-y-auto flex-1 space-y-5 text-xs">
              {/* General Settings: Month & General Goal */}
              <div className="p-4 bg-indigo-50/70 rounded-2xl border border-indigo-200/80 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Tháng áp dụng:
                    </label>
                    <select
                      value={editingPlan.month}
                      onChange={(e) => {
                        const newMonth = Number(e.target.value);
                        setEditingPlan({ ...editingPlan, month: newMonth });
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-900"
                    >
                      <option value={9}>Tháng 9 (Đầu năm học)</option>
                      <option value={10}>Tháng 10 (Thi đua 20/10 & Giữa kỳ)</option>
                      <option value={11}>Tháng 11 (Tri ân 20/11 & Thao giảng)</option>
                      <option value={12}>Tháng 12 (Ôn tập & Kiểm tra HK I)</option>
                      <option value={1}>Tháng 1 (Sơ kết HKI & Triển khai HKII)</option>
                      <option value={2}>Tháng 2 (Mùa xuân & Nghiên cứu bài học)</option>
                      <option value={3}>Tháng 3 (Thi đua 26/3 & HSG)</option>
                      <option value={4}>Tháng 4 (Kiểm tra giữa HK II)</option>
                      <option value={5}>Tháng 5 (Tổng kết năm học & Ôn thi vào 10)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">Năm học:</label>
                    <input
                      type="text"
                      value={editingPlan.schoolYear}
                      onChange={(e) =>
                        setEditingPlan({ ...editingPlan, schoolYear: e.target.value })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-700 font-bold mb-1">
                      Năm dương lịch:
                    </label>
                    <input
                      type="number"
                      value={editingPlan.year}
                      onChange={(e) =>
                        setEditingPlan({ ...editingPlan, year: Number(e.target.value) })
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-slate-700 font-bold">
                      Mục tiêu & Khẩu hiệu trọng tâm chung của tháng: <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={() => handleLoadTemplateForMonth(editingPlan.month)}
                      className="text-[11px] text-indigo-700 hover:text-indigo-900 font-semibold flex items-center gap-1 hover:underline"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Nạp mẫu chuẩn Tháng {editingPlan.month}</span>
                    </button>
                  </div>
                  <textarea
                    rows={2}
                    value={editingPlan.generalGoal}
                    onChange={(e) =>
                      setEditingPlan({ ...editingPlan, generalGoal: e.target.value })
                    }
                    placeholder="VD: Thi đua Dạy tốt - Học tốt chào mừng ngày 20/10; tăng cường nề nếp kiểm tra KHBĐ theo Công văn 5512..."
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 leading-relaxed font-medium"
                    required
                  />
                </div>
              </div>

              {/* Tasks List Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-b border-slate-200 pb-2">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    <ListTodo className="w-4 h-4 text-indigo-600" />
                    Danh Sách Các Nhiệm Vụ Trọng Tâm ({editingPlan.tasks.length} mục)
                  </h4>
                  <span className="text-[11px] text-slate-500 italic hidden sm:inline">
                    Chỉnh sửa trực tiếp từng nội dung bên dưới
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleLoadTemplateForMonth(editingPlan.month)}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-100 text-slate-700 font-semibold text-xs flex items-center gap-1 transition"
                    title="Khôi phục mẫu chuẩn theo tháng"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Mẫu Tháng {editingPlan.month}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleAddNewTask}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 font-bold text-xs flex items-center gap-1 shadow-xs transition"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Thêm Nhiệm Vụ Mới</span>
                  </button>
                </div>
              </div>

              {/* Tasks Cards Editor */}
              <div className="space-y-4">
                {editingPlan.tasks.map((task, index) => (
                  <div
                    key={task.id}
                    className="p-4 bg-slate-50/90 rounded-2xl border border-slate-200 space-y-3 relative group"
                  >
                    <div className="flex items-center justify-between border-b border-slate-200/80 pb-2">
                      <span className="font-bold text-indigo-950 flex items-center gap-2 text-xs">
                        <span className="w-5 h-5 rounded-full bg-indigo-600 text-white font-mono text-[11px] flex items-center justify-center font-bold">
                          {index + 1}
                        </span>
                        <span>Nhiệm vụ {index + 1}</span>
                      </span>

                      <div className="flex items-center gap-1">
                        {/* Order buttons */}
                        <button
                          type="button"
                          disabled={index === 0}
                          onClick={() => handleMoveTask(index, 'up')}
                          className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition"
                          title="Di chuyển lên trên"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          disabled={index === editingPlan.tasks.length - 1}
                          onClick={() => handleMoveTask(index, 'down')}
                          className="p-1 rounded-lg text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition"
                          title="Di chuyển xuống dưới"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveTask(task.id)}
                          className="p-1 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition ml-1"
                          title="Xóa nhiệm vụ này"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                          Tên nhiệm vụ trọng tâm: <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={task.title}
                          onChange={(e) => {
                            const newTasks = [...editingPlan.tasks];
                            newTasks[index].title = e.target.value;
                            setEditingPlan({ ...editingPlan, tasks: newTasks });
                          }}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-900"
                          placeholder="VD: Kiểm tra hồ sơ giáo án 5512 định kỳ"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                            Phân loại danh mục:
                          </label>
                          <select
                            value={task.category}
                            onChange={(e) => {
                              const newTasks = [...editingPlan.tasks];
                              newTasks[index].category = e.target.value as any;
                              setEditingPlan({ ...editingPlan, tasks: newTasks });
                            }}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
                          >
                            <option value="Hồ sơ 5512">Hồ sơ 5512</option>
                            <option value="Dự giờ NCBH">Dự giờ NCBH</option>
                            <option value="Kiểm tra KSCL">Kiểm tra KSCL</option>
                            <option value="Bồi dưỡng HSG">Bồi dưỡng HSG</option>
                            <option value="Chuyên môn">Chuyên môn</option>
                            <option value="Chuyển đổi số">Chuyển đổi số</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                            Người phụ trách:
                          </label>
                          <input
                            type="text"
                            value={task.assignee}
                            onChange={(e) => {
                              const newTasks = [...editingPlan.tasks];
                              newTasks[index].assignee = e.target.value;
                              setEditingPlan({ ...editingPlan, tasks: newTasks });
                            }}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-medium"
                            placeholder="VD: Thầy Hưng (TT) & Toàn tổ"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                            Thời hạn (Deadline):
                          </label>
                          <input
                            type="text"
                            value={task.deadline}
                            onChange={(e) => {
                              const newTasks = [...editingPlan.tasks];
                              newTasks[index].deadline = e.target.value;
                              setEditingPlan({ ...editingPlan, tasks: newTasks });
                            }}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-sans"
                            placeholder="VD: 20/10/2026 hoặc Hàng tuần"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                        <div className="sm:col-span-3">
                          <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                            Chi tiết nội dung & Hướng dẫn thực hiện:
                          </label>
                          <textarea
                            rows={2}
                            value={task.details || ''}
                            onChange={(e) => {
                              const newTasks = [...editingPlan.tasks];
                              newTasks[index].details = e.target.value;
                              setEditingPlan({ ...editingPlan, tasks: newTasks });
                            }}
                            placeholder="Ghi chú chi tiết yêu cầu, tiêu chuẩn kỹ thuật..."
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                            Trạng thái:
                          </label>
                          <select
                            value={task.status}
                            onChange={(e) => {
                              const newTasks = [...editingPlan.tasks];
                              newTasks[index].status = e.target.value as any;
                              setEditingPlan({ ...editingPlan, tasks: newTasks });
                            }}
                            className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 font-semibold"
                          >
                            <option value="Đang thực hiện">Đang thực hiện</option>
                            <option value="Hoàn thành">Hoàn thành</option>
                            <option value="Chưa bắt đầu">Chưa bắt đầu</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Task Button bottom */}
              <button
                type="button"
                onClick={handleAddNewTask}
                className="w-full py-2.5 rounded-2xl border-2 border-dashed border-indigo-300 hover:border-indigo-500 hover:bg-indigo-50/40 text-indigo-700 font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                <Plus className="w-4 h-4" />
                <span>+ Thêm Nhiệm Vụ Trọng Tâm Mới</span>
              </button>

              {/* Modal Footer Controls */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <span className="text-[11px] text-slate-500">
                  Dữ liệu được lưu trữ trực tiếp và cập nhật ngay lập tức trên Dashboard
                </span>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs transition"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Lưu Thay Đổi Nội Dung</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
