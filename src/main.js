// 控制应用生命周期和创建原生浏览器窗口的模组
const { app, BrowserWindow, NativeImage } = require('electron')
const path = require('path')
const fs = require("fs")

console.log('__dirname : ' + __dirname)
console.log('resolve   : ' + path.resolve('./'))
console.log('cwd       : ' + process.cwd())

function createWindow () {
    const config = loadConfig()

    // 创建浏览器窗口
    const mainWindow = new BrowserWindow({
        fullscreen: !config.launchWithWindow,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        },
        transparent: !config.launchWithWindow,
        frame: config.launchWithWindow,
        alwaysOnTop: !config.launchWithWindow,
        icon: "./electronsrc/media/qriheadimg.png"
    })
    mainWindow.setAlwaysOnTop(!config.launchWithWindow)
    // 点击穿透
    mainWindow.setIgnoreMouseEvents(!config.launchWithWindow);
    const urlParamsMap = {
        "roomId": config.roomId,
        "dev": config.devTool
    };
    let urlParamsStr = "?"
    for (let urlParamsMapKey in urlParamsMap) {
        const p = `${urlParamsMapKey}=${urlParamsMap[urlParamsMapKey]}`;
        if (urlParamsStr === "?") {
            urlParamsStr += p
        } else {
            urlParamsStr += "&" + p;
        }
    }

    // 加载 渲染端
    if (config.loadUrl) {
        mainWindow.loadURL("http://show.bilibili.com" + urlParamsStr)
    } else {
        mainWindow.loadFile('./public/index.html', {query: urlParamsMap})
    }
    // 打开开发工具
    if (config.launchWithWindow && config.devTool) {
        mainWindow.webContents.openDevTools()
    }
}

// 这段程序将会在 Electron 结束初始化
// 和创建浏览器窗口的时候调用
// 部分 API 在 ready 事件触发后才能使用。
app.whenReady().then(() => {
    createWindow()

    app.on('activate', function () {
        // 通常在 macOS 上，当点击 dock 中的应用程序图标时，如果没有其他
        // 打开的窗口，那么程序会重新创建一个窗口。
        if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
})

// 除了 macOS 外，当所有窗口都被关闭的时候退出程序。 因此，通常对程序和它们在
// 任务栏上的图标来说，应当保持活跃状态，直到用户使用 Cmd + Q 退出。
app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') app.quit()
})

// 在这个文件中，你可以包含应用程序剩余的所有部分的代码，
// 也可以拆分成几个文件，然后用 require 导入。

function loadConfig() {
    const s = fs.readFileSync("./resources/extraResources/config.json", "utf-8")
    const configMap = JSON.parse(s)

    // 命令行参数的优先级更高
    // 里面有roomId
    process.argv.forEach(s => {
        if (s.startsWith("--")) {
            const sWithoutStart = s.split("--")[1];
            const sArr = sWithoutStart.split("=");
            if (sArr.length === 2) {
                configMap[sArr[0]] = sArr[1]
            }
        }
    })
    configMap["launchWithWindow"] = app.commandLine.hasSwitch("window")
    configMap["devTool"] = app.commandLine.hasSwitch("devTool")
    configMap["loadUrl"] = app.commandLine.hasSwitch("loadUrl")
    return configMap
}