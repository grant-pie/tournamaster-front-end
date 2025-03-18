<!-- components/Cards/CardItem.vue -->
<template>
  <div class="bg-white shadow rounded p-4 flex justify-between">
    <div>
      <h3 class="font-bold">{{ card.cardDetails.name }}</h3>
      <p class="text-sm text-gray-600">{{ card.cardDetails.type }}</p>
      <div class="mt-2">
        <img 
          :src="card.cardDetails.imageUrl || `https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=${card.cardDetails.multiverseId}&type=card`" 
          :alt="card.cardDetails.name"
          class="w-40"
        />
      </div>
      <div class="mt-2 text-sm">
        <p v-if="card.cardDetails.manaCost">Mana Cost: {{ card.cardDetails.manaCost }}</p>
        <p v-if="card.cardDetails.rarity">Rarity: {{ card.cardDetails.rarity }}</p>
        <p v-if="card.cardDetails.set">Set: {{ card.cardDetails.setName }} ({{ card.cardDetails.set }})</p>
        <p v-if="card.createdAt">Received: {{ formattedCreatedAt }}</p>
      </div>
    </div>
    <div>
      <button 
        @click="removeCard" 
        class="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
      >
        Remove
      </button>
    </div>
  </div>
</template>

<script setup>
import { useCardStore } from '~/stores/card';
import { onMounted, computed } from 'vue'
const props = defineProps({
  card: {
    type: Object,
    required: true
  },
  userId: {
    type: String,
    required: true
  }
});

const cardStore = useCardStore();

const removeCard = () => {
  cardStore.removeCard(props.card.id, props.userId);
};

const formattedCreatedAt = computed(() => {
  const date = new Date(props.card.createdAt);
  // Format as yyyy-mm-dd
  return date.toISOString().split('T')[0]
});
</script>