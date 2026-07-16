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

  const [activeBreast, setActiveBreast] = useState(null); // 'Esquerda' | 'Direita' | null
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0); // Tempo decorrido em segundos
  const [warningMessage, setWarningMessage] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());

  const timerRef = useRef(null);
  const startTimeRef = useRef(0);

  // Deriva o último registro do histórico
  const lastFeeding = history.length > 0 ? history[0] : null;

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
  };

  const handleResetTimer = () => {
    if (window.confirm('Deseja realmente cancelar o timer atual? O progresso será perdido.')) {
      setIsRunning(false);
      setTime(0);
      setActiveBreast(null);
      setWarningMessage('');
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

    const lastEnd = new Date(lastFeeding.endTime);
    // Exatamente 3 horas após o término da última mamada
    const nextTime = new Date(lastEnd.getTime() + 3 * 60 * 60 * 1000);
    
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
                  <p className="hint">Previsão baseada no intervalo ideal de 3h.</p>
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
