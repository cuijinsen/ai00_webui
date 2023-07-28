
<template>
    <div class="wdlw">
        <div :class="(s题目.length != 0 || s提纲.length != 0) ? 'logo-left' : 'logo-center'"><b
                style="color: purple;">闻达</b><b>论文</b></div>

        <v-row class="input-box">
            <v-col cols="10" elevation="2">
                <v-text-field autofocus v-model="s题目" label="题目" hide-details="auto"
                    @keypress.enter="window.f生成提纲"></v-text-field>
            </v-col>
            <v-col cols="2">
                <v-btn elevation="2" color="primary" size="x-large" @click="window.f生成提纲()">
                    生成提纲
                </v-btn>
            </v-col>
        </v-row>

        <v-card elevation="2" v-if="s提纲" :loading="b提纲加载中 ? 'primary' : false" title="提纲">
            <!-- <v-card-title>提纲</v-card-title> -->
            <v-divider></v-divider>
            <v-card-text>
                <v-textarea autofocus v-model="s提纲" label="提纲" rows="15" hide-details="auto"></v-textarea>
            </v-card-text>
            <v-card-actions>
                <v-btn color="primary" size="x-large" @click="window.f生成正文()">
                    生成正文
                </v-btn>
                <v-btn color="primary" size="x-large" @click="window.f复制正文()" v-if="results.length">
                    复制正文
                </v-btn>
            </v-card-actions>
        </v-card>
        <v-card elevation="2" v-for="result in results" :loading="result.loading ? 'primary' : false">
            <v-card-title>{{ result.title }} <v-spacer></v-spacer>
                <v-icon @click="window.copy(result.content)" v-if="result.prompt" color="primary">
                    mdi-content-copy
                </v-icon>
                <v-icon @click="window.f重新生成(result)" v-if="result.prompt" color="primary">
                    mdi-refresh
                </v-icon>
                <v-icon @click="window.f知识库重新生成(result)" v-if="result.prompt" color="primary">
                    mdi-book-open-variant
                </v-icon>
            </v-card-title>

            <v-divider v-if="result.prompt"></v-divider>
            <v-textarea v-if="result.prompt" v-model="result.content" rows="5" hide-details></v-textarea>
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
                    <v-btn color="primary" text
                        @click="show_dialog = false; dialog_input = ''; window.dialog_input_resolver()">
                        取消
                    </v-btn>
                    <v-btn color="primary" text @click="show_dialog = false; window.dialog_input_resolver()">
                        确认
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>
<style>
.wdlw {
    background-color: #eff7ff;
    min-height: 100vh;
}
.wdlw .elevation-2 {
    box-shadow: 0px 3px 10px -2px rgb(0 0 0 / 20%), 0px 2px 20px 0px rgb(0 0 0 / 20%), 0px 1px 30px 0px rgb(0 0 0 / 20%) !important;
}

.wdlw div {
    transition: all 0.3s;
}

.wdlw .v-card {
    margin: 20px;
    padding: 10px;
}

.wdlw .logo-center {
    left: calc(50% - 140px);
    width: 260px;
    font-size: 4em;
    padding-top: 2.5em;
    padding-bottom: 0.8em;
    position: relative;
}

.wdlw .logo-left {
    left: 20px;
    width: 100%;
    font-size: xx-large;
    position: relative;
}

.wdlw .input-box {
    margin: auto;
    width: fit-content;
    min-width: 580px;
}

.wdlw pre {
    margin: 20px;
    white-space: break-spaces;
}

.wdlw .v-application--wrap {
    display: unset;
}
</style>
<script>
export default {
    theme: {
        defaultTheme: 'dark'
    },
    data() {
        window.lw_app = this
        return {
            s题目: "",
            s提纲: "",
            s提示文本: "",
            b提纲加载中: false,
            b显示提示文本: false,
            results: [],
            // 是否显示snackbar
            // snackbar的文本
            temperature: 1.3,
            top_p: 0.5,
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
    lw_app.b提纲加载中 = true
    let prompt = '根据以下主题，写一篇高度凝练且全面的论文提纲：' + lw_app.s题目
    await send_raw(prompt, '', [], (s) => { lw_app.s提纲 = s })
    lw_app.b提纲加载中 = false
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
    let resp = lw_app.s提纲
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
                content: '正在撰写',
                loading: true,
                prompt: "根据主题：" + lw_app.s题目 + "\n对下列段落进行详细的撰写：" + line[1]
            }
            lw_app.results.push(paragraph)
            await send_raw(paragraph.prompt, '', [], (s) => { paragraph.content = s })
            paragraph.loading = false
        } else {
            lw_app.results.push({ title: resp[i], content: "" })   // 保存提纲
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
    copy(lw_app.results.map(i => i.title + "\n" + i.content).join("\n"))
}
window.alert = (text) => {
    lw_app.s提示文本 = text; //.replace(/\n/g,"<br>")
    lw_app.b显示提示文本 = true;
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
    lw_app.dialog_title = title
    lw_app.dialog_input = input
    lw_app.show_dialog = true

    await new Promise(resolve => {
        window.dialog_input_resolver = resolve
    })
    return lw_app.dialog_input
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
    const res = await fetch(location.origin.replace("4399", '65530') + "/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            messages: QA_history.concat([{ role: "user", content: prompt }]),
            stream: true,
            temperature: lw_app.temperature,
            top_p: lw_app.top_p,
            max_tokens: lw_app.max_length,
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