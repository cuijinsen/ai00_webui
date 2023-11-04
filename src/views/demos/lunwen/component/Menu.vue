<!--
* @Component:
* @Maintainer: AI00
* @Description:
-->
<script setup lang="ts">
import { useLunwenStore } from "../Store";
const lunwenStore = useLunwenStore();

import * as ai00Type from "@/ai00sdk/ai00Type";
function find_RomanNumerals(str) {
    let RomanNumeralsMap = {
      III: 3,
      II: 2,
      IV: 4,
      IX: 9,
      XL: 40,
      XC: 90,
      CD: 400,
      CM: 900,
      I: 1,
      V: 5,
      X: 10,
      L: 50,
      C: 100,
      D: 500,
      M: 1000,
    };
    let number = 0;
    for (var p in RomanNumeralsMap) {
      if (str.indexOf(p) != -1) {
        str = str.split(p).join("");
        number += RomanNumeralsMap[p];
      }
    }
    return number;
  }

const getTigang = async () => {

  lunwenStore.tigang =""
  lunwenStore.tigangs = []



  const content = `
Instruction: 根据示例，完成一篇高度凝练且全面的论文提纲,论文的题目是：${lunwenStore.title}

Input: 论文提纲标准格式：I.引言。II. 正文。III. 结论。正文又细分为若干具体的小节，用罗马数字分段。

Response: `;

  const body: ai00Type.OaiCompletionsType = {
    prompt: [content],
    max_tokens: 400,
    temperature: 0.9,
    top_p: 0.3,
    presence_penalty: 0.3,
    frequency_penalty: 0.3,
    penalty_decay: Math.exp(-0.69314718055994 / 400),
    stop: [
      "\n\n",
      "\nQ:",
      "\nUser:",
      "\nQuestion:",
      "\n\nQ:",
      "\n\nUser:",
      "\n\nQuestion:",
      "Q:",
      "User:",
      "Question:",
    ],
    stream: false,
  };
  // 调用 window.Ai00Api.oai_completions 函数，传入参数：
  // body 参数数据结构是 /ai00sdk/ai00Type.ts 中定义 的 ai00Type.OaiCompletionsType
  window.Ai00Api.oai_completions(body, async (res: any) => {
    console.log(res);

    let sections = res.choices[0].text.split(/\n(?=[A-Z]+\.\s)/);
    sections = sections.map((section) => {
      let lines = section.split("\n");
      for (let i = 1; i < lines.length; i++) {
        lines[i] = lines[i].replace(/-\s/, `${i}. `);
      }
      return lines.join("\n");
    });
    let newStr = sections.join("\n");
    let resp = newStr.split("\n");
    for (let i in resp) {
      let line = resp[i];
      if (line == "") continue;
      line = line.split(".");
      if (line.length < 2) {
        continue; // 判断非提纲内容
      }
      let num = find_RomanNumerals(line[0]);
      if (num <= 0 || num == 100) {
 
 
        lunwenStore.tigang += resp[i] + "\n";
 
      } else {

        lunwenStore.tigang += resp[i] + "\n";
      }
    }
    lunwenStore.tigang.replace(/(User:)+/g, "");
 
  });
};

//watch lunwenStore.tigang  重造 lunwenStore.tigangs
watch(() => lunwenStore.tigang, (value) => {
  lunwenStore.tigangs = []
  let resp = value.split("\n");
  for (let i in resp) {
    let line = resp[i];
    if (line == "") continue;
    line = line.split(".");
    if (line.length < 2) {
      continue; // 判断非提纲内容
    }
    let num = find_RomanNumerals(line[0]);
    if (num <= 0 || num == 100) {
      let paragraph = {
        title: resp[i],
        content: "",
        loading: true,
        prompt: `
Instruction: 根据论文主题：${lunwenStore.title}\n对下列段落进行详细的撰写：

Input: 段落标题：${line[1]}

Response: `,
      };
      lunwenStore.tigangs.push(paragraph);
      paragraph.loading = false;
    } else {
      lunwenStore.tigangs.push({ title: resp[i], content: "", type: "title" }); // 保存提纲
    }
  }
  console.log(lunwenStore.tigangs)
})

const getLunwen = async () => {

  //根据lunwenStore.tigangs 遍历 lunwenStore.tigangs[i].prompt
  //调用 oai_completions
  //返回结果保存到 lunwenStore.tigangs[i].content

  for (let i in lunwenStore.tigangs) {
    let paragraph = lunwenStore.tigangs[i];
    if (paragraph.type == "title") continue;
    if (paragraph.prompt) {
      paragraph.content="";
      paragraph.loading = true;
      let body: ai00Type.OaiCompletionsType = {
        prompt: [paragraph.prompt],
        max_tokens: 1000,
        temperature: 0.9,
        top_p: 0.3,
        presence_penalty: 0.3,
        frequency_penalty: 0.3,
        penalty_decay: Math.exp(-0.69314718055994 / 400),
        stop: [
          "\n\n",
          "\nQ:",
          "\nUser:",
          "\nQuestion:",
          "\n\nQ:",
          "\n\nUser:",
          "\n\nQuestion:",
          "Q:",
          "User:",
          "Question:",
        ],
        stream: true,
      };
      // 调用 window.Ai00Api.oai_completions 函数，传入参数：
      // body 参数数据结构是 /ai00sdk/ai00Type.ts 中定义 的 ai00Type.OaiCompletionsType
      window.Ai00Api.oai_completions(body, async (res: any) => {
 
        paragraph.content = res;

      });
    }
  }




}
</script>

<template>
  <v-card class="rr d-none d-md-block sidebar" prepend-icon="mdi-cog">
    <template v-slot:title>
      {{ $t("write.settings") }}
    </template>

    <template v-slot:text>
      <v-text-field
        variant="outlined"
        label="论文标题"
        v-model="lunwenStore.title"
      >
      </v-text-field>
      <v-btn color="primary" block size="large" class="mb-3" @click="getTigang"
        >生成提纲</v-btn
      >
      <v-textarea v-model="lunwenStore.tigang" row-height="30" rows="15">
      </v-textarea>
      <v-divider></v-divider>
      <v-btn color="primary" block size="large" class="mb-3" @click="getLunwen"
        >生成论文</v-btn
      >
    </template>
  </v-card>
</template>

<style scoped lang="scss">
.chat-area {
  height: calc(100vh - 660px);
}
</style>
