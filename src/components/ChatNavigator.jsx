import React, { useState, useEffect, useRef } from 'react';
import { AssistantAvatar } from './Logos';
import { ROLES, DEPARTMENTS, KNOWLEDGE_BASE, CAMPUS_FLOORS } from '../data/companyData';
import { 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  MapPin, 
  Phone, 
  FileText, 
  Navigation, 
  Sparkles, 
  UserCheck, 
  ArrowRight,
  Clock,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

export const ChatNavigator = ({ 
  currentRole, 
  isVoiceActive, 
  onSelectOnMap, 
  onOpenTicketWithType,
  initialQuestion = null,
  onClearInitialQuestion
}) => {
  const roleData = ROLES[currentRole] || ROLES.production;
  
  // Сообщения чата
  const [messages, setMessages] = useState([
    {
      id: 'welcome-1',
      sender: 'bot',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: `Здравствуйте! Я ваш внутренний помощник по компании «Волков» и сети «Калина-Малина». 

Вы вошли с профилем: **${roleData.title}** (${roleData.badge}).

Я подскажу, в какой кабинет обратиться, как туда пройти, отвечу на вопросы по зарплате, отпускам, спецодежде или помогу подать электронную заявку в 1 клик. Чем могу помочь?`,
      quickSuggestions: roleData.sampleQuestions
    }
  ]);

  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Скролл вниз при новых сообщениях
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Обработка внешнего входящего вопроса (если кликнули в Справочнике или на Карте)
  useEffect(() => {
    if (initialQuestion) {
      handleUserSendMessage(initialQuestion);
      if (onClearInitialQuestion) {
        onClearInitialQuestion();
      }
    }
  }, [initialQuestion]);

  // Инициализация Web Speech API для голосового ввода
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'ru-RU';
      recognition.interimResults = false;

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputValue(transcript);
        setIsListening(false);
        handleUserSendMessage(transcript);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const toggleVoiceRecording = () => {
    if (!recognitionRef.current) {
      alert("Голосовой ввод не поддерживается вашим браузером. Вы можете воспользоваться клавиатурой или быстрыми кнопками!");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        setIsListening(false);
      }
    }
  };

  // Озвучивание ответа
  const speakText = (text) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    // Очищаем markdown
    const cleanText = text.replace(/[*_#`]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ru-RU';
    utterance.rate = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Интеллектуальный поиск ответа и кабинета
  const generateAssistantResponse = (query) => {
    const q = query.toLowerCase();

    // 1. Поиск по Базе Знаний
    const matchedKb = KNOWLEDGE_BASE.find(item => {
      return item.keywords.some(k => q.includes(k.toLowerCase())) ||
             item.title.toLowerCase().includes(q) ||
             q.includes(item.category.toLowerCase());
    });

    if (matchedKb) {
      const dept = DEPARTMENTS.find(d => d.id === matchedKb.departmentId);
      return {
        text: matchedKb.answer,
        dept,
        cabinet: matchedKb.cabinet,
        actionType: matchedKb.actionType,
        actionTitle: getActionTitle(matchedKb.actionType),
        relatedTitle: matchedKb.title
      };
    }

    // 2. Поиск по подразделениям и кабинетам
    const matchedDept = DEPARTMENTS.find(d => {
      return d.title.toLowerCase().includes(q) ||
             d.shortTitle.toLowerCase().includes(q) ||
             d.room.toLowerCase().includes(q) ||
             d.specialists.some(s => q.includes(s.name.toLowerCase()) || q.includes(s.role.toLowerCase())) ||
             d.services.some(srv => q.includes(srv.toLowerCase()));
    });

    if (matchedDept) {
      return {
        text: `По вашему вопросу обратитесь в **${matchedDept.title}** (${matchedDept.room}).\n\nСпециалисты ведут прием: ${matchedDept.workingHours}.\nВнутренний телефон: ${matchedDept.phone}.`,
        dept: matchedDept,
        cabinet: matchedDept.room,
        roomId: matchedDept.id,
        actionType: 'view_dept',
        actionTitle: 'Показать на плане здания'
      };
    }

    // 2.5. Поиск конкретного кабинета на поэтажной схеме (по номеру, например "222", "каб 222", "кабинет 222" или названию)
    for (const floor of CAMPUS_FLOORS) {
      const foundRoom = floor.rooms.find(r => {
        const num = r.number.toLowerCase();
        const title = r.title.toLowerCase();
        return q.includes(`кабинет ${num}`) ||
               q.includes(`каб. ${num}`) ||
               q.includes(`каб ${num}`) ||
               q.includes(`до ${num}`) ||
               q.includes(`в ${num}`) ||
               q.split(/[\s,.;!?]+/).includes(num) ||
               (num.length >= 3 && q.includes(num)) ||
               q.includes(title);
      });

      if (foundRoom) {
        const dept = DEPARTMENTS.find(d => d.id === foundRoom.deptId || d.room.includes(foundRoom.number));
        return {
          text: `Кабинет **№ ${foundRoom.number}** — **${foundRoom.title}** расположен на **${floor.floorNumber} этаже** (${floor.name}).\n\nКак пройти: поднимитесь на ${floor.floorNumber} этаж на лифте или лестнице и следуйте по центральному коридору до двери с табличкой «${foundRoom.number}».`,
          dept: dept || {
            id: foundRoom.deptId,
            title: foundRoom.title,
            room: `Кабинет ${foundRoom.number}`,
            floor: `${floor.floorNumber} этаж`,
            workingHours: 'Пн–Пт 08:30 – 17:30',
            phone: '+7 (3842) 77-00-' + (foundRoom.number.replace(/\D/g, '') || '00')
          },
          cabinet: `Кабинет ${foundRoom.number}`,
          roomId: foundRoom.id,
          actionType: 'view_dept',
          actionTitle: `Маршрут до каб. ${foundRoom.number} на схеме`
        };
      }
    }

    // 3. Вопросы про приветствие / навигатор
    if (q.includes('привет') || q.includes('здравствуй') || q.includes('помоги') || q.includes('кто ты')) {
      return {
        text: `Я корпоративный навигатор компаний «Волков» и «Калина-Малина». Я знаю расположение всех служб, кабинетов, телефоны специалистов, правила выдачи зарплаты, больничных и спецодежды.\n\nЗадайте вопрос своими словами или выберите одну из подсказок ниже!`,
        dept: null
      };
    }

    // 4. Универсальный вежливый ответ
    return {
      text: `Я записал ваш вопрос: «${query}». \n\nЧтобы предоставить точный ответ и не отвлекать экспертов понапрасну, рекомендую обратиться в **Службу внутренних коммуникаций и кадров (Кабинет 214)** либо оставить электронное обращение через кнопку ниже — ответ поступит прямо сюда.`,
      dept: DEPARTMENTS[0],
      cabinet: 'Кабинет 214',
      actionType: 'ask_human',
      actionTitle: 'Задать вопрос эксперту'
    };
  };

  function getActionTitle(actionType) {
    switch (actionType) {
      case 'request_2ndfl': return 'Оформить 2-НДФЛ онлайн';
      case 'request_uniform': return 'Заявка на спецодежду';
      case 'request_it': return 'Вызвать IT-специалиста';
      case 'request_pass': return 'Заказать новый пропуск';
      case 'request_vacation': return 'Заявление на отпуск';
      default: return 'Показать кабинет на карте';
    }
  }

  const handleUserSendMessage = (textToSend = null) => {
    const text = (textToSend !== null ? textToSend : inputValue).trim();
    if (!text) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: text
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    // Имитация быстрой естественной обработки
    setTimeout(() => {
      const resp = generateAssistantResponse(text);
      
      const botMsg = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: resp.text,
        dept: resp.dept,
        cabinet: resp.cabinet,
        roomId: resp.roomId,
        actionType: resp.actionType,
        actionTitle: resp.actionTitle,
        quickSuggestions: getFollowUpSuggestions(resp.actionType)
      };

      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);

      // Если включена голосовая озвучка
      if (isVoiceActive) {
        speakText(resp.text);
      }
    }, 450);
  };

  const getFollowUpSuggestions = (actionType) => {
    switch (actionType) {
      case 'request_2ndfl':
        return ["Когда придет аванс?", "Как читать расчетный листок?", "Где находится бухгалтерия?"];
      case 'request_uniform':
        return ["Нормы выдачи обуви", "Как работает стирка?", "Где кабинет 115?"];
      case 'request_it':
        return ["Сбросить пароль 1С", "Не работает сканер", "Телефон горячей линии IT"];
      default:
        return roleData.sampleQuestions.slice(0, 3);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'bot',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        text: `История диалога очищена. Я готов ответить на ваши новые вопросы по предприятиям «Волков» и магазинам «Калина-Малина».`,
        quickSuggestions: roleData.sampleQuestions
      }
    ]);
  };

  return (
    <div className="craft-card chat-window" style={{ display: 'flex', flexDirection: 'column' }}>
      
      {/* Шапка чата */}
      <div className="chat-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AssistantAvatar size={42} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--brown-dark)' }}>
                Навигатор Волков & Калина-Малина
              </h3>
              <span className="badge-tag badge-green" style={{ fontSize: '10px' }}>
                Онлайн 24/7
              </span>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--brown-light)' }}>
              Режим: <strong>{roleData.badge}</strong> • Поиск людей, кабинетов и регламентов
            </div>
          </div>
        </div>

        <button
          onClick={handleResetChat}
          className="btn-pill"
          title="Начать новый диалог"
          style={{ padding: '6px 12px', fontSize: '12px' }}
        >
          <RotateCcw size={13} />
          Новый вопрос
        </button>
      </div>

      {/* Список сообщений */}
      <div className="chat-messages">
        {messages.map(msg => {
          const isBot = msg.sender === 'bot';

          return (
            <div key={msg.id} className={`msg-row ${isBot ? 'bot' : 'user'}`}>
              
              {isBot && <AssistantAvatar size={34} />}

              <div className={`msg-bubble ${isBot ? 'bot' : 'user'}`}>
                
                {/* Текст сообщения с базовым форматированием */}
                <div style={{ whiteSpace: 'pre-line', fontSize: 'var(--font-body)' }}>
                  {msg.text}
                </div>

                {/* Вложенная карточка кабинета и маршрута (если бот нашел ответ) */}
                {msg.dept && (
                  <div 
                    style={{ 
                      marginTop: '14px', 
                      padding: '14px', 
                      background: 'var(--bg-cream)', 
                      borderRadius: '14px', 
                      border: '1.5px solid var(--border-craft)',
                      color: 'var(--brown-text)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="badge-tag badge-red" style={{ fontWeight: 800 }}>
                          {msg.dept.room}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--brown-light)' }}>
                          {msg.dept.floor}
                        </span>
                      </div>
                      <span style={{ fontSize: '11px', color: 'var(--brown-light)' }}>
                        {msg.dept.building}
                      </span>
                    </div>

                    <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--brown-dark)', marginBottom: '4px' }}>
                      {msg.dept.title}
                    </div>

                    {/* Пошаговый маршрут как дойти */}
                    <div style={{ fontSize: '12.5px', color: 'var(--brown-text)', background: '#FFFFFF', padding: '8px 10px', borderRadius: '8px', border: '1px solid var(--border-light)', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--red-berry)', fontWeight: 600, marginBottom: '2px' }}>
                        <Navigation size={13} />
                        Маршрут:
                      </div>
                      {msg.dept.routeDescription}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: 'var(--brown-light)', marginBottom: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Clock size={13} />
                        {msg.dept.workingHours}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--brown-dark)', fontWeight: 600 }}>
                        <Phone size={13} color="var(--green-text)" />
                        {msg.dept.phone}
                      </div>
                    </div>

                    {/* Интерактивные кнопки действий прямо в сообщении */}
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <button
                        onClick={() => onSelectOnMap(msg.dept.id)}
                        className="btn-secondary"
                        style={{ fontSize: '12px', padding: '6px 12px' }}
                      >
                        <MapPin size={13} color="var(--red-berry)" />
                        Маршрут на схеме
                      </button>

                      {msg.actionType === 'request_2ndfl' && (
                        <button
                          onClick={() => onOpenTicketWithType('2ndfl')}
                          className="btn-primary"
                          style={{ fontSize: '12px', padding: '6px 14px' }}
                        >
                          <FileText size={13} />
                          Заказать справку 2-НДФЛ
                        </button>
                      )}

                      {msg.actionType === 'request_uniform' && (
                        <button
                          onClick={() => onOpenTicketWithType('uniform')}
                          className="btn-primary"
                          style={{ fontSize: '12px', padding: '6px 14px' }}
                        >
                          <FileText size={13} />
                          Заявка на спецодежду
                        </button>
                      )}

                      {msg.actionType === 'request_it' && (
                        <button
                          onClick={() => onOpenTicketWithType('it_support')}
                          className="btn-primary"
                          style={{ fontSize: '12px', padding: '6px 14px' }}
                        >
                          <FileText size={13} />
                          Вызвать мастера IT
                        </button>
                      )}

                      {msg.actionType === 'ask_human' && (
                        <button
                          onClick={() => onOpenTicketWithType('hr_question')}
                          className="btn-primary"
                          style={{ fontSize: '12px', padding: '6px 14px' }}
                        >
                          <UserCheck size={13} />
                          Задать вопрос человеку
                        </button>
                      )}
                    </div>

                  </div>
                )}

                {/* Время и кнопка прослушать */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: isBot ? 'space-between' : 'flex-end', marginTop: '8px', fontSize: '11px', opacity: 0.75 }}>
                  {isBot && (
                    <button
                      onClick={() => speakText(msg.text)}
                      style={{ border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', color: 'inherit' }}
                      title="Прослушать ответ голосом"
                    >
                      <Volume2 size={13} />
                      <span>Озвучить</span>
                    </button>
                  )}
                  <span>{msg.timestamp}</span>
                </div>

                {/* Быстрые подсказки-вопросы */}
                {msg.quickSuggestions && (
                  <div style={{ marginTop: '14px', paddingTop: '10px', borderTop: '1px solid var(--border-light)' }}>
                    <div style={{ fontSize: '11.5px', color: 'var(--brown-light)', marginBottom: '6px', fontWeight: 600 }}>
                      Частые вопросы для вашей роли:
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {msg.quickSuggestions.map((sugg, sIdx) => (
                        <button
                          key={sIdx}
                          onClick={() => handleUserSendMessage(sugg)}
                          className="btn-pill"
                          style={{ fontSize: '12px', padding: '5px 11px' }}
                        >
                          {sugg}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            </div>
          );
        })}

        {/* Индикатор печати бота */}
        {isTyping && (
          <div className="msg-row bot">
            <AssistantAvatar size={34} />
            <div className="msg-bubble bot" style={{ padding: '12px 18px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '12px', color: 'var(--brown-light)' }}>Ищу в базе знаний ВОЛКОВ и Калина-Малина...</span>
              <span className="badge-tag badge-red" style={{ animation: 'pulse 1s infinite', fontSize: '10px' }}>● ● ●</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Инпут ввода сообщения */}
      <div className="chat-input-bar">
        
        {/* Кнопка микрофона / Голосовой ввод */}
        <button
          onClick={toggleVoiceRecording}
          className={`mic-btn ${isListening ? 'recording' : ''}`}
          title={isListening ? "Идет запись голоса... Нажмите чтобы остановить" : "Голосовой ввод вопроса"}
        >
          {isListening ? <Mic size={20} /> : <Mic size={20} />}
        </button>

        {/* Текстовое поле */}
        <input
          type="text"
          placeholder={isListening ? "Говорите, я вас слушаю..." : "Задайте любой вопрос (например: где взять 2-НДФЛ? зависла касса?)..."}
          value={inputValue}
          onChange={e => setInputValue(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              handleUserSendMessage();
            }
          }}
          className="chat-input"
        />

        {/* Кнопка отправки */}
        <button
          onClick={() => handleUserSendMessage()}
          disabled={!inputValue.trim()}
          className="btn-primary"
          style={{ padding: '12px 18px', opacity: inputValue.trim() ? 1 : 0.6 }}
          title="Отправить сообщение"
        >
          <Send size={18} />
        </button>

      </div>

    </div>
  );
};
