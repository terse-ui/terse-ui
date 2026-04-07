<script setup lang="ts">
import {ref, onMounted} from 'vue';

const props = defineProps<{name: string}>();
const loaded = ref(false);
const error = ref<string | null>(null);

async function loadExamples() {
  const tagName = `ex-${props.name}`;

  if (customElements.get(tagName)) {
    loaded.value = true;
    return;
  }

  const existing = document.querySelector('script[data-terse-examples]');
  if (!existing) {
    const script = document.createElement('script');
    script.type = 'module';
    script.src = '/examples/browser/main.js';
    script.dataset.terseExamples = '';
    document.head.appendChild(script);
  }

  await customElements.whenDefined(tagName);
  loaded.value = true;
}

onMounted(async () => {
  try {
    await loadExamples();
  } catch (e) {
    error.value = (e as Error).message;
  }
});
</script>

<template>
  <div class="ex-container">
    <div v-if="error" class="ex-error">Failed to load example: {{ error }}</div>
    <div v-else-if="!loaded" class="ex-loading">Loading example...</div>
    <component v-else :is="`ex-${name}`" />
  </div>
</template>

<style scoped>
.ex-container {
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  padding: 1.5rem;
  margin: 1rem 0;
}

.ex-loading {
  text-align: center;
  color: var(--vp-c-text-2);
  padding: 2rem;
}

.ex-error {
  text-align: center;
  color: var(--vp-c-danger-1);
  padding: 2rem;
}
</style>
