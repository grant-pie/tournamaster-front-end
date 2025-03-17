// stores/user.ts
import { defineStore } from 'pinia';
import { useAuthStore } from './auth';
import { useRuntimeConfig } from '#app';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  picture?: string;
  role: string;
  createdAt?: string;
}

interface UserState {
  users: User[];
  loading: boolean;
  error: string | null;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    users: [],
    loading: false,
    error: null
  }),
  
  actions: {
    async fetchAllUsers() {
      const authStore = useAuthStore();
      
      // Only admins can fetch all users
      if (!authStore.isAdmin) {
        this.error = 'Unauthorized: Admin access required';
        return;
      }
      
      if (!authStore.token) {
        this.error = 'Authentication required';
        return;
      }
      
      this.loading = true;
      this.error = null;
      
      try {
        const config = useRuntimeConfig();
        const response = await $fetch<User[]>(`${config.public.apiBaseUrl}/users`, {
          headers: {
            Authorization: `Bearer ${authStore.token}`
          }
        });
        
        this.users = response;
        console.log('Fetched users:', this.users);
      } catch (err) {
        console.error('Error fetching users:', err);
        this.error = 'Failed to load users';
      } finally {
        this.loading = false;
      }
    }
  }
});