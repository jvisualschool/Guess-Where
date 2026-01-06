import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, ExternalLink, Lightbulb, ChevronRight, Lock as LockIcon, Globe, X } from 'lucide-react';
import confetti from 'canvas-confetti';
import { locations } from './data/locations';
import './App.css';
import './Admin.css';

const App: React.FC = () => {
  const [adminLocations, setAdminLocations] = useState(() => {
    const saved = localStorage.getItem('guess-where-data');
    return saved ? JSON.parse(saved) : locations;
  });
  const [shuffledLocations, setShuffledLocations] = useState(adminLocations);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [hintLevel, setHintLevel] = useState(1);
  const [isRevealed, setIsRevealed] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [useRandomPosition, setUseRandomPosition] = useState(true);
  const [maskPosition, setMaskPosition] = useState({ x: 50, y: 50 });
  const [view, setView] = useState<'game' | 'admin'>('game');
  const [showModal, setShowModal] = useState(false);

  React.useEffect(() => {
    playSound('start');

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowModal(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  React.useEffect(() => {
    localStorage.setItem('guess-where-data', JSON.stringify(adminLocations));
  }, [adminLocations]);

  const currentLocation = shuffledLocations[currentIndex];

  const updateImageUrl = (id: string, newUrl: string) => {
    setAdminLocations((prev: typeof locations) => {
      const updated = prev.map((loc: typeof locations[0]) => loc.id === id ? { ...loc, imageUrl: newUrl } : loc);
      return updated;
    });
  };

  const copyAdminData = () => {
    const dataString = JSON.stringify(adminLocations, null, 2);
    navigator.clipboard.writeText(dataString);
    alert('데이터가 클립보드에 복사되었습니다. (JSON 형식)\n필요 시 이 데이터를 복사하여 저에게 보내주시면 서버 코드에 영구 반영해 드립니다.');
  };

  const shuffleArray = (array: any[]) => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  const generateRandomPosition = () => {
    const x = Math.floor(Math.random() * 60) + 20;
    const y = Math.floor(Math.random() * 60) + 20;
    setMaskPosition({ x, y });
  };

  const playSound = (type: 'start' | 'good') => {
    const audio = new Audio();
    if (type === 'start') {
      audio.src = '/WHERE/MP3/start.mp3';
    } else {
      const randomNum = Math.floor(Math.random() * 4) + 1;
      audio.src = `/WHERE/MP3/good${randomNum}.mp3`;
    }
    audio.play().catch(e => console.log('Audio play failed:', e));
  };

  const handleStartGame = () => {
    const randomized = shuffleArray(adminLocations);
    setShuffledLocations(randomized);
    setCurrentIndex(0);
    resetLevel();
    setGameStarted(true);
    playSound('start');
  };

  const handleNext = () => {
    if (currentIndex < shuffledLocations.length - 1) {
      setCurrentIndex(prev => prev + 1);
      resetLevel();
    } else {
      handleStartGame();
    }
  };

  const resetLevel = () => {
    setHintLevel(1);
    setIsRevealed(false);
    if (useRandomPosition) {
      generateRandomPosition();
    } else {
      setMaskPosition({ x: 50, y: 50 });
    }
  };

  const handleHint = () => {
    if (hintLevel < 5) {
      setHintLevel(prev => prev + 1);
    }
  };

  const triggerRandomConfetti = () => {
    const effect = Math.floor(Math.random() * 5);
    switch (effect) {
      case 0: confetti({ particleCount: 150, spread: 100, origin: { y: 0.6 }, colors: ['#FFD700', '#FF4500', '#00BFFF', '#32CD32', '#FF69B4'] }); break;
      case 1: confetti({ particleCount: 40, scalar: 1.2, shapes: ['star'], origin: { y: 0.5 } }); break;
      case 2: confetti({ particleCount: 100, angle: 60, spread: 55, origin: { x: 0 } }); confetti({ particleCount: 100, angle: 120, spread: 55, origin: { x: 1 } }); break;
      case 3:
        const duration = 2000;
        const end = Date.now() + duration;
        (function frame() {
          confetti({ particleCount: 5, angle: 90, spread: 90, origin: { x: 0.5, y: 0 } });
          if (Date.now() < end) requestAnimationFrame(frame);
        }());
        break;
      case 4:
        const count = 200;
        const fire = (particleRatio: number, opts: any) => { confetti({ origin: { y: 0.7 }, ...opts, particleCount: Math.floor(count * particleRatio) }); };
        fire(0.25, { spread: 26, startVelocity: 55 }); fire(0.2, { spread: 60 }); fire(0.35, { spread: 100, decay: 0.91 }); fire(0.1, { spread: 120, startVelocity: 25 });
        break;
    }
  };

  const handleReveal = () => {
    setIsRevealed(true);
    triggerRandomConfetti();
    playSound('good');
  };

  const maskStyles = useMemo(() => {
    if (isRevealed) return `circle(150% at ${maskPosition.x}% ${maskPosition.y}%)`;
    let size = 8;
    switch (hintLevel) {
      case 1: size = 8; break;
      case 2: size = 15; break;
      case 3: size = 25; break;
      case 4: size = 40; break;
      case 5: size = 60; break;
    }
    return `circle(${size}% at ${maskPosition.x}% ${maskPosition.y}%)`;
  }, [hintLevel, isRevealed, maskPosition]);

  if (view === 'admin') {
    return (
      <div className="admin-container">
        <header className="admin-header">
          <h1><Search size={32} color="#10b981" /> 관리자 대시보드</h1>
          <div className="admin-actions">
            <button onClick={copyAdminData} className="admin-btn copy">
              <ExternalLink size={18} /> 전체 데이터 복사 (JSON)
            </button>
            <button onClick={() => setView('game')} className="admin-btn back">
              게임으로 돌아가기
            </button>
          </div>
        </header>

        <div className="locations-grid">
          {adminLocations.map((loc: typeof locations[0]) => (
            <div key={loc.id} className="location-admin-card" id={`loc-${loc.id}`}>
              <div className="loc-id">#{loc.id}</div>
              <div className="loc-name">{loc.nameKo}<br /><span style={{ opacity: 0.5, fontSize: '0.8rem' }}>{loc.name}</span></div>
              <div className="loc-preview">
                <img src={loc.imageUrl} alt={loc.name} key={loc.imageUrl} />
              </div>
              <input
                type="text"
                className="loc-url-input"
                value={loc.imageUrl}
                onChange={(e) => updateImageUrl(loc.id, e.target.value)}
              />
              <div style={{ fontSize: '0.8rem', opacity: 0.7 }}>
                {loc.countryKo} ({loc.country})
              </div>
              <button
                onClick={() => window.open(loc.imageUrl, '_blank')}
                className="admin-btn refresh"
                style={{ padding: '0.4rem' }}
              >
                열기
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const handleAdminClick = () => {
    const password = window.prompt('관리자 비밀번호를 입력하세요:');
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || '071300';

    if (password === adminPassword) {
      setView('admin');
    } else if (password !== null) {
      alert('비밀번호가 틀렸습니다.');
    }
  };

  if (!gameStarted) {
    return (
      <div className="start-screen">
        <div className="admin-toggle">
          <button onClick={handleAdminClick} title="Admin Login">
            <LockIcon size={14} />
          </button>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-panel start-card"
        >
          <div className="logo-container" onClick={() => setShowModal(true)} style={{ cursor: 'pointer' }}>
            <Globe size={48} className="logo-icon animate-float" />
          </div>
          <h1>GUESS <span className="thin">WHERE</span></h1>
          <p>전세계 유명한 장소들을 사진의 일부만 보고 맞춰보세요!</p>

          <div className="options glass-panel">
            <label className="option-item">
              <input
                type="checkbox"
                checked={useRandomPosition}
                onChange={(e) => setUseRandomPosition(e.target.checked)}
              />
              <span>힌트 위치 무작위 설정</span>
            </label>
            <div className="option-info">체크 시 힌트가 화면의 랜덤한 위치에 나타납니다.</div>
          </div>

          <div className="rules">
            <span>• 사진의 아주 작은 일부분부터 보여드립니다.</span>
            <span>• 정답을 아시는 분은 큰 소리로 외쳐주세요!</span>
            <span>• 힌트를 누를수록 더 넓은 영역이 보입니다.</span>
          </div>
          <button onClick={handleStartGame} className="start-button">
            게임 시작하기 <ChevronRight size={20} />
          </button>
        </motion.div>

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="modal-content glass-panel"
              onClick={e => e.stopPropagation()}
            >
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={24} />
              </button>
              <div className="modal-image-container">
                <img src="/WHERE/splash.jpg" alt="Splash" className="splash-image" />
              </div>
              <div className="modal-text">
                <h2>GUESS <span className="thin">WHERE</span></h2>
                <div className="modal-info">
                  <p>
                    <strong>Tech Stack:</strong>{' '}
                    <a href="https://react.dev" target="_blank" rel="noopener noreferrer">React</a> •{' '}
                    <a href="https://www.typescriptlang.org" target="_blank" rel="noopener noreferrer">TypeScript</a> •{' '}
                    <a href="https://vitejs.dev" target="_blank" rel="noopener noreferrer">Vite</a> •{' '}
                    <a href="https://www.framer.com/motion/" target="_blank" rel="noopener noreferrer">Framer Motion</a>
                  </p>
                  <p>
                    <strong>Created by:</strong>{' '}
                    <a href="mailto:jvisualschool@gmail.com">Jinho Jung</a>
                  </p>
                  <p className="footer-copyright">2026 © All Rights Reserved</p>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        <footer className="start-footer">
          <div className="footer-content">
            <span className="app-title">GUESS <span className="thin">WHERE</span></span>
            <span className="divider">|</span>
            <span className="tech-stack">
              <a href="https://react.dev" target="_blank" rel="noopener noreferrer">React</a> •{' '}
              <a href="https://www.typescriptlang.org" target="_blank" rel="noopener noreferrer">TypeScript</a> •{' '}
              <a href="https://vitejs.dev" target="_blank" rel="noopener noreferrer">Vite</a> •{' '}
              <a href="https://www.framer.com/motion/" target="_blank" rel="noopener noreferrer">Framer Motion</a>
            </span>
            <span className="divider">|</span>
            <span className="creator">
              Created by <a href="mailto:jvisualschool@gmail.com">Jinho Jung</a>
            </span>
            <span className="copyright">2026 © All Rights Reserved</span>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="game-container">
      <div className={`image-layer ${isRevealed ? 'revealed' : ''}`} key={currentIndex}>
        <div className="black-bg" />
        <motion.div
          className="reveal-mask"
          initial={{ clipPath: `circle(0% at ${maskPosition.x}% ${maskPosition.y}%)` }}
          animate={{ clipPath: maskStyles }}
          transition={{ type: 'spring', damping: 25, stiffness: 80 }}
        >
          <img
            src={currentLocation.imageUrl}
            alt="Target"
            className="base-image"
          />
        </motion.div>
      </div>

      <div className="ui-overlay">
        <header className="game-header">
          <div className="location-badge glass-panel">
            <MapPin size={16} />
            <span>QUIZ {currentIndex + 1}</span>
          </div>
          <div className="progress-badge glass-panel">
            {currentIndex + 1} / {locations.length}
          </div>
        </header>

        <main className="game-main">
          {isRevealed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-panel result-card"
            >
              <div className="result-header">
                <h2>{currentLocation.nameKo}<br /><span>{currentLocation.name}</span></h2>
                <h3>{currentLocation.countryKo} <span>{currentLocation.country}</span></h3>
              </div>
              <div className="result-description">
                <p>{currentLocation.descriptionKo}</p>
                <p className="desc-en">{currentLocation.description}</p>
              </div>
              <div className="result-actions">
                <a
                  href={currentLocation.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="map-link"
                >
                  <MapPin size={18} /> Google 지도에서 보기 <ExternalLink size={14} />
                </a>
              </div>
            </motion.div>
          )}
        </main>

        <footer className="game-footer">
          {!isRevealed && (
            <div className="hint-steps-container">
              <div className="hint-steps">
                {[1, 2, 3, 4, 5].map((lvl) => (
                  <div
                    key={lvl}
                    className={`step ${hintLevel >= lvl ? 'active' : ''}`}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="control-panel glass-panel">
            <div className="quiz-controls">
              <button
                onClick={handleHint}
                disabled={hintLevel >= 5 || isRevealed}
                className="control-button hint"
                style={{ visibility: isRevealed ? 'hidden' : 'visible' }}
              >
                <Lightbulb size={20} />
                <span>힌트 ({hintLevel}/5)</span>
              </button>

              {!isRevealed ? (
                <button
                  onClick={handleReveal}
                  className="control-button reveal"
                >
                  <Search size={20} />
                  <span>정답 보기</span>
                </button>
              ) : (
                <button onClick={handleNext} className="control-button next">
                  <span>다음 장소로</span>
                  <ChevronRight size={20} />
                </button>
              )}
            </div>
          </div>
        </footer>
      </div>

      <div className="vignette"></div>
    </div>
  );
};

export default App;
