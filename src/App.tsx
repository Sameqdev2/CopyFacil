import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthForm } from './components/AuthForm';
import { Dashboard } from './components/Dashboard';
import { Toaster } from 'react-hot-toast';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './lib/firebase';

function App() {
  const [user, setUser] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-400"></div>
      </div>
    );
  }

  return (
    <>
      <Toaster 
        position="top-right"
        toastOptions={{
          style: {
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid rgba(139, 92, 246, 0.2)',
          },
        }}
      />
      <Router>
        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/dashboard" /> : <AuthForm isLogin />}
          />
          <Route
            path="/register"
            element={user ? <Navigate to="/dashboard" /> : <AuthForm />}
          />
          <Route
            path="/dashboard"
            element={user ? <Dashboard /> : <Navigate to="/login" />}
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
