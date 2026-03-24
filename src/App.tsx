import React, { useState, useRef, useEffect } from 'react';
import './App.css';

const SYLLABLES_K = [
  'ba', 'bo', 'bu', 'by', // bak, bok, buk, byk
  'ha', 'hu', // hak, huk
  'ja', // jak
  'ko', // kok
  'le', 'lo', // lek, lok
  'łu', 'ły', // łuk, łyk
  'ma', // mak
  'ra', 'ro', 'ry', // rak, rok, ryk
  'so', 'sy', // sok, syk
  'ta' // tak
];

const SYLLABLES_S = [
  'ba', 'bi', 'bu', // bas, bis, bus
  'ci', // cis
  'ko', // kos
  'la', 'li', 'lo', // las, lis, los
  'mu', // mus
  'no', // nos
  'pa', // pas
  'so', 'su' // sos, sus
];

const EMOJI_MAP: Record<string, string> = {
  'bak': '⛽',    'bok': '📦',    'buk': '🌳',    'byk': '🐃',
  'hak': '🪝',    'huk': '💥',
  'jak': '❓',    
  'kok': '👱‍♀️',
  'lek': '💊',    'lok': '👩‍🦱',
  'łuk': '🏹',    'łyk': '🥤',
  'mak': '🌺',
  'rak': '🦀',    'rok': '📅',    'ryk': '🦁',
  'sok': '🧃',    'syk': '🐍',
  'tak': '👍',
  'bas': '🎸',    'bis': '👏',    'bus': '🚌',    'cis': '🌲',
  'kos': '🐦',
  'las': '🌲',    'lis': '🦊',    'los': '🎲',
  'mus': '🥣',    
  'nos': '👃',
  'pas': '🥋',
  'sos': '🥫',    'sus': '🦘'
};

const VOWELS = new Set(['a', 'e', 'i', 'o', 'u', 'y', 'ą', 'ę', 'ó']);
const LEGO_WIDTHS = [2, 3, 4]; // Wypustki
const STUD_SIZE = 40; // 40px szerokości na wypustkę
const BRICK_HEIGHT_STEP = 32; // 32px wysokości na ząbek (+8px wychodzące poza obrys)

const getRandomColor = () => `hsl(${Math.floor(Math.random() * 360)}, 80%, 55%)`;

interface LegoData {
  id: string;
  width: number;
  height: number;
  color: string;
  x: number;
  y: number;
}

const ColoredSyllable: React.FC<{ text: string }> = ({ text }) => {
  return (
    <>
      {text.split('').map((char, index) => {
        const isVowel = VOWELS.has(char.toLowerCase());
        const color = isVowel ? 'var(--tile-text-right)' : 'var(--tile-text-left)';
        return (
          <span key={index} style={{ color }}>
            {char}
          </span>
        );
      })}
    </>
  );
};

const LegoBrick = ({ 
    brick,
    studsVisible,
    isDragging, 
    onPointerDown 
}: { 
    brick: LegoData;
    studsVisible: boolean[];
    isDragging: boolean;
    onPointerDown: (e: React.PointerEvent, id: string) => void;
}) => {
  return (
    <div
      className={`lego-brick ${isDragging ? 'is-dragging' : ''}`}
      style={{
        left: brick.x,
        top: brick.y,
        width: brick.width * STUD_SIZE,
        height: brick.height * BRICK_HEIGHT_STEP,
        background: brick.color,
      }}
      onPointerDown={(e) => onPointerDown(e, brick.id)}
    >
      {studsVisible.map((visible, i) => (
        <div 
          key={i} 
          className="lego-stud" 
          style={{ 
            backgroundColor: brick.color,
            visibility: visible ? 'visible' : 'hidden'
          }} 
        />
      ))}
    </div>
  );
};

