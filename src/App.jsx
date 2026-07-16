import React, { useState, useEffect, useRef } from 'react';
import './App.css';

// SVG Icons as inline functional components for lightweight rendering and no external assets dependency
const IconBaby = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-baby">
    <path d="M12 2a10 10 0 0 1 10 10c0 5.523-4.477 10-10 10S2 17.523 2 12A10 10 0 0 1 12 2z"/>
    <path d="M12 6a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z"/>
    <path d="M8 13.5a4 4 0 0 0 8 0"/>
    <path d="M10 18h4"/>
    <path d="M12 18v2"/>
  </svg>
);

const IconClock = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-clock">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);

const IconHistory = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-history">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <polyline points="3 3 3 8 8 8" />
    <line x1="12" y1="7" x2="12" y2="12" />
    <line x1="12" y1="12" x2="16" y2="12" />
  </svg>
);

const IconTrash = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-trash">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const IconArrowRight = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-arrow-right">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const IconEdit = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="icon-edit">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

// --- Funções Auxiliares do Perfil do Bebê ---
const getAgeInDays = (birthDateString) => {
  if (!birthDateString) return 0;
  const birth = new Date(birthDateString);
  const now = new Date();
  const birthDateOnly = new Date(birth.getFullYear(), birth.getMonth(), birth.getDate());
  const nowDateOnly = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffTime = nowDateOnly.getTime() - birthDateOnly.getTime();
  return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
};

const getRecommendedInterval = (ageInDays) => {
  if (ageInDays <= 30) {
    return 2.5; // 2h 30m - Recém-nascido
  } else if (ageInDays <= 90) {
    return 3.0; // 3h - 1 a 3 meses
  } else if (ageInDays <= 180) {
    return 3.5; // 3h 30m - 3 a 6 meses
  } else {
    return 4.0; // 4h - 6+ meses
  }
};

const formatAge = (days, birthDateString) => {
  if (!birthDateString) return '';
  const birth = new Date(birthDateString);
  const now = new Date();
  if (birth > now) return 'Ainda não nasceu';
  
  if (days === 0) return 'Nasceu hoje!';
  if (days < 7) {
    return days === 1 ? '1 dia de vida' : `${days} dias de vida`;
  }
  const weeks = Math.floor(days / 7);
  const remainingDays = days % 7;
  if (days < 30) {
    let text = weeks === 1 ? '1 semana' : `${weeks} semanas`;
    if (remainingDays > 0) {
      text += remainingDays === 1 ? ' e 1 dia' : ` e ${remainingDays} dias`;
    }
    return text + ' de vida';
  }
  const months = Math.floor(days / 30.4375);
  const remainingDaysInMonth = Math.floor(days % 30.4375);
  if (months < 12) {
    let text = months === 1 ? '1 mês' : `${months} meses`;
    if (remainingDaysInMonth >= 7) {
      const w = Math.floor(remainingDaysInMonth / 7);
      text += w === 1 ? ' e 1 semana' : ` e ${w} semanas`;
    } else if (remainingDaysInMonth > 0) {
      text += remainingDaysInMonth === 1 ? ' e 1 dia' : ` e ${remainingDaysInMonth} dias`;
    }
    return text + ' de vida';
  }
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  let text = years === 1 ? '1 ano' : `${years} anos`;
  if (remainingMonths > 0) {
    text += remainingMonths === 1 ? ' e 1 mês' : ` e ${remainingMonths} meses`;
  }
  return text + ' de vida';
};

const formatInterval = (hours) => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) {
    return h === 1 ? '1 hora' : `${h} horas`;
  }
  return `${h}h ${m}m`;
};

