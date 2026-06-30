import { db } from '../src/services/firebase/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import * as fs from 'fs';
import * as path from 'path';

const seedUsers = async () => {
  try {
    let csvPath = path.resolve(process.cwd(), 'test-users.csv');
    if (!fs.existsSync(csvPath)) {
      csvPath = path.resolve(process.cwd(), '통합 문서1.csv');
      if (!fs.existsSync(csvPath)) {
        throw new Error("CSV file not found! (Neither 'test-users.csv' nor '통합 문서1.csv')");
      }
    }
    
    console.log(`Reading CSV file from: ${csvPath}...`);
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = fileContent.split(/\r?\n/).filter(line => line.trim() !== '');
    
    let successCount = 0;
    
    if (!db) {
      throw new Error("Firestore DB is not initialized.");
    }
    
    for (const line of lines) {
      const parts = line.split(',').map(s => s.trim());
      if (parts.length < 8) continue; // internalId, userId, name, userType, role, oneTimeCode, isActive, passwordSet

      const [internalId, userId, name, userType, role, oneTimeCode, isActiveStr, passwordSetStr] = parts;
      
      const isActive = isActiveStr?.toUpperCase() === 'TRUE';
      const passwordSet = passwordSetStr?.toUpperCase() === 'TRUE';
      
      let grade = null, classNumber = null, studentNumber = null;
      if (userType === 'S' && userId.length === 5) {
        grade = parseInt(userId.substring(0, 1), 10);
        classNumber = parseInt(userId.substring(1, 3), 10);
        studentNumber = parseInt(userId.substring(3, 5), 10);
      }
      
      const userRef = doc(db, 'users', String(internalId));
      const existingSnap = await getDoc(userRef);
      
      let previousUserIds: string[] = [];
      let createdAt = new Date();
      
      if (existingSnap.exists()) {
        const existingData = existingSnap.data();
        createdAt = existingData.createdAt?.toDate ? existingData.createdAt.toDate() : new Date();
        previousUserIds = existingData.previousUserIds || [];
        
        if (existingData.userId && existingData.userId !== userId) {
          if (!previousUserIds.includes(existingData.userId)) {
            previousUserIds.push(existingData.userId);
          }
        }
      }

      const userData = {
        internalId: String(internalId),
        userId: String(userId),
        name,
        userType,
        role,
        oneTimeCode: String(oneTimeCode),
        isActive,
        passwordSet,
        previousUserIds,
        schoolYear: "2026",
        ...(grade !== null && !isNaN(grade) && { grade }),
        ...(classNumber !== null && !isNaN(classNumber) && { classNumber }),
        ...(studentNumber !== null && !isNaN(studentNumber) && { studentNumber }),
        createdAt,
        updatedAt: new Date()
      };
      
      await setDoc(userRef, userData, { merge: true });
      console.log(`[OK] User ${internalId} (userId: ${userId}, name: ${name}) uploaded/updated successfully.`);
      successCount++;
    }
    
    console.log(`\n🎉 Total ${successCount} users seeded successfully into Firestore!`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding users:', error);
    process.exit(1);
  }
};

seedUsers();
