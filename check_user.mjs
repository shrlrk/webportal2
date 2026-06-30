import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDTSYJmyfJ4qIv6JGTe6DTZZ4T50b8dzRE",
  authDomain: "dy365-92aa0.firebaseapp.com",
  projectId: "dy365-92aa0",
  storageBucket: "dy365-92aa0.firebasestorage.app",
  messagingSenderId: "56892812876",
  appId: "1:568928128769:web:37e1417117c7fc47875500"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function check() {
  const usersRef = collection(db, 'users');
  const snap = await getDocs(usersRef);
  let found = false;
  snap.forEach(d => {
    const data = d.data();
    const vals = JSON.stringify(data) + ' ' + d.id;
    if (vals.includes('90001')) {
      console.log('--- FOUND 90001 ---');
      console.log('Doc ID:', d.id);
      console.log('Data:', data);
      found = true;
    }
  });
  if (!found) console.log('90001 NOT FOUND IN USERS COLLECTION');
  process.exit(0);
}
check().catch(e => { console.error(e); process.exit(1); });
