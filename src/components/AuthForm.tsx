import React, { useState } from 'react';
import { auth } from '../lib/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { PenTool } from 'lucide-react';
import toast from 'react-hot-toast';

interface AuthFormProps {
  isLogin?: boolean;
}

export function AuthForm({ isLogin = false }: AuthFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Login successful!');
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success('Account created successfully!');
      }
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
      <div className="bg-black/30 backdrop-blur-sm border border-purple-500/20 p-8 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-center mb-8">
          <PenTool className="h-10 w-10 text-purple-400" />
        </div>
        <h2 className="text-2xl font-bold text-center mb-6 text-white">
          {isLogin ? 'Welcome to Marcos Quantum' : 'Join Marcos Quantum'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-300">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md bg-gray-900/50 border-purple-500/30 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500"
                required
              />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-300">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-md bg-gray-900/50 border-purple-500/30 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-md bg-gray-900/50 border-purple-500/30 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-violet-600 text-white py-2 px-4 rounded-md hover:from-purple-700 hover:to-violet-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition-all duration-200"
          >
            {isLogin ? 'Login' : 'Sign Up'}
          </button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-400">
          {isLogin ? (
            <>
              Don't have an account?{' '}
              <a href="/register" className="text-purple-400 hover:text-purple-300">
                Sign up
              </a>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <a href="/login" className="text-purple-400 hover:text-purple-300">
                Login
              </a>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
