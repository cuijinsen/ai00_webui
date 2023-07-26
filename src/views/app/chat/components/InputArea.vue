<!--
* @Component:
* @Maintainer: AI00
* @Description:
-->
<script setup lang="ts">
import type { User, Message, ChatMessage } from '../chatTypes'
import { ChatListStore } from '../chatlistStore'
import { useChatStore } from '../chatStore'
import { watch, nextTick } from 'vue'
import { chat } from "../openAIApi";
import moment from 'moment'
import 'moment/dist/locale/zh-cn'

moment.locale('zh-cn');



const chatStore = useChatStore()

const ChatList = ChatListStore()

const userMessage = ref('')
const aiMessage = ref('')

const createMessage = (user: User, text: string) => {
  const message: Message = {
    id: '_' + Math.random().toString(36).substring(2, 11),
    user,
    text,
    timestamp: new Date().getTime(),
  }
  return message
}

const user = ref({
  id: 1,
  name: 'YOU',
  avatar: '/tou/8.png',
})

const bot = ref({
  id: 2,
  name: 'AI',
  avatar: '/tou/9.png',
})

const emits = defineEmits(['scroll'])

const sendMessage = () => {
  // 判断是否为空

  if(chatStore.getChatting()){
    return
  }

  if (!userMessage.value) return

  // 发送User Message
  chatStore.addToHistory(createMessage(user.value, userMessage.value + '  '))

  // AI等待Message
  aiMessage.value = 'Please wait a moment ......'
  chatStore.addToHistory(createMessage(bot.value, aiMessage.value + '&nbsp;'))

  ChatList.changeTitle(chatStore.getnowchat(),userMessage.value)
  // 请求AI回答

    sendChatMessage(userMessage.value)



  // 清空Input
  userMessage.value = ''
}

const isError = ref(false)
const ischat = ref(false)
const errorMsg = ref('')

watch(
  () => chatStore.chatHistory,
  () => {
    ChatList.setHistory(chatStore.getHistory(), chatStore.getnowchat())
  },
  { deep: true }
)

watch(
  () => chatStore.isChatting,
  () => {
    nextTick(() => {
      emits('scroll')
    })
    ischat.value = chatStore.getChatting()


  },
  { deep: true }
)

const decoder = new TextDecoder("utf-8");

const sendChatMessage = async (content: string = userMessage.value) => {
  try {
    chatStore.setChatting(true)
    const messlist = chatStore.getHistory()
    const contlist = []

      contlist.push({
        role:'user',
        content:'现在的时间是' + moment().format('llll')
      })

      contlist.push({
        role:'assistant',
        content:'好的我知道了！'
      })

      contlist.push({
        role:'user',
        content:'我们所处的位置是哪里？'
      })

      contlist.push({
        role:'assistant',
        content:'我们在中国上海！'
      })

      contlist.push({
        role:'user',
        content:'你是谁？'
      })

    for (let index = 0; index < messlist.length-1; index++) {
      const element = messlist[index];
      let chatm :ChatMessage = {
        role:element.user.id == 1 ? 'user'  : 'assistant',
        content:element.text,
      }
      contlist.push(chatm)

    }

    const { body, status } = await chat(contlist, "",chatStore.getserverip(),chatStore.getserverport());
    if (body) {
      const reader = body.getReader();
      await readStream(reader, status);
    }
  } catch (error: any) {
    ischat.value = false;
    chatStore.setChatting(false)
  } finally {
    ischat.value = false;
    chatStore.setChatting(false)
  }
};

const readStream = async (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  status: number
) => {
  let partialLine = "";
  let contentss = ""
  while (true) {
    // eslint-disable-next-line no-await-in-loop
    const { value, done } = await reader.read();
    if (done) break;

    const decodedText = decoder.decode(value, { stream: true });

    if (status !== 200) {
      const json = JSON.parse(decodedText); // start with "data: "
      const content = json.error.message ?? decodedText;
      chatStore.changeLatestMessage(content);
      return;
    }
    //console.log(decodedText)
    const chunk = partialLine + decodedText;
    const newLines = chunk.split(/\r?\n/);

    partialLine = newLines.pop() ?? "";
    //console.log(newLines)
    for (const line of newLines) {
      if (line.length === 0) continue; // ignore empty message
      if (line.startsWith(":")) continue; // ignore sse comment message
      if (line === "data: [DONE]") return; //
      if (line === "data:[DONE]") return; //

      const json = JSON.parse(line.substring(5)); // start with "data: "
      const content =
        status === 200
          ? json.choices[0].delta.content ?? ""
          : json.error.message;
      console.log(content)
      contentss +=  content
      chatStore.changeLatestMessage(contentss)

    }

  }
}


</script>

<template>
  <v-textarea
    v-model="userMessage"
    rows="3"
    row-height="12"
    label="愉快的聊天吧"
    no-resize
    max-rows="3"
    variant="outlined"
    clear-icon="mdi-close-circle"
    clearable
    :disabled="ischat"
    @keydown.ctrl.enter="sendMessage"
  >
    <template #append>
      <v-btn
        style="margin-right: 20px; height: 70px"
        class="bg-primary"
        @click="sendMessage"
      >
        <v-icon size="25">mdi-account-voice</v-icon></v-btn
      >
    </template>
    <template #prepend>
      <ul style="list-style: none; margin-left: 20px">
        <li style="list-style: none; margin-bottom: 20px">
          <v-icon @click="sendMessage" color="primary">mdi-new-box</v-icon>
        </li>
        <li style="list-style: none; margin-bottom: 15px">
          <v-icon color="#a2a2a2" icon="mdi-web" @click="sendMessage"></v-icon>
        </li>
      </ul>
    </template>
  </v-textarea>
  <v-snackbar :timeout="2000" color="error" v-model="isError">
    {{ errorMsg }}
  </v-snackbar>
</template>

<style scoped lang="scss">
</style>
