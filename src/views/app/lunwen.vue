
<template>
    <div :class="(s题目.length != 0 || s提纲.length != 0) ? 'logo-left' : 'logo-center'"><b
            style="color: purple;">闻达</b><b>论文</b></div>

    <v-row class="input-box">
        <v-col cols="10">
            <v-textarea autofocus v-model="s题目" label="题目" no-resize rows="1" hide-details="auto"
                @keypress.enter="window.f生成提纲()"></v-textarea>
        </v-col>
        <v-col cols="2">
            <v-btn color="purple" dark size="x-large" @click="window.f生成提纲()">
                生成提纲
            </v-btn>
        </v-col>
    </v-row>

    <v-card elevation="2" v-if="s提纲">
        <v-card-title>提纲</v-card-title>
        <v-divider></v-divider>
        <v-card-text>
            <v-textarea autofocus v-model="s提纲" label="提纲" rows="15" hide-details="auto"></v-textarea>
        </v-card-text>
        <v-card-actions>
            <v-btn color="purple" dark size="x-large" @click="window.f生成正文()">
                生成正文
            </v-btn>
            <v-btn color="purple" dark size="x-large" @click="window.f复制正文()" v-if="results.length">
                复制正文
            </v-btn>
        </v-card-actions>
    </v-card>
    <v-card elevation="2" v-for="result in results">
        <v-card-title>{{ result.title }} <v-spacer></v-spacer>
            <v-icon @click="window.copy(result.content)" v-if="result.prompt">
                mdi-content-copy
            </v-icon>
            <v-icon @click="window.f重新生成(result)" v-if="result.prompt">
                mdi-refresh
            </v-icon>
            <v-icon @click="window.f知识库重新生成(result)" v-if="result.prompt">
                mdi-book-open-variant
            </v-icon>
        </v-card-title>

        <v-divider v-if="result.prompt"></v-divider>
        <pre v-text="result.content"></pre>
    </v-card>
    <v-snackbar v-model="b显示提示文本" :timeout="3000" style="white-space: pre-line">{{ s提示文本 }}</v-snackbar>
    <v-dialog v-model="show_dialog" persistent max-width="600px">
        <v-card class="ma-0 pa0">
            <v-card-title>
                <span class="text-h5">{{ dialog_title }}</span>
            </v-card-title>
            <v-card-text>
                <v-container>
                    <v-textarea autofocus v-model="dialog_input" no-resize rows="2" hide-details="auto"
                        @keypress.enter="show_dialog = false; window.dialog_input_resolver()"></v-textarea>
                </v-container>
            </v-card-text>
            <v-card-actions>
                <v-btn color="blue darken-1" text
                    @click="show_dialog = false; dialog_input = ''; window.dialog_input_resolver()">
                    取消
                </v-btn>
                <v-btn color="blue darken-1" text @click="show_dialog = false; window.dialog_input_resolver()">
                    确认
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>
<style>


.logo-center {
    left: calc(50% - 140px);
    width: 260px;
    font-size: 4em;
    padding-top: 2.5em;
    padding-bottom: 0.8em;
    position: relative;
}

.logo-left {
    left: 20px;
    width: 100%;
    font-size: xx-large;
    position: relative;
}

.input-box {
    margin: auto;
    width: fit-content;
    min-width: 580px;
}

pre {
    margin: 20px;
    white-space: break-spaces;
}

