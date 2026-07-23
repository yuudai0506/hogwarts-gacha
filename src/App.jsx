import { useState } from 'react';
import Greeting from './Greeting';

function App() {
  const [spell, setSpell] = useState(null);
  const [loading, setLoading] = useState(false);

  const getRandomRarity = () => {
    const rand = Math.random() * 100; 
    
    if (rand < 3) {
      return { label: 'LR', color: '#ff007f', bg: '#fff0f5', text: '🌈 レジェンドレア 🌈' };
    } else if (rand < 15) {
      return { label: 'SSR', color: '#ff9900', bg: '#fff9e6', text: '🌟 SSR 🌟' };
    } else if (rand < 40) {
      return { label: 'SR', color: '#9933ff', bg: '#f5f0ff', text: '✨ SR ✨' };
    } else {
      return { label: 'R', color: '#0066cc', bg: '#f0f5ff', text: '🔹 R 🔹' };
    }
  };

  const fetchSingleSpell = async () => {
    setLoading(true);
    try {
      const response = await fetch('https://hp-api.onrender.com/api/spells');
      const data = await response.json();
      
      const randomIndex = Math.floor(Math.random() * data.length);
      const randomSpell = data[randomIndex];
      
      const rarity = getRandomRarity();
      
      setSpell({
        ...randomSpell,
        rarity: rarity
      });
    } catch (error) {
      console.error('呪文の取得に失敗しました...', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: '50px', fontFamily: 'sans-serif' }}>
      <h1>🧙‍♂️ ホグワーツ魔法ガチャ 🔮</h1>
      
      <Greeting onCastSpell={fetchSingleSpell} isLoading={loading} />

      <h4>💫確率💫  (R60%)  (SR25%)  (SSR12%)  (LR3%)</h4>

      <div style={{ marginTop: '40px' }}>
        {loading && <p style={{ fontSize: '18px', fontWeight: 'bold' }}>召喚中...</p>}
        
        {!loading && spell && (
          <div style={{
            display: 'inline-block',
            padding: '25px',
            border: `3px solid ${spell.rarity.color}`,
            borderRadius: '16px',
            backgroundColor: spell.rarity.bg,
            boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
            width: '340px',
            transition: 'all 0.3s ease'
          }}>
            <div style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              color: spell.rarity.color,
              marginBottom: '10px'
            }}>
              {spell.rarity.text}
            </div>

            <h2 style={{ color: '#333', margin: '0 0 12px 0', fontSize: '24px' }}>
              {spell.name}
            </h2>

            <hr style={{ border: `0.5px solid ${spell.rarity.color}`, opacity: 0.3, margin: '12px 0' }} />

            <p style={{ margin: 0, color: '#555', lineHeight: '1.6', fontSize: '15px' }}>
              <strong>効果:</strong> {spell.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;