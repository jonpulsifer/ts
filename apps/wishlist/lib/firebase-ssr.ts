import { FirebaseError } from 'firebase-admin';
import { FieldPath } from 'firebase-admin/firestore';
import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';

import { AppUser, Family, Gift } from '../types';
import { auth, db } from './firebase-ssr-db';

function isFirebaseError(error: unknown): error is FirebaseError {
  return (error as FirebaseError).code !== undefined;
}

const getClaimedGifts = async (): Promise<{ gifts: Gift[] }> => {
  const gifts: Gift[] = [];
  const token = cookies().get('token')?.value;
  if (!token) redirect('/login');
  try {
    const { uid } = await auth.verifyIdToken(token, true);
    const snapshot = await db
      .collection('gifts')
      .where('claimed_by', '==', uid)
      .where('owner', '!=', uid)
      .get();

    for (const doc of snapshot.docs) {
      const user = await db.doc(`users/${doc.get('owner')}`).get();
      const owner_name = user.get('name') || user.get('email');
      gifts.push({
        ...(doc.data() as Gift),
        id: doc.id,
        owner_name,
      });
    }
    return { gifts };
  } catch (e) {
    if (isFirebaseError(e)) console.log(JSON.stringify(e));
  }
  redirect('/login');
};

const getFamilies = async () => {
  const token = cookies().get('token')?.value;
  if (!token) redirect('/login');

  const families: Family[] = [];
  try {
    const { uid } = await auth.verifyIdToken(token, true);
    const snapshot = await db.collection('families').get();
    const userSmapshot = await db.collection('users').doc(uid).get();
    const user = userSmapshot.data() as AppUser;
    for (const doc of snapshot.docs)
      families.push({
        ...(doc.data() as Family),
        id: doc.id,
      });
    return { families, user };
  } catch (e) {
    if (isFirebaseError(e)) console.log(JSON.stringify(e));
  }
  redirect('/login');
};

const getGift = async (id: string) => {
  const token = cookies().get('token')?.value;
  if (!token) redirect('/login');

  try {
    auth.verifyIdToken(token, true);
    const snapshot = await db.doc(`/gifts/${id}`).get();
    const doc = snapshot.data() as Gift;
    if (!doc) notFound();

    const gift: Gift = {
      ...doc,
      id: snapshot.id,
    };

    return { gift };
  } catch (e) {
    if (isFirebaseError(e)) console.log(JSON.stringify(e));
  }
  redirect('/login');
};

const getGifts = async () => {
  const token = cookies().get('token')?.value;
  if (!token) redirect('/login');

  const gifts: Gift[] = [];
  try {
    const { uid } = await auth.verifyIdToken(token, true);
    const user = (await db.doc(`/users/${uid}`).get()).data() as AppUser;
    if (!user.families || !user.families.length) return { gifts };

    const userSnapshot = await db
      .collection('users')
      .where(FieldPath.documentId(), '!=', uid)
      .where('families', 'array-contains-any', user.families)
      .get();

    const familyUsers = userSnapshot.docs;
    const familyUserIds = familyUsers.map((u) => u.id).filter((u) => u !== uid);

    if (!familyUserIds.length) return { gifts };

    const snapshot = await db
      .collection('gifts')
      .where('claimed_by', 'in', [uid, ''])
      .orderBy('owner')
      .get();

    for (const doc of snapshot.docs) {
      const gift = doc.data() as Gift;
      if (!familyUserIds.includes(gift.owner)) continue;
      const user = familyUsers.find((u) => u.id === gift.owner);
      const owner_name = user?.get('name') || user?.get('email');
      gifts.push({
        ...gift,
        id: doc.id,
        owner_name,
      });
    }

    // sort gifts by name
    const sorted = gifts.sort((a, b) => {
      if (a.name && b.name) return a.name.localeCompare(b.name);
      if (a.name) return -1;
      if (b.name) return 1;
      return 0;
    });

    return { gifts: sorted };
  } catch (e) {
    if (isFirebaseError(e)) console.log(JSON.stringify(e));
  }
  redirect('/login');
};

