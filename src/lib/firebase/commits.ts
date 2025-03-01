import { getFirestore } from './firestore';
import { collection, addDoc, query, where, getDocs, orderBy, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import type { Commit } from '../../types/commit';

const COMMITS_COLLECTION = 'commits';

// Ajouter un nouveau commit
export const addCommit = async (commit: Omit<Commit, 'id'>) => {
  try {
    const db = await getFirestore();
    const docRef = await addDoc(collection(db, COMMITS_COLLECTION), {
      ...commit,
      date: new Date()
    });
    return docRef.id;
  } catch (error) {
    console.error('Erreur lors de l\'ajout du commit:', error);
    throw error;
  }
};

// Récupérer les commits d'un utilisateur
export const getUserCommits = async (userId: string) => {
  try {
    const db = await getFirestore();
    const q = query(
      collection(db, COMMITS_COLLECTION),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Commit[];
  } catch (error) {
    console.error('Erreur lors de la récupération des commits:', error);
    throw error;
  }
};

// Supprimer un commit
export const deleteCommit = async (commitId: string) => {
  try {
    const db = await getFirestore();
    await deleteDoc(doc(db, COMMITS_COLLECTION, commitId));
  } catch (error) {
    console.error('Erreur lors de la suppression du commit:', error);
    throw error;
  }
};

// Mettre à jour un commit
export const updateCommit = async (commitId: string, updates: Partial<Commit>) => {
  try {
    const db = await getFirestore();
    const commitRef = doc(db, COMMITS_COLLECTION, commitId);
    await updateDoc(commitRef, updates);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du commit:', error);
    throw error;
  }
};
