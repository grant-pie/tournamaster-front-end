<!-- components/Cards/CardItem.vue -->
<template>
    <div class="bg-white shadow rounded p-4 flex justify-between">
      <div>
        <h3 class="font-bold">Card ID: {{ card.multiverseId }}</h3>
        <div class="mt-2">
          <img 
            :src="`https://gatherer.wizards.com/Handlers/Image.ashx?multiverseid=${card.multiverseId}&type=card`" 
            :alt="`Card ${card.multiverseId}`"
            class="w-40"
          />
        </div>
      </div>
  
    </div>
  </template>
  
  <script setup>
  import { useCardStore } from '~/stores/card';
  
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
  </script>