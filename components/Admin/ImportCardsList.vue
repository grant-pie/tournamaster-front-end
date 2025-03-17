<template>
    <div class="bg-white p-6 rounded shadow-md">
      <h2 class="text-2xl font-bold mb-4">Import Cards from Text</h2>
      
      <div v-if="!isAdmin" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        Only administrators can import cards.
      </div>
      
      <div v-else>
        <div class="mb-4">
          <label for="cardList" class="block text-gray-700 mb-2">Card List</label>
          <textarea 
            v-model="cardListText"
            id="cardList" 
            class="w-full p-2 border rounded h-40"
            placeholder="Paste card list here (e.g. '1 Card Name [SET]')"
            :disabled="loading"
          ></textarea>
          <p class="text-sm text-gray-500 mt-1">
            Format: Quantity Card Name [Set Code]. One card per line.
          </p>
        </div>
        
        <div class="flex gap-2 mb-4">
          <button 
            @click="parseCardList"
            class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            :disabled="loading || !cardListText"
          >
            Parse Card List
          </button>
          
          <button 
            v-if="parsedCards.length > 0 && !allCardsHaveMultiverseId"
            @click="fetchMultiverseIds"
            class="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
            :disabled="fetchingIds || allCardsHaveMultiverseId"
          >
            {{ fetchingIds ? `Fetching IDs (${fetchProgress}/${parsedCards.length})` : 'Fetch Multiverse IDs' }}
          </button>
        </div>
        
        <div v-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {{ error }}
        </div>
        
        <div v-if="parsedCards.length > 0" class="mt-4">
          <h3 class="text-xl font-semibold mb-3">Parsed Cards</h3>
          
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Card Name</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Set</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Qty</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Multiverse ID</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="(card, index) in parsedCards" :key="index">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ card.name }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ card.set }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ card.qty }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span v-if="card.multiverseId">{{ card.multiverseId }}</span>
                    <span v-else-if="card.multiverseIdError" class="text-red-500">Error: {{ card.multiverseIdError }}</span>
                    <span v-else>-</span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <button 
                      v-if="card.multiverseId"
                      @click="addCardToUser(card)"
                      class="bg-green-600 hover:bg-green-700 text-white font-bold py-1 px-3 rounded text-sm"
                      :disabled="card.adding"
                    >
                      {{ card.adding ? 'Adding...' : card.qty > 1 ? 'Add Cards' : 'Add Card' }}
                    </button>
                    <span v-else-if="!card.multiverseId" class="text-gray-400">Need ID</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed } from 'vue';
  import { useAuthStore } from '~/stores/auth';
  import { useCardStore } from '~/stores/card';
  
  const props = defineProps({
    userId: {
      type: String,
      required: true
    }
  });
  
  const authStore = useAuthStore();
  const cardStore = useCardStore();
  
  interface ParsedCard {
    name: string;
    set: string;
    qty: number;
    multiverseId?: string;
    multiverseIdError?: string;
    adding?: boolean;
  }
  
  const isAdmin = computed(() => authStore.isAdmin);
  const cardListText = ref('');
  const parsedCards = ref<ParsedCard[]>([]);
  const loading = ref(false);
  const fetchingIds = ref(false);
  const fetchProgress = ref(0);
  const error = ref<string | null>(null);
  
  const allCardsHaveMultiverseId = computed(() => {
    return parsedCards.value.length > 0 && 
           parsedCards.value.every(card => card.multiverseId || card.multiverseIdError);
  });
  
  const parseCardList = () => {
    if (!cardListText.value || loading.value) return;
    
    loading.value = true;
    error.value = null;
    parsedCards.value = [];
    
    try {
      // Split by new lines and filter out empty lines
      const lines = cardListText.value.split('\n').filter(line => line.trim());
      
      for (const line of lines) {
        // Parse line using regex to extract qty, name, and set
        const match = line.match(/^(\d+)\s+(.*?)\s+\[(\w+)\]\.?$/);
        
        if (match) {
          const [_, qty, name, set] = match;
          parsedCards.value.push({
            name: name.trim(),
            set: set.trim(),
            qty: parseInt(qty.trim(), 10)
          });
        }
      }
      
      if (parsedCards.value.length === 0) {
        error.value = "No valid card entries found. Please check your format.";
      }
      
    } catch (err: any) {
      console.error('Error parsing card list:', err);
      error.value = err.message || 'Failed to parse card list';
    } finally {
      loading.value = false;
    }
  };
  
  const fetchMultiverseIds = async () => {
    if (fetchingIds.value) return;
    
    fetchingIds.value = true;
    fetchProgress.value = 0;
    error.value = null;
    
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
    
    try {
      for (let i = 0; i < parsedCards.value.length; i++) {
        const card = parsedCards.value[i];
        
        if (!card.multiverseId && !card.multiverseIdError) {
          try {
            // Replace spaces with %20 for the API call
            const encodedName = encodeURIComponent(card.name);
            const response = await fetch(`https://api.scryfall.com/cards/named?exact=${encodedName}`);
            
            if (!response.ok) {
              throw new Error(`Card not found: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.multiverse_ids && data.multiverse_ids.length > 0) {
              card.multiverseId = data.multiverse_ids[0].toString();
            } else {
              card.multiverseIdError = "No multiverse ID available";
            }
          } catch (err: any) {
            console.error(`Error fetching multiverse ID for ${card.name}:`, err);
            card.multiverseIdError = err.message || "Failed to fetch ID";
          }
          
          fetchProgress.value = i + 1;
          
          // Delay to avoid rate limiting (100ms between requests)
          await delay(100);
        }
      }
    } catch (err: any) {
      console.error('Error in fetch process:', err);
      error.value = err.message || 'Failed to fetch all multiverse IDs';
    } finally {
      fetchingIds.value = false;
    }
  };
  
  const addCardToUser = async (card: ParsedCard) => {
    if (!card.multiverseId) {
      error.value = "Card doesn't have a multiverse ID and can't be added.";
      return;
    }
    
    card.adding = true;
    
    try {
      // If quantity is greater than 1, we need to add the card multiple times
      for (let i = 0; i < card.qty; i++) {
        await cardStore.addCardToUser(props.userId, card.multiverseId);
        
        // Small delay between requests if adding multiple copies
        if (card.qty > 1 && i < card.qty - 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }
      
      // Mark the card as successfully added
      card.adding = false;
    } catch (err: any) {
      console.error('Error adding card to user:', err);
      error.value = err.message || 'Failed to add card to user';
      card.adding = false;
    }
  };
  </script>