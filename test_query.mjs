import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, query, where } from 'firebase/firestore';

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
  const searchUserId = "90001";
  
  console.log('Testing queries for', searchUserId);
  
  const qStr = query(usersRef, where('userId', '==', searchUserId));
  const snapStr = await getDocs(qStr);
  console.log('String match count:', snapStr.size);

  const qNum = query(usersRef, where('userId', '==', Number(searchUserId)));
  const snapNum = await getDocs(qNum);
  console.log('Number match count:', snapNum.size);

  const qInternal = query(usersRef, where('internalId', '==', searchUserId));
  const snapInternal = await getDocs(qInternal);
  console.log('internalId match count:', snapInternal.size);

  const qPrev = query(usersRef, where('previousUserIds', 'array-contains', searchUserId));
  const snapPrev = await getDocs(qPrev);
  console.log('previousUserIds match count:', snapPrev.size);

  process.exit(0);
}
check().catch(e => { console.error(e); process.exit(1); });
