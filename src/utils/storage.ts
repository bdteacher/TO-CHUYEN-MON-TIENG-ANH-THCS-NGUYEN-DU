import { Teacher, MeetingMinute, LessonObservation, LessonPlanReview, SubstituteTeaching, DepartmentSetting, DepartmentRequest } from '../types';
import {
  initialDepartmentSetting,
  initialTeachers,
  initialMeetingMinutes,
  initialLessonObservations,
  initialSubstituteTeachings,
  initialLessonPlanReviews,
  initialDepartmentRequests,
} from '../data/initialData';

const STORAGE_KEYS = {
  TEACHERS: 'thcs_nguyen_du_teachers',
  MEETINGS: 'thcs_nguyen_du_meetings',
  OBSERVATIONS: 'thcs_nguyen_du_observations',
  SUBSTITUTES: 'thcs_nguyen_du_substitutes',
  LESSON_PLANS: 'thcs_nguyen_du_lesson_plans',
  SETTINGS: 'thcs_nguyen_du_settings',
  REQUESTS: 'thcs_nguyen_du_requests',
  ROLE_OVERRIDE: 'thcs_nguyen_du_role_override',
  SCHEDULE_IMAGES: 'thcs_nguyen_du_schedule_images',
  SCHEDULE_IMAGE: 'thcs_nguyen_du_schedule_image',
  SCHEDULE_TITLE: 'thcs_nguyen_du_schedule_title',
  SCHEDULE_UPDATED_AT: 'thcs_nguyen_du_schedule_updated_at',
};

export const getStoredData = () => {
  const load = <T>(key: string, fallback: T): T => {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error(`Failed to load ${key} from storage:`, e);
    }
    return fallback;
  };

  const rawTeachers = load<Teacher[]>(STORAGE_KEYS.TEACHERS, initialTeachers);
  const teachers = rawTeachers.map((t, idx) => {
    const fallback = initialTeachers.find((it) => it.id === t.id) || initialTeachers[idx] || initialTeachers[0];
    return {
      ...t,
      majorSubject: t.majorSubject === 'Toán học' || t.majorSubject === 'Tin học' ? 'Tiếng Anh' : (t.majorSubject || 'Tiếng Anh'),
      birthDate: t.birthDate || (fallback ? fallback.birthDate : (t.birthYear ? `01/01/${t.birthYear}` : '01/01/1985')),
      departmentTopic: t.departmentTopic || (fallback ? fallback.departmentTopic : 'Nâng cao chất lượng dạy học môn Tiếng Anh theo GDPT 2018'),
    };
  });

  const rawSettings = load<DepartmentSetting>(STORAGE_KEYS.SETTINGS, initialDepartmentSetting);
  const settings: DepartmentSetting = {
    ...rawSettings,
    departmentName: rawSettings.departmentName === 'TỔ TOÁN - TIN HỌC' ? 'TỔ TIẾNG ANH' : rawSettings.departmentName,
  };

  const rawLessonPlans = load<LessonPlanReview[]>(STORAGE_KEYS.LESSON_PLANS, initialLessonPlanReviews);
  const lessonPlans = rawLessonPlans.map((lp) => ({
    ...lp,
    subject: 'Tiếng Anh',
  }));

  const rawObservations = load<LessonObservation[]>(STORAGE_KEYS.OBSERVATIONS, initialLessonObservations);
  const observations = rawObservations.map((obs) => ({
    ...obs,
    subject: 'Tiếng Anh',
  }));

  const rawSubstitutes = load<SubstituteTeaching[]>(STORAGE_KEYS.SUBSTITUTES, initialSubstituteTeachings);
  const substitutes = rawSubstitutes.map((sub) => ({
    ...sub,
    subject: 'Tiếng Anh',
  }));

  return {
    teachers,
    meetings: load<MeetingMinute[]>(STORAGE_KEYS.MEETINGS, initialMeetingMinutes),
    observations,
    substitutes,
    lessonPlans,
    settings,
    requests: load<DepartmentRequest[]>(STORAGE_KEYS.REQUESTS, initialDepartmentRequests),
    roleOverride: load<string | null>(STORAGE_KEYS.ROLE_OVERRIDE, null),
  };
};

export const saveTeachers = (teachers: Teacher[]) => {
  localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
};

export const saveMeetings = (meetings: MeetingMinute[]) => {
  localStorage.setItem(STORAGE_KEYS.MEETINGS, JSON.stringify(meetings));
};

export const saveObservations = (observations: LessonObservation[]) => {
  localStorage.setItem(STORAGE_KEYS.OBSERVATIONS, JSON.stringify(observations));
};

export const saveSubstitutes = (substitutes: SubstituteTeaching[]) => {
  localStorage.setItem(STORAGE_KEYS.SUBSTITUTES, JSON.stringify(substitutes));
};

export const saveLessonPlans = (lessonPlans: LessonPlanReview[]) => {
  localStorage.setItem(STORAGE_KEYS.LESSON_PLANS, JSON.stringify(lessonPlans));
};

export const saveSettings = (settings: DepartmentSetting) => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

export const saveRequests = (requests: DepartmentRequest[]) => {
  localStorage.setItem(STORAGE_KEYS.REQUESTS, JSON.stringify(requests));
};

export const saveRoleOverride = (role: string | null) => {
  if (role) {
    localStorage.setItem(STORAGE_KEYS.ROLE_OVERRIDE, JSON.stringify(role));
  } else {
    localStorage.removeItem(STORAGE_KEYS.ROLE_OVERRIDE);
  }
};

export const resetAllData = () => {
  localStorage.removeItem(STORAGE_KEYS.TEACHERS);
  localStorage.removeItem(STORAGE_KEYS.MEETINGS);
  localStorage.removeItem(STORAGE_KEYS.OBSERVATIONS);
  localStorage.removeItem(STORAGE_KEYS.SUBSTITUTES);
  localStorage.removeItem(STORAGE_KEYS.LESSON_PLANS);
  localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  localStorage.removeItem(STORAGE_KEYS.REQUESTS);
  localStorage.removeItem(STORAGE_KEYS.ROLE_OVERRIDE);
  localStorage.removeItem(STORAGE_KEYS.SCHEDULE_IMAGES);
  localStorage.removeItem(STORAGE_KEYS.SCHEDULE_IMAGE);
  localStorage.removeItem(STORAGE_KEYS.SCHEDULE_TITLE);
  localStorage.removeItem(STORAGE_KEYS.SCHEDULE_UPDATED_AT);
};
