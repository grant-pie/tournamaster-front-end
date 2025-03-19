<template>
  <div>
    <Header 
      :title="deck ? deck.name : 'Deck Details'" 
      :subtitle="deck ? deck.description : 'Loading...'"
    />
    
    <div v-if="!isAuthenticated" class="text-center py-10">
      <p>Please log in to view deck details.</p>
      <LoginButton class="mt-4" />
    </div>
    
    <div v-else-if="deckStore.loading" class="text-center py-10">
      <p>Loading deck...</p>
    </div>
    
    <div v-else-if="deckStore.error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded my-4">
      <p>{{ deckStore.error }}</p>
    </div>
    
    <div v-else-if="!deck" class="text-center py-10">
      <p>Deck not found.</p>
      <NuxtLink to="/decks" class="mt-4 inline-block px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition">
        Back to Decks
      </NuxtLink>
    </div>
    
    <div v-else class="mt-8">
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold">Cards in this Deck</h2>
        <button 
          @click="showAddCardModal = true" 
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
        >
          Add Cards
        </button>
      </div>
      
      <!-- Cards in the deck -->
      <div v-if="deck.userCards && deck.userCards.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="card in deck.userCards" :key="card.id" class="bg-white shadow rounded p-4 flex justify-between">
          <div>
            <h3 class="font-bold">{{ card.card.name}}</h3>
            <div class="mt-2">
              <img 
                :src="`${card.card.imageUrl}`" 
                :alt="`Card ${card.multiverseId || (card.cardDetails && card.cardDetails.multiverseId)}`"
                class="w-40"
              />
            </div>
          </div>
          <button 
            @click="removeCardFromDeck(card.id)" 
            class="h-8 px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition"
          >
            Remove
          </button>
        </div>
      </div>
      
      <div v-else class="text-center py-10 bg-gray-50 rounded">
        <p class="text-gray-600">This deck has no cards yet.</p>
        <button 
          @click="showAddCardModal = true" 
          class="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition"
        >
          Add Your First Card
        </button>
      </div>
    </div>
    
    <!-- Add Card Modal -->
    <div v-if="showAddCardModal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-4xl h-3/4 flex flex-col">
        <h3 class="text-xl font-bold mb-4">Add Cards to Deck</h3>
        
        <div class="mb-4">
          <p class="text-gray-600">Select from your card collection:</p>
        </div>
        
        <div class="flex-grow overflow-y-auto">
          <div v-if="cardStore.loading" class="text-center py-4">
            <p>Loading your card collection...</p>
          </div>
          
          <div v-else-if="cardStore.error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            <p>{{ cardStore.error }}</p>
          </div>
          
          <div v-else-if="availableCards.length === 0" class="text-center py-4">
            <p>You don't have any cards to add.</p>
          </div>
          
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div v-for="card in availableCards" :key="card.id" class="bg-white border rounded p-4 flex justify-between">
              <div>
                <h3 class="font-bold">{{ card.cardDetails.name }}</h3>
                <div class="mt-2">
                  <img 
                    :src="`${card.cardDetails.imageUrl}`" 
                    :alt="`Card ${card.cardDetails.name}`"
                    class="w-40"
                  />
                </div>
              </div>
              <button 
                @click="addCardToDeck(card.id)" 
                class="h-8 px-4 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition"
              >
                Add
              </button>
            </div>
          </div>
        </div>
        
        <div class="mt-4 pt-4 border-t flex justify-end">
          <button 
            @click="showAddCardModal = false" 
            class="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '~/stores/auth';
import { useDeckStore } from '~/stores/deck';
import { useCardStore } from '~/stores/card';
import Header from '~/components/Layout/Header.vue';
import LoginButton from '~/components/Auth/LoginButton.vue';

definePageMeta({
  middleware: ['auth']
});

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const deckStore = useDeckStore();
const cardStore = useCardStore();

const { isAuthenticated, user } = storeToRefs(authStore);
const showAddCardModal = ref(false);

// Get deck details
const deckId = computed(() => route.params.id);
const deck = computed(() => deckStore.currentDeck);

// Get available cards (user's cards not already in deck)
const availableCards = computed(() => {
  if (!deck.value || !deck.value.userCards) {
    return cardStore.userCards || [];
  }
  
  // Get all user cards
  const allCards = cardStore.userCards || [];
 
  // Filter out cards already in the deck
  // Make sure we're comparing the right IDs
  const deckCardIds = deck.value.userCards.map(card => card.id);

  return allCards.filter(card => !deckCardIds.includes(card.id));

});

watch(availableCards, () => {
  console.log({
    deck: deck.value,
    cards_in_deck: deck.value.userCards.map(card => card.id),
    all_cards: cardStore.userCards
  });

});

// Methods
const fetchData = async () => {
  if (!isAuthenticated.value || !deckId.value) return;
  
  await deckStore.fetchDeck(deckId.value);
  
  // Also fetch user's card collection for the add card functionality
  if (user.value?.id) {
    await cardStore.fetchUserCards(user.value.id);
  }
};

const addCardToDeck = async (userCardId) => {
  if (!deckId.value) return;
  
  try {
    await deckStore.addUserCardToDeck(deckId.value, userCardId);
    
    // Refresh the deck data to show the newly added card
    await deckStore.fetchDeck(deckId.value);
  } catch (error) {
    console.error('Error adding card to deck:', error);
  }
};

const removeCardFromDeck = async (userCardId) => {
  if (!deckId.value) return;
  
  if (confirm('Are you sure you want to remove this card from the deck?')) {
    try {
      await deckStore.removeUserCardFromDeck(deckId.value, userCardId);
      
      // Refresh the deck data to update the UI
      await deckStore.fetchDeck(deckId.value);
    } catch (error) {
      console.error('Error removing card from deck:', error);
    }
  }
};

// Fetch data on component mount
onMounted(async () => {
  await authStore.initAuth();
  await fetchData();
});
</script>