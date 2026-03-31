import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    updateProfile,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './config';

/**
 * Register a new user with email/password.
 * Also creates a user profile document in Firestore.
 */
export const registerUser = async ({ firstName, lastName, email, password }) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update Firebase Auth display name
    await updateProfile(user, { displayName: `${firstName} ${lastName}` });

    // Store extra profile info in Firestore
    await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        firstName,
        lastName,
        email,
        createdAt: serverTimestamp()
    });

    return {
        id: user.uid,
        email: user.email,
        firstName,
        lastName
    };
};

/**
 * Login with email and password.
 * Returns a plain user object compatible with the existing localStorage pattern.
 */
export const loginUser = async ({ email, password }) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Fetch extra profile data from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    const profile = userDoc.exists() ? userDoc.data() : {};

    return {
        id: user.uid,
        email: user.email,
        firstName: profile.firstName || '',
        lastName: profile.lastName || ''
    };
};

/**
 * Sign out the current user.
 */
export const logoutUser = () => signOut(auth);

/**
 * Sign in or Register with Google using a popup.
 */
export const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    const user = userCredential.user;

    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);

    // Provide fallback names if Google doesn't return a display name
    const splitName = user.displayName ? user.displayName.split(' ') : ['Google', 'User'];
    const firstName = splitName[0];
    const lastName = splitName.slice(1).join(' ');

    let profile = {};

    if (!userDocSnap.exists()) {
        profile = {
            uid: user.uid,
            firstName,
            lastName,
            email: user.email,
            createdAt: serverTimestamp()
        };
        await setDoc(userDocRef, profile);
    } else {
        profile = userDocSnap.data();
    }

    return {
        id: user.uid,
        email: user.email,
        firstName: profile.firstName || firstName,
        lastName: profile.lastName || lastName
    };
};
