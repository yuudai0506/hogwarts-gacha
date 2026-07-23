import { useState, useEffect } from 'react';

function Greeting({ onCastSpell, isLoading }) {
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(false);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setSpeechSupported(true);
    }
  }, []);

  const startVoiceCast = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = 'ja-JP';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      alert(`🎤 「${transcript}」と詠唱しました！`);
      onCastSpell(1); // 音声で1連ガチャ発動
    };

    recognition.start();
  };

  return (
    <div style={{ margin: '20px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', flexWrap: 'wrap' }}>
        <button className="btn-action" onClick={() => onCastSpell(1)} disabled={isLoading}>
          {isLoading ? '詠唱中...✨' : '🪄 1連ガチャ (100G)'}
        </button>
        <button className="btn-action" onClick={() => onCastSpell(10)} disabled={isLoading}>
          {isLoading ? '詠唱中...✨' : '🔮 10連ガチャ (1000G)'}
        </button>
      </div>

      {speechSupported && (
        <div style={{ marginTop: '15px' }}>
          <button 
            onClick={startVoiceCast} 
            disabled={isListening || isLoading}
            style={{
              background: isListening ? '#ef4444' : '#3b82f6',
              color: '#fff',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '15px',
              cursor: 'pointer'
            }}
          >
            {isListening ? '🎤 呪文を聞き取り中...' : '🎙️ 音声で呪文を唱える'}
          </button>
        </div>
      )}
    </div>
  );
}

export default Greeting;