import { useState, useEffect } from 'react';
import Greeting from './Greeting';
import './App.css';

// 寮の設定
const HOUSES = {
  Gryffindor: { name: 'グリフィンドール', color: '#740001', accent: '#ae0001', gold: '#eab308' },
  Slytherin: { name: 'スリザリン', color: '#1a472a', accent: '#2a623d', gold: '#22c55e' },
  Ravenclaw: { name: 'レイブンクロー', color: '#0e1a40', accent: '#222f5b', gold: '#3b82f6' },
  Hufflepuff: { name: 'ハッフルパフ', color: '#ecb939', accent: '#f0c75e', gold: '#eab308' }
};

// 杖の選択肢
const WANDS = [
  'ヒイラギと鳳凰の羽根 (11インチ)',
  'ニワトコとセストラル（12インチ）',
  'トネリコとドラゴンの心臓の琴線 (12.5インチ)'
];

function App() {
  const [activeTab, setActiveTab] = useState('gacha'); // 'gacha' | 'book' | 'duel'
  const [allSpells, setAllSpells] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [collectedSpellIds, setCollectedSpellIds] = useState(new Set());
  
  // ステート
  const [house, setHouse] = useState('Gryffindor');
  const [wand, setWand] = useState(WANDS[0]);
  const [galleons, setGalleons] = useState(1500);
  const [showNews, setShowNews] = useState(true);
  const [isCastingCircle, setIsCastingCircle] = useState(false);

  // デュエル用ステート
  const [enemyHp, setEnemyHp] = useState(100);
  const [playerHp, setPlayerHp] = useState(100);
  const [duelLog, setDuelLog] = useState('マイクに向かって、習得した呪文を詠唱せよ！');
  const [isListening, setIsListening] = useState(false);

  useEffect(() => {
    fetch('https://hp-api.onrender.com/api/spells')
      .then((res) => res.json())
      .then((data) => setAllSpells(data))
      .catch((err) => console.error('呪文取得エラー:', err));
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--house-color', HOUSES[house].gold);
  }, [house]);

  const getRandomRarity = () => {
    const rand = Math.random() * 100;
    if (rand < 5) return { label: 'LR', color: '#ff007f', glow: 'rgba(255, 0, 127, 0.8)', text: '🌈 LR' };
    if (rand < 20) return { label: 'SSR', color: '#eab308', glow: 'rgba(234, 179, 8, 0.8)', text: '🌟 SSR' };
    if (rand < 50) return { label: 'SR', color: '#a855f7', glow: 'rgba(168, 85, 247, 0.8)', text: '✨ SR' };
    return { label: 'R', color: '#3b82f6', glow: 'rgba(59, 130, 246, 0.8)', text: '🔹 R' };
  };

  const handleCastSpell = (count = 1) => {
    const cost = count * 100;
    if (galleons < cost) {
      alert('ガリオン金貨が足りません！新聞でボーナスを受け取ってください。');
      return;
    }

    setGalleons((prev) => prev - cost);
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
    }, 600);
  };

  // 🎤 音声認識デュエル攻撃処理
  const handleVoiceAttack = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('お使いのブラウザは音声認識に対応していません。（Chrome / Safari 等を推進）');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US'; // 呪文名（Aberto, Lumosなど）が英語ベースのためen-US、またはja-JP

    recognition.onstart = () => {
      setIsListening(true);
      setDuelLog('🎤 呪文を聴き取っています...（習得済みの呪文を唱えて！）');
    };

    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript.trim().toLowerCase();
      
      // 所持している（図鑑にある）呪文から、発音と一致・部分一致するものを探す
      const myUnlockedSpells = allSpells.filter(s => collectedSpellIds.has(s.id));
      const matchedSpell = myUnlockedSpells.find(s => 
        spokenText.includes(s.name.toLowerCase()) || s.name.toLowerCase().includes(spokenText)
      );

      if (matchedSpell) {
        // 成功！
        const damage = Math.floor(Math.random() * 25) + 20; // 成功で強めのダメージ
        const enemyDamage = Math.floor(Math.random() * 15) + 5;

        const nextEnemyHp = Math.max(0, enemyHp - damage);
        const nextPlayerHp = Math.max(0, playerHp - enemyDamage);

        setEnemyHp(nextEnemyHp);
        setPlayerHp(nextPlayerHp);

        if (nextEnemyHp === 0) {
          setDuelLog(`✨ 詠唱成功！「${matchedSpell.name}」！！ 💥${damage}ダメージ！ 🎉 勝利！ (＋500金貨)`);
          setGalleons((prev) => prev + 500);
        } else {
          setDuelLog(`✨ 詠唱成功！「${matchedSpell.name}」発動！ 敵に ${damage} ダメージ！ (敵の反撃: ${enemyDamage}点)`);
        }
      } else {
        // 失敗（未習得、または聞き取れなかった）
        const enemyDamage = Math.floor(Math.random() * 20) + 10;
        const nextPlayerHp = Math.max(0, playerHp - enemyDamage);
        setPlayerHp(nextPlayerHp);

        setDuelLog(`⚠️ 呪文の詠唱に失敗…（認識: "${spokenText}"）。呪文が発動せず、反撃を受けた！ (${enemyDamage}ダメージ)`);
      }
    };

    recognition.start();
  };

  const resetDuel = () => {
    setEnemyHp(100);
    setPlayerHp(100);
    setDuelLog('マイクに向かって、習得した呪文を詠唱せよ！');
  };

  return (
    <div className="magic-container">
      {/* 📰 日刊予言者新聞 */}
      {showNews && (
        <div className="modal-overlay">
          <div className="newspaper-card">
            <div className="newspaper-title">DAILY PROPHET</div>
            <p style={{ fontWeight: 'bold', margin: '10px 0' }}>日刊予言者新聞 - 特別号</p>
            <p>「ホグワーツで新たな魔法使いがガチャを開始！」</p>
            <p style={{ fontSize: '0.85rem', margin: '15px 0' }}>本日のログインボーナスとして **500 ガリオン** を支給します。</p>
            <button className="btn-action" onClick={() => { setGalleons(g => g + 500); setShowNews(false); }}>
              金貨を受け取る 💰
            </button>
          </div>
        </div>
      )}

      {/* ステータスバー */}
      <div className="status-bar">
        <div>
          <span>所属: </span>
          <select value={house} onChange={(e) => setHouse(e.target.value)} style={{ background: '#222', color: '#fff', border: 'none', padding: '4px 8px', borderRadius: '4px' }}>
            {Object.keys(HOUSES).map((h) => (
              <option key={h} value={h}>{HOUSES[h].name}</option>
            ))}
          </select>
        </div>
        <div className="coin-badge">💰 {galleons} ガリオン</div>
      </div>

      <h1 style={{ color: HOUSES[house].gold }}>🧙‍♂️ HOGWARTS SPELL GACHA 🔮</h1>

      {/* タブナビゲーション */}
      <div className="tab-container">
        <button className={`tab-btn ${activeTab === 'gacha' ? 'active' : ''}`} onClick={() => setActiveTab('gacha')}>🎰 ガチャ</button>
        <button className={`tab-btn ${activeTab === 'book' ? 'active' : ''}`} onClick={() => setActiveTab('book')}>📖 魔法図鑑 ({collectedSpellIds.size}/{allSpells.length})</button>
        <button className={`tab-btn ${activeTab === 'duel' ? 'active' : ''}`} onClick={() => setActiveTab('duel')}>⚔️ 呪文デュエル</button>
      </div>

      {activeTab === 'gacha' && (
        <>
          <div className="wand-select-box">
            <label style={{ fontSize: '0.9rem', color: '#d1d5db' }}>装備する杖: </label>
            <select value={wand} onChange={(e) => setWand(e.target.value)} style={{ background: '#111', color: '#fff', border: '1px solid #444', padding: '4px' }}>
              {WANDS.map(w => <option key={w} value={w}>{w}</option>)}
            </select>

            <div className="magic-circle-zone" onMouseDown={() => setIsCastingCircle(true)} onMouseUp={() => setIsCastingCircle(false)}>
              <span style={{ fontSize: '0.8rem', color: '#d1d5db' }}>
                {isCastingCircle ? '✨ 魔法陣を詠唱中...' : '🪄 ここを掴んで魔法陣を描く'}
              </span>
            </div>
          </div>

          <Greeting onCastSpell={handleCastSpell} isLoading={loading} />

          <div className="card-grid">
            {results.map((spell) => (
              <div key={spell.uniqueKey} className="spell-card" style={{ '--rarity-color': spell.rarity.color, '--rarity-glow': spell.rarity.glow }}>
                <span className="rarity-badge">{spell.rarity.text}</span>
                <h3>{spell.name}</h3>
                <p style={{ fontSize: '0.85rem', color: '#d1d5db' }}>{spell.description || '古い魔法の呪文...'}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'book' && (
        <div className="book-container">
          <h2>📖 魔法図鑑</h2>
          <p style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '15px' }}>
            ※ここに載っている解放済みの英語の呪文名（Lumos, Alohomora等）をデュエルで叫ぼう！
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '15px' }}>
            {allSpells.map((spell) => {
              const unlocked = collectedSpellIds.has(spell.id);
              return (
                <div key={spell.id} style={{ background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', opacity: unlocked ? 1 : 0.4 }}>
                  <h4 style={{ margin: '0 0 6px 0', color: unlocked ? HOUSES[house].gold : '#888' }}>
                    {unlocked ? spell.name : '？？？？'}
                  </h4>
                  <p style={{ fontSize: '0.75rem', color: '#aaa' }}>{unlocked ? spell.description : '未獲得'}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeTab === 'duel' && (
        <div className="duel-container">
          <h2>⚔️ 音声認識 呪文デュエル</h2>
          <p style={{ fontSize: '0.9rem', color: '#aaa' }}>図鑑にある呪文を声で唱えて攻撃しよう！</p>

          <div className="duel-box">
            <div className="duel-fighter">
              <h3>🧙‍♂️ あなた</h3>
              <p>HP: {playerHp} / 100</p>
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>VS</div>
            <div className="duel-fighter">
              <h3>🦹‍♂️ 闇の魔法使い</h3>
              <p>HP: {enemyHp} / 100</p>
            </div>
          </div>

          <div style={{ 
            minHeight: '60px', 
            background: 'rgba(0,0,0,0.3)', 
            padding: '10px', 
            borderRadius: '8px', 
            margin: '15px 0',
            border: '1px solid #333'
          }}>
            <p style={{ fontWeight: 'bold', color: HOUSES[house].gold }}>{duelLog}</p>
          </div>

          {(playerHp > 0 && enemyHp > 0) ? (
            <button 
              className="btn-action" 
              onClick={handleVoiceAttack}
              disabled={isListening}
              style={{ background: isListening ? '#ef4444' : HOUSES[house].gold }}
            >
              {isListening ? '🎙️ 呪文を聴き取り中...' : '🎙️ 声で呪文を唱えて攻撃！'}
            </button>
          ) : (
            <button className="btn-action" onClick={resetDuel}>🔄 もう一度挑戦する</button>
          )}

          {/* 解放中の呪文ヒント */}
          <div style={{ marginTop: '20px', textAlign: 'left', fontSize: '0.85rem' }}>
            <span style={{ color: '#aaa' }}>💡 使用可能な詠唱ヒント: </span>
            {allSpells.filter(s => collectedSpellIds.has(s.id)).map(s => (
              <span key={s.id} style={{ color: HOUSES[house].gold, marginRight: '8px' }}>
                [{s.name}]
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;