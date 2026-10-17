import React, { useState } from 'react';
import { VolkovLogo, KalinaMalinaLogo, AssistantAvatar } from './Logos';
import { ROLES, LOCATIONS } from '../data/companyData';
import { 
  Building2, 
  MapPin, 
  Type, 
  Contrast, 
  Volume2, 
  VolumeX, 
  ChevronDown, 
  UserCircle2, 
  ShieldCheck,
  ShieldAlert,
  FileText,
  LogIn,
  UserPlus,
  LogOut,
  User
} from 'lucide-react';

export const Header = ({
  currentUser,
  onOpenAuthModal,
  onLogout,
  currentRole,
  onOpenRoleModal,
  selectedLocation,
  onLocationChange,
  isLargeFont,
  onToggleLargeFont,
  isHighContrast,
  onToggleHighContrast,
  isVoiceActive,
  onToggleVoice,
  activeTicketsCount,
  onOpenTicketsModal
}) => {
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);
  const roleData = ROLES[currentRole] || ROLES.production;
  const locationData = LOCATIONS.find(l => l.id === selectedLocation) || LOCATIONS[0];
  
  // Является ли текущий пользователь руководителем
  const isManager = Boolean(currentUser?.isManager || currentRole === 'manager');

  return (
    <header className="header-wrapper">
      <div className="header-content">
        
        {/* Брендовая секция: Логотипы Волков и Калина-Малина */}
        <div className="brand-section">
          <VolkovLogo className="h-7 sm:h-9" />
          <div className="brand-divider" />
          <KalinaMalinaLogo className="h-7 sm:h-9" />
          
          <div className="hidden lg:block pl-2">
            <span className="badge-tag badge-red">
              <ShieldCheck size={12} />
              Навигатор компании
            </span>
          </div>
        </div>

        {/* Правая панель: Локация, Роль, Вход/Регистрация, Заявки (только для руководителя) и Доступность */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          
          {/* Селектор производственной площадки / завода */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowLocationDropdown(!showLocationDropdown)}
              className="btn-pill"
              title="Выбрать предприятие или филиал"
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12.5px' }}
            >
              <MapPin size={14} color="var(--red-berry)" />
              <span style={{ maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {locationData.name.split('—')[0]}
              </span>
              <ChevronDown size={13} />
            </button>

            {showLocationDropdown && (
              <div 
                className="craft-card" 
                style={{
                  position: 'absolute',
                  top: '110%',
                  right: 0,
                  width: '280px',
                  zIndex: 60,
                  padding: '8px',
                  borderRadius: '14px',
                  boxShadow: 'var(--shadow-lg)'
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 600, color: 'var(--brown-light)', padding: '6px 10px', textTransform: 'uppercase' }}>
                  Площадки ВОЛКОВ ГРУПП:
                </div>
                {LOCATIONS.map(loc => (
                  <button
                    key={loc.id}
                    onClick={() => {
                      onLocationChange(loc.id);
                      setShowLocationDropdown(false);
                    }}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      background: loc.id === selectedLocation ? 'var(--red-soft)' : 'transparent',
                      color: loc.id === selectedLocation ? 'var(--red-berry)' : 'var(--brown-text)',
                      border: 'none',
                      fontWeight: loc.id === selectedLocation ? 600 : 500,
                      cursor: 'pointer',
                      fontSize: '13px'
                    }}
                  >
                    <div>{loc.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--brown-light)' }}>{loc.type}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Индикатор роли с кнопкой быстрой смены */}
          <button
            onClick={onOpenRoleModal}
            className="btn-secondary"
            style={{ 
              padding: '5px 12px', 
              borderRadius: '9999px',
              borderColor: 'var(--border-craft)',
              fontSize: '12.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
            title="Сменить профиль должности сотрудника"
          >
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: roleData.color }} />
            <span style={{ fontWeight: 600 }}>{roleData.badge}</span>
          </button>

          {/* ========================================================
              КНОПКА «ЗАЯВКИ» — ОТОБРАЖАЕТСЯ ИСКЛЮЧИТЕЛЬНО ДЛЯ РУКОВОДИТЕЛЯ
              ======================================================== */}
          {isManager && (
            <button
              onClick={onOpenTicketsModal}
              className="btn-pill"
              style={{ 
                background: 'linear-gradient(135deg, #FFF1F4 0%, #FAF0E6 100%)', 
                borderColor: 'var(--red-berry)',
                color: 'var(--red-berry)',
                fontWeight: 700,
                fontSize: '12.5px',
                padding: '6px 14px',
                boxShadow: '0 2px 8px rgba(229, 0, 70, 0.2)'
              }}
              title="Реестр и согласование заявок подчиненных сотрудников"
            >
              <ShieldCheck size={15} color="var(--red-berry)" />
              <span>Заявки сотрудников</span>
              {activeTicketsCount > 0 && (
                <span 
                  style={{ 
                    background: 'var(--red-berry)', 
                    color: '#fff', 
                    fontSize: '10.5px', 
                    borderRadius: '10px', 
                    padding: '1px 6px',
                    fontWeight: 800 
                  }}
                >
                  {activeTicketsCount}
                </span>
              )}
            </button>
          )}

          {/* ========================================================
              АВТОРИЗАЦИЯ И ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ
              ======================================================== */}
          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-cream)', padding: '3px 8px 3px 4px', borderRadius: '9999px', border: '1px solid var(--border-craft)' }}>
              <div 
                style={{ 
                  width: '26px', 
                  height: '26px', 
                  borderRadius: '50%', 
                  background: isManager ? 'var(--red-berry)' : 'var(--brown-text)', 
                  color: '#fff', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontSize: '11px',
                  fontWeight: 700
                }}
              >
                {isManager ? <ShieldCheck size={14} /> : currentUser.fullName?.charAt(0) || 'С'}
              </div>

              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--brown-dark)', maxWidth: '120px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {currentUser.fullName ? currentUser.fullName.split(' ')[0] : 'Сотрудник'}
              </div>

              <button
                onClick={onLogout}
                style={{ background: 'none', border: 'none', color: 'var(--brown-light)', cursor: 'pointer', padding: '2px', display: 'flex', alignItems: 'center' }}
                title="Выйти из профиля"
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {/* ВЫДЕЛЕННАЯ КНОПКА: ВХОД ДЛЯ РУКОВОДИТЕЛЯ */}
              <button
                onClick={() => onOpenAuthModal('login')}
                className="btn-pill"
                style={{ 
                  background: 'var(--red-soft)', 
                  borderColor: 'var(--red-berry)', 
                  color: 'var(--red-berry)',
                  fontWeight: 700,
                  fontSize: '12px',
                  padding: '6px 12px',
                  gap: '5px'
                }}
                title="Быстрый вход для руководителя (доступ к заявкам сотрудников)"
              >
                <ShieldCheck size={14} />
                <span>Вход для руководителя</span>
              </button>

              {/* Кнопка регистрации */}
              <button
                onClick={() => onOpenAuthModal('register')}
                className="btn-secondary"
                style={{ padding: '6px 10px', fontSize: '12px', borderRadius: '9999px' }}
                title="Зарегистрировать нового сотрудника"
              >
                <UserPlus size={14} />
                <span className="hidden sm:inline">Регистрация</span>
              </button>
            </div>
          )}

          {/* Панель доступности (Крупный шрифт, высокий контраст, звук) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '3px', background: 'var(--bg-cream)', padding: '2px', borderRadius: '12px', border: '1px solid var(--border-craft)' }}>
            <button
              onClick={onToggleLargeFont}
              className={`btn-pill ${isLargeFont ? 'active' : ''}`}
              style={{ padding: '5px 8px', minWidth: '30px', justifyContent: 'center' }}
              title={isLargeFont ? "Вернуть обычный шрифт" : "Крупный шрифт для удобного чтения"}
            >
              <Type size={14} />
              <span style={{ fontSize: '10px', fontWeight: 700 }}>A+</span>
            </button>

            <button
              onClick={onToggleHighContrast}
              className={`btn-pill ${isHighContrast ? 'active' : ''}`}
              style={{ padding: '5px 8px', minWidth: '30px', justifyContent: 'center' }}
              title="Высокий контраст"
            >
              <Contrast size={14} />
            </button>

            <button
              onClick={onToggleVoice}
              className={`btn-pill ${isVoiceActive ? 'active' : ''}`}
              style={{ padding: '5px 8px', minWidth: '30px', justifyContent: 'center' }}
              title={isVoiceActive ? "Голосовое озвучивание включено" : "Включить голосовое озвучивание"}
            >
              {isVoiceActive ? <Volume2 size={14} /> : <VolumeX size={14} />}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
