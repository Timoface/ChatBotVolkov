import React, { useState } from 'react';
import { DEPARTMENTS, ROLES } from '../data/companyData';
import { 
  Search, 
  MapPin, 
  Clock, 
  Phone, 
  Mail, 
  Users, 
  Navigation, 
  FileText, 
  MessageSquare,
  Sparkles,
  ChevronRight,
  Filter
} from 'lucide-react';

export const CabinetsDirectory = ({ 
  currentRole, 
  onSelectOnMap, 
  onOpenChatWithQuestion, 
  onOpenTicketWithType 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterOnlyForRole, setFilterOnlyForRole] = useState(false);

  const filteredDepts = DEPARTMENTS.filter(dept => {
    // Фильтр по роли, если включен
    if (filterOnlyForRole && !dept.rolesAllowed.includes(currentRole)) {
      return false;
    }

    if (!searchQuery.trim()) return true;

    const q = searchQuery.toLowerCase();
    const matchTitle = dept.title.toLowerCase().includes(q) || dept.shortTitle.toLowerCase().includes(q);
    const matchRoom = dept.room.toLowerCase().includes(q);
    const matchSpecialists = dept.specialists.some(s => s.name.toLowerCase().includes(q) || s.role.toLowerCase().includes(q));
    const matchServices = dept.services.some(srv => srv.toLowerCase().includes(q));
    const matchChief = dept.chief.toLowerCase().includes(q);

    return matchTitle || matchRoom || matchSpecialists || matchServices || matchChief;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Поисковая панель и фильтры */}
      <div className="craft-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <h3 style={{ fontSize: 'var(--font-h3)', fontWeight: 700, color: 'var(--brown-dark)' }}>
              Справочник кабинетов и специалистов
            </h3>
            <p style={{ fontSize: 'var(--font-small)', color: 'var(--brown-light)' }}>
              Более 8 подразделений, 25 специалистов и прямые внутренние телефоны без лишних переключений
            </p>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px' }}>
            <input 
              type="checkbox"
              checked={filterOnlyForRole}
              onChange={e => setFilterOnlyForRole(e.target.checked)}
              style={{ accentColor: 'var(--red-berry)', width: '16px', height: '16px' }}
            />
            <span style={{ fontWeight: 600, color: 'var(--brown-text)' }}>
              Только профильные для роли ({ROLES[currentRole]?.badge})
            </span>
          </label>
        </div>

        {/* Инпут поиска */}
        <div style={{ position: 'relative' }}>
          <Search size={18} color="var(--brown-light)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Поиск по номеру кабинета (напр. 214), фамилии специалиста, справке или услуге..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="chat-input"
            style={{ width: '100%', paddingLeft: '46px', fontSize: '15px' }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', border: 'none', background: 'none', cursor: 'pointer', color: 'var(--brown-light)', fontSize: '14px' }}
            >
              Очистить
            </button>
          )}
        </div>

        {/* Быстрые теги поиска */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: 'var(--brown-light)' }}>Быстрый поиск:</span>
          {["Кадры", "2-НДФЛ", "Больничный", "Спецодежда", "IT-поддержка", "Санкнижка", "Касса", "Юрист"].map(tag => (
            <button
              key={tag}
              onClick={() => setSearchQuery(tag)}
              className="btn-pill"
              style={{ padding: '4px 10px', fontSize: '12px' }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Список отделов и кабинетов в виде адаптивной сетки */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '20px' }}>
        {filteredDepts.map(dept => (
          <div 
            key={dept.id} 
            className="craft-card" 
            style={{ 
              padding: '22px', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between',
              gap: '16px' 
            }}
          >
            <div>
              {/* Верхняя строка: Номер кабинета и статус */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span className="badge-tag badge-red" style={{ fontSize: '12px', fontWeight: 800 }}>
                  {dept.room}
                </span>
                <span className="badge-tag badge-brown" style={{ fontSize: '11px' }}>
                  {dept.floor}
                </span>
              </div>

              {/* Название отдела */}
              <h4 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--brown-dark)', marginBottom: '4px' }}>
                {dept.title}
              </h4>
              <div style={{ fontSize: '13px', color: 'var(--brown-light)', marginBottom: '14px' }}>
                {dept.building}
              </div>

              {/* Маршрут как пройти */}
              <div style={{ background: 'var(--bg-cream)', padding: '10px 12px', borderRadius: '10px', border: '1px solid var(--border-craft)', marginBottom: '14px', fontSize: '12.5px', color: 'var(--brown-text)', lineHeight: 1.4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 600, color: 'var(--red-berry)', marginBottom: '3px' }}>
                  <Navigation size={13} />
                  Как пройти:
                </div>
                {dept.routeDescription}
              </div>

              {/* Контакты и график */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '13px', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={14} color="var(--brown-light)" />
                  <span><strong>Режим:</strong> {dept.workingHours}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Phone size={14} color="var(--green-text)" />
                  <span><strong>Телефон:</strong> {dept.phone}</span>
                </div>
                {dept.email && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Mail size={14} color="var(--brown-light)" />
                    <span><strong>Email:</strong> {dept.email}</span>
                  </div>
                )}
              </div>

              {/* Список специалистов */}
              <div style={{ marginBottom: '14px' }}>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brown-light)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  Сотрудники в кабинете:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                  {dept.specialists.map((spec, sIdx) => (
                    <div 
                      key={sIdx}
                      style={{ 
                        padding: '6px 10px', 
                        background: '#FAF8F5', 
                        borderRadius: '6px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between',
                        fontSize: '12.5px' 
                      }}
                    >
                      <div>
                        <strong>{spec.name}</strong>
                        <span style={{ color: 'var(--brown-light)', marginLeft: '6px', fontSize: '11.5px' }}>({spec.role})</span>
                      </div>
                      <span style={{ color: 'var(--red-berry)', fontWeight: 600 }}>{spec.phone}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Ключевые услуги кабинета */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--brown-light)', textTransform: 'uppercase', marginBottom: '6px' }}>
                  По каким вопросам обращаться:
                </div>
                <ul style={{ listStyle: 'disc', paddingLeft: '18px', fontSize: '12.5px', color: 'var(--brown-text)', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {dept.services.map((srv, srvIdx) => (
                    <li key={srvIdx}>{srv}</li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Кнопки действий */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', paddingTop: '10px', borderTop: '1px solid var(--border-light)' }}>
              <button
                onClick={() => onSelectOnMap(dept.id)}
                className="btn-secondary"
                style={{ fontSize: '12.5px', padding: '8px 12px' }}
              >
                <MapPin size={14} color="var(--red-berry)" />
                На схеме
              </button>

              <button
                onClick={() => {
                  if (dept.id === 'accounting') onOpenTicketWithType('2ndfl');
                  else if (dept.id === 'it') onOpenTicketWithType('it_support');
                  else if (dept.id === 'safety') onOpenTicketWithType('uniform');
                  else if (dept.id === 'archive') onOpenTicketWithType('archive_doc');
                  else onOpenChatWithQuestion(`Как записаться на приём в ${dept.shortTitle}?`);
                }}
                className="btn-primary"
                style={{ fontSize: '12.5px', padding: '8px 12px' }}
              >
                <MessageSquare size={14} />
                Обратиться
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};
