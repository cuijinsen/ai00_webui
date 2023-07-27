<script setup lang="ts">
  const props = defineProps({
    // Message to display
    message: {
      type: Object,
      default: () => ({}),
    },
  });
  import { useChatStore } from '../chatStore'
  const ChatStore = useChatStore()

</script>

<template>
  <v-card class="mx-auto bg-primary titles" width="100%"   title="AI00 Assistant"  >
    <template #subtitle>
      <v-row no-gutters>
          <v-col cols="12" sm="3">
              chat mode
          </v-col>
          <v-col cols="12" sm="9">
              <p>Model: RWKV-World-7B-CHNtuned</p>
              <p>Top_p: 0.7</p>
          </v-col>

        </v-row>
    </template>

    <v-avatar :image="ChatStore.chatHistory[0].user.avatar" class="aitou" size="100"></v-avatar>
  </v-card>
  <v-avatar image="/tou/8.png" class="mytou"  size="100"  ></v-avatar>
</template>

<style scoped lang="scss">
.titles{
  padding-bottom: 60px;
  clip-path: polygon(
	    0 0,
	    0 100%,
	    -10% 100%,
	    100% calc(100% - 50px),
	    100% 0,
	);
}
.aitou{
  position:absolute;
  bottom: -20px;
  animation: shake 2s infinite;
  transform-origin: center;

}
.mytou{
  position:absolute;
  top: 60px;
  right: 20px;
  background-color: white;
  z-index: 10;
  transform:rotate(10deg);
}
@keyframes shake {
  10%, 90% {
    transform: translate3d(-1px, 0, 0);
    transform: rotate(-10deg);
  }

  20%, 80% {
    transform: translate3d(4px, 10px, 10px);

  }

  30%, 50%, 70% {
    transform: translate3d(-4px, 0, 0);
  }

  40%, 60% {
    transform: translate3d(4px, 0, 0);
    transform: rotate(-10deg);
  }
}


</style>
