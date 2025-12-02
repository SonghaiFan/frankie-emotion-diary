
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  setDoc,
  deleteDoc,
  doc,
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  Timestamp 
} from 'firebase/firestore';
import { EmotionLog, Emotion, Category, TodoItem, Message } from '../types';

// TODO: Replace with your actual Firebase project configuration
// Get this from: Firebase Console -> Project Settings -> General -> Your apps
const firebaseConfig = {
  apiKey: "AIzaSyAMNRqyyJAgsKshDzQ2gaKoUqV0D4bPepM",
  authDomain: "aurora-mental.firebaseapp.com",
  projectId: "aurora-mental",
  storageBucket: "aurora-mental.firebasestorage.app",
  messagingSenderId: "448988354364",
  appId: "1:448988354364:web:de5983309381deb1b97039",
  measurementId: "G-CPMN7RP66Q"
};

// Initialize Firebase
let auth: any;
let db: any;

try {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.warn("Firebase not initialized. Make sure to replace firebaseConfig in services/firebase.ts with your own credentials.");
}

export const signInWithGoogle = async () => {
  if (!auth) return;
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
  } catch (error: any) {
    console.error("Error signing in with Google", error);
    if (error.code === 'auth/unauthorized-domain') {
        const domain = window.location.hostname;
        alert(`Configuration Error: Domain not authorized.\n\nPlease go to Firebase Console -> Authentication -> Settings -> Authorized Domains and add:\n\n${domain}`);
    } else {
        alert(`Login failed: ${error.message}`);
    }
  }
};

export const signOut = async () => {
  if (!auth) return;
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    console.error("Error signing out", error);
  }
};

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, callback);
};

// --- Emotion Logging ---

export const logEmotion = async (uid: string, emotion: Emotion, category: Category, note?: string) => {
  if (!db) return;
  try {
    await addDoc(collection(db, 'emotionLogs'), {
      uid,
      emotion,
      category,
      timestamp: Timestamp.now(),
      note: note || ''
    });
  } catch (error) {
    console.error("Error logging emotion", error);
  }
};

export const getEmotionHistory = async (uid: string): Promise<EmotionLog[]> => {
  if (!db) return [];
  try {
    const q = query(
      collection(db, 'emotionLogs'),
      where("uid", "==", uid),
      orderBy("timestamp", "desc"),
      limit(100)
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        uid: data.uid,
        emotion: data.emotion as Emotion,
        category: data.category as Category,
        timestamp: data.timestamp.toMillis(),
        note: data.note
      };
    });
  } catch (error) {
    console.error("Error fetching emotion history", error);
    return [];
  }
};

// --- Todo Cloud Sync ---

export const syncTodoToCloud = async (uid: string, todo: TodoItem) => {
  if (!db) return;
  try {
    // Use setDoc with the todo ID to create or update
    await setDoc(doc(db, 'todos', todo.id), {
      ...todo,
      uid // Tag with user ID for security rules/filtering
    });
  } catch (error) {
    console.error("Error syncing todo", error);
  }
};

export const deleteTodoFromCloud = async (uid: string, todoId: string) => {
  if (!db) return;
  try {
    await deleteDoc(doc(db, 'todos', todoId));
  } catch (error) {
    console.error("Error deleting todo", error);
  }
};

export const getUserTodos = async (uid: string): Promise<TodoItem[]> => {
  if (!db) return [];
  try {
    const q = query(
      collection(db, 'todos'),
      where("uid", "==", uid)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => doc.data() as TodoItem);
  } catch (error) {
    console.error("Error fetching user todos", error);
    return [];
  }
};

// --- Chat History Sync ---

export const saveChatMessage = async (uid: string, message: Message) => {
  if (!db) return;
  try {
    // We store messages in a 'chats' collection
    await setDoc(doc(db, 'chats', message.id), {
      ...message,
      uid,
      timestamp: Timestamp.fromMillis(message.timestamp)
    });
  } catch (error) {
    console.error("Error saving chat message", error);
  }
};

export const getRecentChatHistory = async (uid: string): Promise<Message[]> => {
  if (!db) return [];
  try {
    const q = query(
      collection(db, 'chats'),
      where("uid", "==", uid),
      orderBy("timestamp", "asc"), // Get them in chronological order
      limit(50) // Reasonable context limit
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        role: data.role,
        text: data.text,
        timestamp: data.timestamp.toMillis(), // Convert Firestore Timestamp back to number
        suggestions: data.suggestions
      } as Message;
    });
  } catch (error) {
    console.error("Error fetching chat history", error);
    return [];
  }
};
