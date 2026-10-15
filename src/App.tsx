/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { NavigationTabs, TabType } from './components/NavigationTabs';
import { Dashboard } from './components/Dashboard';
import { TeacherList } from './components/TeacherList';
import { AssignmentManager } from './components/AssignmentManager';
import { SubstituteManager } from './components/SubstituteManager';
import { MeetingManager } from './components/MeetingManager';
import { ObservationManager } from './components/ObservationManager';
import { LessonPlanAudit } from './components/LessonPlanAudit';
import { EvaluationReport } from './components/EvaluationReport';
import { OfficialPrintModal } from './components/OfficialPrintModal';
import { GoogleDriveManager } from './components/GoogleDriveManager';
import { RolePermissionBanner } from './components/RolePermissionBanner';
import { DepartmentRequestModal } from './components/DepartmentRequestModal';
import { ToastProvider, useToast } from './context/ToastContext';
import { AuthRoleProvider, useAuthRole } from './context/AuthRoleContext';
import { initAuth } from './utils/googleAuth';
import { User } from 'firebase/auth';

import {
  getStoredData,
  saveTeachers,
  saveMeetings,
  saveObservations,
  saveSubstitutes,
  saveLessonPlans,
  saveSettings,
  saveRequests,
  resetAllData,
} from './utils/storage';
import {
  Teacher,
  MeetingMinute,
  LessonObservation,
  SubstituteTeaching,
  LessonPlanReview,
  DepartmentSetting,
  DepartmentRequest,
} from './types';

interface AppShellProps {
  settings: DepartmentSetting;
  teachers: Teacher[];
  meetings: MeetingMinute[];
  observations: LessonObservation[];
  substitutes: SubstituteTeaching[];
  lessonPlans: LessonPlanReview[];
  requests: DepartmentRequest[];
  onUpdateSettings: (settings: DepartmentSetting) => void;
  onUpdateTeacher: (updated: Teacher) => void;
  onAddMeeting: (meeting: MeetingMinute) => void;
  onUpdateMeeting: (meeting: MeetingMinute) => void;
  onDeleteMeeting: (id: string) => void;
  onAddObservation: (obs: LessonObservation) => void;
  onDeleteObservation: (id: string) => void;
  onAddSubstitute: (sub: SubstituteTeaching) => void;
  onUpdateSubstitute: (sub: SubstituteTeaching) => void;
  onDeleteSubstitute: (id: string) => void;
  onUpdateLessonPlans: (updated: LessonPlanReview[]) => void;
  onAddRequest: (req: DepartmentRequest) => void;
  onUpdateRequest: (req: DepartmentRequest) => void;
  onResetData: () => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRestoreData: (backupData: any) => void;
  currentUser: User | null;
  onUserChange: (user: User | null) => void;
}

