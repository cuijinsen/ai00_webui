import type { ChatMessage } from "./chatTypes";

export async function chat(messageList: ChatMessage[], apiKey: string, serverip: string, serverport: string) {

    const result = await fetch("http://"+serverip+"/v1/chat/completions", {
      method: "post",
      // signal: AbortSignal.timeout(8000),
      // 开启后到达设定时间会中断流式输出
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        stream: true,
        messages: messageList,
        stop: ["\n\n","\nUser:","User:"],
        max_tokens: 1000,
        temperature: 1,
        top_p: 0.2,
        presence_penalty: 0.1,
        frequency_penalty: 0.1,
      }),
    });
    return result;

}
