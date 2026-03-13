import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyCQDHGMadI4o7EYvCmOOAm9wE-rFrkHUPU',
  authDomain: 'buildos-6f0c4.firebaseapp.com',
  projectId: 'buildos-6f0c4',
  storageBucket: 'buildos-6f0c4.firebasestorage.app',
  messagingSenderId: '376624004289',
  appId: '1:376624004289:web:3e988a713fd50522b5a840',
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
