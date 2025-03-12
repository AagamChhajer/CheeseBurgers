import { useState } from 'react';
import { User } from '@/types/exam';

// In a real application, this would come from a database
let MOCK_USERS: User[] = [
  { email: 'test@example.com', name: 'Test User', password: 'password123' },
  { email: 'admin@shield.com', name: 'Admin User', password: 'admin123' }
];

interface AuthState {
  user: User | null;
  error: string | null;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    error: null
  });

  const login = (email: string, password: string): boolean => {
    // Reset error state
    setState(prev => ({ ...prev, error: null }));

    // Basic validation
    if (!email || !password) {
      setState(prev => ({ ...prev, error: 'Please fill in all fields' }));
      return false;
    }

    // Find user
    const user = MOCK_USERS.find(u => u.email === email);

    if (!user) {
      setState(prev => ({ ...prev, error: 'User not found' }));
      return false;
    }

    if (user.password !== password) {
      setState(prev => ({ ...prev, error: 'Invalid password' }));
      return false;
    }

    // Login successful
    const { password: _, ...userWithoutPassword } = user;
    setState(prev => ({ ...prev, user: userWithoutPassword }));
    return true;
  };

  const signup = (name: string, email: string, password: string): boolean => {
    // Reset error state
    setState(prev => ({ ...prev, error: null }));

    // Basic validation
    if (!name || !email || !password) {
      setState(prev => ({ ...prev, error: 'Please fill in all fields' }));
      return false;
    }

    // Check if email is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setState(prev => ({ ...prev, error: 'Please enter a valid email' }));
      return false;
    }

    // Check if user already exists
    if (MOCK_USERS.some(u => u.email === email)) {
      setState(prev => ({ ...prev, error: 'Email already registered' }));
      return false;
    }

    // Create new user and add to mock database
    const newUser: User = { name, email, password };
    MOCK_USERS.push(newUser);

    // Set the current user (without password)
    const { password: _, ...userWithoutPassword } = newUser;
    setState(prev => ({ ...prev, user: userWithoutPassword }));
    return true;
  };

  const logout = () => {
    setState({ user: null, error: null });
  };

  return {
    user: state.user,
    error: state.error,
    login,
    signup,
    logout
  };
}; 