import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import { User } from 'firebase/auth';
import { initAuth, googleSignIn, logout as firebaseLogout } from '../utils/googleAuth';
import { Teacher, DepartmentSetting, UserRole } from '../types';
import { saveRoleOverride } from '../utils/storage';

interface AuthRoleContextType {
  currentUser: User | null;
  userEmail: string | null;
  displayName: string;
  photoURL: string | null;
  role: UserRole;
  isHead: boolean;
  isMember: boolean;
  matchedTeacher: Teacher | null;
  roleOverride: UserRole | null;
  setRoleOverride: (role: UserRole | null) => void;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  simulateTeacherLogin: (teacher: Teacher) => void;
  isSigningIn: boolean;
  authError: string | null;
}

const AuthRoleContext = createContext<AuthRoleContextType | undefined>(undefined);

interface AuthRoleProviderProps {
  children: ReactNode;
  settings: DepartmentSetting;
  teachers: Teacher[];
  initialRoleOverride?: string | null;
}

export const AuthRoleProvider: React.FC<AuthRoleProviderProps> = ({
  children,
  settings,
  teachers,
  initialRoleOverride = null,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [simulatedTeacher, setSimulatedTeacher] = useState<Teacher | null>(null);
  const [roleOverride, setRoleOverrideState] = useState<UserRole | null>(
    initialRoleOverride === 'Tổ trưởng' || initialRoleOverride === 'Tổ viên'
      ? initialRoleOverride
      : null
  );
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Initialize Firebase Auth listener
  useEffect(() => {
    const unsubscribe = initAuth(
      (user) => {
        setCurrentUser(user);
        setSimulatedTeacher(null); // Clear simulation if real user logs in
      },
      () => {
        // Not logged in or logged out
        setCurrentUser(null);
      }
    );
    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  const handleSetRoleOverride = (newRole: UserRole | null) => {
    setRoleOverrideState(newRole);
    saveRoleOverride(newRole);
  };

  // Find matching teacher based on current logged-in Google email or simulated teacher
  const matchedTeacher = useMemo(() => {
    if (simulatedTeacher) return simulatedTeacher;
    if (!currentUser?.email) return null;
    const email = currentUser.email.toLowerCase().trim();
    return (
      teachers.find((t) => t.email.toLowerCase().trim() === email) ||
      null
    );
  }, [currentUser, simulatedTeacher, teachers]);

  // Determine effective role
  const computedRole: UserRole = useMemo(() => {
    // 1. If explicit role override toggle is selected, respect it (great for testing)
    if (roleOverride) {
      return roleOverride;
    }

    // 2. If simulated teacher is active
    if (simulatedTeacher) {
      return simulatedTeacher.role === 'Tổ trưởng' ? 'Tổ trưởng' : 'Tổ viên';
    }

    // 3. Based on real Google Auth user
    if (currentUser?.email) {
      const email = currentUser.email.toLowerCase().trim();
      const headEmail = (settings.headOfDepartmentEmail || '').toLowerCase().trim();
      const headTeacher = teachers.find((t) => t.id === settings.headOfDepartmentId || t.role === 'Tổ trưởng');
      const headTeacherEmail = headTeacher?.email.toLowerCase().trim() || '';

      // If email matches head of department settings OR default head teacher email OR bdteacher@gmail.com
      if (
        (headEmail && email === headEmail) ||
        (headTeacherEmail && email === headTeacherEmail) ||
        email === 'bdteacher@gmail.com' ||
        email.startsWith('hung.nguyen')
      ) {
        return 'Tổ trưởng';
      }

      // If matches any other teacher in list who is not head, or general user
      return 'Tổ viên';
    }

    // 4. If not logged in at all, default to Tổ viên (Read-only & request mode)
    return 'Tổ viên';
  }, [roleOverride, simulatedTeacher, currentUser, settings, teachers]);

  const userEmail = useMemo(() => {
    if (currentUser?.email) return currentUser.email;
    if (simulatedTeacher) return simulatedTeacher.email;
    return null;
  }, [currentUser, simulatedTeacher]);

  const displayName = useMemo(() => {
    if (currentUser?.displayName) return currentUser.displayName;
    if (matchedTeacher) return matchedTeacher.fullName;
    if (simulatedTeacher) return simulatedTeacher.fullName;
    return computedRole === 'Tổ trưởng' ? 'Thầy Nguyễn Văn Hưng (Tổ trưởng)' : 'Tổ viên THCS Nguyễn Du';
  }, [currentUser, matchedTeacher, simulatedTeacher, computedRole]);

  const photoURL = useMemo(() => {
    if (currentUser?.photoURL) return currentUser.photoURL;
    if (matchedTeacher?.avatarUrl) return matchedTeacher.avatarUrl;
    return null;
  }, [currentUser, matchedTeacher]);

  const signInWithGoogle = async () => {
    setIsSigningIn(true);
    setAuthError(null);
    try {
      const result = await googleSignIn();
      if (result?.user) {
        setCurrentUser(result.user);
        setSimulatedTeacher(null);
      }
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setAuthError(err?.message || 'Không thể đăng nhập bằng tài khoản Google.');
    } finally {
      setIsSigningIn(false);
    }
  };

  const signOut = async () => {
    try {
      await firebaseLogout();
      setCurrentUser(null);
      setSimulatedTeacher(null);
      handleSetRoleOverride(null);
    } catch (err: any) {
      console.error('Google sign-out error:', err);
    }
  };

  const simulateTeacherLogin = (teacher: Teacher) => {
    setSimulatedTeacher(teacher);
    handleSetRoleOverride(teacher.role === 'Tổ trưởng' ? 'Tổ trưởng' : 'Tổ viên');
  };

  const value = {
    currentUser,
    userEmail,
    displayName,
    photoURL,
    role: computedRole,
    isHead: computedRole === 'Tổ trưởng',
    isMember: computedRole === 'Tổ viên',
    matchedTeacher,
    roleOverride,
    setRoleOverride: handleSetRoleOverride,
    signInWithGoogle,
    signOut,
    simulateTeacherLogin,
    isSigningIn,
    authError,
  };

  return <AuthRoleContext.Provider value={value}>{children}</AuthRoleContext.Provider>;
};

export const useAuthRole = (): AuthRoleContextType => {
  const context = useContext(AuthRoleContext);
  if (!context) {
    throw new Error('useAuthRole must be used within an AuthRoleProvider');
  }
  return context;
};
