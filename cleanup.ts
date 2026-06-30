import { db } from './src/services/firebase/firebase';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

const cleanup = async () => {
  const usersRef = collection(db, 'users');
  const snap = await getDocs(usersRef);
  
  let deletedCount = 0;
  for (const document of snap.docs) {
    // If document ID does not start with S or T, it's an old document
    if (!document.id.startsWith('S') && !document.id.startsWith('T')) {
      console.log(`Deleting old document: ${document.id}`);
      await deleteDoc(doc(db, 'users', document.id));
      deletedCount++;
    }
  }
  
  console.log(`Deleted ${deletedCount} old documents.`);
  process.exit(0);
};

cleanup();
