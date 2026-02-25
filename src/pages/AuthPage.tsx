import { useState, FormEvent } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sparkles, Mail, Lock, User, ArrowRight, AlertCircle } from 'lucide-react';

export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const [isRegister, setIsRegister] = useState(searchParams.get('mode') === 'register');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (isRegister) {
      if (!name.trim()) { setError('Введите имя'); return; }
      if (!email.trim()) { setError('Введите email'); return; }
      if (password.length < 4) { setError('Пароль должен быть не менее 4 символов'); return; }
      const result = register(name.trim(), email.trim().toLowerCase(), password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Ошибка регистрации');
      }
    } else {
      if (!email.trim()) { setError('Введите email'); return; }
      if (!password) { setError('Введите пароль'); return; }
      const result = login(email.trim().toLowerCase(), password);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || 'Ошибка входа');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 pt-16">
      <div className="w-full max-w-md">
        <div className="text-center mb-8 animate-fade-in-up">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-200">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              InviteCraft
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {isRegister ? 'Создать аккаунт' : 'Добро пожаловать!'}
          </h1>
          <p className="text-gray-500 mt-2">
            {isRegister ? 'Начните создавать красивые приглашения' : 'Войдите в свой аккаунт'}
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl shadow-indigo-50 border border-gray-100 p-8 animate-fade-in-up delay-100" style={{ animationFillMode: 'both' }}>
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl mb-6 text-red-600 text-sm animate-slide-down">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {isRegister && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Ваше имя</label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Как вас зовут?"
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all text-gray-800 placeholder:text-gray-300"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all text-gray-800 placeholder:text-gray-300"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Пароль</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-300" />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder={isRegister ? 'Минимум 4 символа' : 'Введите пароль'}
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 outline-none transition-all text-gray-800 placeholder:text-gray-300"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-200 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5"
            >
              {isRegister ? 'Зарегистрироваться' : 'Войти'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => { setIsRegister(!isRegister); setError(''); }}
              className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
            >
              {isRegister ? 'Уже есть аккаунт? Войти' : 'Нет аккаунта? Зарегистрироваться'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
