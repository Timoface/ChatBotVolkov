import React, { useState } from 'react';
import { 
  X, 
  Send, 
  CheckCircle2, 
  Clock, 
  FileText, 
  ShieldCheck, 
  Check, 
  Search, 
  Building2, 
  User, 
  MessageSquare
} from 'lucide-react';

export const TicketModal = ({ 
  isOpen, 
  onClose, 
  currentUser,
  currentRole, 
  initialType = "2ndfl",
  tickets = [],
  onAddTicket,
  onUpdateTicketStatus 
}) => {
  const isManager = currentUser?.isManager || currentRole === 'manager';

  const [activeTab, setActiveTab] = useState(isManager ? 'manager_inbox' : 'create'); // 'manager_inbox' | 'create' | 'history'
  const [filterStatus, setFilterStatus] = useState('all'); // 'all' | 'new' | 'progress' | 'done'
  const [searchQuery, setSearchQuery] = useState('');
  
  // Поля формы подачи заявки
  const [ticketType, setTicketType] = useState(initialType);
  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [departmentName, setDepartmentName] = useState(currentUser?.department || '');
  const [description, setDescription] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState('digital'); // 'digital' or 'paper'
  const [isSuccess, setIsSuccess] = useState(false);

  // Резолюция руководителя
  const [respondingTicketId, setRespondingTicketId] = useState(null);
  const [managerNote, setManagerNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    const newTicket = {
      id: `TK-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ', ' + new Date().toLocaleDateString('ru-RU'),
      type: ticketType,
      title: getTicketTitle(ticketType),
      fullName: fullName.trim(),
      departmentName: departmentName.trim() || 'Не указан',
      description: description.trim(),
      deliveryMethod: deliveryMethod === 'digital' ? 'В электронном виде в чат' : 'Оригинал с печатью в кабинете',
      status: 'На рассмотрении',
      targetCabinet: getTargetCabinet(ticketType),
      responsiblePerson: getResponsiblePerson(ticketType),
      managerResolution: null
    };

    onAddTicket(newTicket);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      setActiveTab(isManager ? 'manager_inbox' : 'history');
    }, 1000);
  };

  function getTicketTitle(type) {
    switch (type) {
      case '2ndfl': return 'Заказ справки о доходах (2-НДФЛ)';
      case 'work_cert': return 'Заказ справки с места работы';
      case 'archive_doc': return 'Заказ архивной справки / копии приказа';
      case 'it_support': return 'Заявка в IT-поддержку / Оборудование';
      case 'uniform': return 'Заявка на замену спецодежды или СИЗ';
      case 'hr_question': return 'Обращение к кадровому специалисту';
      case 'sick_leave': return 'Уведомление об открытии больничного листа';
      default: return 'Обращение во внутреннюю службу';
    }
  }

  function getTargetCabinet(type) {
    switch (type) {
      case '2ndfl': return 'Кабинет 218 (Бухгалтерия)';
      case 'archive_doc': return 'Кабинет 222 (Архив)';
      case 'work_cert':
      case 'hr_question':
      case 'sick_leave': return 'Кабинет 214 (Отдел кадров)';
      case 'it_support': return 'Кабинет 108 (IT-служба)';
      case 'uniform': return 'Кабинет 115 (Охрана труда и СИЗ)';
      default: return 'Кабинет 105 (АХО)';
    }
  }

  function getResponsiblePerson(type) {
    switch (type) {
      case '2ndfl': return 'Татьяна Смирнова (доб. 2181)';
      case 'archive_doc': return 'Валентина Федосеева (доб. 2221)';
      case 'work_cert':
      case 'hr_question': return 'Анна Соколова (доб. 2141)';
      case 'it_support': return 'Денис Васильев / Артем Белов (доб. 1122)';
      case 'uniform': return 'Надежда Федорова (доб. 1152)';
      default: return 'Дежурный администратор';
    }
  }

  const handleStatusChange = (ticketId, newStatus, note = '') => {
    if (onUpdateTicketStatus) {
      onUpdateTicketStatus(ticketId, newStatus, note);
    }
    setRespondingTicketId(null);
    setManagerNote('');
  };

  // Фильтрация заявок для руководителя
  const filteredTickets = tickets.filter(ticket => {
    if (filterStatus === 'new' && ticket.status !== 'На рассмотрении' && ticket.status !== 'В обработке') return false;
    if (filterStatus === 'progress' && ticket.status !== 'В обработке') return false;
    if (filterStatus === 'done' && ticket.status !== 'Готово к выдаче' && ticket.status !== 'Одобрено') return false;

    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return ticket.id.toLowerCase().includes(q) ||
           ticket.fullName.toLowerCase().includes(q) ||
           ticket.title.toLowerCase().includes(q) ||
           ticket.departmentName.toLowerCase().includes(q);
  });

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-dialog" 
        onClick={e => e.stopPropagation()} 
        style={{ maxWidth: isManager ? '780px' : '640px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
      >
        
        {/* Шапка модального окна */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', shrink: 0 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {isManager ? (
                <span className="badge-tag badge-red" style={{ fontSize: '11px', fontWeight: 800 }}>
                  <ShieldCheck size={13} />
                  Панель Руководителя
                </span>
              ) : (
                <span className="badge-tag badge-brown" style={{ fontSize: '11px' }}>
                  Сервисы для сотрудников
                </span>
              )}
            </div>
            <h2 style={{ fontSize: 'var(--font-h2)', fontWeight: 800, color: 'var(--brown-dark)', marginTop: '4px' }}>
              {isManager ? 'Реестр заявок и обращений сотрудников' : 'Внутренние заявки и справки'}
            </h2>
            <p style={{ fontSize: 'var(--font-small)', color: 'var(--brown-light)' }}>
              {isManager 
                ? 'Согласование справок 2-НДФЛ, замены СИЗ, больничных и обращений подчиненных'
                : 'Быстрое оформление справок и обращений без очередей'}
            </p>
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

        {/* Переключатель вкладок */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', borderBottom: '1px solid var(--border-craft)', paddingBottom: '10px', shrink: 0 }}>
          {isManager && (
            <button
              onClick={() => setActiveTab('manager_inbox')}
              className={`btn-pill ${activeTab === 'manager_inbox' ? 'active' : ''}`}
              style={{ padding: '8px 16px', fontWeight: 700 }}
            >
              Входящие заявки ({tickets.length})
            </button>
          )}

          <button
            onClick={() => setActiveTab('create')}
            className={`btn-pill ${activeTab === 'create' ? 'active' : ''}`}
            style={{ padding: '8px 16px', fontWeight: 600 }}
          >
            + Подать заявку
          </button>

          {!isManager && (
            <button
              onClick={() => setActiveTab('history')}
              className={`btn-pill ${activeTab === 'history' ? 'active' : ''}`}
              style={{ padding: '8px 16px', fontWeight: 600 }}
            >
              Мои заявки ({tickets.length})
            </button>
          )}
        </div>

        {/* Контент модального окна с прокруткой */}
        <div style={{ overflowY: 'auto', paddingRight: '4px', flex: 1 }}>

          {/* ========================================================
              РЕЖИМ РУКОВОДИТЕЛЯ: СПИСОК ВСЕХ ЗАЯВОК И УПРАВЛЕНИЕ
              ======================================================== */}
          {activeTab === 'manager_inbox' && isManager && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Панель фильтров и статистики */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', background: 'var(--bg-cream)', padding: '10px 14px', borderRadius: '12px', border: '1px solid var(--border-craft)' }}>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => setFilterStatus('all')}
                    className={`btn-pill ${filterStatus === 'all' ? 'active' : ''}`}
                    style={{ padding: '4px 10px', fontSize: '11.5px' }}
                  >
                    Все ({tickets.length})
                  </button>
                  <button
                    onClick={() => setFilterStatus('new')}
                    className={`btn-pill ${filterStatus === 'new' ? 'active' : ''}`}
                    style={{ padding: '4px 10px', fontSize: '11.5px' }}
                  >
                    На рассмотрении ({tickets.filter(t => t.status === 'На рассмотрении').length})
                  </button>
                  <button
                    onClick={() => setFilterStatus('done')}
                    className={`btn-pill ${filterStatus === 'done' ? 'active' : ''}`}
                    style={{ padding: '4px 10px', fontSize: '11.5px' }}
                  >
                    Готово ({tickets.filter(t => t.status === 'Готово к выдаче' || t.status === 'Одобрено').length})
                  </button>
                </div>

                <div style={{ position: 'relative', width: '200px' }}>
                  <Search size={14} color="var(--brown-light)" style={{ position: 'absolute', left: '10px', top: '9px' }} />
                  <input
                    type="text"
                    placeholder="Поиск по ФИО..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="chat-input"
                    style={{ width: '100%', paddingLeft: '30px', paddingRight: '8px', paddingTop: '5px', paddingBottom: '5px', fontSize: '12px', borderRadius: '8px' }}
                  />
                </div>
              </div>

              {/* Список заявок */}
              {filteredTickets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--brown-light)' }}>
                  <CheckCircle2 size={36} color="var(--green-taiga)" style={{ margin: '0 auto 10px auto' }} />
                  <div style={{ fontWeight: 700, fontSize: 'var(--font-body)', color: 'var(--brown-dark)' }}>
                    Нет активных заявок по данному фильтру
                  </div>
                  <div style={{ fontSize: '12px', marginTop: '4px' }}>
                    Все поступившие запросы сотрудников обработаны или еще не поданы.
                  </div>
                </div>
              ) : (
                filteredTickets.map(ticket => {
                  const isPending = ticket.status === 'На рассмотрении' || ticket.status === 'В обработке';
                  const isDone = ticket.status === 'Готово к выдаче' || ticket.status === 'Одобрено';

                  return (
                    <div 
                      key={ticket.id}
                      className="craft-card"
                      style={{ 
                        padding: '16px', 
                        display: 'flex', 
                        flexDirection: 'column', 
                        gap: '10px',
                        borderLeft: isPending ? '4px solid var(--red-berry)' : '4px solid var(--green-taiga)' 
                      }}
                    >
                      {/* Верхняя строка: Номер, дата, статус */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontWeight: 800, fontSize: '13.5px', color: 'var(--brown-dark)' }}>
                            {ticket.id}
                          </span>
                          <span className={`badge-tag ${isDone ? 'badge-green' : 'badge-amber'}`} style={{ fontSize: '11px', fontWeight: 700 }}>
                            <Clock size={11} />
                            {ticket.status}
                          </span>
                          <span style={{ fontSize: '11px', color: 'var(--brown-light)' }}>
                            {ticket.createdAt}
                          </span>
                        </div>

                        <span className="badge-tag badge-brown" style={{ fontSize: '11px' }}>
                          {ticket.targetCabinet}
                        </span>
                      </div>

                      {/* Название заявки и заявитель */}
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '14.5px', color: 'var(--brown-dark)' }}>
                          {ticket.title}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '12.5px', color: 'var(--brown-text)', marginTop: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                            <User size={13} color="var(--red-berry)" />
                            <strong>{ticket.fullName}</strong>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--brown-light)' }}>
                            <Building2 size={13} />
                            <span>{ticket.departmentName}</span>
                          </div>
                        </div>
                      </div>

                      {/* Описание и формат */}
                      <div style={{ background: '#FAF7F2', padding: '10px 12px', borderRadius: '8px', fontSize: '12.5px', color: 'var(--brown-text)', lineHeight: 1.4 }}>
                        {ticket.description && (
                          <div style={{ marginBottom: '4px' }}>
                            <strong>Детали от сотрудника:</strong> {ticket.description}
                          </div>
                        )}
                        <div>
                          <strong>Формат выдачи:</strong> {ticket.deliveryMethod}
                        </div>
                        {ticket.managerResolution && (
                          <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: '1px dashed var(--border-craft)', color: 'var(--green-text)', fontWeight: 600 }}>
                            Резолюция руководителя: {ticket.managerResolution}
                          </div>
                        )}
                      </div>

                      {/* Кнопки действий руководителя */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', paddingTop: '4px' }}>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => handleStatusChange(ticket.id, 'Одобрено', 'Согласовано руководителем смены. Передано на выдачу.')}
                            className="btn-primary"
                            style={{ padding: '6px 12px', fontSize: '12px', gap: '4px' }}
                            title="Одобрить заявку сотрудника"
                          >
                            <Check size={14} />
                            Одобрить
                          </button>

                          <button
                            onClick={() => handleStatusChange(ticket.id, 'В обработке', 'Принято в работу ответственным специалистом.')}
                            className="btn-pill"
                            style={{ padding: '6px 12px', fontSize: '12px', gap: '4px' }}
                            title="Взять в работу"
                          >
                            <Clock size={14} />
                            В работу
                          </button>

                          <button
                            onClick={() => handleStatusChange(ticket.id, 'Готово к выдаче', 'Документ готов к выдаче сотруднику.')}
                            className="btn-pill"
                            style={{ padding: '6px 12px', fontSize: '12px', gap: '4px', background: 'var(--green-soft)', color: 'var(--green-text)', borderColor: 'var(--green-leaf)' }}
                            title="Пометить как готово к выдаче"
                          >
                            <CheckCircle2 size={14} />
                            Готово к выдаче
                          </button>
                        </div>

                        <button
                          onClick={() => setRespondingTicketId(respondingTicketId === ticket.id ? null : ticket.id)}
                          style={{ background: 'none', border: 'none', color: 'var(--brown-light)', fontSize: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'underline' }}
                        >
                          <MessageSquare size={13} />
                          {respondingTicketId === ticket.id ? 'Скрыть ответ' : 'Написать комментарий'}
                        </button>
                      </div>

                      {/* Поле ответа руководителя */}
                      {respondingTicketId === ticket.id && (
                        <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
                          <input
                            type="text"
                            placeholder="Напишите комментарий сотруднику (например: Заберите в каб. 218 после 14:00)..."
                            value={managerNote}
                            onChange={e => setManagerNote(e.target.value)}
                            className="chat-input"
                            style={{ flex: 1, fontSize: '12.5px', borderRadius: '8px' }}
                          />
                          <button
                            onClick={() => handleStatusChange(ticket.id, ticket.status, managerNote || 'Комментарий добавлен')}
                            className="btn-primary"
                            style={{ padding: '6px 14px', fontSize: '12px' }}
                          >
                            Сохранить
                          </button>
                        </div>
                      )}

                    </div>
                  );
                })
              )}

            </div>
          )}

          {/* ========================================================
              РЕЖИМ СОЗДАНИЯ ЗАЯВКИ
              ======================================================== */}
          {activeTab === 'create' && (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-small)', fontWeight: 600, marginBottom: '6px', color: 'var(--brown-text)' }}>
                  Что вам требуется?
                </label>
                <select
                  value={ticketType}
                  onChange={e => setTicketType(e.target.value)}
                  className="chat-input"
                  style={{ width: '100%', cursor: 'pointer', borderRadius: '10px' }}
                >
                  <option value="2ndfl">Справка о доходах (2-НДФЛ для кредита/ипотеки)</option>
                  <option value="work_cert">Справка с места работы (для визы/соцзащиты)</option>
                  <option value="archive_doc">Архивная справка о стаже / выписка из архива (Каб. 222)</option>
                  <option value="it_support">Заявка в IT-поддержку (касса, 1С, пароль, почта)</option>
                  <option value="uniform">Замена спецодежды или средств защиты (СИЗ)</option>
                  <option value="sick_leave">Сообщить номер больничного листа</option>
                  <option value="hr_question">Вопрос в отдел кадров / консультация</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--font-small)', fontWeight: 600, marginBottom: '6px', color: 'var(--brown-text)' }}>
                    Ваше ФИО *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Иванов Иван Иванович"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="chat-input"
                    style={{ width: '100%', borderRadius: '10px' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 'var(--font-small)', fontWeight: 600, marginBottom: '6px', color: 'var(--brown-text)' }}>
                    Цех / Магазин / Отдел
                  </label>
                  <input
                    type="text"
                    placeholder="Например: Колбасный цех №1"
                    value={departmentName}
                    onChange={e => setDepartmentName(e.target.value)}
                    className="chat-input"
                    style={{ width: '100%', borderRadius: '10px' }}
                  />
                </div>
              </div>

              {(ticketType === '2ndfl' || ticketType === 'work_cert') && (
                <div>
                  <label style={{ display: 'block', fontSize: 'var(--font-small)', fontWeight: 600, marginBottom: '6px', color: 'var(--brown-text)' }}>
                    Формат получения справки:
                  </label>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <label 
                      style={{ 
                        flex: 1, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        padding: '10px 14px', 
                        border: '1.5px solid var(--border-craft)', 
                        borderRadius: '10px', 
                        background: deliveryMethod === 'digital' ? 'var(--red-soft)' : '#fff',
                        borderColor: deliveryMethod === 'digital' ? 'var(--red-berry)' : 'var(--border-craft)',
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                    >
                      <input
                        type="radio"
                        name="delivery"
                        value="digital"
                        checked={deliveryMethod === 'digital'}
                        onChange={() => setDeliveryMethod('digital')}
                      />
                      <span>Электронный скан в чат</span>
                    </label>

                    <label 
                      style={{ 
                        flex: 1, 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        padding: '10px 14px', 
                        border: '1.5px solid var(--border-craft)', 
                        borderRadius: '10px', 
                        background: deliveryMethod === 'paper' ? 'var(--red-soft)' : '#fff',
                        borderColor: deliveryMethod === 'paper' ? 'var(--red-berry)' : 'var(--border-craft)',
                        cursor: 'pointer',
                        fontSize: '13px'
                      }}
                    >
                      <input
                        type="radio"
                        name="delivery"
                        value="paper"
                        checked={deliveryMethod === 'paper'}
                        onChange={() => setDeliveryMethod('paper')}
                      />
                      <span>Бумажный оригинал с печатью</span>
                    </label>
                  </div>
                </div>
              )}

              <div>
                <label style={{ display: 'block', fontSize: 'var(--font-small)', fontWeight: 600, marginBottom: '6px', color: 'var(--brown-text)' }}>
                  Уточнение или текст вопроса (необязательно)
                </label>
                <textarea
                  rows={3}
                  placeholder="Укажите период для справки, размер обуви или код ошибки кассы..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="chat-input"
                  style={{ width: '100%', resize: 'vertical', borderRadius: '10px' }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
                <div style={{ fontSize: 'var(--font-tiny)', color: 'var(--brown-light)' }}>
                  {isManager ? 'Заявка будет сразу зарегистрирована в системе' : 'Руководитель и исполнитель получат уведомление'}
                </div>

                <button
                  type="submit"
                  disabled={isSuccess}
                  className="btn-primary"
                  style={{ minWidth: '180px', justifyContent: 'center' }}
                >
                  {isSuccess ? (
                    <>
                      <CheckCircle2 size={18} />
                      Заявка отправлена!
                    </>
                  ) : (
                    <>
                      <Send size={16} />
                      Отправить заявку
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

          {/* ========================================================
              РЕЖИМ ОБЫЧНОГО СОТРУДНИКА: МОИ ЗАЯВКИ
              ======================================================== */}
          {activeTab === 'history' && !isManager && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {tickets.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--brown-light)' }}>
                  <FileText size={36} style={{ margin: '0 auto 10px auto', opacity: 0.5 }} />
                  <div style={{ fontWeight: 600, fontSize: 'var(--font-body)', color: 'var(--brown-dark)' }}>
                    У вас пока нет активных заявок
                  </div>
                </div>
              ) : (
                tickets.map(ticket => (
                  <div 
                    key={ticket.id} 
                    className="craft-card" 
                    style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 700, fontSize: '13px', color: 'var(--brown-dark)' }}>
                          {ticket.id}
                        </span>
                        <span className="badge-tag badge-amber" style={{ fontSize: '11px' }}>
                          <Clock size={12} />
                          {ticket.status}
                        </span>
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--brown-light)' }}>
                        {ticket.createdAt}
                      </span>
                    </div>

                    <div style={{ fontWeight: 600, fontSize: '14px', color: 'var(--brown-dark)' }}>
                      {ticket.title}
                    </div>

                    <div style={{ fontSize: '12.5px', color: 'var(--brown-text)', background: 'var(--bg-cream)', padding: '8px 12px', borderRadius: '8px' }}>
                      <div><strong>Кабинет:</strong> {ticket.targetCabinet}</div>
                      <div><strong>Ответственный:</strong> {ticket.responsiblePerson}</div>
                      {ticket.managerResolution && (
                        <div style={{ marginTop: '4px', color: 'var(--green-text)', fontWeight: 600 }}>
                          Резолюция: {ticket.managerResolution}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
