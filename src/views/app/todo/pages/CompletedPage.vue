<!--
* @Component:
* @Maintainer: AI00
* @Description:
-->
<script setup lang="ts">
import TodoList from "@/views/app/todo/component/List.vue";
import { useTodoStore } from "@/views/app/todo/Store";
const todoStore = useTodoStore();
</script>

<template>
  <TodoList :tasks="todoStore.getCompletedTodos" />
</template>

<style scoped lang="scss"></style>