function AppShell({
  settings,
  teachers,
  meetings,
  observations,
  substitutes,
  lessonPlans,
  requests,
  onUpdateSettings,
  onUpdateTeacher,
  onAddMeeting,
  onUpdateMeeting,
  onDeleteMeeting,
  onAddObservation,
  onDeleteObservation,
  onAddSubstitute,
  onUpdateSubstitute,
  onDeleteSubstitute,
  onUpdateLessonPlans,
  onAddRequest,
  onUpdateRequest,
  onResetData,
  onExportData,
  onImportData,
  onRestoreData,
  currentUser,
  onUserChange,
}: AppShellProps) {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [isRequestsModalOpen, setIsRequestsModalOpen] = useState(false);

  const pendingPlansCount = lessonPlans.filter((lp) => lp.status !== 'Đã ký duyệt').length;
  const pendingRequestsCount = requests.filter((r) => r.status === 'Chờ duyệt').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-800">
      {/* Top Header with Role Status & Quick Action Buttons */}
      <Header
        settings={settings}
        teachers={teachers}
        onUpdateSettings={onUpdateSettings}
        onResetData={onResetData}
        onExportData={onExportData}
        onImportData={onImportData}
        onOpenOfficialPrint={() => setIsPrintModalOpen(true)}
        currentUser={currentUser}
        onOpenDriveTab={() => setActiveTab('drive')}
        onOpenRequestsModal={() => setIsRequestsModalOpen(true)}
        pendingRequestsCount={pendingRequestsCount}
      />

      {/* Navigation Tabs */}
      <NavigationTabs
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        counts={{
          teachers: teachers.length,
          substitutes: substitutes.length,
          meetings: meetings.length,
          observations: observations.length,
          lessonPlansPending: pendingPlansCount,
        }}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Role & Google Auth Status Banner with quick 1-click simulator switcher */}
        <RolePermissionBanner
          teachers={teachers}
          pendingRequestsCount={pendingRequestsCount}
          onOpenRequestsModal={() => setIsRequestsModalOpen(true)}
        />

        {activeTab === 'dashboard' && (
          <Dashboard
            settings={settings}
            teachers={teachers}
            meetings={meetings}
            observations={observations}
            substitutes={substitutes}
            lessonPlans={lessonPlans}
            onNavigate={setActiveTab}
            onOpenNewMeeting={() => setActiveTab('meetings')}
            onOpenNewObservation={() => setActiveTab('observations')}
            onOpenNewSubstitute={() => setActiveTab('substitutes')}
          />
        )}

        {activeTab === 'teachers' && (
          <TeacherList teachers={teachers} onUpdateTeacher={onUpdateTeacher} />
        )}

        {activeTab === 'assignments' && (
          <AssignmentManager
            settings={settings}
            teachers={teachers}
            onUpdateTeacher={onUpdateTeacher}
            onOpenOfficialPrint={() => setIsPrintModalOpen(true)}
            onOpenRequestModal={() => setIsRequestsModalOpen(true)}
          />
        )}

        {activeTab === 'substitutes' && (
          <SubstituteManager
            teachers={teachers}
            substitutes={substitutes}
            onAddSubstitute={onAddSubstitute}
            onUpdateSubstitute={onUpdateSubstitute}
            onDeleteSubstitute={onDeleteSubstitute}
          />
        )}

        {activeTab === 'meetings' && (
          <MeetingManager
            settings={settings}
            teachers={teachers}
            meetings={meetings}
            onAddMeeting={onAddMeeting}
            onUpdateMeeting={onUpdateMeeting}
            onDeleteMeeting={onDeleteMeeting}
            onPrintMeeting={() => setIsPrintModalOpen(true)}
            onOpenRequestModal={() => setIsRequestsModalOpen(true)}
          />
        )}

        {activeTab === 'observations' && (
          <ObservationManager
            settings={settings}
            teachers={teachers}
            observations={observations}
            onAddObservation={onAddObservation}
            onDeleteObservation={onDeleteObservation}
            onPrintObservation={() => setIsPrintModalOpen(true)}
          />
        )}

        {activeTab === 'lessonPlans' && (
          <LessonPlanAudit
            settings={settings}
            teachers={teachers}
            lessonPlans={lessonPlans}
            onUpdateLessonPlans={onUpdateLessonPlans}
            onOpenRequestModal={() => setIsRequestsModalOpen(true)}
          />
        )}

        {activeTab === 'evaluation' && (
          <EvaluationReport
            settings={settings}
            teachers={teachers}
            onUpdateTeacher={onUpdateTeacher}
            onOpenOfficialPrint={() => setIsPrintModalOpen(true)}
          />
        )}

        {activeTab === 'drive' && (
          <GoogleDriveManager
            settings={settings}
            teachers={teachers}
            meetings={meetings}
            observations={observations}
            substitutes={substitutes}
            lessonPlans={lessonPlans}
            onRestoreData={onRestoreData}
            currentUser={currentUser}
            onUserChange={onUserChange}
          />
        )}
      </main>

      {/* Department Request Modal (Submit & Approve Requests) */}
      <DepartmentRequestModal
        isOpen={isRequestsModalOpen}
        onClose={() => setIsRequestsModalOpen(false)}
        requests={requests}
        teachers={teachers}
        onAddRequest={onAddRequest}
        onUpdateRequest={onUpdateRequest}
        onAutoAddSubstitute={onAddSubstitute}
      />

      {/* Official Print Modal */}
      <OfficialPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        settings={settings}
        teachers={teachers}
        meetings={meetings}
        observations={observations}
        substitutes={substitutes}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © {new Date().getFullYear()} {settings.schoolName} • {settings.departmentName}
          </span>
          <span className="text-[11px] text-slate-400">
            Hệ thống phân quyền chuyên môn: Tổ trưởng (toàn quyền) & Tổ viên (chỉ xem & gửi yêu cầu) qua Google Auth
          </span>
        </div>
      </footer>
    </div>
  );
}

