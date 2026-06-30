import React, { useEffect } from 'react';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import { db } from './services/firebase/firebase';

const App: React.FC = () => {
  useEffect(() => {
    // Keep firebase connection test silently
    console.log("Firestore Initialized:", db ? "Success" : "Failed");
  }, []);

  return (
    <Layout>
      <HomePage />
    </Layout>
  );
};

export default App;
