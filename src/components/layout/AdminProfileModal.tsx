import React, { useState } from 'react';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';

export const AdminProfileModal: React.FC = () => {
  const { isProfileModalOpen, setProfileModalOpen, addToast } = useUIStore();
  const { currentUser, updateProfile, logout } = useAuthStore();

  const [name, setName] = useState(currentUser?.name || 'Rahul Sharma');
  const [phone, setPhone] = useState(currentUser?.phone || '+91 98450 99001');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!isProfileModalOpen || !currentUser) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (password && password !== confirmPassword) {
      addToast({
        type: 'ERROR',
        title: 'Password Mismatch',
        message: 'New password and confirmation do not match.',
      });
      return;
    }
    updateProfile({ name, phone });
    addToast({
      type: 'SUCCESS',
      title: 'Profile Updated',
      message: 'Your administrator credentials have been saved.',
    });
    setProfileModalOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-on-surface/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-surface-container-lowest rounded-2xl shadow-2xl border border-surface-container-high overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-space-md border-b border-surface-container-high bg-surface-container-low/50">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-12 h-12 rounded-full object-cover ring-2 ring-primary"
            />
            <div>
              <h3 className="font-headline-sm text-headline-sm font-bold text-on-surface">
                {currentUser.name}
              </h3>
              <p className="font-label-sm text-label-sm text-on-surface-variant">
                {currentUser.role.replace('_', ' ')} • {currentUser.department}
              </p>
            </div>
          </div>
          <button
            onClick={() => setProfileModalOpen(false)}
            className="p-1 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSave} className="p-space-lg space-y-4">
          <div>
            <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold mb-1">
              Full Name
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all border border-surface-container-high/60"
            />
          </div>

          <div>
            <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold mb-1">
              Work Email (Read Only)
            </label>
            <input
              value={currentUser.email}
              readOnly
              className="w-full h-10 px-3 rounded-lg bg-surface-container-high/60 text-on-surface-variant font-body-sm text-body-sm cursor-not-allowed border border-surface-container-high/60"
            />
          </div>

          <div>
            <label className="block font-label-sm text-label-sm text-on-surface-variant uppercase font-semibold mb-1">
              Direct Contact Number
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full h-10 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:outline-none focus:bg-surface-container-lowest focus:ring-2 focus:ring-primary/20 transition-all border border-surface-container-high/60 font-tabular-mono"
            />
          </div>

          <div className="pt-2 border-t border-surface-container-high">
            <span className="block font-label-md text-label-md text-on-surface font-bold mb-2">
              Change Security Password
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:outline-none border border-surface-container-high/60"
                />
              </div>
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg bg-surface-container-low text-on-surface font-body-sm text-body-sm focus:outline-none border border-surface-container-high/60"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setProfileModalOpen(false);
                logout();
              }}
              className="text-error font-label-md text-label-md font-semibold hover:underline flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[16px]">logout</span>
              Sign out session
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setProfileModalOpen(false)}
                className="h-9 px-4 rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md font-semibold transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-9 px-5 rounded-lg bg-primary text-on-primary font-label-md text-label-md font-bold hover:bg-primary-container transition-all shadow-sm"
              >
                Save Profile
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
