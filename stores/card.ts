// stores/card.ts
import { defineStore } from 'pinia';
import { useAuthStore } from './auth';

export const useCardStore = defineStore('card', {
  state: () => ({
    userCards: [] as any[],
    loading: false,
    error: null as string | null,
  }),
  
  actions: {
    async fetchUserCards(userId: string) {
      const authStore = useAuthStore();
      const config = useRuntimeConfig();
      if (!authStore.token) return;
      
      try {
        this.loading = true;
        this.error = null;
        
        const response = await $fetch(`${config.public.apiBaseUrl}/user-cards/${userId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          }
        });
        
        this.userCards = response.cards || [];
      } catch (err: any) {
        console.error('Error fetching user cards:', err);
        this.error = err.message || 'Failed to fetch cards';
      } finally {
        this.loading = false;
      }
    },
    
    async addCardToUser(userId: string, multiverseId: string) {
      const authStore = useAuthStore();
      const config = useRuntimeConfig();
      if (!authStore.isAdmin) return;
      
      try {
        this.loading = true;
        this.error = null;
        
        await $fetch(`${config.public.apiBaseUrl}/user-cards/${userId}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${authStore.token}`,
            'Content-Type': 'application/json'
          },
          body: { multiverseId }
        });
        
        // Refresh the cards list
        await this.fetchUserCards(userId);
      } catch (err: any) {
        console.error('Error adding card:', err);
        this.error = err.message || 'Failed to add card';
      } finally {
        this.loading = false;
      }
    },
    
    async removeCard(cardId: string, userId: string) {
      const authStore = useAuthStore();
      if (!authStore.token) return;
      
      try {
        this.loading = true;
        await useFetch(`/user-cards/${cardId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          }
        });
        
        // Refresh the cards list
        await this.fetchUserCards(userId);
      } catch (err: any) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    }
  }
});