function MainApp() {
  const toast = useToast();
  const initialData = getStoredData();

  const [settings, setSettings] = useState<DepartmentSetting>(initialData.settings);
  const [teachers, setTeachers] = useState<Teacher[]>(initialData.teachers);
  const [meetings, setMeetings] = useState<MeetingMinute[]>(initialData.meetings);
  const [observations, setObservations] = useState<LessonObservation[]>(initialData.observations);
  const [substitutes, setSubstitutes] = useState<SubstituteTeaching[]>(initialData.substitutes);
  const [lessonPlans, setLessonPlans] = useState<LessonPlanReview[]>(initialData.lessonPlans);
  const [requests, setRequests] = useState<DepartmentRequest[]>(initialData.requests || []);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Initialize Firebase Auth listener for Google Drive session
  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setCurrentUser(user);
      },
      () => {
        setCurrentUser(null);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Sync to localStorage
  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  useEffect(() => {
    saveTeachers(teachers);
  }, [teachers]);

  useEffect(() => {
    saveMeetings(meetings);
  }, [meetings]);

  useEffect(() => {
    saveObservations(observations);
  }, [observations]);

  useEffect(() => {
    saveSubstitutes(substitutes);
  }, [substitutes]);

  useEffect(() => {
    saveLessonPlans(lessonPlans);
  }, [lessonPlans]);

  useEffect(() => {
    saveRequests(requests);
  }, [requests]);

  // Settings handler
  const handleUpdateSettings = (newSettings: DepartmentSetting) => {
    setSettings(newSettings);
    toast.success('Đã cập nhật thiết lập tổ chuyên môn thành công!', 'Thiết lập tổ');
  };

  // Teacher handlers
  const handleUpdateTeacher = (updated: Teacher) => {
    setTeachers((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    toast.success(`Đã cập nhật hồ sơ giáo viên "${updated.fullName}" thành công!`, 'Hồ sơ giáo viên');
  };

  // Meeting handlers
  const handleAddMeeting = (meeting: MeetingMinute) => {
    setMeetings((prev) => [meeting, ...prev]);
    toast.success(`Đã lưu biên bản sinh hoạt tổ: "${meeting.title}"`, 'Biên bản sinh hoạt');
  };

  const handleUpdateMeeting = (meeting: MeetingMinute) => {
    setMeetings((prev) => prev.map((m) => (m.id === meeting.id ? meeting : m)));
    toast.success(`Đã cập nhật biên bản sinh hoạt: "${meeting.title}"`, 'Biên bản sinh hoạt');
  };

  const handleDeleteMeeting = (id: string) => {
    setMeetings((prev) => prev.filter((m) => m.id !== id));
    toast.info('Đã xóa biên bản sinh hoạt tổ.', 'Xóa biên bản');
  };

  // Observation handlers
  const handleAddObservation = (obs: LessonObservation) => {
    setObservations((prev) => [obs, ...prev]);
    const teacher = teachers.find((t) => t.id === obs.teacherId);
    toast.success(`Đã thêm phiếu dự giờ của GV ${teacher ? teacher.fullName : ''}`, 'Dự giờ thao giảng');
  };

  const handleDeleteObservation = (id: string) => {
    setObservations((prev) => prev.filter((o) => o.id !== id));
    toast.info('Đã xóa hồ sơ dự giờ thao giảng.', 'Dự giờ thao giảng');
  };

  // Substitute handlers
  const handleAddSubstitute = (sub: SubstituteTeaching) => {
    setSubstitutes((prev) => [sub, ...prev]);
  };

  const handleUpdateSubstitute = (sub: SubstituteTeaching) => {
    setSubstitutes((prev) => prev.map((s) => (s.id === sub.id ? sub : s)));
    toast.success('Đã cập nhật lịch phân công dạy thay!', 'Phân công dạy thay');
  };

  const handleDeleteSubstitute = (id: string) => {
    setSubstitutes((prev) => prev.filter((s) => s.id !== id));
    toast.info('Đã xóa lịch phân công dạy thay.', 'Phân công dạy thay');
  };

  // Lesson Plan handlers
  const handleUpdateLessonPlans = (updated: LessonPlanReview[]) => {
    setLessonPlans(updated);
    toast.success('Đã lưu kết quả kiểm tra kế hoạch bài dạy!', 'Kiểm tra KHBĐ');
  };

  // Request handlers
  const handleAddRequest = (req: DepartmentRequest) => {
    setRequests((prev) => [req, ...prev]);
  };

  const handleUpdateRequest = (req: DepartmentRequest) => {
    setRequests((prev) => prev.map((r) => (r.id === req.id ? req : r)));

    // If request was for substitute teaching and status changed to 'Đã chấp thuận', update substitute table
    if (req.type === 'Xin dạy thay / Báo vắng' && req.status === 'Đã chấp thuận' && req.substituteData) {
      setSubstitutes((prev) =>
        prev.map((s) => {
          if (
            s.absentTeacherId === req.substituteData?.absentTeacherId &&
            s.date === req.substituteData?.date &&
            s.period === req.substituteData?.period
          ) {
            return { ...s, status: 'Đã duyệt' };
          }
          return s;
        })
      );
    }
  };

  // Data Export & Import
  const handleExportData = () => {
    const backup = {
      settings,
      teachers,
      meetings,
      observations,
      substitutes,
      lessonPlans,
      requests,
      exportDate: new Date().toISOString(),
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `THCS_NguyenDu_ToChuyenMon_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('Đã xuất file dữ liệu dự phòng thành công (JSON)!', 'Sao lưu dữ liệu');
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.teachers && Array.isArray(json.teachers)) setTeachers(json.teachers);
        if (json.settings) setSettings(json.settings);
        if (json.meetings && Array.isArray(json.meetings)) setMeetings(json.meetings);
        if (json.observations && Array.isArray(json.observations)) setObservations(json.observations);
        if (json.substitutes && Array.isArray(json.substitutes)) setSubstitutes(json.substitutes);
        if (json.lessonPlans && Array.isArray(json.lessonPlans)) setLessonPlans(json.lessonPlans);
        if (json.requests && Array.isArray(json.requests)) setRequests(json.requests);
        toast.success('Nhập dữ liệu thành công!', 'Phục hồi dữ liệu');
      } catch (err) {
        toast.error('File dữ liệu không đúng định dạng JSON.', 'Lỗi dữ liệu');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetData = () => {
    if (confirm('Bạn có chắc chắn muốn khôi phục dữ liệu mẫu ban đầu của THCS Nguyễn Du (10 giáo viên)?')) {
      resetAllData();
      window.location.reload();
    }
  };

  const handleRestoreFromBackup = (data: any) => {
    if (data.teachers && Array.isArray(data.teachers)) setTeachers(data.teachers);
    if (data.settings) setSettings(data.settings);
    if (data.meetings && Array.isArray(data.meetings)) setMeetings(data.meetings);
    if (data.observations && Array.isArray(data.observations)) setObservations(data.observations);
    if (data.substitutes && Array.isArray(data.substitutes)) setSubstitutes(data.substitutes);
    if (data.lessonPlans && Array.isArray(data.lessonPlans)) setLessonPlans(data.lessonPlans);
    if (data.requests && Array.isArray(data.requests)) setRequests(data.requests);
    toast.success('Đã khôi phục dữ liệu từ bản sao lưu thành công!', 'Khôi phục dữ liệu');
  };

  return (
    <AuthRoleProvider
      settings={settings}
      teachers={teachers}
      initialRoleOverride={initialData.roleOverride}
    >
      <AppShell
        settings={settings}
        teachers={teachers}
        meetings={meetings}
        observations={observations}
        substitutes={substitutes}
        lessonPlans={lessonPlans}
        requests={requests}
        onUpdateSettings={handleUpdateSettings}
        onUpdateTeacher={handleUpdateTeacher}
        onAddMeeting={handleAddMeeting}
        onUpdateMeeting={handleUpdateMeeting}
        onDeleteMeeting={handleDeleteMeeting}
        onAddObservation={handleAddObservation}
        onDeleteObservation={handleDeleteObservation}
        onAddSubstitute={handleAddSubstitute}
        onUpdateSubstitute={handleUpdateSubstitute}
        onDeleteSubstitute={handleDeleteSubstitute}
        onUpdateLessonPlans={handleUpdateLessonPlans}
        onAddRequest={handleAddRequest}
        onUpdateRequest={handleUpdateRequest}
        onResetData={handleResetData}
        onExportData={handleExportData}
        onImportData={handleImportData}
        onRestoreData={handleRestoreFromBackup}
        currentUser={currentUser}
        onUserChange={setCurrentUser}
      />
    </AuthRoleProvider>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <MainApp />
    </ToastProvider>
  );
}
