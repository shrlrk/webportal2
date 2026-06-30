import { db } from './src/services/firebase/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

const run = async () => {
  const usersRef = collection(db, 'users');
  
  console.log("1. Fetching all users to see the structure...");
  const allSnap = await getDocs(usersRef);
  console.log(`Total users in DB: ${allSnap.size}`);
  allSnap.forEach(doc => {
    console.log(`Doc ID: ${doc.id}`);
    console.log(doc.data());
  });

  console.log("\n2. Querying by userId = '10101'...");
  const q = query(usersRef, where('userId', '==', '10101'));
  const snap = await getDocs(q);
  console.log(`Query result size: ${snap.size}`);
  if (!snap.empty) {
    console.log("Found user:", snap.docs[0].id, snap.docs[0].data());
  }

  process.exit(0);
};

run();