const SettingsModal = ({
    onSave,
    initialSyllables,
    initialRight
}: {
    onSave: (syls: string[], right: 'k' | 's') => void;
    initialSyllables: string[];
    initialRight: 'k' | 's';
}) => {
    const [sc, setSc] = useState<Set<string>>(new Set(initialSyllables));
    const [right, setRight] = useState<'k' | 's'>(initialRight);

    const currentSyllables = right === 'k' ? SYLLABLES_K : SYLLABLES_S;

    const toggleSyl = (s: string) => {
        setSc(prev => {
            const next = new Set(prev);
            if (next.has(s)) next.delete(s);
            else next.add(s);
            return next;
        });
    };

    const selectAllSyls = (selectAll: boolean) => {
        if (selectAll) setSc(new Set(currentSyllables));
        else setSc(new Set());
    };

    const handleRightChange = (val: 'k' | 's') => {
        setRight(val);
        setSc(new Set(val === 'k' ? SYLLABLES_K : SYLLABLES_S));
    };

    const handleSave = () => {
        if (sc.size === 0) {
            alert('Wybierz przynajmniej jedną sylabę!');
            return;
        }
        onSave(Array.from(sc), right);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Wybierz grające sylaby</h2>
                <p style={{fontSize: '0.85rem', color: '#64748b', textAlign: 'center', marginTop: '-15px'}}>
                    Po przeczytaniu wyrazu wciśnij klawisz "1", by pojawił się klocek-nagroda.
                </p>
                
                <div style={{ background: '#f1f5f9', padding: '15px 20px', borderRadius: '12px' }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#1e293b', borderBottom: '2px solid #cbd5e1', paddingBottom: '10px' }}>Prawa strona (Zakończenie)</h3>
                    <div style={{ display: 'flex', gap: '20px' }}>
                        <label className="checkbox-label" style={{ opacity: right === 'k' ? 1 : 0.6 }}>
                            <input type="radio" name="rEnding" checked={right === 'k'} onChange={() => handleRightChange('k')} />
                            k
                        </label>
                        <label className="checkbox-label" style={{ opacity: right === 's' ? 1 : 0.6 }}>
                            <input type="radio" name="rEnding" checked={right === 's'} onChange={() => handleRightChange('s')} />
                            s
                        </label>
                    </div>
                </div>

                <div className="settings-columns">
                    <div className="settings-column">
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15, borderBottom: '2px solid #cbd5e1', paddingBottom: 10}}>
                            <h3 style={{margin: 0, border: 'none', padding: 0}}>Lewa strona</h3>
                            <div>
                                <button className="small-btn" onClick={() => selectAllSyls(true)}>Wszystkie</button>
                                <button className="small-btn" onClick={() => selectAllSyls(false)} style={{marginLeft: 5}}>Żadne</button>
                            </div>
                        </div>
                        <div className="checkbox-grid">
                            {currentSyllables.map(s => (
                                <label key={s} className="checkbox-label">
                                    <input 
                                        type="checkbox" 
                                        checked={sc.has(s)} 
                                        onChange={() => toggleSyl(s)}
                                    />
                                    {s}
                                </label>
                            ))}
                        </div>
                    </div>
                </div>

                <button className="save-btn" onClick={handleSave}>Rozpocznij grę!</button>
            </div>
        </div>
    );
};