.v-application--wrap {
    display: unset;
}
</style>
<script>
export default {
    data() {
        window.app = this
        return {
            s题目: "",
            s提纲: "",
            results: [],
            // 是否显示snackbar
            b显示提示文本: false,
            // snackbar的文本
            s提示文本: "",
            temperature: 0.8,
            top_p: 0.2,
            max_length: 2000,
            llm_type: "",
            //显示对话框
            show_dialog: false,
            //对话框标题
            dialog_title: "",
            //对话框用户输入
            dialog_input: "",
            window: window
        }
    }
}
window.f生成提纲 = async (e) => {
    e && e.preventDefault()
    let prompt = '根据以下主题，写一篇高度凝练且全面的论文提纲：' + app.s题目
    return await send_raw(prompt, '', [], (s) => { app.s提纲 = s })
}
window.f生成正文 = async (e) => {


    function find_RomanNumerals(str) {
        let RomanNumeralsMap = {
            'III': 3,
            'II': 2,
            'IV': 4,
            'IX': 9,
            'XL': 40,
            'XC': 90,
            'CD': 400,
            'CM': 900,
            'I': 1,
            'V': 5,
            'X': 10,
            'L': 50,
            'C': 100,
            'D': 500,
            'M': 1000
        }
        let number = 0;
        for (var p in RomanNumeralsMap) {
            if (str.indexOf(p) != -1) {
                str = str.split(p).join("");
                number += RomanNumeralsMap[p];
            }
        }
        return number
    }
    let resp = app.s提纲
        .replace(/\n- /g, '\n1.')//兼容不同格式
        .split("\n")
    for (let i in resp) {
        let line = resp[i]
        if (line == "") continue
        line = line.split(".")
        if (line.length < 2) {
            continue  // 判断非提纲内容
        }
        let num = find_RomanNumerals(line[0])
        if (num <= 0 || num == 100) {
            let paragraph = {
                title: resp[i],
                content: '',
                prompt: "根据主题：" + app.s题目 + "\n对下列段落进行详细的撰写：" + line[1]
            }
            app.results.push(paragraph)
            await send_raw(paragraph.prompt, '', [], (s) => { paragraph.content = s })
        } else {
            app.results.push({ title: resp[i], content: "" })   // 保存提纲
        }
    }
}
window.f重新生成 = async (paragraph) => {
    await edit(paragraph)
    await send_raw(paragraph.prompt, '', [], (s) => { paragraph.content = s })
}
window.f知识库重新生成 = async (paragraph) => {
    `	response = await fetch("/api/list_rtst_in_disk", {
				method: 'post',
			})
			let list_rtst_in_disk = await response.json()
			list_rtst_in_disk = list_rtst_in_disk.map(decodeURI).map(s => "rtst:10:" + s)
			kownladge = await find_dynamic(paragraph.title.split(".")[1], 5, { libraryStategy:list_rtst_in_disk.map(encodeURI).join(" "), maxItmes: 100 })
			`
    let kownladge = await find(paragraph.title.split(".")[1], 5)
    kownladge = kownladge.filter(i => !i.score || i.score < 150)
    await send_raw(paragraph.prompt + '\n参考下列资料：\n' +
        kownladge.map((e, i) => i + 1 + "." + e.content).join('\n'), '', [], (s) => { paragraph.content = s })
}
window.f复制正文 = async () => {
    copy(app.results.map(i => i.title + "\n" + i.content).join("\n"))
}
window.alert = (text) => {
    app.s提示文本 = text; //.replace(/\n/g,"<br>")
    app.b显示提示文本 = true;
}
//编辑prompt
window.edit = async (current_conversation) => {
    let s修改后的内容 = await input('请输入新的提示词', current_conversation.prompt)
    if (s修改后的内容) {
        current_conversation.prompt = s修改后的内容
        alert('修改成功')
    } else
        alert('取消修改')
}
//获取用户输入
window.input = async (title = '请输入', input = '') => {
    app.dialog_title = title
    app.dialog_input = input
    app.show_dialog = true

    await new Promise(resolve => {
        window.dialog_input_resolver = resolve
    })
    return app.dialog_input
}
window.copy = (s) => {
    navigator.permissions
        .query({ name: "clipboard-write" })
        .then((result) => {
            if (result.state == "granted" || result.state == "prompt") {
                navigator.clipboard
                    .writeText(s.replace(/\n+/g, "\n"))
                    .then(() => {
                        alert("文本已经成功复制到剪切板");
                        console.log("文本已经成功复制到剪切板");
                    })
                    .catch((err) => { });
            } else {
                alert(
                    "当前无操作权限。请使用最新版本Chrome浏览器，并在浏览器高级设置-页面设置中允许访问剪切板"
                );
                console.log(
                    "当前无操作权限。请使用最新版本Chrome浏览器，并在浏览器高级设置-页面设置中允许访问剪切板"
                );
            }
        });
};

window.send_raw = async (prompt, keyword, QA_history, onmessage = alert) => {
    const res = await fetch("http://"+ window.location.host + "/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            messages: QA_history.concat([{ role: "user", content: prompt }]),
            stream: true,
            max_tokens: 1000,
            temperature: 1,
            top_p: 0.5,
            presence_penalty: 0.3,
            frequency_penalty: 0.3,
        }),
        // signal: controller.signal
    });
    let result = ''
    const decoder = new TextDecoder();
    const reader = res.body.getReader();
    const readChunk = async () => {
        return reader.read().then(async ({ value, done }) => {
            value = decoder.decode(value);
            let chunks = value.match(/[^\n]+/g);
            if (!chunks) return readChunk();
            for (let i = 0; i < chunks.length; i++) {
                let chunk = chunks[i];
                if (chunk) {
                    chunk = chunk.slice(6)
                    if (chunk == '[DONE]') return

                    let payload = JSON.parse(chunk);
                    let content = payload.choices[0].delta.content;
                    if (content) {
                        result += content
                        onmessage(result.trim())
                    }
                }

            }
            return await readChunk();
        });
    }
    await readChunk()
    return result.trim()
}

</script>
