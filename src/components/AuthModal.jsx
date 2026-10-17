import React, { useState } from 'react';
import { 
  X, 
  User, 
  Lock, 
  Mail, 
  ShieldCheck, 
  ShieldAlert, 
  Check, 
  Briefcase,
  KeyRound,
  AlertCircle
} from 'lucide-react';
import { KalinaMalinaLogo, VolkovLogo } from './Logos';
import { ROLES } from '../data/companyData';

export const AuthModal = ({ 
  isOpen, 
  onClose, 
  onLoginSuccess,
  initialMode = 'login' 
}) => {
  const [mode, setMode] = useState(initialMode); // 'login' | 'register'
  
  // Поля входа
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  
  // Поля регистрации
  const [regFullName, setRegFullName] = useState('');
  const [regRole, setRegRole] = useState('production');
  const [regIdentifier, setRegIdentifier] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [managerSecretCode, setManagerSecretCode] = useState('VOLKOV2026');
  
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  // Быстрый вход для руководителя
  const handleFastManagerLogin = () => {
    const managerUser = {
      id: 'mgr-101',
      fullName: 'Александр Сергеевич Волков',
      email: 'volkov.lead@volkov-group.ru',
      badgeNumber: 'MGR-007',
      role: 'manager',
      isManager: true,
      department: 'Производственно-административное управление'
    };

    localStorage.setItem('volkov_current_user', JSON.stringify(managerUser));
    localStorage.setItem('volkov_user_role', 'manager');
    
    setSuccessMessage('Успешный вход в статусе Руководителя! Заявки сотрудников теперь доступны.');
    setTimeout(() => {
      onLoginSuccess(managerUser);
      onClose();
    }, 600);
  };

  // Быстрый вход для рядового сотрудника
  const handleFastEmployeeLogin = () => {
    const workerUser = {
      id: 'emp-204',
      fullName: 'Михаил Сергеевич Сидоров',
      email: 'sidorov.m@volkov-group.ru',
      badgeNumber: 'PRD-1042',
      role: 'production',
      isManager: false,
      department: 'Колбасный цех №1'
    };

    localStorage.setItem('volkov_current_user', JSON.stringify(workerUser));
    localStorage.setItem('volkov_user_role', 'production');

    setSuccessMessage('Вход выполнен: Работник производства.');
    setTimeout(() => {
      onLoginSuccess(workerUser);
      onClose();
    }, 600);
  };

  // Обычный вход по форме
  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!loginIdentifier.trim() || !loginPassword.trim()) {
      setErrorMessage('Пожалуйста, введите логин / email и пароль');
      return;
    }

    // Проверяем сохраненных зарегистрированных пользователей
    const savedUsers = JSON.parse(localStorage.getItem('volkov_registered_users') || '[]');
    const existing = savedUsers.find(u => 
      (u.email?.toLowerCase() === loginIdentifier.toLowerCase().trim() || 
       u.badgeNumber?.toLowerCase() === loginIdentifier.toLowerCase().trim() ||
       u.fullName?.toLowerCase().includes(loginIdentifier.toLowerCase().trim())) &&
      u.password === loginPassword
    );

    if (existing) {
      localStorage.setItem('volkov_current_user', JSON.stringify(existing));
      localStorage.setItem('volkov_user_role', existing.role);
      setSuccessMessage(`Добро пожаловать, ${existing.fullName}!`);
      setTimeout(() => {
        onLoginSuccess(existing);
        onClose();
      }, 600);
      return;
    }

    // Если пароль совпал с базовым демо-аккаунтом руководителя
    if (loginIdentifier.toLowerCase().includes('руководитель') || loginIdentifier.toLowerCase().includes('директор') || loginIdentifier.toLowerCase() === 'manager') {
      handleFastManagerLogin();
      return;
    }

    // Иначе создаем сессию обычного сотрудника
    const tempUser = {
      id: `user-${Date.now()}`,
      fullName: loginIdentifier.includes('@') ? loginIdentifier.split('@')[0] : loginIdentifier,
      email: loginIdentifier.includes('@') ? loginIdentifier : `${loginIdentifier}@volkov-group.ru`,
      badgeNumber: `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      role: 'production',
      isManager: false
    };

    localStorage.setItem('volkov_current_user', JSON.stringify(tempUser));
    localStorage.setItem('volkov_user_role', 'production');
    onLoginSuccess(tempUser);
    onClose();
  };

  // Регистрация нового сотрудника
  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!regFullName.trim()) {
      setErrorMessage('Укажите ваше ФИО');
      return;
    }
    if (!regIdentifier.trim()) {
      setErrorMessage('Укажите рабочий email или табельный номер');
      return;
    }
    if (!regPassword || regPassword.length < 4) {
      setErrorMessage('Пароль должен содержать минимум 4 символа');
      return;
    }

    const isSelectingManager = regRole === 'manager';
    if (isSelectingManager && managerSecretCode.trim() !== 'VOLKOV2026' && managerSecretCode.trim() !== '1234') {
      setErrorMessage('Неверный код доступа руководителя. Для теста введите VOLKOV2026');
      return;
    }

    const newUser = {
      id: `usr-${Date.now()}`,
      fullName: regFullName.trim(),
      email: regIdentifier.includes('@') ? regIdentifier.trim() : `${regIdentifier.trim()}@volkov-group.ru`,
      badgeNumber: regIdentifier.includes('@') ? `EMP-${Math.floor(1000 + Math.random() * 9000)}` : regIdentifier.trim(),
      password: regPassword,
      role: regRole,
      isManager: isSelectingManager,
      department: ROLES[regRole]?.title || 'Подразделение компании',
      registeredAt: new Date().toLocaleDateString('ru-RU')
    };

    // Сохраняем в список пользователей
    const savedUsers = JSON.parse(localStorage.getItem('volkov_registered_users') || '[]');
    savedUsers.push(newUser);
    localStorage.setItem('volkov_registered_users', JSON.stringify(savedUsers));

    // Авторизуем
    localStorage.setItem('volkov_current_user', JSON.stringify(newUser));
    localStorage.setItem('volkov_user_role', newUser.role);

    setSuccessMessage(
      isSelectingManager 
        ? 'Регистрация руководителя успешна! Заявки сотрудников станут видны.'
        : 'Регистрация успешна! Добро пожаловать в команду.'
    );

    setTimeout(() => {
      onLoginSuccess(newUser);
      onClose();
    }, 700);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: '580px', padding: '28px' }}>
        
        {/* Шапка модального окна */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <VolkovLogo className="h-6" />
            <div style={{ width: '1px', height: '20px', background: 'var(--border-craft)' }} />
            <KalinaMalinaLogo className="h-6" />
          </div>

          <button 
            onClick={onClose}
            className="btn-pill"
            style={{ padding: '8px', borderRadius: '50%' }}
            title="Закрыть"
          >
            <X size={18} />
          </button>
        </div>

        {/* Заголовок */}
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{ fontSize: 'var(--font-h2)', fontWeight: 800, color: 'var(--brown-dark)' }}>
            {mode === 'login' ? 'Авторизация в корпоративной сети' : 'Регистрация нового сотрудника'}
          </h2>
          <p style={{ fontSize: 'var(--font-small)', color: 'var(--brown-light)', marginTop: '4px' }}>
            {mode === 'login' 
              ? 'Войдите для персонального доступа к кабинетам, заявкам и внутренним услугам'
              : 'Создайте учетную запись сотрудника «Волков» или «Калина-Малина»'}
          </p>
        </div>

        {/* Вкладки: Вход / Регистрация */}
        <div style={{ display: 'flex', gap: '8px', background: 'var(--bg-cream)', padding: '4px', borderRadius: '12px', marginBottom: '20px', border: '1px solid var(--border-craft)' }}>
          <button
            type="button"
            onClick={() => { setMode('login'); setErrorMessage(''); }}
            className={`btn-pill ${mode === 'login' ? 'active' : ''}`}
            style={{ flex: 1, justifyContent: 'center', padding: '10px', fontWeight: 700 }}
          >
            Вход в систему
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setErrorMessage(''); }}
            className={`btn-pill ${mode === 'register' ? 'active' : ''}`}
            style={{ flex: 1, justifyContent: 'center', padding: '10px', fontWeight: 700 }}
          >
            Регистрация
          </button>
        </div>

        {/* Сообщения об ошибках или успехе */}
        {errorMessage && (
          <div style={{ background: '#FFF1F4', color: 'var(--red-berry)', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', border: '1px solid rgba(229, 0, 70, 0.2)' }}>
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div style={{ background: '#F2F5EB', color: 'var(--green-text)', padding: '10px 14px', borderRadius: '10px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', border: '1px solid rgba(144, 159, 94, 0.3)' }}>
            <Check size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* ========================================================
            РЕЖИМ 1: ВХОД В СИСТЕМУ
            ======================================================== */}
        {mode === 'login' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* СПЕЦИАЛЬНЫЙ БЛОК: ВХОД ДЛЯ РУКОВОДИТЕЛЯ */}
            <div 
              style={{ 
                background: 'linear-gradient(135deg, #FFF1F4 0%, #FAF0E6 100%)', 
                border: '2px solid var(--red-berry)', 
                borderRadius: '16px', 
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--red-berry)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '14px', color: 'var(--brown-dark)' }}>
                      Вход для руководителя
                    </div>
                    <div style={{ fontSize: '11.5px', color: 'var(--brown-light)' }}>
                      Открывает доступ к разделу «Заявки» и согласованию обращений
                    </div>
                  </div>
                </div>

                <span className="badge-tag badge-red" style={{ fontSize: '10px', fontWeight: 700 }}>
                  Руководитель
                </span>
              </div>

              <button
                type="button"
                onClick={handleFastManagerLogin}
                className="btn-primary"
                style={{ 
                  width: '100%', 
                  justifyContent: 'center', 
                  padding: '10px', 
                  fontWeight: 700,
                  fontSize: '13.5px',
                  background: 'linear-gradient(135deg, #E50046 0%, #C8102E 100%)' 
                }}
              >
                <ShieldCheck size={16} />
                Войти как Руководитель (А. С. Волков)
              </button>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '4px 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-craft)' }} />
              <span style={{ fontSize: '11px', color: 'var(--brown-light)', textTransform: 'uppercase', fontWeight: 600 }}>
                или вход по логину сотрудника
              </span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-craft)' }} />
            </div>

            {/* Форма логина */}
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--brown-text)', marginBottom: '5px' }}>
                  Табельный номер или рабочий email:
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} color="var(--brown-light)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                  <input
                    type="text"
                    value={loginIdentifier}
                    onChange={e => setLoginIdentifier(e.target.value)}
                    placeholder="sidorov.m@volkov-group.ru или PRD-1042"
                    className="chat-input"
                    style={{ width: '100%', paddingLeft: '38px', borderRadius: '10px', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--brown-text)', marginBottom: '5px' }}>
                  Пароль:
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} color="var(--brown-light)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                  <input
                    type="password"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="chat-input"
                    style={{ width: '100%', paddingLeft: '38px', borderRadius: '10px', fontSize: '13px' }}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'center', padding: '10px', fontWeight: 600, marginTop: '4px' }}
              >
                Войти в учетную запись
              </button>

              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
                <button
                  type="button"
                  onClick={handleFastEmployeeLogin}
                  style={{ background: 'none', border: 'none', color: 'var(--brown-light)', fontSize: '12px', cursor: 'pointer', textDecoration: 'underline' }}
                >
                  Быстрый вход: Работник цеха (М. С. Сидоров)
                </button>
              </div>
            </form>

          </div>
        ) : (
          /* ========================================================
             РЕЖИМ 2: РЕГИСТРАЦИЯ СОТРУДНИКА
             ======================================================== */
          <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--brown-text)', marginBottom: '5px' }}>
                ФИО сотрудника полностью:
              </label>
              <div style={{ position: 'relative' }}>
                <User size={16} color="var(--brown-light)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                <input
                  type="text"
                  value={regFullName}
                  onChange={e => setRegFullName(e.target.value)}
                  placeholder="Иванов Петр Сергеевич"
                  className="chat-input"
                  style={{ width: '100%', paddingLeft: '38px', borderRadius: '10px', fontSize: '13px' }}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--brown-text)', marginBottom: '5px' }}>
                Категория должности и профиль доступа:
              </label>
              <select
                value={regRole}
                onChange={e => setRegRole(e.target.value)}
                className="chat-input"
                style={{ width: '100%', borderRadius: '10px', fontSize: '13px', cursor: 'pointer' }}
              >
                <option value="production">Работник производства (Мясокомбинат)</option>
                <option value="retail">Сотрудник розницы «Калина-Малина»</option>
                <option value="office">Офисный специалист (Центральный офис)</option>
                <option value="onboarding">Новый сотрудник (Онбординг)</option>
                <option value="manager">★ Руководитель / Начальник смены (Доступ к заявкам)</option>
              </select>
            </div>

            {/* Специальное подтверждение, если регистрируется руководитель */}
            {regRole === 'manager' && (
              <div style={{ background: 'var(--red-soft)', border: '1px dashed var(--red-berry)', borderRadius: '10px', padding: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700, color: 'var(--red-berry)', marginBottom: '4px' }}>
                  <ShieldAlert size={15} />
                  Регистрация руководителя
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--brown-text)', marginBottom: '8px' }}>
                  Для доступа к заявкам и личным данным сотрудников введите корпоративный код подтверждения (для теста: <strong>VOLKOV2026</strong>):
                </div>
                <div style={{ position: 'relative' }}>
                  <KeyRound size={15} color="var(--red-berry)" style={{ position: 'absolute', left: '10px', top: '11px' }} />
                  <input
                    type="text"
                    value={managerSecretCode}
                    onChange={e => setManagerSecretCode(e.target.value)}
                    placeholder="Код подтверждения"
                    className="chat-input"
                    style={{ width: '100%', paddingLeft: '34px', borderRadius: '8px', fontSize: '12.5px', background: '#FFFFFF' }}
                  />
                </div>
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--brown-text)', marginBottom: '5px' }}>
                Табельный номер или корпоративный Email:
              </label>
              <div style={{ position: 'relative' }}>
                <Briefcase size={16} color="var(--brown-light)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                <input
                  type="text"
                  value={regIdentifier}
                  onChange={e => setRegIdentifier(e.target.value)}
                  placeholder="Например, PRD-5501 или ivanov.p@volkov-group.ru"
                  className="chat-input"
                  style={{ width: '100%', paddingLeft: '38px', borderRadius: '10px', fontSize: '13px' }}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--brown-text)', marginBottom: '5px' }}>
                Пароль для входа:
              </label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} color="var(--brown-light)" style={{ position: 'absolute', left: '12px', top: '13px' }} />
                <input
                  type="password"
                  value={regPassword}
                  onChange={e => setRegPassword(e.target.value)}
                  placeholder="Минимум 4 символа"
                  className="chat-input"
                  style={{ width: '100%', paddingLeft: '38px', borderRadius: '10px', fontSize: '13px' }}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center', padding: '11px', fontWeight: 700, fontSize: '14px', marginTop: '6px' }}
            >
              Зарегистрироваться и войти
            </button>

          </form>
        )}

      </div>
    </div>
  );
};