function App() {
  const [showSettings, setShowSettings] = useState(true);
  const [activeSyllables, setActiveSyllables] = useState<string[]>(SYLLABLES_K);
  const [unusedSyllables, setUnusedSyllables] = useState<string[]>(SYLLABLES_K);
  const [targetSyllable, setTargetSyllable] = useState<string>('ba');
  const [spinningItems, setSpinningItems] = useState<string[]>([]);
  const [spinPhase, setSpinPhase] = useState<'idle' | 'spinning' | 'waiting'>('idle');
  const [targetRight, setTargetRight] = useState<'k' | 's'>('k');
  const [rewardPos, setRewardPos] = useState({ x: -289, y: 100 });
  const slotRef = useRef<HTMLDivElement>(null);
  
  // ==== STATE DLA KLOCKÓW ====
  const [legoBricks, setLegoBricks] = useState<LegoData[]>([]);
  const [draggingBrickId, setDraggingBrickId] = useState<string | null>(null);

  const dragInfo = useRef({
    startX: 0,
    startY: 0,
    initialX: 0,
    initialY: 0
  });

  const boardRef = useRef<HTMLDivElement>(null);

  // Globalny Keydown listener dla akcji klawisza 1 (Krok "Waiting")
  useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
          if (e.key === '1' && spinPhase === 'waiting') {
              addRandomLego();
              setSpinPhase('idle');
          }
      };
      
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
  }, [spinPhase]);

  useEffect(() => {
    setSpinningItems(['ba']);
  }, []);

  const addRandomLego = () => {
      const w = LEGO_WIDTHS[Math.floor(Math.random() * LEGO_WIDTHS.length)];
      const startX = -289 - (w * STUD_SIZE) / 2; // -289 to precyzyjny środek maszyny od lewej listwy tablicy
      const h = Math.random() > 0.6 ? 2 : 1; // 40% szans na rzad dwoch klockow wzwyz
      
      let startY = 100;
      if (boardRef.current) {
          const machine = document.querySelector('.cartoon-slot-machine');
          if (machine) {
              const mRect = machine.getBoundingClientRect();
              const bRect = boardRef.current.getBoundingClientRect();
              const brickHeight = h * BRICK_HEIGHT_STEP;
              // Ustawiamy klocka tak, żeby jego dolna krawędź była 50px nad maszyną
              startY = mRect.top - bRect.top - brickHeight - 50;
          }
      }
      
      setLegoBricks(prev => [
          ...prev,
          {
              id: Math.random().toString(36).substr(2, 9),
              width: w,
              height: h,
              color: getRandomColor(),
              x: startX,
              y: startY
          }
      ]);
  }

  const hasUnplacedBricks = legoBricks.some(b => b.x < 0);

  const startSpin = () => {
    if (spinPhase !== 'idle' || hasUnplacedBricks) return;
    setSpinPhase('spinning');
    
    let currentPool = unusedSyllables.length > 0 ? unusedSyllables : activeSyllables;
    if (currentPool.length === 0) currentPool = activeSyllables;

    const getRandomSyl = (pool: string[]) => pool[Math.floor(Math.random() * pool.length)];

    let newTarget = getRandomSyl(currentPool);
    while (newTarget === targetSyllable && currentPool.length > 1) {
      newTarget = getRandomSyl(currentPool);
    }

    const nextUnused = currentPool.filter(s => s !== newTarget);
    if (nextUnused.length === 0) {
        setUnusedSyllables(activeSyllables.filter(s => s !== newTarget));
    } else {
        setUnusedSyllables(nextUnused);
    }

    const sequence: string[] = [newTarget];
    for (let i = 0; i < 39; i++) {
        sequence.push(getRandomSyl(activeSyllables));
    }
    sequence.push(targetSyllable);
    
    setSpinningItems(sequence);
    setTargetSyllable(newTarget);

    setTimeout(() => {
        setSpinningItems([newTarget]);
        
        let y = 100;
        if (boardRef.current) {
            const machine = document.querySelector('.cartoon-slot-machine');
            if (machine) {
                const mRect = machine.getBoundingClientRect();
                const bRect = boardRef.current.getBoundingClientRect();
                y = mRect.top - bRect.top - 100; // 100px gap dla emoji
            }
        }
        setRewardPos({ x: -289, y });

        // Zatrzymujemy w statusie "waiting", pokazując emoji
        setSpinPhase('waiting');

    }, 3000);
  };

  // ==== HANDLERY LEGO ====
  const handlePointerDownBrick = (e: React.PointerEvent, id: string) => {
    e.preventDefault(); 
    e.stopPropagation();
    if (e.button !== 0) return;

    const b = legoBricks.find(brick => brick.id === id);
    if (!b) return;

    setDraggingBrickId(id);
    dragInfo.current = {
      startX: e.clientX,
      startY: e.clientY,
      initialX: b.x,
      initialY: b.y
    };

    // Przesuń klocek na koniec tablicy, aby renderował się najwyżej (na wierzchu)
    setLegoBricks(prev => {
        const filtered = prev.filter(br => br.id !== id);
        return [...filtered, b];
    });
  };

  const handlePointerMoveBoard = (e: React.PointerEvent) => {
    if (!draggingBrickId) return;

    const dx = e.clientX - dragInfo.current.startX;
    const dy = e.clientY - dragInfo.current.startY;

    setLegoBricks(prev => prev.map(b => {
      if (b.id === draggingBrickId) {
        return {
          ...b,
          x: dragInfo.current.initialX + dx,
          y: dragInfo.current.initialY + dy
        };
      }
      return b;
    }));
  };

  const handlePointerUpBoard = () => {
    if (draggingBrickId) {
      setLegoBricks(prev => {
        // Find the brick that was dragged
        const dragging = prev.find(b => b.id === draggingBrickId);
        if (!dragging) return prev;
        
        let snappedX = Math.round(dragging.x / STUD_SIZE) * STUD_SIZE;
        let snappedY = Math.round(dragging.y / BRICK_HEIGHT_STEP) * BRICK_HEIGHT_STEP;

        // Collision Check: Are any other bricks occupying these exact pixels in grid?
        let isCollision = false;
        
        for (const other of prev) {
            if (other.id === draggingBrickId) continue;
            
            // Kolizja w osi Y (Box Intersection 1D)
            const top1 = snappedY;
            const bottom1 = snappedY + dragging.height * BRICK_HEIGHT_STEP;
            const top2 = other.y;
            const bottom2 = other.y + other.height * BRICK_HEIGHT_STEP;

            if (top1 < bottom2 && bottom1 > top2) {
                // Kolizja w osi X
                const left1 = snappedX;
                const right1 = snappedX + dragging.width * STUD_SIZE;
                const left2 = other.x;
                const right2 = other.x + other.width * STUD_SIZE;
                
                if (left1 < right2 && right1 > left2) {
                    isCollision = true;
                    break;
                }
            }
        }

        if (isCollision) {
            // Revert to initial snapped position
            snappedX = Math.round(dragInfo.current.initialX / STUD_SIZE) * STUD_SIZE;
            snappedY = Math.round(dragInfo.current.initialY / BRICK_HEIGHT_STEP) * BRICK_HEIGHT_STEP;
        }

        // Sprawdzanie granic planszy, by klocek nie uciekł na zewnątrz
        let isOutOfBounds = false;
        if (boardRef.current) {
            const maxX = boardRef.current.clientWidth;
            const maxY = boardRef.current.clientHeight;
            if (snappedX < 0 || snappedY < 0 || 
                snappedX + dragging.width * STUD_SIZE > maxX || 
                snappedY + dragging.height * BRICK_HEIGHT_STEP > maxY) {
                isOutOfBounds = true;
            }
        }

        if (isOutOfBounds) {
            // Revert do poprzedniej, bezpiecznej pozycji
            snappedX = Math.round(dragInfo.current.initialX / STUD_SIZE) * STUD_SIZE;
            snappedY = Math.round(dragInfo.current.initialY / BRICK_HEIGHT_STEP) * BRICK_HEIGHT_STEP;
        }

        return prev.map(b => {
          if (b.id === draggingBrickId) {
            return { ...b, x: snappedX, y: snappedY };
          }
          return b;
        });
      });
      setDraggingBrickId(null);
    }
  };

  return (
    <>
      {showSettings && (
          <SettingsModal 
              initialSyllables={activeSyllables} 
              initialRight={targetRight}
              onSave={(syls, right) => {
                  setActiveSyllables(syls);
                  setTargetRight(right);
                  setTargetSyllable(syls[0] || 'ba');
                  setUnusedSyllables(syls);
                  setShowSettings(false);
              }} 
          />
      )}
      <div 
        className="app-container"
        onPointerMove={handlePointerMoveBoard}
        onPointerUp={handlePointerUpBoard}
        onPointerCancel={handlePointerUpBoard}
        onPointerLeave={handlePointerUpBoard}
    >
      <div className="header">
        <h1 className="title">Losowanie i budowanie z Dzieszkoła.pl</h1>
      </div>

      <div className="main-content">
        <div className="slot-section">
          <div className="cartoon-slot-machine">
            <div className="machine-top">
              <div className="bulb"></div>
              <div className="bulb"></div>
              <div className="bulb"></div>
              <div className="bulb"></div>
              <div className="bulb"></div>
            </div>
            
            <div className="slot-machine-display">
              <div className="tile-part left slot-window">
                  <div className="slot-inner-shadow"></div>
                  <div 
                      className={`slot-reel phase-${spinPhase}`}
                      ref={slotRef}
                  >
                      {spinningItems.map((syl, i) => (
                          <div key={i} className="slot-item">
                              <ColoredSyllable text={syl} />
                          </div>
                      ))}
                  </div>
              </div>
              
              <div className="tile-part right">
                   <div className="slot-item">
                      <ColoredSyllable text={targetRight} />
                   </div>
              </div>
            </div>
            
            <div className="machine-bottom">
              <button 
                className={`spin-btn ${spinPhase !== 'idle' ? 'pressed' : ''}`}
                onClick={startSpin}
                disabled={spinPhase !== 'idle' || hasUnplacedBricks}
              >
                  {spinPhase === 'spinning' ? 'Losowanie...' : 'Start!'}
              </button>
            </div>
          </div>
          <button 
            className="settings-btn"
            style={{ marginTop: '80px' }}
            onClick={() => setShowSettings(true)}
            disabled={spinPhase !== 'idle'}
          >
            ⚙️ Ustawienia
          </button>
        </div>

        {/* Prawa strona: Klocki Lego */}
        <div className="lego-board" ref={boardRef}>
            {legoBricks.map(brick => {
                const studsVisible = Array.from({ length: brick.width }).map((_, i) => {
                    const studGlobalX = brick.x + i * STUD_SIZE;
                    
                    // Jesli choc jeden klocek lezy dokładnie "piętro wyżej" i przykrywa konkretnie tę wypustkę
                    const isCovered = legoBricks.some(other => 
                        other.id !== brick.id && 
                        other.y + other.height * BRICK_HEIGHT_STEP === brick.y && 
                        other.x <= studGlobalX && 
                        other.x + other.width * STUD_SIZE > studGlobalX
                    );
                    
                    return !isCovered;
                });

                return (
                    <LegoBrick 
                        key={brick.id} 
                        brick={brick} 
                        studsVisible={studsVisible}
                        isDragging={draggingBrickId === brick.id} 
                        onPointerDown={handlePointerDownBrick}
                    />
                );
            })}
            
            {legoBricks.length === 0 && (
              <div style={{position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', opacity: 0.3, letterSpacing: '2px', fontWeight: 800, color: 'white', fontSize: '2rem'}}>
                KLOCKI LEGO POJAWIĄ SIĘ<br/>PO PIERWSZYM LOSOWANIU
              </div>
            )}

            {spinPhase === 'waiting' && EMOJI_MAP[(targetSyllable + targetRight).toLowerCase()] && (
                <div 
                  className="word-graphic" 
                  style={{ 
                    left: rewardPos.x, 
                    top: rewardPos.y
                  }}
                >
                    {EMOJI_MAP[(targetSyllable + targetRight).toLowerCase()]}
                </div>
            )}
        </div>
      </div>
      </div>
    </>
  );
}

export default App;
