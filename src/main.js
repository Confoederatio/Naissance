//Declare app variables
var { app, BrowserWindow, ipcMain } = require("electron");
var { performance } = require("perf_hooks");

var latest_fps = 0;
var naissance_version = "1.3.5b";
var title_update_interval;
var win;

//Initialise functions
{
  function createWindow () {
    win = new BrowserWindow({
      autoHideMenuBar: true,
      width: 1920,
      height: 1080,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      },
    });

    win.loadFile("./src/index.html");
    win.webContents.openDevTools();

    //Listen for FPS updates from the renderer process
    ipcMain.on("update-fps", (event, fps) => {
      latest_fps = fps;
    });

    //Update the title every second with the latest data
    title_update_interval = setInterval(function () {
      var memory_usage = process.memoryUsage();

      var heap_used_mb = (memory_usage.heapUsed/1024/1024).toFixed(2);
      var rss_mb = (memory_usage.rss/1024/1024).toFixed(2);
      var title_string = `Naissance ${naissance_version} - FPS: ${latest_fps} | Memory: RSS ${rss_mb} MB, Heap ${heap_used_mb} MB`;

      win.setTitle(title_string);
    }, 1000);
    win.webContents.once("dom-ready", () => {
      injectFPSCounter(win);
    });
  }

  function injectFPSCounter (arg0_browser_window) {
    //Convert from parameters
    var browser_window = arg0_browser_window;

    //Declare local instance variables
    var fps_counter_script = `
    var { ipcRenderer } = require('electron');

    var frame_count = 0;
    var last_time = performance.now();

    function trackFPS() {
      frame_count++;
      const now = performance.now();

      //Report back to the main process once per second
      if (now - last_time >= 1000) {
        ipcRenderer.send('update-fps', frame_count);
        frame_count = 0;
        last_time = now;
      }
      
      //Keep the loop going
      requestAnimationFrame(trackFPS);
    }

    //Start the counter
    trackFPS();
  `;

    browser_window.webContents.executeJavaScript(fps_counter_script);
  }
}

//Instantiate app
app.whenReady().then(createWindow);
app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0)
    createWindow();
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin")
    app.quit();
  clearInterval(title_update_interval);
});
