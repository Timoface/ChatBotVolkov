import React from 'react';
import { ROLES } from '../data/companyData';
import { X, Check, ShieldCheck, UserCheck, Sparkles } from 'lucide-react';

export const RoleSelectorModal = ({ isOpen, onClose, currentRole, onSelectRole }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-dialog" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px' }}>
        
        {/* Заголовок модального окна */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span className="badge-tag badge-red">
                <ShieldCheck size={13} />
                Разграничение прав доступа
              </span>
            </div>
            <h2 style={{ fontSize: 'var(--font-h2)', fontWeight: 700, color: 'var(--brown-dark)' }}>
              Выберите роль сотрудника
            </h2>
            <p style={{ fontSize: 'var(--font-small)', color: 'var(--brown-light)', marginTop: '4px' }}>
              Чат-бот настраивает доступ к информации, быстрые кнопки и маршруты в зависимости от вашей должности на предприятии.
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

        {/* Список ролей */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {Object.values(ROLES).map(role => {
            const isSelected = role.id === currentRole;
            return (
              <div
                key={role.id}
                onClick={() => {
                  onSelectRole(role.id);
                  onClose();
                }}
                className="craft-card"
                style={{
                  padding: '16px 20px',
                  cursor: 'pointer',
                  borderColor: isSelected ? 'var(--red-berry)' : 'var(--border-craft)',
                  background: isSelected ? 'var(--red-soft)' : '#FFFFFF',
                  transform: isSelected ? 'scale(1.01)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px'
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                    <span 
                      style={{ 
                        width: '10px', 
                        height: '10px', 
                        borderRadius: '50%', 
                        background: role.color 
                      }} 
                    />
                    <span style={{ fontWeight: 700, fontSize: 'var(--font-body)', color: 'var(--brown-dark)' }}>
                      {role.title}
                    </span>
                    <span className="badge-tag badge-brown" style={{ fontSize: '10px' }}>
                      {role.badge}
                    </span>
                  </div>

                  <div style={{ fontSize: 'var(--font-small)', fontWeight: 500, color: 'var(--brown-text)', marginBottom: '4px' }}>
                    {role.subtitle}
                  </div>

                  <div style={{ fontSize: 'var(--font-tiny)', color: 'var(--brown-light)' }}>
                    {role.description}
                  </div>
                </div>

                <div>
                  {isSelected ? (
                    <div 
                      style={{ 
                        background: 'var(--red-berry)', 
                        color: '#FFFFFF', 
                        borderRadius: '50%', 
                        width: '32px', 
                        height: '32px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <Check size={18} />
                    </div>
                  ) : (
                    <div 
                      style={{ 
                        border: '1.5px solid var(--border-craft)', 
                        borderRadius: '50%', 
                        width: '32px', 
                        height: '32px' 
                      }} 
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Информационный футер */}
        <div 
          style={{ 
            marginTop: '20px', 
            padding: '12px 16px', 
            background: 'var(--bg-cream)', 
            borderRadius: '12px',
            border: '1px solid var(--border-craft)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: 'var(--font-small)',
            color: 'var(--brown-text)'
          }}
        >
          <Sparkles size={18} color="var(--amber-warm)" />
          <span>
            Информация персонализирована: каждый сотрудник видит только актуальные для него кабинеты, контакты кураторов и правила компании.
          </span>
        </div>

      </div>
    </div>
  );
};
