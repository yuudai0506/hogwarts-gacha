function Greeting({ onCastSpell, onCastTenSpells, isLoading }) {
  return (
    <div className="button-group">
      <button 
        className="btn-magic" 
        onClick={() => onCastSpell(1)} 
        disabled={isLoading}
      >
        {isLoading ? '詠唱中...✨' : '🪄 1連ガチャ'}
      </button>

      <button 
        className="btn-magic" 
        onClick={() => onCastSpell(10)} 
        disabled={isLoading}
      >
        {isLoading ? '詠唱中...✨' : '🔮 10連ガチャ'}
      </button>
    </div>
  );
}

export default Greeting;