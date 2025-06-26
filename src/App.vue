<template>
  <GridBoard />
</template>

<script setup>
import GridBoard from './components/GridBoard.vue'
</script>

<style>
/* Style personnalisé pour le curseur d'édition */
.edit-cursor,
[title^="Double-clic pour modifier"] {
  cursor: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 16 16'><text x='0' y='14' font-size='16' style='font-family: Arial, sans-serif;'>✏️</text></svg>") 0 16, pointer;
}
</style>
