<template>
  <div>
    <Header 
      title="User Profile" 
      subtitle="View and manage your account information"
    />
    
    <div class="mt-8">
      <div v-if="loading" class="text-center py-10">
        <p>Loading profile...</p>
      </div>
      
      <div v-else-if="error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
        {{ error }}
      </div>
      
      <div v-else-if="user" class="max-w-3xl mx-auto bg-white p-8 rounded shadow-md">
        <div class="flex items-center mb-6">
          <div v-if="user.picture" class="mr-4">
            <img :src="user.picture" alt="User avatar" class="w-16 h-16 rounded-full" />
          </div>
          <div>
            <h2 class="text-2xl font-bold">{{ user.firstName }} {{ user.lastName }}</h2>
            <p class="text-gray-600">{{ user.email }}</p>
          </div>
        </div>
        
        <div class="mb-6">
          <h3 class="text-xl font-semibold mb-2">Account Information</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p class="text-gray-600">User ID</p>
              <p>{{ user.id }}</p>
            </div>
            <div v-if="user.role">
              <p class="text-gray-600">Role</p>
              <p>{{ user.role }}</p>
            </div>
            <div v-if="user.createdAt">
              <p class="text-gray-600">Member Since</p>
              <p>{{ new Date(user.createdAt).toLocaleDateString() }}</p>
            </div>
          </div>
        </div>
        
        <div class="mb-6">
          <h3 class="text-xl font-semibold mb-2">My Cards</h3>
          <NuxtLink 
            to="/cards" 
            class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            View My Card Collection
          </NuxtLink>
        </div>
      </div>
      
      <!-- Debug Panel - Remove in production -->
      <div v-if="!loading && !user" class="mt-4 p-4 bg-yellow-100 border border-yellow-400 rounded">
        <h3 class="font-bold">Debug Information:</h3>
        <p>Token exists: {{ !!authStore.token }}</p>
        <button @click="debugFetchUser" class="mt-2 bg-gray-200 hover:bg-gray-300 p-2 rounded">
          Try Fetch User
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { useAuthStore } from '~/stores/auth';
import Header from '~/components/Layout/Header.vue';
import { onMounted } from 'vue';

definePageMeta({
  middleware: ['auth']
});

const authStore = useAuthStore();
const { user, loading, error } = storeToRefs(authStore);

async function debugFetchUser() {
  console.log('Manual fetch attempt with token:', authStore.token);
  await authStore.fetchUser();
  console.log('After manual fetch - user:', authStore.user);
}

onMounted(async () => {
  console.log('Profile component mounted');
  console.log('Initial state - token:', authStore.token, 'user:', authStore.user);
  
  await authStore.initAuth();
  
  console.log('After initAuth - token:', authStore.token, 'user:', authStore.user);
  
  if (!authStore.user && authStore.token) {
    console.log('No user data after initAuth, trying direct fetch');
    await authStore.fetchUser();
    console.log('After direct fetch - user:', authStore.user);
  }
});
</script>