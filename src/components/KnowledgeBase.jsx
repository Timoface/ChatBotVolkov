import React, { useState } from 'react';
import { KNOWLEDGE_BASE, ROLES, DEPARTMENTS } from '../data/companyData';
import { 
  BookOpen, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  MapPin, 
  FileText, 
  Sparkles, 
  ShieldCheck,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';

export const KnowledgeBase = ({ 
  currentRole, 
  onOpenTicketWithType, 
  onSelectOnMap, 
  onOpenChatWithQuestion 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedId, setExpandedId] = useState('kb-01');

  // Уникальные категории
  const categories = ['all', ...new Set(KNOWLEDGE_BASE.map(item => item.category))];

  const filteredItems = KNOWLEDGE_BASE.filter(item => {
    // Проверка прав доступа роли
    const roleHasAccess = item.roles.includes(currentRole);
    if (!roleHasAccess) return false;

    // Фильтр по категории
    if (selectedCategory !== 'all' && item.category !== selectedCategory) {
      return false;
    }

    // Поиск по тексту и ключевым словам
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchTitle = item.title.toLowerCase().includes(q);
    const matchAnswer = item.answer.toLowerCase().includes(q);
    const matchKeywords = item.keywords.some(k => k.toLowerCase().includes(q));

    return matchTitle || matchAnswer || matchKeywords;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Шапка базы знаний */}
      <div className="craft-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BookOpen size={20} color="var(--red-berry)" />
            <h3 style={{ fontSize: 'var(--font-h3)', fontWeight: 700, color: 'var(--brown-dark)' }}>
              База знаний и регламенты предприятия
            </h3>
          </div>
          <p style={{ fontSize: 'var(--font-small)', color: 'var(--brown-light)', marginTop: '2px' }}>
            Актуальные ответы на типовые вопросы сотрудников с учетом вашей роли: <strong>{ROLES[currentRole]?.badge}</strong>
          </p>
        </div>

        {/* Инпут поиска */}
        <div style={{ position: 'relative' }}>
          <Search size={18} color="var(--brown-light)" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            placeholder="Поиск по регламентам (отпускные, медосмотр, аванс, скидка сотрудника, сломалась касса)..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="chat-input"
            style={{ width: '100%', paddingLeft: '46px' }}
          />
        </div>

        {/* Категории вопросов в виде pill-кнопок */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`btn-pill ${selectedCategory === cat ? 'active' : ''}`}
              style={{ padding: '6px 14px', whiteSpace: 'nowrap' }}
            >
              {cat === 'all' ? 'Все разделы' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Список статей / аккордеон */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredItems.length === 0 ? (
          <div className="craft-card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--brown-light)' }}>
            <BookOpen size={36} style={{ margin: '0 auto 10px auto', opacity: 0.4 }} />
            <div style={{ fontWeight: 600, color: 'var(--brown-dark)' }}>По вашему запросу ничего не найдено</div>
            <div style={{ fontSize: '13px', marginTop: '4px' }}>
              Попробуйте изменить формулировку или задайте вопрос нашему AI-ассистенту во вкладке «Чат-помощник».
            </div>
          </div>
        ) : (
          filteredItems.map(item => {
            const isExpanded = expandedId === item.id;
            const targetDept = DEPARTMENTS.find(d => d.id === item.departmentId);

            return (
              <div 
                key={item.id} 
                className="craft-card" 
                style={{ 
                  borderColor: isExpanded ? 'var(--red-berry)' : 'var(--border-craft)',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Заголовок аккордеона */}
                <div
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  style={{
                    padding: '18px 22px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '14px',
                    cursor: 'pointer',
                    background: isExpanded ? 'var(--bg-cream)' : '#FFFFFF'
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px', flexWrap: 'wrap' }}>
                      <span className="badge-tag badge-brown" style={{ fontSize: '11px' }}>
                        {item.category}
                      </span>
                      <span className="badge-tag badge-red" style={{ fontSize: '11px' }}>
                        {item.cabinet}
                      </span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: '16px', color: 'var(--brown-dark)' }}>
                      {item.title}
                    </div>
                  </div>

                  <div style={{ color: isExpanded ? 'var(--red-berry)' : 'var(--brown-light)' }}>
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </div>

                {/* Развернутое содержимое */}
                {isExpanded && (
                  <div style={{ padding: '0 22px 22px 22px', borderTop: '1px solid var(--border-light)', background: '#FFFFFF' }}>
                    <div style={{ paddingTop: '16px', fontSize: '14.5px', color: 'var(--brown-text)', whiteSpace: 'pre-line', lineHeight: 1.6 }}>
                      {item.answer}
                    </div>

                    {/* Плашка ответственного кабинета и кнопки действий */}
                    <div 
                      style={{ 
                        marginTop: '18px', 
                        padding: '12px 16px', 
                        background: 'var(--bg-cream)', 
                        borderRadius: '12px',
                        border: '1px solid var(--border-craft)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ background: 'var(--red-soft)', padding: '8px', borderRadius: '8px' }}>
                          <MapPin size={18} color="var(--red-berry)" />
                        </div>
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--brown-dark)' }}>
                            {targetDept?.title || item.cabinet}
                          </div>
                          <div style={{ fontSize: '11.5px', color: 'var(--brown-light)' }}>
                            {targetDept?.workingHours || 'Пн–Пт 08:30 – 17:30'} • Внутренний телефон: {targetDept?.phone}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => onSelectOnMap(item.departmentId)}
                          className="btn-secondary"
                          style={{ fontSize: '12px', padding: '6px 12px' }}
                        >
                          Маршрут на карте
                        </button>

                        {item.actionType === 'request_2ndfl' && (
                          <button
                            onClick={() => onOpenTicketWithType('2ndfl')}
                            className="btn-primary"
                            style={{ fontSize: '12px', padding: '6px 14px' }}
                          >
                            Заказать справку 2-НДФЛ
                          </button>
                        )}

                        {item.actionType === 'request_uniform' && (
                          <button
                            onClick={() => onOpenTicketWithType('uniform')}
                            className="btn-primary"
                            style={{ fontSize: '12px', padding: '6px 14px' }}
                          >
                            Заявка на спецодежду
                          </button>
                        )}

                        {item.actionType === 'request_it' && (
                          <button
                            onClick={() => onOpenTicketWithType('it_support')}
                            className="btn-primary"
                            style={{ fontSize: '12px', padding: '6px 14px' }}
                          >
                            Вызвать IT-специалиста
                          </button>
                        )}

                        <button
                          onClick={() => onOpenChatWithQuestion(item.title)}
                          className="btn-secondary"
                          style={{ fontSize: '12px', padding: '6px 12px' }}
                          title="Обсудить с чат-помощником"
                        >
                          Спросить в чате
                        </button>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

    </div>
  );
};
