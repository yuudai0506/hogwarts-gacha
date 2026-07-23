function Greeting({ onCastSpell, isLoading }) {
  return (
    <div>
      <button 
        onClick={onCastSpell} 
        disabled={isLoading}
        style={{
          padding: '14px 28px',
          fontSize: '18px',
          backgroundColor: '#ffcc00',
          color: '#333',
          border: 'none',
          borderRadius: '25px',
          cursor: 'pointer',
          fontWeight: 'bold',
          boxShadow: '0 4px 15px rgba(255, 204, 0, 0.4)',
          transition: 'transform 0.1s'
        }}
      >
        {isLoading ? '召喚中...🪄' : '🎰 魔法ガチャを引く！'}
      </button>
    </div>
  );
}

export default Greeting;