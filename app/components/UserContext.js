'use client';
import { createContext, useContext, useEffect, useState } from 'react';

export const ROLES = {
  admin:    { label: 'Admin',    color: '#f43f5e', can: { all: true } },
  manager:  { label: 'Manager', color: '#f59e0b', can: { all: true, manageUsers: false } },
  employee: { label: 'Employee',color: '#10b981', can: { viewReports: false, manageUsers: false, deleteRecords: false } },
  auditor:  { label: 'Auditor', color: '#38bdf8', can: { readOnly: true } },
};

export const ROUTE_PERMISSIONS = {
  '/reports/pl':            ['admin','manager','auditor'],
  '/reports/balance-sheet': ['admin','manager','auditor'],
  '/reports/trial-balance': ['admin','manager','auditor'],
  '/reports/aging':         ['admin','manager','auditor'],
  '/reports/cashflow':      ['admin','manager','auditor'],
  '/settings':              ['admin'],
  '/journal':               ['admin','manager'],
  '/accounts':              ['admin','manager','auditor'],
  '/ledger':                ['admin','manager','auditor'],
  '/daybook':               ['admin','manager','auditor'],
  '/cashbook':              ['admin','manager','auditor'],
};

const UserContext = createContext({ user: null, setUser: () => {}, can: () => true });

export function UserProvider({ children }) {
  const [user, setUserState] = useState(null);

  useEffect(() => {
    const saved = localStorage.getItem('accounpro_user');
    if (saved) {
      try { setUserState(JSON.parse(saved)); } catch {}
    }
  }, []);

  const setUser = (u) => {
    setUserState(u);
    if (u) localStorage.setItem('accounpro_user', JSON.stringify(u));
    else localStorage.removeItem('accounpro_user');
  };

  const can = (action) => {
    if (!user) return false;
    if (user.role === 'admin') return true;
    if (user.role === 'auditor') return action === 'view';
    if (user.role === 'manager') return !['manageUsers'].includes(action);
    if (user.role === 'employee') return !['viewReports','manageUsers','deleteRecords','viewJournal'].includes(action);
    return false;
  };

  const canAccessRoute = (route) => {
    if (!user) return false;
    const allowed = ROUTE_PERMISSIONS[route];
    if (!allowed) return true;
    return allowed.includes(user.role);
  };

  return (
    <UserContext.Provider value={{ user, setUser, can, canAccessRoute }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() { return useContext(UserContext); }
