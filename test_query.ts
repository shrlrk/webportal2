import { db } from './src/services/firebase/firebase';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';

const run = async () => {
  console.log("1. Checking S000001 directly...");
  const docRef = doc(db, 'users', 'S000001');
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    console.log("S000001 Data:");
    console.dir(snap.data());
  } else {
    console.log("S000001 does not exist!");
  }

  console.log("\n2. Querying where userId == '10101'");
  const usersRef = collection(db, 'users');
  const q = query(usersRef, where('userId', '==', '10101'));
  const querySnap = await getDocs(q);
  console.log(`Query size: ${querySnap.size}`);
  querySnap.forEach(d => {
    console.log(`Found doc id: ${d.id}`);
    console.dir(d.data());
  });

  process.exit(0);
};

run();
