import { initializeApp } from 'firebase/app'; // Correct import for Firebase app
import { getAuth } from 'firebase/auth'; // Correct import for Firebase auth

const firebaseConfig = {
  apiKey: "AlzaSyAaaceQCMb6V1FoBMxFaKY6wD12Ctv1LIo",
  authDomain: "gesellschafter-assistent.firebaseapp.com",
  projectId: "gesellschafter-assistent",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
