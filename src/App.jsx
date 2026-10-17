import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { ChatNavigator } from './components/ChatNavigator';
import { InteractiveMap } from './components/InteractiveMap';
import { CabinetsDirectory } from './components/CabinetsDirectory';
import { KnowledgeBase } from './components/KnowledgeBase';
import { RoleSelectorModal } from './components/RoleSelectorModal';
import { TicketModal } from './components/TicketModal';
import { AuthModal } from './components/AuthModal';
import { ROLES } from './data/companyData';
import { 
  MessageSquare, 
  MapPin, 
  Building2, 
  BookOpen, 
  FileText, 
  ShieldCheck, 
  Compass,
  CheckCircle2,
  HeartHandshake,
  Clock
} from 'lucide-react';

export default function App() {
  // Текущий авторизованный пользователь
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('volkov_current_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  // Активная роль сотрудника (синхронизирована с пользователем)
  const [currentRole, setCurrentRole] = useState(() => {
    return localStorage.getItem('volkov_user_role') || 'production';
  });

  // Вычисляем, является ли пользователь руководителем
  const isManager = Boolean(currentUser?.isManager || currentRole === 'manager');

  // Активная локация
  const [selectedLocation, setSelectedLocation] = useState('kemerovo-hq');

  // Активная вкладка навигации ('chat' | 'map' | 'directory' | 'kb' | 'tickets')
  const [activeTab, setActiveTab] = useState('chat');

  // Доступность
  const [isLargeFont, setIsLargeFont] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);

  // Модальные окна
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [initialTicketType, setInitialTicketType] = useState('2ndfl');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register'

  // Связка между компонентами
  const [chatInitialQuestion, setChatInitialQuestion] = useState(null);
  const [selectedDeptForMap, setSelectedDeptForMap] = useState('hr');

  // Список корпоративных заявок
  const [tickets, setTickets] = useState(() => {
    try {
      const saved = localStorage.getItem('volkov_company_tickets');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return [
      {
        id: 'TK-1042',
        createdAt: 'Сегодня, 10:30',
        type: '2ndfl',
        title: 'Заказ справки о доходах (2-НДФЛ)',
        fullName: 'Сидоров Михаил Сергеевич',
        departmentName: 'Колбасный цех №1',
        description: 'Справка за последние 12 месяцев для одобрения семейной ипотеки',
        deliveryMethod: 'В электронном виде в чат',
        status: 'Готово к выдаче',
        targetCabinet: 'Кабинет 218 (Бухгалтерия)',
        responsiblePerson: 'Татьяна Смирнова (доб. 2181)',
        managerResolution: 'Подписана главным бухгалтером, электронный скан загружен в чат.'
      },
      {
        id: 'TK-1055',
        createdAt: 'Сегодня, 09:15',
        type: 'uniform',
        title: 'Заявка на замену спецодежды или СИЗ',
        fullName: 'Петрова Елена Викторовна',
        departmentName: 'Фасовочно-упаковочный участок',
        description: 'Износ спецобуви (сапоги антискользящие, р. 38) и защитного фартука',
        deliveryMethod: 'Оригинал в кабинете',
        status: 'На рассмотрении',
        targetCabinet: 'Кабинет 115 (Охрана труда и СИЗ)',
        responsiblePerson: 'Надежда Федорова (доб. 1152)',
        managerResolution: null
      },
      {
        id: 'TK-1061',
        createdAt: 'Вчера, 16:40',
        type: 'it_support',
        title: 'Заявка в IT-поддержку: Сбой кассы Эвотор',
        fullName: 'Кузнецова Мария Дмитриевна',
        departmentName: 'Магазин «Калина-Малина» (пр. Шахтеров, 48)',
        description: 'Завис фискальный регистратор, ошибка связи с кассовым моноблоком',
        deliveryMethod: 'Удаленное подключение IT',
        status: 'В обработке',
        targetCabinet: 'Кабинет 108 (IT-служба)',
        responsiblePerson: 'Артем Белов (доб. 1124)',
        managerResolution: 'Инженер подключился удаленно для обновления фискального драйвера.'
      },
      {
        id: 'TK-1070',
        createdAt: 'Сегодня, 08:20',
        type: 'sick_leave',
        title: 'Уведомление об открытии больничного листа',
        fullName: 'Морозов Иван Александрович',
        departmentName: 'Транспортно-логистический отдел',
        description: 'ЭЛН №91002348123 открыт терапевтом поликлиники №5 с 16 по 23 октября',
        deliveryMethod: 'В электронном виде в чат',
        status: 'На рассмотрении',
        targetCabinet: 'Кабинет 214 (Отдел кадров)',
        responsiblePerson: 'Анна Соколова (доб. 2141)',
        managerResolution: null
      }
    ];
  });

  // Синхронизация заявок в LocalStorage
  useEffect(() => {
    localStorage.setItem('volkov_company_tickets', JSON.stringify(tickets));
  }, [tickets]);

  // Если не руководитель, вкладка заявок недоступна (перенаправляем на чат)
  const effectiveTab = (activeTab === 'tickets' && !isManager) ? 'chat' : activeTab;

  // Применение доступности к body
  useEffect(() => {
    if (isLargeFont) {
      document.body.classList.add('font-large');
    } else {
      document.body.classList.remove('font-large');
    }
  }, [isLargeFont]);

  useEffect(() => {
    if (isHighContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [isHighContrast]);

  const handleRoleSelect = (newRole) => {
    setCurrentRole(newRole);
    localStorage.setItem('volkov_user_role', newRole);
    if (currentUser) {
      const updated = { ...currentUser, role: newRole, isManager: newRole === 'manager' };
      setCurrentUser(updated);
      localStorage.setItem('volkov_current_user', JSON.stringify(updated));
    }
  };

  const handleOpenAuth = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    if (user.role) {
      setCurrentRole(user.role);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentRole('production');
    localStorage.removeItem('volkov_current_user');
    localStorage.setItem('volkov_user_role', 'production');
    if (activeTab === 'tickets') {
      setActiveTab('chat');
    }
  };

  const handleOpenTicketWithType = (type) => {
    setInitialTicketType(type);
    setIsTicketModalOpen(true);
  };

  const handleSelectOnMap = (deptId) => {
    setSelectedDeptForMap(deptId);
    setActiveTab('map');
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  const handleOpenChatWithQuestion = (question) => {
    setChatInitialQuestion(question);
    setActiveTab('chat');
    window.scrollTo({ top: 180, behavior: 'smooth' });
  };

  // Изменение статуса заявки руководителем
  const handleUpdateTicketStatus = (ticketId, newStatus, managerNote = '') => {
    setTickets(prev => prev.map(t => {
      if (t.id === ticketId) {
        return {
          ...t,
          status: newStatus,
          managerResolution: managerNote || t.managerResolution
        };
      }
      return t;
    }));
  };

  const roleData = ROLES[currentRole] || ROLES.production;

  return (
    <div className="app-container">
      
      {/* Верхний брендовый хедер с логотипом и разграничением прав */}
      <Header
        currentUser={currentUser}
        onOpenAuthModal={handleOpenAuth}
        onLogout={handleLogout}
        currentRole={currentRole}
        onOpenRoleModal={() => setIsRoleModalOpen(true)}
        selectedLocation={selectedLocation}
        onLocationChange={setSelectedLocation}
        isLargeFont={isLargeFont}
        onToggleLargeFont={() => setIsLargeFont(!isLargeFont)}
        isHighContrast={isHighContrast}
        onToggleHighContrast={() => setIsHighContrast(!isHighContrast)}
        isVoiceActive={isVoiceActive}
        onToggleVoice={() => setIsVoiceActive(!isVoiceActive)}
        activeTicketsCount={tickets.filter(t => t.status === 'На рассмотрении').length}
        onOpenTicketsModal={() => setIsTicketModalOpen(true)}
      />

      {/* Информационный приветственный баннер */}
      <div 
        className="craft-card" 
        style={{ 
          padding: '18px 24px', 
          marginBottom: '20px', 
          background: isManager 
            ? 'linear-gradient(135deg, #FFF1F4 0%, #FFFFFF 100%)' 
            : 'linear-gradient(135deg, #FFFFFF 0%, #FAF6F0 100%)',
          borderColor: isManager ? 'var(--red-berry)' : 'var(--border-craft)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '14px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div 
            style={{ 
              width: '46px', 
              height: '46px', 
              borderRadius: '14px', 
              background: isManager ? 'var(--red-berry)' : 'var(--red-soft)', 
              color: isManager ? '#fff' : 'var(--red-berry)',
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: '1px solid rgba(229, 0, 70, 0.2)'
            }}
          >
            {isManager ? <ShieldCheck size={26} /> : <Compass size={24} />}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 'var(--font-h3)', fontWeight: 800, color: 'var(--brown-dark)' }}>
                {isManager 
                  ? 'Кабинет руководителя: «ВОЛКОВ ГРУПП» & «Калина-Малина»' 
                  : 'Навигатор компании «Волков» & «Калина-Малина»'}
              </h1>
              {isManager ? (
                <span className="badge-tag badge-red" style={{ fontWeight: 800 }}>
                  <ShieldCheck size={12} />
                  Режим руководителя активен
                </span>
              ) : (
                <span className="badge-tag badge-red">
                  1000+ сотрудников
                </span>
              )}
            </div>
            <p style={{ fontSize: 'var(--font-small)', color: 'var(--brown-light)', marginTop: '2px' }}>
              {isManager 
                ? 'Вам открыт доступ к согласованию заявок, справок 2-НДФЛ, выдаче СИЗ и маршрутам по заводам.'
                : 'Единый помощник: быстрые ответы, точные указатели к кабинетам и доступ к услугам без очередей.'}
            </p>
          </div>
        </div>

        {/* Правый блок действий в баннере */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {isManager ? (
            <button
              onClick={() => setIsTicketModalOpen(true)}
              className="btn-primary"
              style={{ fontSize: '13px', padding: '8px 16px', gap: '6px' }}
            >
              <FileText size={16} />
              <span>Заявки на согласовании ({tickets.filter(t => t.status === 'На рассмотрении').length})</span>
            </button>
          ) : !currentUser ? (
            <button
              onClick={() => handleOpenAuth('login')}
              className="btn-pill"
              style={{ 
                fontSize: '12.5px', 
                padding: '8px 16px',
                background: 'var(--red-soft)',
                borderColor: 'var(--red-berry)',
                color: 'var(--red-berry)',
                fontWeight: 700 
              }}
            >
              <ShieldCheck size={15} />
              Вход для руководителя
            </button>
          ) : (
            <button
              onClick={() => handleRoleSelect('manager')}
              className="btn-pill"
              style={{ fontSize: '12px', padding: '6px 12px' }}
            >
              Переключить на руководителя
            </button>
          )}
        </div>
      </div>

      {/* Навигационные вкладки приложения */}
      <nav className="nav-tabs">
        <button
          onClick={() => setActiveTab('chat')}
          className={`nav-tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
        >
          <MessageSquare size={18} />
          <span>Чат-помощник</span>
        </button>

        <button
          onClick={() => setActiveTab('map')}
          className={`nav-tab-btn ${activeTab === 'map' ? 'active' : ''}`}
        >
          <MapPin size={18} />
          <span>Карта и маршруты</span>
        </button>

        <button
          onClick={() => setActiveTab('directory')}
          className={`nav-tab-btn ${activeTab === 'directory' ? 'active' : ''}`}
        >
          <Building2 size={18} />
          <span>Кабинеты и специалисты</span>
        </button>

        <button
          onClick={() => setActiveTab('kb')}
          className={`nav-tab-btn ${activeTab === 'kb' ? 'active' : ''}`}
        >
          <BookOpen size={18} />
          <span>База знаний</span>
        </button>

        {/* ========================================================
            ВКЛАДКА ЗАЯВОК: ОТОБРАЖАЕТСЯ ТОЛЬКО ЕСЛИ ВЫПОЛНЕН ВХОД ДЛЯ РУКОВОДИТЕЛЯ
            ======================================================== */}
        {isManager && (
          <button
            onClick={() => setActiveTab('tickets')}
            className={`nav-tab-btn ${activeTab === 'tickets' ? 'active' : ''}`}
            style={{ 
              color: activeTab === 'tickets' ? 'var(--red-berry)' : 'var(--brown-dark)',
              fontWeight: 700,
              background: activeTab === 'tickets' ? 'var(--red-soft)' : 'transparent',
              borderColor: activeTab === 'tickets' ? 'var(--red-berry)' : 'transparent'
            }}
          >
            <ShieldCheck size={18} color="var(--red-berry)" />
            <span>Заявки сотрудников ({tickets.length})</span>
          </button>
        )}
      </nav>

      {/* Основной контент по выбранной вкладке */}
      <main>
        {effectiveTab === 'chat' && (
          <ChatNavigator
            currentRole={currentRole}
            isVoiceActive={isVoiceActive}
            onSelectOnMap={handleSelectOnMap}
            onOpenTicketWithType={handleOpenTicketWithType}
            initialQuestion={chatInitialQuestion}
            onClearInitialQuestion={() => setChatInitialQuestion(null)}
          />
        )}

        {effectiveTab === 'map' && (
          <InteractiveMap
            selectedDeptId={selectedDeptForMap}
            onSelectDept={setSelectedDeptForMap}
            onOpenChatWithQuestion={handleOpenChatWithQuestion}
            onOpenTicketWithType={handleOpenTicketWithType}
          />
        )}

        {effectiveTab === 'directory' && (
          <CabinetsDirectory
            currentRole={currentRole}
            onSelectOnMap={handleSelectOnMap}
            onOpenChatWithQuestion={handleOpenChatWithQuestion}
            onOpenTicketWithType={handleOpenTicketWithType}
          />
        )}

        {effectiveTab === 'kb' && (
          <KnowledgeBase
            currentRole={currentRole}
            onOpenTicketWithType={handleOpenTicketWithType}
            onSelectOnMap={handleSelectOnMap}
            onOpenChatWithQuestion={handleOpenChatWithQuestion}
          />
        )}

        {/* Вкладка Заявок (доступна только руководителю) */}
        {effectiveTab === 'tickets' && isManager && (
          <div className="craft-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span className="badge-tag badge-red">
                    <ShieldCheck size={13} />
                    Реестр согласования руководителя
                  </span>
                </div>
                <h3 style={{ fontSize: 'var(--font-h2)', fontWeight: 800, color: 'var(--brown-dark)', marginTop: '4px' }}>
                  Управление заявками и справками сотрудников
                </h3>
                <p style={{ fontSize: 'var(--font-small)', color: 'var(--brown-light)' }}>
                  Все поданные справки 2-НДФЛ, требования на выдачу СИЗ, больничные и запросы на ремонт оборудования
                </p>
              </div>

              <button
                onClick={() => handleOpenTicketWithType('2ndfl')}
                className="btn-primary"
                style={{ padding: '8px 18px', fontSize: '13px' }}
              >
                + Создать служебное распоряжение
              </button>
            </div>

            {/* Карточки заявок */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {tickets.map(ticket => (
                <div 
                  key={ticket.id} 
                  className="craft-card" 
                  style={{ 
                    padding: '18px', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '10px',
                    borderLeft: ticket.status === 'На рассмотрении' ? '4px solid var(--red-berry)' : '4px solid var(--green-taiga)' 
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontWeight: 800, fontSize: '14px', color: 'var(--brown-dark)' }}>{ticket.id}</span>
                      <span className={`badge-tag ${ticket.status === 'Готово к выдаче' || ticket.status === 'Одобрено' ? 'badge-green' : 'badge-amber'}`}>
                        <Clock size={12} />
                        {ticket.status}
                      </span>
                      <span style={{ fontSize: '12px', color: 'var(--brown-light)' }}>{ticket.createdAt}</span>
                    </div>

                    <span className="badge-tag badge-brown">{ticket.targetCabinet}</span>
                  </div>

                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--brown-dark)' }}>{ticket.title}</h4>
                    <div style={{ fontSize: '13px', color: 'var(--brown-text)', marginTop: '2px' }}>
                      Сотрудник: <strong>{ticket.fullName}</strong> • Подразделение: <strong>{ticket.departmentName}</strong>
                    </div>
                  </div>

                  <div style={{ background: '#FAF7F2', padding: '10px 14px', borderRadius: '8px', fontSize: '13px', color: 'var(--brown-text)' }}>
                    {ticket.description && <div><strong>Детали:</strong> {ticket.description}</div>}
                    <div><strong>Формат выдачи:</strong> {ticket.deliveryMethod}</div>
                    {ticket.managerResolution && (
                      <div style={{ marginTop: '6px', color: 'var(--green-text)', fontWeight: 600 }}>
                        Резолюция руководителя: {ticket.managerResolution}
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: '8px', paddingTop: '4px' }}>
                    <button
                      onClick={() => handleUpdateTicketStatus(ticket.id, 'Одобрено', 'Согласовано руководителем. Документ подписан.')}
                      className="btn-primary"
                      style={{ padding: '6px 14px', fontSize: '12px', gap: '4px' }}
                    >
                      <CheckCircle2 size={14} />
                      Одобрить
                    </button>
                    <button
                      onClick={() => handleUpdateTicketStatus(ticket.id, 'В обработке', 'Принято в работу.')}
                      className="btn-pill"
                      style={{ padding: '6px 14px', fontSize: '12px', gap: '4px' }}
                    >
                      <Clock size={14} />
                      В работу
                    </button>
                    <button
                      onClick={() => handleUpdateTicketStatus(ticket.id, 'Готово к выдаче', 'Документ готов к выдаче в кабинете.')}
                      className="btn-pill"
                      style={{ padding: '6px 14px', fontSize: '12px', gap: '4px', background: 'var(--green-soft)', color: 'var(--green-text)', borderColor: 'var(--green-leaf)' }}
                    >
                      Готово к выдаче
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Модальное окно входа и регистрации */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        initialMode={authModalMode}
      />

      {/* Модальное окно выбора роли сотрудника */}
      <RoleSelectorModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
        currentRole={currentRole}
        onSelectRole={handleRoleSelect}
      />

      {/* Модальное окно онлайн-заявок и справок */}
      <TicketModal
        isOpen={isTicketModalOpen}
        onClose={() => setIsTicketModalOpen(false)}
        currentUser={currentUser}
        currentRole={currentRole}
        initialType={initialTicketType}
        tickets={tickets}
        onAddTicket={(newTicket) => setTickets(prev => [newTicket, ...prev])}
        onUpdateTicketStatus={handleUpdateTicketStatus}
      />

      {/* Корпоративный подвал */}
      <footer style={{ marginTop: '40px', paddingTop: '20px', borderTop: '1px solid var(--border-craft)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', fontSize: 'var(--font-small)', color: 'var(--brown-light)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HeartHandshake size={16} color="var(--red-berry)" />
          <span>Группа компаний «ВОЛКОВ ГРУПП» & Розничная сеть «Калина-Малина»</span>
        </div>
        <div>
          Внутренний навигатор сотрудника • Официальный портал предприятия
        </div>
      </footer>

    </div>
  );
}
