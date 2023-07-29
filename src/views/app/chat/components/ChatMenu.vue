<!--
* @Component:
* @Maintainer: AI00
* @Description:
-->
<script setup lang="ts">

import { ChatListStore } from '../chatlistStore'
import { useChatStore } from '../chatStore'
import type { Message, clist } from '../chatTypes'
import moment from 'moment'
import 'moment/dist/locale/zh-cn'
import 'moment/dist/locale/es-us'

import { useI18n } from 'vue-i18n'

const { t } = useI18n()
moment.locale('zh-cn')

const getdiff = (timestamp) => {
  moment.locale('zh-cn')
  return moment(Number(timestamp)).fromNow()
}

const ChatList = ChatListStore()

const ChatStore = useChatStore()

const index = ref(0)
const idname = ref('')


const newchat = () => {
  if(ChatStore.getChatting()){
    return
  }
  const idnames = Date.now().toString()
  const newchatl: clist = {
    id_name: idnames,
    title: t("chat.newchat"),
  }

  const tounum = Math.round(Math.random()*15);
  const bot = ref({
  id: 2,
  name: 'AI',
  avatar: '/tou/'+tounum+'.png',
  })

  ChatList.addToChatList(newchatl)

  index.value = ChatList.getListnum() - 1

  ChatStore.setnowchat(idnames)
  idname.value = idnames
  ChatStore.AIimg = '/tou/'+tounum+'.png'

  const hello: Message = {
    id: '_' + Math.random().toString(36).substring(2, 11),
    user: bot.value,
    text: t("chat.hello"),
    timestamp: new Date().getTime(),
  }
  ChatStore.startHistory(hello)
}

const change = (i: number) => {
  if(ChatStore.getChatting()){
    return
  }
  index.value = i

  ChatStore.setnowchat(ChatList.getChatid(i).id_name)
  idname.value = ChatList.getChatid(i).id
  const nowHistoy = ChatList.getChatid(i).history

  ChatStore.setHistory(nowHistoy)
if(ChatStore.chatHistory){ChatStore.AIimg = ChatStore.chatHistory[0].user.avatar}


}

const del = (id_name: string) => {
  if(ChatStore.getChatting()){
    return
  }
  ChatStore.clearHistory()
  ChatList.removeChatList(id_name)
  if (ChatList.getListnum() == 0) {
    newchat()
  } else if (id_name == ChatStore.getnowchat()) {
    change(0)
  }
}

if (ChatList.getListnum() == 0) {
  newchat()
} else {
  for (let i = 0; i < ChatList.getListnum(); i++) {
    if (ChatList.getChatid(i).id_name == ChatStore.getnowchat()) {
      change(i)
    }
  }
}
</script>

<template>
  <!-- ---------------------------------------------- -->
  <!-- Add Task Dialog -->
  <!-- ---------------------------------------------- -->
  <v-btn color="primary" block class="mb-4 w-full" @click="newchat"
    >      {{ $t('chat.newchat')  }}</v-btn
  >
  <perfect-scrollbar ref="target" id="chat-m" class="chat-m" >
  <v-list nav class="mt-2 pa-0" color="primary">
    <v-list-item
      v-for="(item, indexs) of ChatList.ids"
      :key="item.id_name"
      class="newbtn"
      active-class="active-chat"
      :title="getdiff(item.id_name)"
      link
      :active="index === indexs"
      @click="change(indexs)"
    >
    <template #title>
      <v-card style="background-color: rgba(255, 255, 255, 0);">
        <template #title>
          <span style="font-size:16px;">{{item.title}}</span>
        </template>
        <template #subtitle>
          <span style="font-size:12px;">{{getdiff(item.id_name)}}</span>
        </template>
      </v-card>
    </template>
      <template v-slot:append>
        <v-btn
          variant="plain"
          size="x-small"
          icon="mdi-close"
          @click="del(item.id_name)"
        ></v-btn>
      </template>
    </v-list-item>
  </v-list>
  </perfect-scrollbar>
  <!-- <div class="pa-1 mt-2 text-overline text-grey">More Chats</div> -->
</template>

<style scoped lang="scss">
.active-chat {
  border-left: 5px solid;
  border-image-slice: 1;
}

.newbtn {
  overflow: hidden;
}

.chat-m {
    height: calc(100vh - 320px);
    margin-bottom: 20px;
  }
</style>
