import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyBETVmIGLiceblZ5lrH7fLSra5DnK5VmuU',
  authDomain: 'buildingos-22b57.firebaseapp.com',
  projectId: 'buildingos-22b57',
  storageBucket: 'buildingos-22b57.firebasestorage.app',
  messagingSenderId: '889983338722',
  appId: '1:889983338722:web:6c22c3aa516c223673b6bb',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
