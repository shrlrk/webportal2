import { db } from '../src/services/firebase/firebase';
import { doc, setDoc } from 'firebase/firestore';
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
    
    for (const line of lines) {
      // 10101,가학생,S,student,A001,TRUE,FALSE
      const parts = line.split(',').map(s => s.trim());
      if (parts.length < 7) continue;

      const [userId, name, userType, role, oneTimeCode, isActiveStr, passwordSetStr] = parts;
      
      const isActive = isActiveStr?.toUpperCase() === 'TRUE';
      const passwordSet = passwordSetStr?.toUpperCase() === 'TRUE';
      
      let grade = null, classNumber = null, studentNumber = null;
      if (userType === 'S' && userId.length === 5) {
        grade = parseInt(userId.substring(0, 1), 10);
        classNumber = parseInt(userId.substring(1, 3), 10);
        studentNumber = parseInt(userId.substring(3, 5), 10);
      }
      
      if (!db) {
        throw new Error("Firestore DB is not initialized.");
      }

      const userRef = doc(db, 'users', userId);
      const userData = {
        userId,
        name,
        userType,
        role,
        oneTimeCode,
        isActive,
        passwordSet,
        ...(grade !== null && !isNaN(grade) && { grade }),
        ...(classNumber !== null && !isNaN(classNumber) && { classNumber }),
        ...(studentNumber !== null && !isNaN(studentNumber) && { studentNumber }),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      await setDoc(userRef, userData, { merge: true });
      console.log(`[OK] User ${userId} (${name}) uploaded/updated successfully.`);
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
