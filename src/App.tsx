import React, { useEffect } from 'react';
import { db } from './services/firebase/firebase';

const App: React.FC = () => {
  useEffect(() => {
    console.log("Firestore:", db);
  }, []);
  return (
    <div style={{ padding: '2rem', textAlign: 'center', fontFamily: 'sans-serif' }}>
      <h1>학교생활+ Firebase 연결 확인 중</h1>
    </div>
  );
};

export default App;
