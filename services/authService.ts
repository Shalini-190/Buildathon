import { User } from '../types';

const USERS_KEY = 'clipverb_users';
const SESSION_KEY = 'clipverb_session';

// Simulate a simple hash
const hashPassword = (pwd: string) => btoa(pwd);

export const registerUser = (name: string, email: string, password: string, agencyName?: string): User => {
  const usersStr = localStorage.getItem(USERS_KEY);
  const users: User[] = usersStr ? JSON.parse(usersStr) : [];

  if (users.find(u => u.email === email)) {
    throw new Error("User already exists with this email.");
  }

  const newUser: User = {
    id: Date.now().toString(),
    name,
    agencyName: agencyName || '', // Default to empty string if not provided
    email,
    passwordHash: hashPassword(password)
  };

  users.push(newUser);
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
  
  // Auto login
  localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
  return newUser;
};

export const loginUser = (email: string, password: string): User => {
  const usersStr = localStorage.getItem(USERS_KEY);
  const users: User[] = usersStr ? JSON.parse(usersStr) : [];
  
  const user = users.find(u => u.email === email && u.passwordHash === hashPassword(password));
  
  if (!user) {
    throw new Error("Invalid email or password.");
  }

  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  return user;
};

export const logoutUser = () => {
  localStorage.removeItem(SESSION_KEY);
};

export const getCurrentUser = (): User | null => {
  const session = localStorage.getItem(SESSION_KEY);
  return session ? JSON.parse(session) : null;
};