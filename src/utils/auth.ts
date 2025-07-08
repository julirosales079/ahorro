import { User } from '../types';

const AUTH_STORAGE_KEY = 'savings-fund-auth';
const USERS_STORAGE_KEY = 'savings-fund-users';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  role?: 'admin' | 'member';
}

// Simple hash function for password storage (in production, use proper hashing)
const simpleHash = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString();
};

export const authService = {
  // Get current authenticated user
  getCurrentUser: (): User | null => {
    const authData = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!authData) return null;
    
    try {
      const { userId } = JSON.parse(authData);
      const users = authService.getAllUsers();
      return users.find(user => user.id === userId) || null;
    } catch {
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    return authService.getCurrentUser() !== null;
  },

  // Check if current user is admin
  isAdmin: (): boolean => {
    const user = authService.getCurrentUser();
    return user?.role === 'admin';
  },

  // Get all users (for internal use)
  getAllUsers: (): (User & { passwordHash: string })[] => {
    const usersData = localStorage.getItem(USERS_STORAGE_KEY);
    return usersData ? JSON.parse(usersData) : [];
  },

  // Get all users without password (for admin view)
  getAllUsersPublic: (): User[] => {
    const users = authService.getAllUsers();
    return users.map(({ passwordHash, ...user }) => user);
  },

  // Save users to storage
  saveUsers: (users: (User & { passwordHash: string })[]) => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  },

  // Create user by admin
  createUser: (data: RegisterData): { success: boolean; error?: string; user?: User } => {
    const users = authService.getAllUsers();
    
    // Check if email already exists
    if (users.find(user => user.email === data.email)) {
      return { success: false, error: 'El email ya está registrado' };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return { success: false, error: 'Formato de email inválido' };
    }

    // Create new user
    const newUser: User & { passwordHash: string } = {
      id: Date.now().toString(),
      email: data.email,
      name: data.name,
      createdAt: new Date().toISOString(),
      role: data.role || 'member',
      isActive: true,
      totalSavings: 0,
      passwordHash: simpleHash(data.password || '123456') // Default password
    };

    users.push(newUser);
    authService.saveUsers(users);

    const { passwordHash, ...userWithoutPassword } = newUser;
    return { success: true, user: userWithoutPassword };
  },

  // Register new user (first user becomes admin)
  register: (data: RegisterData): { success: boolean; error?: string; user?: User } => {
    const users = authService.getAllUsers();
    
    // Check if email already exists
    if (users.find(user => user.email === data.email)) {
      return { success: false, error: 'El email ya está registrado' };
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return { success: false, error: 'Formato de email inválido' };
    }

    // Validate password length
    if (data.password.length < 6) {
      return { success: false, error: 'La contraseña debe tener al menos 6 caracteres' };
    }

    // First user becomes admin
    const isFirstUser = users.length === 0;

    // Create new user
    const newUser: User & { passwordHash: string } = {
      id: Date.now().toString(),
      email: data.email,
      name: data.name,
      createdAt: new Date().toISOString(),
      role: isFirstUser ? 'admin' : 'member',
      isActive: true,
      totalSavings: 0,
      passwordHash: simpleHash(data.password)
    };

    users.push(newUser);
    authService.saveUsers(users);

    // Auto-login after registration
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ userId: newUser.id }));

    const { passwordHash, ...userWithoutPassword } = newUser;
    return { success: true, user: userWithoutPassword };
  },

  // Login user
  login: (credentials: LoginCredentials): { success: boolean; error?: string; user?: User } => {
    const users = authService.getAllUsers();
    const user = users.find(u => u.email === credentials.email);

    if (!user) {
      return { success: false, error: 'Email o contraseña incorrectos' };
    }

    if (!user.isActive) {
      return { success: false, error: 'Usuario inactivo. Contacta al administrador.' };
    }

    if (user.passwordHash !== simpleHash(credentials.password)) {
      return { success: false, error: 'Email o contraseña incorrectos' };
    }

    // Save auth state
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ userId: user.id }));

    const { passwordHash, ...userWithoutPassword } = user;
    return { success: true, user: userWithoutPassword };
  },

  // Update user
  updateUser: (userId: string, updates: Partial<User>): { success: boolean; error?: string } => {
    const users = authService.getAllUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
      return { success: false, error: 'Usuario no encontrado' };
    }

    users[userIndex] = { ...users[userIndex], ...updates };
    authService.saveUsers(users);

    return { success: true };
  },

  // Logout user
  logout: () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  },

  // Get user-specific storage key
  getUserStorageKey: (baseKey: string, userId: string): string => {
    return `${baseKey}-${userId}`;
  }
};