function App() {
  // --- Estados ---
  const [history, setHistory] = useState(() => {
    try {
      const savedHistory = localStorage.getItem('baby_care_history');
      if (savedHistory) {
        return JSON.parse(savedHistory);
      }
      const savedLast = localStorage.getItem('baby_care_last_feeding');
      if (savedLast) {
        return [JSON.parse(savedLast)];
      }
    } catch (e) {
      console.error('Erro ao ler dados do localStorage:', e);
    }
    return [];
  });

  const [babyName, setBabyName] = useState(() => {
    return localStorage.getItem('baby_care_name') || '';
  });
  const [babyBirthDate, setBabyBirthDate] = useState(() => {
    return localStorage.getItem('baby_care_birthdate') || '';
  });
  const [useRecommendedInterval, setUseRecommendedInterval] = useState(() => {
    const saved = localStorage.getItem('baby_care_use_recommended');
    return saved !== 'false';
  });
  const [customInterval, setCustomInterval] = useState(() => {
    const saved = localStorage.getItem('baby_care_custom_interval');
    return saved ? parseFloat(saved) : 3.0;
  });

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [tempName, setTempName] = useState('');
  const [tempBirthDate, setTempBirthDate] = useState('');
  const [tempUseRecommended, setTempUseRecommended] = useState(true);
  const [tempCustomInterval, setTempCustomInterval] = useState(3.0);

  const [activeBreast, setActiveBreast] = useState(null); // 'Esquerda' | 'Direita' | null
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0); // Tempo decorrido em segundos
  const [warningMessage, setWarningMessage] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [note, setNote] = useState(''); // Anotações sobre a mamada atual

  const timerRef = useRef(null);
  const startTimeRef = useRef(0);

  // Deriva o último registro do histórico
  const lastFeeding = history.length > 0 ? history[0] : null;

  // Deriva dados do bebê e intervalo ativo
  const ageInDays = babyBirthDate ? Math.max(0, getAgeInDays(babyBirthDate)) : 0;
  const recommendedInterval = getRecommendedInterval(ageInDays);
  const activeInterval = useRecommendedInterval ? recommendedInterval : customInterval;

  // --- Efeitos ---
  // Atualiza a hora atual a cada segundo (usado para o cálculo dinâmico da próxima mamada)
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timeInterval);
  }, []);

  // Lógica do cronômetro para evitar atrasos causados pelo sleep do navegador
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setTime(elapsed);
      }, 100); // Roda frequentemente para maior precisão
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRunning]);

  // --- Ações ---
  const handleEditProfile = () => {
    setTempName(babyName);
    setTempBirthDate(babyBirthDate);
    setTempUseRecommended(useRecommendedInterval);
    setTempCustomInterval(customInterval);
    setIsEditingProfile(true);
  };

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setBabyName(tempName);
    setBabyBirthDate(tempBirthDate);
    setUseRecommendedInterval(tempUseRecommended);
    setCustomInterval(tempCustomInterval);

    localStorage.setItem('baby_care_name', tempName);
    localStorage.setItem('baby_care_birthdate', tempBirthDate);
    localStorage.setItem('baby_care_use_recommended', tempUseRecommended.toString());
    localStorage.setItem('baby_care_custom_interval', tempCustomInterval.toString());

    setIsEditingProfile(false);
  };

  const handleCancelProfile = () => {
    setIsEditingProfile(false);
  };

  const handleStartTimer = () => {
    if (!activeBreast) {
      setWarningMessage('Por favor, selecione uma mama (Esquerda ou Direita) antes de iniciar!');
      // Auto-limpa o aviso após 4 segundos
      setTimeout(() => setWarningMessage(''), 4000);
      return;
    }
    setWarningMessage('');
    startTimeRef.current = Date.now() - time * 1000;
    setIsRunning(true);
  };

  const handlePauseTimer = () => {
    setIsRunning(false);
  };

  const handleStopAndSave = () => {
    if (!activeBreast) {
      setWarningMessage('Selecione uma mama para salvar o registro.');
      return;
    }
    if (time < 5) {
      setWarningMessage('A amamentação precisa ter pelo menos 5 segundos para ser registrada.');
      setTimeout(() => setWarningMessage(''), 4000);
      return;
    }

    const now = new Date();
    const durationSeconds = time;
    const endStr = now.toISOString();
    const startStr = new Date(now.getTime() - durationSeconds * 1000).toISOString();

    const newRecord = {
      id: Date.now().toString(),
      breast: activeBreast,
      duration: durationSeconds,
      startTime: startStr,
      endTime: endStr,
      note: note.trim(),
    };

    const newHistory = [newRecord, ...history];
    setHistory(newHistory);

    // Salva no localStorage conforme requisitos (obrigatório persistir o último registro + histórico premium)
    localStorage.setItem('baby_care_history', JSON.stringify(newHistory));
    localStorage.setItem('baby_care_last_feeding', JSON.stringify(newRecord));

    // Reseta estado local do timer
    setIsRunning(false);
    setTime(0);
    setActiveBreast(null);
    setWarningMessage('');
    setNote('');
  };

  const handleResetTimer = () => {
    if (window.confirm('Deseja realmente cancelar o timer atual? O progresso será perdido.')) {
      setIsRunning(false);
      setTime(0);
      setActiveBreast(null);
      setWarningMessage('');
      setNote('');
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Tem certeza que deseja limpar todo o histórico de amamentação?')) {
      setHistory([]);
      localStorage.removeItem('baby_care_history');
      localStorage.removeItem('baby_care_last_feeding');
    }
  };

  // --- Auxiliares de Formatação ---
  const formatTimer = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    const pad = (num) => num.toString().padStart(2, '0');
    return `${pad(minutes)}:${pad(seconds)}`;
  };

  const formatShortDuration = (totalSeconds) => {
    if (totalSeconds < 60) return `${totalSeconds}s`;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return seconds > 0 ? `${minutes}m ${seconds}s` : `${minutes}m`;
  };

  const formatTimeOfDay = (dateString) => {
    const d = new Date(dateString);
    const hours = d.getHours().toString().padStart(2, '0');
    const minutes = d.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const formatDateLabel = (dateString) => {
    const d = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.toDateString() === today.toDateString()) {
      return 'Hoje';
    } else if (d.toDateString() === yesterday.toDateString()) {
      return 'Ontem';
    } else {
      return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
    }
  };

  // --- Cálculo da Próxima Mamada ---
  const getNextFeedingInfo = () => {
    if (!lastFeeding) return null;

    // Recomendação pediátrica: contagem do intervalo a partir do INÍCIO da última mamada
    const lastStart = new Date(lastFeeding.startTime);
    // Prevista para o intervalo selecionado após o início da última mamada
    const nextTime = new Date(lastStart.getTime() + activeInterval * 60 * 60 * 1000);
    
    const diffMs = nextTime.getTime() - currentTime.getTime();
    const diffMins = Math.round(diffMs / 60000);

    let statusText = '';
    let isOverdue = false;

    if (diffMins > 0) {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      statusText = hours > 0 ? `Em ${hours}h ${mins}m` : `Em ${mins} min`;
    } else {
      isOverdue = true;
      const absMins = Math.abs(diffMins);
      const hours = Math.floor(absMins / 60);
      const mins = absMins % 60;
      statusText = hours > 0 ? `Atrasada por ${hours}h ${mins}m` : `Atrasada por ${mins} min`;
    }

    return {
      timeFormatted: formatTimeOfDay(nextTime.toISOString()),
      statusText,
      isOverdue,
    };
  };

  const nextFeeding = getNextFeedingInfo();

  return (
    <div className="app-container">
      {/* Cabeçalho */}
      <header className="app-header">
        <div className="logo-wrapper">
          <IconBaby />
        </div>
        <h1>Timer de Amamentação</h1>
        <p className="app-subtitle">Acompanhe as mamadas com praticidade e carinho</p>
      </header>

      <main className="app-main">
        {/* Card: Perfil do Bebê */}
        <section className="baby-profile-card card">
          {!babyBirthDate && !isEditingProfile ? (
            <div className="baby-profile-empty">
              <div className="baby-profile-info">
                <div className="baby-avatar-wrapper">
                  <IconBaby />
                </div>
                <div className="baby-details">
                  <h3 className="baby-name">Olá!</h3>
                  <p className="baby-age">Configure o perfil do bebê para definir o intervalo de amamentação conforme o tempo de vida.</p>
                </div>
              </div>
              <button 
                type="button" 
                className="btn-edit-profile"
                onClick={handleEditProfile}
              >
                Configurar Perfil
              </button>
            </div>
          ) : isEditingProfile ? (
            <form onSubmit={handleSaveProfile} className="baby-profile-edit-form">
              <h3 className="form-title">Editar Perfil do Bebê</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="baby-name-input" className="form-label">Nome do Bebê</label>
                  <input
                    id="baby-name-input"
                    type="text"
                    className="form-input"
                    placeholder="Ex: Lucas, Sofia"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    maxLength={30}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="baby-birth-input" className="form-label">Data de Nascimento</label>
                  <input
                    id="baby-birth-input"
                    type="date"
                    className="form-input"
                    value={tempBirthDate}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setTempBirthDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="interval-settings-group">
                <label className="checkbox-group">
                  <input
                    type="checkbox"
                    checked={tempUseRecommended}
                    onChange={(e) => setTempUseRecommended(e.target.checked)}
                  />
                  <span className="form-label">Ajustar intervalo automaticamente por idade</span>
                </label>

                {tempUseRecommended && tempBirthDate && (
                  <div className="recommended-preview-box">
                    <span className="hint-label">
                      Recomendado para a idade atual ({formatAge(Math.max(0, getAgeInDays(tempBirthDate)), tempBirthDate)}):
                    </span>
                    <strong className="recommended-val"> {formatInterval(getRecommendedInterval(Math.max(0, getAgeInDays(tempBirthDate))))}</strong>
                  </div>
                )}

                {!tempUseRecommended && (
                  <div className="form-group custom-interval-group">
                    <label htmlFor="custom-interval-select" className="form-label">Intervalo Personalizado (horas)</label>
                    <select
                      id="custom-interval-select"
                      className="form-select"
                      value={tempCustomInterval}
                      onChange={(e) => setTempCustomInterval(parseFloat(e.target.value))}
                    >
                      <option value="1.0">1h 00m</option>
                      <option value="1.5">1h 30m</option>
                      <option value="2.0">2h 00m</option>
                      <option value="2.5">2h 30m</option>
                      <option value="3.0">3h 00m</option>
                      <option value="3.5">3h 30m</option>
                      <option value="4.0">4h 00m</option>
                      <option value="4.5">4h 30m</option>
                      <option value="5.0">5h 00m</option>
                      <option value="5.5">5h 30m</option>
                      <option value="6.0">6h 00m</option>
                    </select>
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button type="button" className="btn-cancel-profile" onClick={handleCancelProfile}>
                  Cancelar
                </button>
                <button type="submit" className="btn-save-profile">
                  Salvar
                </button>
              </div>
            </form>
          ) : (
            <div className="baby-profile-view">
              <div className="baby-profile-info">
                <div className="baby-avatar-wrapper">
                  <IconBaby />
                </div>
                <div className="baby-details">
                  <h3 className="baby-name">{babyName || 'Bebê'}</h3>
                  <p className="baby-age">{formatAge(ageInDays, babyBirthDate)}</p>
                  <div className="baby-interval-info">
                    <span>Intervalo de amamentação: <strong>{formatInterval(activeInterval)}</strong></span>
                    <span className={`interval-badge ${useRecommendedInterval ? 'recommended' : 'custom'}`}>
                      {useRecommendedInterval ? 'Automático por idade' : 'Personalizado'}
                    </span>
                  </div>
                </div>
              </div>
              <button 
                type="button" 
                className="btn-edit-profile"
                onClick={handleEditProfile}
              >
                <IconEdit /> Editar
              </button>
            </div>
          )}
        </section>

        {/* Painel de Controle Principal */}
        <section className="control-panel card">
          {warningMessage && (
            <div className="warning-toast">
              <span>{warningMessage}</span>
            </div>
          )}

          {/* Seleção de Mama */}
          <div className="breast-selector">
            <h2 className="section-title">Qual mama usar?</h2>
            <div className="selector-buttons">
              <button
                type="button"
                className={`breast-btn breast-left ${activeBreast === 'Esquerda' ? 'selected' : ''}`}
                onClick={() => {
                  if (!isRunning) setActiveBreast('Esquerda');
                }}
                disabled={isRunning}
              >
                <div className="breast-indicator left-indicator">L</div>
                <span className="btn-label">Esquerda</span>
              </button>
              <button
                type="button"
                className={`breast-btn breast-right ${activeBreast === 'Direita' ? 'selected' : ''}`}
                onClick={() => {
                  if (!isRunning) setActiveBreast('Direita');
                }}
                disabled={isRunning}
              >
                <div className="breast-indicator right-indicator">R</div>
                <span className="btn-label">Direita</span>
              </button>
            </div>
          </div>

          {/* Cronômetro */}
          <div className="timer-display-wrapper">
            <div className={`timer-circle ${isRunning ? 'pulse' : ''} ${activeBreast ? `selected-${activeBreast.toLowerCase()}` : ''}`}>
              <div className="timer-inner">
                <span className="timer-time">{formatTimer(time)}</span>
                <span className="timer-breast">
                  {activeBreast ? `Mama ${activeBreast}` : 'Selecione a mama'}
                </span>
              </div>
            </div>
          </div>

          {/* Campo de Anotações (visível durante a sessão ativa) */}
          {(isRunning || time > 0) && (
            <div className="note-input-wrapper">
              <label htmlFor="feeding-note" className="note-label">Anotações da Mamada</label>
              <textarea
                id="feeding-note"
                className="note-textarea"
                placeholder="Ex: Teve boa pega, dormiu no final, usou bico de silicone..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={200}
              />
            </div>
          )}

          {/* Ações do Timer */}
          <div className="timer-actions">
            {!isRunning && time === 0 ? (
              <button
                type="button"
                className="action-btn btn-start"
                onClick={handleStartTimer}
              >
                Iniciar Amamentação
              </button>
            ) : (
              <div className="active-timer-controls">
                {isRunning ? (
                  <button
                    type="button"
                    className="action-btn btn-pause"
                    onClick={handlePauseTimer}
                  >
                    Pausar
                  </button>
                ) : (
                  <button
                    type="button"
                    className="action-btn btn-resume"
                    onClick={handleStartTimer}
                  >
                    Retomar
                  </button>
                )}
                
                <button
                  type="button"
                  className="action-btn btn-save"
                  onClick={handleStopAndSave}
                >
                  Salvar Registro
                </button>

                <button
                  type="button"
                  className="action-btn btn-cancel"
                  onClick={handleResetTimer}
                  title="Cancelar cronômetro"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Resumo da Mamada e Próxima Previsão */}
        <section className="summary-widgets">
          {/* Card: Última Mamada */}
          <div className="widget-card card">
            <h3 className="widget-title">
              <IconHistory /> Última Amamentação
            </h3>
            {lastFeeding ? (
              <div className="widget-content">
                <div className="widget-primary-val">
                  <span className={`breast-badge ${lastFeeding.breast.toLowerCase()}`}>
                    Mama {lastFeeding.breast}
                  </span>
                </div>
                <div className="widget-details">
                  <p>Terminou às <strong>{formatTimeOfDay(lastFeeding.endTime)}</strong> ({formatDateLabel(lastFeeding.endTime)})</p>
                  <p>Duração: <strong>{formatShortDuration(lastFeeding.duration)}</strong></p>
                  {lastFeeding.note && (
                    <div className="widget-note-preview">
                      <strong>Obs:</strong> {lastFeeding.note}
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="widget-empty">
                <p>Nenhuma mamada registrada.</p>
                <p className="hint">Inicie o cronômetro acima para começar.</p>
              </div>
            )}
          </div>

          {/* Card: Próxima Previsão */}
          <div className="widget-card card">
            <h3 className="widget-title">
              <IconClock /> Próxima Mamada
            </h3>
            {nextFeeding ? (
              <div className="widget-content">
                <div className="widget-primary-val">
                  <span className="next-time">{nextFeeding.timeFormatted}</span>
                </div>
                <div className="widget-details">
                  <p className={`countdown-badge ${nextFeeding.isOverdue ? 'overdue' : 'pending'}`}>
                    {nextFeeding.statusText}
                  </p>
                  <p className="hint">Previsão baseada no início da última mamada ({formatInterval(activeInterval)}).</p>
                </div>
              </div>
            ) : (
              <div className="widget-empty">
                <p>Aguardando primeiro registro para calcular.</p>
              </div>
            )}
          </div>
        </section>

        {/* Histórico Recente */}
        <section className="history-section card">
          <div className="history-header">
            <h2 className="section-title">Histórico Recente</h2>
            {history.length > 0 && (
              <button
                type="button"
                className="btn-clear-history"
                onClick={handleClearHistory}
                title="Limpar todo o histórico"
              >
                <IconTrash /> Limpar tudo
              </button>
            )}
          </div>

          {history.length > 0 ? (
            <div className="history-list-wrapper">
              <ul className="history-list">
                {history.map((record) => (
                  <li key={record.id} className="history-item">
                    <div className="item-breast-info">
                      <span className={`breast-dot ${record.breast.toLowerCase()}`}></span>
                      <span className="item-breast-label">Mama {record.breast}</span>
                    </div>
                    <div className="item-time-flow">
                      <span className="time-node">{formatTimeOfDay(record.startTime)}</span>
                      <IconArrowRight />
                      <span className="time-node">{formatTimeOfDay(record.endTime)}</span>
                      <span className="item-date-label">({formatDateLabel(record.endTime)})</span>
                    </div>
                    <div className="item-duration">
                      <span>Duração: <strong>{formatShortDuration(record.duration)}</strong></span>
                    </div>
                    {record.note && (
                      <div className="item-note-display">
                        <span className="note-icon">📝</span>
                        <span className="note-text">{record.note}</span>
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="history-empty">
              <p>Nenhuma mamada no histórico ainda.</p>
            </div>
          )}
        </section>
      </main>

      <footer className="app-footer">
        <p>Timer de Amamentação &copy; {new Date().getFullYear()} - Feito com carinho para as mamães</p>
      </footer>
    </div>
  );
}

export default App;