const getAllUserGifts = async () => {
  const token = cookies().get('token')?.value;
  if (!token) redirect('/login');
  const gifts: Gift[] = [];

  try {
    const { uid } = await auth.verifyIdToken(token, true);
    const snapshot = await db
      .collection('gifts')
      .where('owner', '==', uid)
      .get();

    for (const doc of snapshot.docs) {
      gifts.push({
        ...(doc.data() as Gift),
        id: doc.id,
      });
    }
    const sorted = gifts.sort((a, b) => {
      if (a.name && b.name) return a.name.localeCompare(b.name);
      if (a.name) return -1;
      if (b.name) return 1;
      return 0;
    });
    return { gifts: sorted };
  } catch (e) {
    if (isFirebaseError(e)) console.log(JSON.stringify(e));
  }
  redirect('/login');
};

const getUser = async (id: string) => {
  const token = cookies().get('token')?.value;
  if (!token) redirect('/login');

  try {
    auth.verifyIdToken(token, true);
    const snapshot = await db.doc(`/users/${id}`).get();
    const doc = snapshot.data() as AppUser;
    if (!doc) notFound();

    const user: AppUser = {
      ...doc,
      uid: snapshot.id,
    };

    return { user };
  } catch (e) {
    if (isFirebaseError(e)) console.log(JSON.stringify(e));
  }
  redirect('/login');
};

const getCurrentUser = async () => {
  const t = cookies().get('token')?.value;
  if (!t) redirect('/login');

  try {
    const token = await auth.verifyIdToken(t, true);
    const snapshot = await db.doc(`/users/${token.uid}`).get();
    const doc = snapshot.data() as AppUser;
    if (!doc) notFound();

    const user: AppUser = {
      ...doc,
      uid: snapshot.id,
    };

    return { user };
  } catch (e) {
    if (isFirebaseError(e)) console.log(JSON.stringify(e));
  }
  redirect('/login');
};

const getPeopleForUser = async () => {
  const users: AppUser[] = [];
  const token = cookies().get('token')?.value;
  if (!token) redirect('/login');

  try {
    const { uid } = await auth.verifyIdToken(token, true);
    const doc = await db.doc(`/users/${uid}`).get();
    const user: AppUser = {
      ...(doc.data() as AppUser),
      uid: doc.id,
    };

    if (!user.families || !user.families.length) return { users, user };
    const snapshot = await db
      .collection('users')
      .where(FieldPath.documentId(), '!=', uid)
      .where('families', 'array-contains-any', user.families)
      .get();

    for (const u of snapshot.docs) {
      const snapcount = await db
        .collection('gifts')
        .where('owner', '==', u.id)
        .where('claimed_by', 'in', [null, ''])
        .count()
        .get();
      const count = snapcount.data().count;
      users.push({
        ...(u.data() as AppUser),
        uid: u.id,
        num_gifts: count,
      });
    }
    // sort users by name
    const sorted = users.sort((a, b) => {
      if (a.name && b.name) return a.name.localeCompare(b.name);
      if (a.name) return -1;
      if (b.name) return 1;
      return 0;
    });

    return { users: sorted, user };
  } catch (e) {
    if (isFirebaseError(e)) console.log(JSON.stringify(e));
  }
  redirect('/login');
};

const getUserGifts = async (id: string) => {
  const token = cookies().get('token')?.value;
  if (!token) redirect('/login');

  try {
    const { uid: tokenUid } = await auth.verifyIdToken(token, true);
    const snapshot = await db.doc(`/users/${id}`).get();
    const doc = snapshot.data() as AppUser;
    const uid = snapshot.id;

    if (!doc) notFound();

    const user: AppUser = {
      ...doc,
      uid,
    };

    const query =
      uid === tokenUid
        ? db.collection('gifts').where('owner', '==', uid)
        : db
            .collection('gifts')
            .where('owner', '==', uid)
            .where('claimed_by', 'in', [null, '']);

    const gifts: Gift[] = [];
    const docs = await query.get();

    docs.forEach((doc) => {
      gifts.push({
        ...(doc.data() as Gift),
        id: doc.id,
      });
    });

    // sort gifts by name
    const sorted = gifts.sort((a, b) => {
      if (a.name && b.name) return a.name.localeCompare(b.name);
      if (a.name) return -1;
      if (b.name) return 1;
      return 0;
    });

    return { user, gifts: sorted };
  } catch (e) {
    if (isFirebaseError(e)) console.log(JSON.stringify(e));
  }
  redirect('/login');
};

export {
  getAllUserGifts,
  getClaimedGifts,
  getCurrentUser,
  getFamilies,
  getGift,
  getGifts,
  getPeopleForUser,
  getUser,
  getUserGifts,
  isFirebaseError,
};
