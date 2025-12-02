
import firebase from 'firebase/app';
import 'firebase/auth';
import 'firebase/firestore';
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
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();

export const signInWithGoogle = async () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    await auth.signInWithPopup(provider);
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
  try {
    await auth.signOut();
  } catch (error) {
    console.error("Error signing out", error);
  }
};

export const subscribeToAuthChanges = (callback: (user: firebase.User | null) => void) => {
  return auth.onAuthStateChanged(callback);
};

// --- Emotion Logging (Sub-collection) ---

export const logEmotion = async (uid: string, emotion: Emotion, category: Category, note?: string) => {
  try {
    // Path: users/{uid}/emotionLogs/{logId}
    await db.collection('users').doc(uid).collection('emotionLogs').add({
      uid, // Keep uid in data for redundancy/export ease, though implied by path
      emotion,
      category,
      timestamp: firebase.firestore.Timestamp.now(),
      note: note || ''
    });
  } catch (error) {
    console.error("Error logging emotion", error);
  }
};

export const getEmotionHistory = async (uid: string): Promise<EmotionLog[]> => {
  try {
    // Path: users/{uid}/emotionLogs
    const snapshot = await db.collection('users').doc(uid).collection('emotionLogs')
      .orderBy("timestamp", "desc")
      .limit(100)
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        uid: uid, // Use the uid from context since it matches the path
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

// --- Todo Cloud Sync (Sub-collection) ---

export const syncTodoToCloud = async (uid: string, todo: TodoItem) => {
  try {
    // Path: users/{uid}/todos/{todoId}
    await db.collection('users').doc(uid).collection('todos').doc(todo.id).set(todo);
  } catch (error) {
    console.error("Error syncing todo", error);
  }
};

export const deleteTodoFromCloud = async (uid: string, todoId: string) => {
  try {
    // Path: users/{uid}/todos/{todoId}
    await db.collection('users').doc(uid).collection('todos').doc(todoId).delete();
  } catch (error) {
    console.error("Error deleting todo", error);
  }
};

export const getUserTodos = async (uid: string): Promise<TodoItem[]> => {
  try {
    // Path: users/{uid}/todos
    const snapshot = await db.collection('users').doc(uid).collection('todos').get();
    return snapshot.docs.map(doc => doc.data() as TodoItem);
  } catch (error) {
    console.error("Error fetching user todos", error);
    return [];
  }
};

// --- Chat History Sync (Sub-collection) ---

export const saveChatMessage = async (uid: string, message: Message) => {
  try {
    // Path: users/{uid}/chats/{messageId}
    await db.collection('users').doc(uid).collection('chats').doc(message.id).set({
      ...message,
      uid, // Optional redundancy
      timestamp: firebase.firestore.Timestamp.fromMillis(message.timestamp)
    });
  } catch (error) {
    console.error("Error saving chat message", error);
  }
};

export const getRecentChatHistory = async (uid: string): Promise<Message[]> => {
  try {
    // Path: users/{uid}/chats
    const snapshot = await db.collection('users').doc(uid).collection('chats')
      .orderBy("timestamp", "asc")
      .limit(50)
      .get();

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        role: data.role,
        text: data.text,
        timestamp: data.timestamp.toMillis(),
        suggestions: data.suggestions
      } as Message;
    });
  } catch (error) {
    console.error("Error fetching chat history", error);
    return [];
  }
};
