<!--
* @Component:
* @Maintainer: AI00
* @Description:
-->
<script setup lang="ts">
import TodoMenu from "./component/Menu.vue";
import Tigang from "./component/Tigang.vue";
</script>

<template>
  <v-container class="app-container">
    <!-- ---------------------------------------------- -->
    <!-- Side Bar -->
    <!-- ---------------------------------------------- -->
    <div class="d-none d-md-block sidebar">
      <TodoMenu />
    </div>
    <!-- ---------------------------------------------- -->
    <!--  List Todo -->
    <!-- ---------------------------------------------- -->
    <div class="main">
      <router-view v-slot="{ Component }">
        <transition name="fade">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>

 
  </v-container>
</template>

<style scoped lang="scss">
.app-container {
  display: flex;
  height: calc(100vh - 70px);
  width: 100%;
  font-size: 13px;

  .sidebar {
    display: flex;
    flex-direction: column;
    width: 300px;
    height: 100%;
    background-color: #fff;
    margin-right: 20px;
  }

  .main {
    flex: 1;
    width: 100%;
    height: 100%;
    background-color: #fff;
  }
}
</style>
