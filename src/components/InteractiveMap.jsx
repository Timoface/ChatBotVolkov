import React, { useState, useEffect } from 'react';
import { CAMPUS_FLOORS, DEPARTMENTS } from '../data/companyData';
import { 
  Compass, 
  MapPin, 
  Clock, 
  Phone, 
  Navigation, 
  Footprints, 
  Info,
  Calendar,
  MessageSquare,
  Building2,
  CheckCircle2,
  FileText
} from 'lucide-react';

export const InteractiveMap = ({ 
  selectedDeptId, 
  onSelectDept, 
  onOpenChatWithQuestion,
  onOpenTicketWithType 
}) => {
  const [activeFloorIndex, setActiveFloorIndex] = useState(1); // 2nd floor default
  const [selectedRoomId, setSelectedRoomId] = useState('r214'); // HR default

  // Синхронизация при внешнем выборе отдела или кабинета (из поиска, чата или справочника)
  useEffect(() => {
    if (!selectedDeptId) return;

    // Если текущий выбранный кабинет уже совпадает с запросом (по id, номеру или отделу), не сбрасываем
    const currentRoom = CAMPUS_FLOORS[activeFloorIndex]?.rooms?.find(r => r.id === selectedRoomId);
    if (currentRoom && (currentRoom.id === selectedDeptId || currentRoom.number === selectedDeptId || currentRoom.deptId === selectedDeptId)) {
      return;
    }

    // Ищем целевой кабинет по точному ID комнаты, номеру кабинета или ID подразделения
    for (let fIdx = 0; fIdx < CAMPUS_FLOORS.length; fIdx++) {
      const room = CAMPUS_FLOORS[fIdx].rooms.find(r => 
        r.id === selectedDeptId || 
        r.number === selectedDeptId || 
        r.deptId === selectedDeptId
      );
      if (room) {
        setActiveFloorIndex(fIdx);
        setSelectedRoomId(room.id);
        break;
      }
    }
  }, [selectedDeptId]);

  const currentFloor = CAMPUS_FLOORS[activeFloorIndex] || CAMPUS_FLOORS[1];
  const activeRoom = currentFloor.rooms.find(r => r.id === selectedRoomId) || currentFloor.rooms[0];
  const activeDept = DEPARTMENTS.find(d => 
    d.id === activeRoom?.deptId || 
    (activeRoom?.number && d.room.includes(activeRoom.number)) ||
    d.id === selectedDeptId
  );

  const handleSelectRoom = (room) => {
    setSelectedRoomId(room.id);
    if (onSelectDept) {
      onSelectDept(room.id);
    }
  };

  // Координаты активного кабинета в единой системе 1000x440
  const roomCenterX = activeRoom ? activeRoom.x + activeRoom.width / 2 : 270;
  const isTopRow = activeRoom ? activeRoom.y < 200 : true;
  const doorY = activeRoom ? (isTopRow ? activeRoom.y + activeRoom.height : activeRoom.y) : 175;
  const roomInsideY = activeRoom ? (isTopRow ? activeRoom.y + activeRoom.height - 35 : activeRoom.y + 35) : 130;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      
      {/* Верхняя плашка: Этажи и подсказка */}
      <div 
        className="craft-card" 
        style={{ 
          padding: '16px 20px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          flexWrap: 'wrap', 
          gap: '12px' 
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Compass size={20} color="var(--red-berry)" />
            <h3 style={{ fontSize: 'var(--font-h3)', fontWeight: 700, color: 'var(--brown-dark)' }}>
              Интерактивная карта и точные маршруты по комплексу
            </h3>
          </div>
          <p style={{ fontSize: 'var(--font-small)', color: 'var(--brown-light)', marginTop: '2px' }}>
            Центральный производственно-административный комплекс ООО «Волков» (г. Кемерово, ул. Терешковой, 41)
          </p>
        </div>

        {/* Переключатель этажей */}
        <div style={{ display: 'flex', gap: '6px', background: 'var(--bg-cream)', padding: '4px', borderRadius: '12px', border: '1px solid var(--border-craft)' }}>
          {CAMPUS_FLOORS.map((floor, idx) => (
            <button
              key={floor.id}
              onClick={() => {
                setActiveFloorIndex(idx);
                setSelectedRoomId(floor.rooms[0]?.id);
                if (onSelectDept && floor.rooms[0]?.id) {
                  onSelectDept(floor.rooms[0].id);
                }
              }}
              className={`btn-pill ${activeFloorIndex === idx ? 'active' : ''}`}
              style={{ padding: '8px 16px', fontWeight: 600, fontSize: '13px' }}
            >
              {floor.floorNumber} Этаж
            </button>
          ))}
        </div>
      </div>

      {/* Основная сетка: Векторная схема этажа + Карточка выбранного кабинета */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(340px, 1.45fr) minmax(300px, 1fr)', gap: '20px' }}>
        
        {/* Интерактивная векторная карта */}
        <div className="craft-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--brown-dark)' }}>
                {currentFloor.name}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--brown-light)' }}>
                {currentFloor.subtitle}
              </div>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', color: 'var(--red-berry)', background: 'var(--red-soft)', padding: '4px 10px', borderRadius: '8px', fontWeight: 600 }}>
              <Footprints size={14} />
              Маршрут проложен: от входа до кабинета {activeRoom?.number}
            </div>
          </div>

          {/* SVG Canvas этажа */}
          <div 
            style={{ 
              position: 'relative', 
              width: '100%', 
              background: '#FBF8F3', 
              borderRadius: '16px', 
              border: '1.5px solid var(--border-craft)',
              overflow: 'hidden',
              boxShadow: 'inset 0 2px 8px rgba(62, 41, 28, 0.04)'
            }}
          >
            <svg 
              viewBox="0 0 1000 440" 
              className="w-full h-auto select-none"
              style={{ display: 'block', width: '100%', height: 'auto', minHeight: '320px' }}
            >
              <defs>
                {/* Сетка чертежа */}
                <pattern id="cad-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#EADBCE" strokeWidth="0.5" strokeOpacity="0.4" />
                </pattern>

                {/* Тень для указателя */}
                <filter id="shadow-pin" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#C8102E" floodOpacity="0.35" />
                </filter>
                
                {/* Тень для карточек кабинетов */}
                <filter id="shadow-room" x="-10%" y="-10%" width="120%" height="120%">
                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#3E291C" floodOpacity="0.08" />
                </filter>

                {/* Активная тень */}
                <filter id="shadow-active-room" x="-15%" y="-15%" width="130%" height="130%">
                  <feDropShadow dx="0" dy="4" stdDeviation="6" floodColor="#E50046" floodOpacity="0.25" />
                </filter>
              </defs>

              {/* Фоновая сетка */}
              <rect width="1000" height="440" fill="url(#cad-grid)" />

              {/* Зона лестницы и лифта (Главный вход на этаж) */}
              <g transform="translate(24, 185)">
                <rect 
                  width="95" 
                  height="70" 
                  rx="12" 
                  fill="#2B1C13" 
                  stroke="#3E291C" 
                  strokeWidth="2" 
                />
                {/* Символ лестницы/лифта */}
                <path d="M 18 50 L 32 50 L 32 38 L 46 38 L 46 26 L 60 26 L 60 14" stroke="#FAF7F2" strokeWidth="2.5" fill="none" strokeLinecap="round" />
                <text x="50" y="58" fill="#FAF7F2" fontSize="9" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">
                  ЛИФТ / ВХОД
                </text>
              </g>

              {/* Центральный коридор */}
              <rect 
                x="120" 
                y="195" 
                width="850" 
                height="50" 
                rx="8" 
                fill="#F2ECE2" 
                stroke="#E2D6C6" 
                strokeWidth="1.5" 
              />
              {/* Осевая линия коридора с подсказками */}
              <line x1="130" y1="220" x2="960" y2="220" stroke="#D8C9B8" strokeWidth="1.5" strokeDasharray="4 6" />
              <text x="540" y="224" fill="#A89688" fontSize="10" fontWeight="600" textAnchor="middle" letterSpacing="2" fontFamily="sans-serif">
                ГЛАВНЫЙ КОРИДОР ЭТАЖА
              </text>

              {/* Отрисовка всех кабинетов этажа */}
              {currentFloor.rooms.map(room => {
                const isSelected = room.id === activeRoom?.id;
                const rCenterX = room.x + room.width / 2;
                const rIsTop = room.y < 200;
                const rDoorY = rIsTop ? room.y + room.height : room.y;

                return (
                  <g 
                    key={room.id}
                    onClick={() => handleSelectRoom(room)}
                    style={{ cursor: 'pointer' }}
                    className="map-room-group"
                  >
                    {/* Прямоугольник кабинета */}
                    <rect
                      x={room.x}
                      y={room.y}
                      width={room.width}
                      height={room.height}
                      rx="14"
                      ry="14"
                      fill={isSelected ? '#FFF2F5' : '#FFFFFF'}
                      stroke={isSelected ? '#E50046' : '#DECFC0'}
                      strokeWidth={isSelected ? 3 : 1.5}
                      filter={isSelected ? 'url(#shadow-active-room)' : 'url(#shadow-room)'}
                      style={{ transition: 'all 0.25s ease' }}
                    />

                    {/* Дверной проем в коридор */}
                    <rect 
                      x={rCenterX - 24} 
                      y={rIsTop ? room.y + room.height - 3 : room.y - 3} 
                      width="48" 
                      height="6" 
                      fill={isSelected ? '#E50046' : '#DECFC0'} 
                      rx="2"
                    />
                    <line 
                      x1={rCenterX - 20} 
                      y1={rDoorY} 
                      x2={rCenterX + 20} 
                      y2={rDoorY} 
                      stroke={isSelected ? '#FFF2F5' : '#F2ECE2'} 
                      strokeWidth="3" 
                    />

                    {/* Номер кабинета (Бейдж) */}
                    <rect
                      x={room.x + 14}
                      y={room.y + 14}
                      width={room.number.length > 4 ? 90 : 54}
                      height="24"
                      rx="6"
                      fill={isSelected ? '#E50046' : (room.color || '#553826')}
                    />
                    <text
                      x={room.x + 14 + (room.number.length > 4 ? 45 : 27)}
                      y={room.y + 30}
                      fill="#FFFFFF"
                      fontSize="11.5"
                      fontWeight="800"
                      textAnchor="middle"
                      fontFamily="sans-serif"
                    >
                      {room.number.startsWith('r') ? room.number.substring(1) : room.number}
                    </text>

                    {/* Метка "Выбрано" если активен */}
                    {isSelected && (
                      <g transform={`translate(${room.x + room.width - 80}, ${room.y + 14})`}>
                        <rect width="66" height="22" rx="11" fill="#FFE5EC" stroke="#E50046" strokeWidth="1" />
                        <text x="33" y="15" fill="#E50046" fontSize="9.5" fontWeight="700" textAnchor="middle" fontFamily="sans-serif">
                          ВЫБРАН
                        </text>
                      </g>
                    )}

                    {/* Название кабинета и отдела */}
                    <text
                      x={room.x + 16}
                      y={room.y + 60}
                      fill={isSelected ? '#2B1C13' : '#3E291C'}
                      fontSize="13"
                      fontWeight="700"
                      fontFamily="sans-serif"
                    >
                      {room.title.length > 32 ? `${room.title.substring(0, 30)}...` : room.title}
                    </text>

                    <text
                      x={room.x + 16}
                      y={room.y + 80}
                      fill="#8C7769"
                      fontSize="11"
                      fontWeight="500"
                      fontFamily="sans-serif"
                    >
                      {rIsTop ? 'Секция А • Северное крыло' : 'Секция Б • Южное крыло'}
                    </text>

                    {/* Дверная стрелка-подсказка при наведении */}
                    <text
                      x={rCenterX}
                      y={rIsTop ? room.y + room.height - 12 : room.y + 20}
                      fill={isSelected ? '#E50046' : '#C4B6AA'}
                      fontSize="9.5"
                      fontWeight="600"
                      textAnchor="middle"
                      fontFamily="sans-serif"
                    >
                      {rIsTop ? 'ВХОД ↑' : 'ВХОД ↓'}
                    </text>
                  </g>
                );
              })}

              {/* Маршрутная пунктирная линия от входа прямо в выбранный кабинет */}
              {activeRoom && (
                <g className="map-route-group">
                  {/* Фоновая мягкая подсветка траектории */}
                  <path
                    d={`M 75 220 L ${roomCenterX} 220 L ${roomCenterX} ${doorY} L ${roomCenterX} ${roomInsideY}`}
                    stroke="rgba(229, 0, 70, 0.2)"
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Основная анимированная пунктирная нить маршрута */}
                  <path
                    d={`M 75 220 L ${roomCenterX} 220 L ${roomCenterX} ${doorY} L ${roomCenterX} ${roomInsideY}`}
                    stroke="#E50046"
                    strokeWidth="3.5"
                    strokeDasharray="8 6"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <animate attributeName="stroke-dashoffset" from="28" to="0" dur="1s" repeatCount="indefinite" />
                  </path>

                  {/* Точка старта у входа/лифта */}
                  <circle cx="75" cy="220" r="5" fill="#2B1C13" stroke="#FAF7F2" strokeWidth="2" />

                  {/* ========================================================
                      ТОЧНЫЙ УКАЗАТЕЛЬ (LOCATION PIN) — ПРИВЯЗАН ПРЯМО К КАБИНЕТУ
                      ======================================================== */}
                  <g transform={`translate(${roomCenterX}, ${doorY})`}>
                    {/* Пульсирующие радиоволны цели */}
                    <circle r="18" fill="rgba(229, 0, 70, 0.25)">
                      <animate attributeName="r" values="8;24;8" dur="2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.8;0;0.8" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <circle r="6" fill="#C8102E" stroke="#FFFFFF" strokeWidth="2.5" />

                    {/* Фирменный указатель "Вам сюда" со стрелкой точно на дверь кабинета */}
                    <g transform={`translate(0, ${isTopRow ? -36 : 36})`}>
                      {/* Плашка указателя */}
                      <rect 
                        x="-76" 
                        y="-15" 
                        width="152" 
                        height="30" 
                        rx="15" 
                        fill="#C8102E" 
                        filter="url(#shadow-pin)" 
                      />
                      <text 
                        x="0" 
                        y="5" 
                        textAnchor="middle" 
                        fill="#FFFFFF" 
                        fontSize="11.5" 
                        fontWeight="800" 
                        fontFamily="sans-serif"
                      >
                        📍 Вам сюда: Каб. {activeRoom.number}
                      </text>

                      {/* Треугольный указатель-стрелка, направленный точно в точку двери */}
                      {isTopRow ? (
                        <polygon points="-7,15 7,15 0,30" fill="#C8102E" />
                      ) : (
                        <polygon points="-7,-15 7,-15 0,-30" fill="#C8102E" />
                      )}
                    </g>
                  </g>
                </g>
              )}
            </svg>
          </div>

          <div style={{ marginTop: '14px', fontSize: '12px', color: 'var(--brown-light)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Info size={15} color="var(--red-berry)" style={{ shrink: 0 }} />
            <span>
              Маршрут рассчитывается автоматически от лестницы и лифта. Нажмите на любой кабинет на схеме, чтобы переключить указатель.
            </span>
          </div>

        </div>

        {/* Детальная карточка выбранного кабинета и специалистов */}
        <div className="craft-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
            <div>
              <span className="badge-tag badge-red" style={{ marginBottom: '6px' }}>
                {activeDept?.room || `Кабинет ${activeRoom?.number}`}
              </span>
              <h4 style={{ fontSize: 'var(--font-h3)', fontWeight: 700, color: 'var(--brown-dark)' }}>
                {activeDept?.title || activeRoom?.title}
              </h4>
              <div style={{ fontSize: '13px', color: 'var(--brown-light)', marginTop: '2px' }}>
                {activeDept?.building || 'Центральный комплекс'}, {activeDept?.floor || `${currentFloor.floorNumber} этаж`}
              </div>
            </div>
          </div>

          {/* Пошаговый маршрут: Как пройти */}
          <div style={{ background: 'var(--bg-cream)', padding: '12px 14px', borderRadius: '12px', border: '1px solid var(--border-craft)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '13px', color: 'var(--red-berry)', marginBottom: '6px' }}>
              <Navigation size={14} />
              Точный маршрут:
            </div>
            <div style={{ fontSize: '13px', color: 'var(--brown-text)', lineHeight: 1.5 }}>
              {activeDept?.routeDescription || `1. Поднимитесь на ${currentFloor.floorNumber} этаж на лифте или лестнице.\n2. Выйдите в центральный коридор и идите прямо до кабинета ${activeRoom?.number}.\n3. Дверь оснащена синей настенной табличкой и бесконтактным звонком.`}
            </div>
          </div>

          {/* График работы, обед и прием */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', background: '#FFFFFF', padding: '12px', borderRadius: '10px', border: '1px solid var(--border-light)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brown-text)' }}>
              <Clock size={15} color="var(--brown-light)" />
              <div><strong>Режим работы:</strong> {activeDept?.workingHours || '08:30 – 17:30'}</div>
            </div>
            {activeDept?.receptionHours && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brown-text)' }}>
                <Calendar size={15} color="var(--red-berry)" />
                <div><strong>Прием сотрудников:</strong> {activeDept.receptionHours}</div>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--brown-text)' }}>
              <Phone size={15} color="var(--green-text)" />
              <div><strong>Внутренний телефон:</strong> {activeDept?.phone || 'доб. 1000'}</div>
            </div>
          </div>

          {/* Сотрудники в кабинете */}
          {activeDept?.specialists && (
            <div>
              <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--brown-dark)', marginBottom: '8px' }}>
                Сотрудники в этом кабинете:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
                {activeDept.specialists.map((spec, sIdx) => (
                  <div 
                    key={sIdx} 
                    style={{ 
                      padding: '8px 10px', 
                      background: '#FFFFFF', 
                      border: '1px solid var(--border-light)', 
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '12.5px'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--brown-dark)' }}>{spec.name}</div>
                      <div style={{ color: 'var(--brown-light)', fontSize: '11px' }}>{spec.role}</div>
                    </div>
                    <span className="badge-tag badge-brown" style={{ fontSize: '11px' }}>
                      {spec.phone}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Быстрые действия */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: 'auto', paddingTop: '8px' }}>
            <button
              onClick={() => {
                if (onOpenChatWithQuestion) {
                  onOpenChatWithQuestion(`Как попасть в ${activeDept?.shortTitle || activeDept?.title || activeRoom?.title} и какие документы нужны?`);
                }
              }}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              <MessageSquare size={16} />
              Задать вопрос в чат по кабинету
            </button>

            {onOpenTicketWithType && (
              <button
                onClick={() => {
                  const type = activeDept?.id === 'accounting' ? '2ndfl' 
                             : activeDept?.id === 'safety' ? 'uniform' 
                             : activeDept?.id === 'it' ? 'it_support' 
                             : activeDept?.id === 'archive' ? 'archive_doc'
                             : 'work_cert';
                  onOpenTicketWithType(type);
                }}
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'center' }}
              >
                <FileText size={16} />
                Подать обращение / справку в этот отдел
              </button>
            )}
          </div>

        </div>

      </div>

    </div>
  );
};
