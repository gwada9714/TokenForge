import { app, auth, db, storage } from '@/config/firebase';
import { firebaseManager } from './services';

export { app, auth, db, storage };
export { firebaseManager as default };
