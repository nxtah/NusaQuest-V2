import type {AppUser} from './auth';

export interface UserProfile extends AppUser {
  createdAt?: number;
  updatedAt?: number;
}
