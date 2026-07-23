import { useState, useEffect } from 'react';
import Greeting from './Greeting';
import './App.css';

function App() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [allSpells, setAllSpells] = useState([]);
  const [collectedSpellIds, setCollectedSpellIds] = useState(new Set());
  const [activeTab, setActiveTab] = useState('gacha'); // 'gacha' | 'book'

  // 初回にすべての呪文データをロードしておく（図鑑機能のため）
  useEffect(() => {
    fetch('https://hp-api.onrender.com/api/spells')
      .then((res) => res.json())
      .then((data) => setAllSpells(data))
      .catch((err) => console.error('呪文一覧の取得に失敗:', err));
  }, []);

  const getRandomRarity = () => {
    const rand = Math.random() * 100;
    if (rand < 3) {
      return { label: 'LR', color: '#ff007f', glow: 'rgba(255, 0, 127, 0.8)', text: '🌈 レジェンドレア' };
    } else if (rand < 15) {
      return { label: 'SSR', color: '#eab308', glow: 'rgba(234, 179, 8, 0.8)', text: '🌟 SSR' };
    } else if (rand < 40) {
      return { label: 'SR', color: '#a855f7', glow: 'rgba(168, 85, 247, 0.8)', text: '✨ SR' };
    } else {
      return { label: 'R', color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.8)', text: '🔹 R' };
    }
  };

  const handleCastSpell = async (count = 1) => {
    if (allSpells.length === 0) return;
    setLoading(true);
    setResults([]);

    setTimeout(() => {
      const drawnSpells = [];
      const newCollected = new Set(collectedSpellIds);

      for (let i = 0; i < count; i++) {
        const randomIndex = Math.floor(Math.random() * allSpells.length);
        const randomSpell = allSpells[randomIndex];
        const rarity = getRandomRarity();

        drawnSpells.push({
          ...randomSpell,
          rarity,
          uniqueKey: `${randomSpell.id}-${Date.now()}-${i}`
        });

        newCollected.add(randomSpell.id);
      }

      setResults(drawnSpells);
      setCollectedSpellIds(newCollected);
      setLoading(false);
    }, 600); // 演出用のウェイト時間
  };

  return (
    <div className="magic-container">
      <h1 className="magic-title">🧙‍♂️ HOGWARTS SPELL GACHA 🔮</h1>
      <p className="magic-subtitle">古代の魔法の力を呼び覚まし、大いなる呪文を習得せよ</p>

      {/* タブ切り替えボタン */}
      <div className="tab-container">
        <button 
          className={`tab-btn ${activeTab === 'gacha' ? 'active' : ''}`}
          onClick={() => setActiveTab('gacha')}
        >
          🎰 ガチャを引く
        </button>
        <button 
          className={`tab-btn ${activeTab === 'book' ? 'active' : ''}`}
          onClick={() => setActiveTab('book')}
        >
          📖 魔法図鑑 ({collectedSpellIds.size} / {allSpells.length})
        </button>
      </div>

      {activeTab === 'gacha' ? (
        <>
          <Greeting onCastSpell={handleCastSpell} isLoading={loading} />
          
          <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>
            💫 召喚確率: R (60%) | SR (25%) | SSR (12%) | LR (3%)
          </p>

          <div className="card-grid">
            {results.map((spell) => (
              <div 
                key={spell.uniqueKey} 
                className="spell-card"
                style={{
                  '--rarity-color': spell.rarity.color,
                  '--rarity-glow': spell.rarity.glow
                }}
              >
                <span className="rarity-badge">{spell.rarity.text}</span>
                <h3 className="spell-name">{spell.name}</h3>
                <p className="spell-desc">{spell.description || '効果不明の古い呪文...'}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        /* 図鑑コンポーネント */
        <div className="book-container">
          <h2>🧙‍♂️ 習得済み呪文一覧</h2>
          <div className="book-grid">
            {allSpells.map((spell) => {
              const isUnlocked = collectedSpellIds.has(spell.id);
              return (
                <div key={spell.id} className={`book-card ${isUnlocked ? '' : 'locked'}`}>
                  <h4 style={{ margin: '0 0 8px 0', color: isUnlocked ? '#fef08a' : '#6b7280' }}>
                    {isUnlocked ? spell.name : '？？？？？？'}
                  </h4>
                  <p style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                    {isUnlocked ? spell.description : '未習得の呪文です。ガチャで引き当ててください。'}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;