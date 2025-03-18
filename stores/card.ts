// stores/card.ts
import { defineStore } from 'pinia';
import { useAuthStore } from './auth';

interface Card {
  id: string;
  multiverseId: string;
  name: string;
  manaCost?: string;
  convertedManaCost?: number;
  type?: string;
  colors?: string[];
  rarity?: string;
  set?: string;
  setName?: string;
  text?: string;
  artist?: string;
  power?: string;
  toughness?: string;
  imageUrl?: string;
}

interface UserCard {
  id: string;
  userId: string;
  cardId: string;
  cardDetails: Card;
  createdAt: string;
}

export const useCardStore = defineStore('card', {
  state: () => ({
    userCards: [] as UserCard[],
    allCards: [] as Card[],
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
    
    async fetchCardsByUsername(username: string, searchParams?: Record<string, any>) {
      const config = useRuntimeConfig();
      
      try {
        this.loading = true;
        this.error = null;
        
        let url = `${config.public.apiBaseUrl}/user-cards/username/${username}`;
        
        // Add search parameters if provided
        if (searchParams) {
          // Build query string
          const queryParams = new URLSearchParams();
          for (const [key, value] of Object.entries(searchParams)) {
            if (value !== undefined && value !== null && value !== '') {
              // Handle array values (like colors)
              if (Array.isArray(value)) {
                value.forEach((item: string) => {
                  queryParams.append(key, item);
                });
              } else {
                queryParams.append(key, value.toString());
              }
            }
          }
          
          const queryString = queryParams.toString();
          if (queryString) {
            url += `?${queryString}`;
          }
        }
        
        const response = await $fetch(url, {
          method: 'GET'
        });
        
        this.userCards = response.cards || [];
        return this.userCards;
      } catch (err: any) {
        console.error('Error fetching cards by username:', err);
        this.error = err.message || 'Failed to fetch cards';
        return [];
      } finally {
        this.loading = false;
      }
    },
    
    async searchUserCards(userId: string, searchParams: Record<string, any>) {
      const authStore = useAuthStore();
      const config = useRuntimeConfig();
      if (!authStore.token) return;
      
      try {
        this.loading = true;
        this.error = null;
        
        // Build query string
        const queryParams = new URLSearchParams();
        for (const [key, value] of Object.entries(searchParams)) {
          if (value !== undefined && value !== null && value !== '') {
            // Handle array values (like colors)
            if (Array.isArray(value)) {
              value.forEach((item: string) => {
                queryParams.append(key, item);
              });
            } else {
              queryParams.append(key, value.toString());
            }
          }
        }
        
        const queryString = queryParams.toString();
        const url = `${config.public.apiBaseUrl}/user-cards/${userId}${queryString ? `?${queryString}` : ''}`;
        
        const response = await $fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          }
        });
        
        this.userCards = response.cards || [];
      } catch (err: any) {
        console.error('Error searching user cards:', err);
        this.error = err.message || 'Failed to search cards';
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
      const config = useRuntimeConfig();
      if (!authStore.token) return;
      
      try {
        this.loading = true;
        this.error = null;
        
        await $fetch(`${config.public.apiBaseUrl}/user-cards/${cardId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          }
        });
        
        // Refresh the cards list
        await this.fetchUserCards(userId);
      } catch (err: any) {
        this.error = err.message || 'Failed to remove card';
      } finally {
        this.loading = false;
      }
    },
    
    async searchCards(query: Record<string, any>) {
      const authStore = useAuthStore();
      const config = useRuntimeConfig();
      if (!authStore.token) return;
      
      try {
        this.loading = true;
        this.error = null;
        
        // Build query string
        const queryParams = new URLSearchParams();
        for (const [key, value] of Object.entries(query)) {
          if (value) {
            queryParams.append(key, value.toString());
          }
        }
        
        const response = await $fetch(`${config.public.apiBaseUrl}/cards?${queryParams.toString()}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          }
        });
        
        this.allCards = response || [];
        return this.allCards;
      } catch (err: any) {
        console.error('Error searching cards:', err);
        this.error = err.message || 'Failed to search cards';
        return [];
      } finally {
        this.loading = false;
      }
    },
    
    async fetchCardDetails(multiverseId: string) {
      const authStore = useAuthStore();
      const config = useRuntimeConfig();
      if (!authStore.token) return null;
      
      try {
        const response = await $fetch(`${config.public.apiBaseUrl}/cards/multiverse/${multiverseId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${authStore.token}`
          }
        });
        
        return response;
      } catch (err: any) {
        console.error('Error fetching card details:', err);
        return null;
      }
    }
  }
});