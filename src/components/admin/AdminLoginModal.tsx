import React, { useState } from 'react';
import { X, Lock, Mail, KeyRound, AlertCircle, Sparkles } from 'lucide-react';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    
    const isValidAdmin =
      (cleanEmail === 'ventas@charlitron.com' && password === '2003') ||
      (cleanEmail === 'betoronazo@gmail.com' && password === 'Betofifa12');

    if (isValidAdmin) {
      setError('');
      onLoginSuccess();
      onClose();
    } else {
      setError('Correo o contraseña incorrectos. Verifica tus credenciales de administrador.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#0B0D10]/85 backdrop-blur-md"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-[#12151B] border-2 border-[#54431B] rounded-2xl p-6 shadow-2xl text-[#F3E5C8] z-10 space-y-6">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#A89878] hover:text-[#F3E5C8] p-1.5 rounded-lg hover:bg-[#211A0C]"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#211A0C] to-[#3D3016] border border-[#6B531F] flex items-center justify-center mx-auto text-[#E2B755] shadow-lg">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="font-serif text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFF6E5] via-[#E8C56B] to-[#C59B27]">
            Acceso Administrador
          </h2>
          <p className="text-xs text-[#A89878]">
            Ingresa con tus credenciales asignadas para gestionar productos, cotizaciones y personalizar la tienda.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 text-xs text-red-300 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#A89878] mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#827258]" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="correo@ejemplo.com"
                className="w-full bg-[#080A0C] border border-[#3D3016] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#F3E5C8] placeholder-[#61523B] focus:outline-none focus:border-[#D4AF37]"
                id="admin-login-email-input"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#A89878] mb-1">
              Contraseña
            </label>
            <div className="relative">
              <KeyRound className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#827258]" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••"
                className="w-full bg-[#080A0C] border border-[#3D3016] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#F3E5C8] placeholder-[#61523B] focus:outline-none focus:border-[#D4AF37]"
                id="admin-login-password-input"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#C59B27] to-[#8F6C13] text-[#0B0D10] font-extrabold text-sm hover:brightness-110 transition-all shadow-lg flex items-center justify-center gap-2"
            id="admin-login-submit-btn"
          >
            <Sparkles className="w-4 h-4" />
            <span>Iniciar Sesión en el Panel</span>
          </button>
        </form>

      </div>
    </div>
  );
};
