//Import libraries
let { app, BrowserWindow, dialog, ipcMain, session, shell } = require("electron");
let fs = require("fs");
let path = require("path");
let readline = require("readline");
let { performance } = require("perf_hooks");

//Metadata - Title
let latest_fps = 0;
let naissance_version = "1.7b Chukchi";
let title_update_interval;
let win;

//Initialise functions
{
  function createWindow () {
    //Declare local instance variables
    win = new BrowserWindow({
      width: 3840,
      height: 2160,
      webPreferences: {
        contextIsolation: false,
        enableRemoteModule: false,
        nodeIntegration: true,
        webSecurity: false
      },

      icon: path.join(process.cwd(), `gfx/logo.png`)
    });

    //Load file; open Inspect Element
    win.loadFile("index.html").then(() => {
			win.webContents.openDevTools();
			win.setMenuBarVisibility(false);
		});

    //Listen for FPS updates from the renderer process
    ipcMain.on("update-fps", (event, fps) => {
      latest_fps = fps;
    });

    //Update the title every second with the latest data
    title_update_interval = setInterval(function () {
			let memory_usage = process.memoryUsage();

      let heap_used_mb = (memory_usage.heapUsed/1024/1024).toFixed(2);
			let rss_mb = (memory_usage.rss/1024/1024).toFixed(2);
			let title_string = `Naissance HGIS ${naissance_version} - FPS: ${latest_fps} | RAM: RSS ${rss_mb}MB/Heap ${heap_used_mb}MB`;

      win.setTitle(title_string);
    }, 1000);
    
    //<a href> handling
    //Intercept link clicks that would navigate the current window
    win.webContents.on("will-navigate", (event, url) => {
      if (url !== win.webContents.getURL()) {
        event.preventDefault();
        shell.openExternal(url);
      }
    });
    
    //Intercept target="_blank" or window.open()
    win.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: "deny" };
    });

    //Get the default session
    try {
      let default_session = session.defaultSession;

      //Set up CORS settings for the default session
      default_session.webRequest.onHeadersReceived((details, callback) => {
        callback({
          responseHeaders: {
            ...details.responseHeaders,
            'Access-Control-Allow-Origin': ['*'],
            'Access-Control-Allow-Methods': ['GET', 'POST', 'OPTIONS', 'PUT', 'PATCH', 'DELETE'],
            'Access-Control-Allow-Headers': ['Content-Type', 'Authorization']
          }
        });
      });
    } catch (e) {
      console.warn(e);
    }
  }
}

//App handling
{
  app.commandLine.appendSwitch("enable-features", "SharedArrayBuffer");
  app.commandLine.appendSwitch('js-flags', '--max-old-space-size=32128 --expose-gc');
  
  //Launch app when ready
  app.whenReady().then(() => {
    //Create the window and instantiate it
    createWindow();

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow();
    });
    app.on("ready", () => {
      Menu.setApplicationMenu(null);
    });
  });

  //Window lifecycle defaults
  app.on("window-all-closed", () => {
    if (process.platform !== "darwin") app.quit();
  });
}

//IPC handling
{
  let ve = require("./UF/js/vercengen/startup/vercengen_electron");
  ve.initialiseIPC();
}