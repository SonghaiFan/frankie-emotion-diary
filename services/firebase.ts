import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  setDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  limit,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { EmotionLog, TodoItem, Message } from "../types";
import { Emotion, Category } from "@/constants";

// TODO: Replace with your actual Firebase project configuration
// Get this from: Firebase Console -> Project Settings -> General -> Your apps
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
let auth: any;
let db: any;

try {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
} catch (e) {
  console.warn(
    "Firebase not initialized. Make sure to replace firebaseConfig in services/firebase.ts with your own credentials."
  );
}

export const signInWithGoogle = async () => {
  if (!auth) return;
  const provider = new GoogleAuthProvider();
  try {
    await signInWithPopup(auth, provider);
  } catch (error: any) {
    console.error("Error signing in with Google", error);
    if (error.code === "auth/unauthorized-domain") {
      const domain = window.location.hostname;
      alert(
        `Configuration Error: Domain not authorized.\n\nPlease go to Firebase Console -> Authentication -> Settings -> Authorized Domains and add:\n\n${domain}`
      );
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

export const subscribeToAuthChanges = (
  callback: (user: User | null) => void
) => {
  if (!auth) return () => {};
  return onAuthStateChanged(auth, callback);
};

// --- Emotion Logging (Sub-collection) ---

export const logEmotion = async (
  uid: string,
  emotion: Emotion,
  category: Category,
  note?: string
) => {
  if (!db) return;
  try {
    // Path: users/{uid}/emotionLogs/{logId}
    const userEmotionColl = collection(db, "users", uid, "emotionLogs");

    await addDoc(userEmotionColl, {
      uid, // Keep uid in data for redundancy/export ease, though implied by path
      emotion,
      category,
      timestamp: Timestamp.now(),
      note: note || "",
    });
  } catch (error) {
    console.error("Error logging emotion", error);
  }
};

export const getEmotionHistory = async (uid: string): Promise<EmotionLog[]> => {
  if (!db) return [];
  try {
    // Path: users/{uid}/emotionLogs
    const userEmotionColl = collection(db, "users", uid, "emotionLogs");

    const q = query(userEmotionColl, orderBy("timestamp", "desc"), limit(100));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        uid: uid, // Use the uid from context since it matches the path
        emotion: data.emotion as Emotion,
        category: data.category as Category,
        timestamp: data.timestamp.toMillis(),
        note: data.note,
      };
    });
  } catch (error) {
    console.error("Error fetching emotion history", error);
    return [];
  }
};

// --- Todo Cloud Sync (Sub-collection) ---

export const syncTodoToCloud = async (uid: string, todo: TodoItem) => {
  if (!db) return;
  try {
    // Path: users/{uid}/todos/{todoId}
    const userTodoRef = doc(db, "users", uid, "todos", todo.id);

    // We strictly save the todo item. We don't need to manually inject 'uid'
    // for security anymore because the path secures it.
    await setDoc(userTodoRef, todo);
  } catch (error) {
    console.error("Error syncing todo", error);
  }
};

export const deleteTodoFromCloud = async (uid: string, todoId: string) => {
  if (!db) return;
  try {
    // Path: users/{uid}/todos/{todoId}
    await deleteDoc(doc(db, "users", uid, "todos", todoId));
  } catch (error) {
    console.error("Error deleting todo", error);
  }
};

export const getUserTodos = async (uid: string): Promise<TodoItem[]> => {
  if (!db) return [];
  try {
    // Path: users/{uid}/todos
    const userTodosColl = collection(db, "users", uid, "todos");

    // No need for 'where uid == ...' because we are querying that specific user's subcollection
    const q = query(userTodosColl);

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as TodoItem);
  } catch (error) {
    console.error("Error fetching user todos", error);
    return [];
  }
};

// --- Chat History Sync (Sub-collection) ---

export const saveChatMessage = async (uid: string, message: Message) => {
  if (!db) return;
  try {
    // Path: users/{uid}/chats/{messageId}
    const userChatRef = doc(db, "users", uid, "chats", message.id);

    await setDoc(userChatRef, {
      ...message,
      uid, // Optional redundancy
      timestamp: Timestamp.fromMillis(message.timestamp),
    });
  } catch (error) {
    console.error("Error saving chat message", error);
  }
};

export const getRecentChatHistory = async (uid: string): Promise<Message[]> => {
  if (!db) return [];
  try {
    // Path: users/{uid}/chats
    const userChatsColl = collection(db, "users", uid, "chats");

    const q = query(userChatsColl, orderBy("timestamp", "asc"), limit(50));

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        role: data.role,
        text: data.text,
        timestamp: data.timestamp.toMillis(),
        suggestions: data.suggestions,
      } as Message;
    });
  } catch (error) {
    console.error("Error fetching chat history", error);
    return [];
  }
};
