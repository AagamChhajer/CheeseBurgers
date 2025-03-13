import React, { useRef, useState, useEffect } from 'react';
import { User } from '@/types/exam';
import { login } from '@/services/api';
import { useSocket } from '@/context/socket';

interface LoginModalProps {
  isVisible: boolean;
  onClose?: () => void;
}

const LoginModal: React.FC<LoginModalProps> = ({ isVisible, onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { socket } = useSocket();

  useEffect(() => {
    if (socket) {
      socket.on('connect', () => console.log('Connected to WebSocket server'));
      socket.on('disconnect', () => console.log('Disconnected from WebSocket'));
    }
    return () => {
      socket?.off('connect');
      socket?.off('disconnect');
    };
  }, [socket]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await login(email, password);
      if (res.token) {
        localStorage.setItem('token', res.token);
        onLoginSuccess(res.token);
        socket?.emit('login', { email });
      } else {
        setError('Invalid credentials');
      }
    } catch (err) {
      console.error("Login API Error:", err);
      setError('Something went wrong');
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-lg font-bold mb-4">Login</h2>
        {error && <p className="text-red-500 text-sm mb-3">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border p-2 rounded"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700"
          >
            Login
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="mt-2 text-gray-500 hover:text-gray-700"
            >
              Close
            </button>
          )}
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
