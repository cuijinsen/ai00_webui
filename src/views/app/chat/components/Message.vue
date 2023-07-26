<!--
* @Component:
* @Maintainer: AI00
* @Description:
-->
<script setup lang="ts">
import ChatLabel from "./ChatLabel.vue";

const props = defineProps({
  // Message to display
  message: {
    type: Object,
    default: () => ({}),
  },
});

const isUserMessage = computed(() => {
  return props.message.user.id === 1;
});
</script>

<template>
  <div
    class="d-flex  justify-align-start"
    :class="{ 'flex-row-reverse': isUserMessage }"
  >
    <v-avatar size="40" class="elevation-1 grey lighten-3 ma-1 "
      :class="isUserMessage ? 'bg-shades-white' : 'bg-primary'"
      style="z-index:22;top:-20px">
      <v-img v-if="message.user.avatar" :src="message.user.avatar" />
    </v-avatar>
    <v-card
      :class="isUserMessage ? ' w-auto ml-5 mr-n8 ' : ' w-auto mr-5 ml-n8' "
      :color="isUserMessage ? ' bg-primary' : ' '"
      :theme="isUserMessage ? ' dark' : ' light'"
      :style="isUserMessage ? ' white-space: pre-wrap;word-break: break-all;padding: 10px 20px 0px 10px; ' : ' white-space: pre-wrap;word-break: break-all;padding: 0px 0px 0px 0px;background-color: rgba(121,122,112,0.7);color: #fff'  "
    >
      <chat-label v-if="!isUserMessage"  :text="message.text" />
      <span v-if="isUserMessage" style="padding: 10px;background-color: rgba(12,12,12,0.0);"> {{message.text}} </span>
    </v-card>
  </div>

</template>

<style scoped lang="scss"></style>
