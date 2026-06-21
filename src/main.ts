import {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  nativeImage,
  dialog,
  screen,
  desktopCapturer,
  Tray,
  Menu,
  shell,
} from "electron";
import path from "node:path";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "fs";
import screenshot from "screenshot-desktop";
import log from "electron-log/main";
import { autoUpdater } from "electron-updater";

// ── Logging setup ────────────────────────────────────────────────────────────
// Logs are written to: %AppData%\RealityLens\logs\main.log

log.initialize();
log.transports.file.level = "debug";
log.transports.console.level = "debug";
log.transports.file.format = "[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}";

// Forward all console.* to electron-log so nothing is lost
Object.assign(console, log.functions);

// Catch any crash before Electron even fires — this is what fills the log
// when the Squirrel installer silently fails
process.on("uncaughtException", (error) => {
  log.error("[uncaughtException]", error);
});
process.on("unhandledRejection", (reason) => {
  log.error("[unhandledRejection]", reason);
});

log.info("=== RealityLens starting ===");
log.info("Platform:", process.platform, "| Arch:", process.arch);
log.info(
  "Electron:",
  process.versions.electron,
  "| Node:",
  process.versions.node,
);
log.info("Args:", process.argv.join(" "));
log.info("Log file:", log.transports.file.getFile().path);
// ─────────────────────────────────────────────────────────────────────────────

autoUpdater.logger = log;
// Auto-updater is initialized in app.whenReady() below

const execFileAsync = promisify(execFile);
const configPath = path.join(app.getPath("userData"), "config.json");

function getConfig() {
  try {
    return JSON.parse(fs.readFileSync(configPath, "utf8"));
  } catch (e) {
    return { shortcut: "CommandOrControl+Shift+L" };
  }
}

function saveConfig(config: any) {
  fs.writeFileSync(configPath, JSON.stringify(config));
}
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
let tray: Tray | null = null;

// Disable CalculateNativeWinOcclusion so the transparent overlay window
// does not interfere with hardware-accelerated video planes (MPO) in other apps
// like Chrome/Edge showing X/Twitter or YouTube videos underneath.
// Also disable direct composition to stop per-pixel alpha layered windows from
// disrupting Windows DWM compositing of video below the overlay.
if (process.platform === "win32") {
  app.commandLine.appendSwitch(
    "disable-features",
    "CalculateNativeWinOcclusion,HardwareMediaKeyHandling,MediaFoundationVideoCapture",
  );
} else if (process.platform === "linux") {
  app.disableHardwareAcceleration();
  app.commandLine.appendSwitch("enable-transparent-visuals");
  app.commandLine.appendSwitch("disable-gpu");
}

let overlayWindow: BrowserWindow | null = null;
let mainWindow: BrowserWindow | null = null;
let isQuitting = false;

const getIconPath = () => {
  return app.isPackaged
    ? path.join(process.resourcesPath, "App_icons", "icon.png")
    : path.join(__dirname, "../../src/App_icons/icon.png");
};

const createWindow = () => {
  // Create the browser window.
  const win = new BrowserWindow({
    width: 1200,
    height: 1000,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      sandbox: false,
    },
    icon: getIconPath(),
  });

  mainWindow = win;

  // and load the index.html of the app.
  if (process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(process.env['ELECTRON_RENDERER_URL']);
  } else {
    win.loadFile(
      path.join(__dirname, `../renderer/index.html`),
    );
  }

  // Open DevTools only in development
  if (process.env['ELECTRON_RENDERER_URL']) {
    win.webContents.openDevTools();
    win.setMenu(null);

    // Unregister or block common inspection shortcuts
    win.webContents.on("before-input-event", (event, input) => {
      if (
        (input.control || input.meta) &&
        input.shift &&
        input.key.toLowerCase() === "i"
      ) {
        event.preventDefault();
      }
      if (input.key === "F12") {
        event.preventDefault();
      }
    });
  } else {
    win.webContents.on("devtools-opened", () => {
      win.webContents.closeDevTools();
    });
  }

  // When main window is closed, hide it to tray instead of quitting
  win.on("close", (event) => {
    if (!isQuitting) {
      event.preventDefault();
      win.hide();
      if (overlayWindow && !overlayWindow.isDestroyed()) {
        overlayWindow.destroy();
        overlayWindow = null;
      }
    }
  });

  win.on("show", () => {
    if (process.platform === "darwin" && app.dock) {
      app.dock.show();
    }
  });

  return win;
};

function createOverlayWindow() {
  if (overlayWindow) return;

  const primaryDisplay = screen.getPrimaryDisplay();

  const { width, height } = primaryDisplay.bounds;

  overlayWindow = new BrowserWindow({
    width,
    height,
    x: 0,
    y: 0,

    transparent: true,
    backgroundColor: "#00000000",
    frame: false,
    hasShadow: false,
    alwaysOnTop: true,
    fullscreenable: false,
    skipTaskbar: true,
    movable: false,
    resizable: false,
    focusable: true,
    visualEffectState: "active",

    webPreferences: {
      preload: path.join(__dirname, "../preload/index.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  overlayWindow.setAlwaysOnTop(
    true,
    process.platform === "darwin" ? "pop-up-menu" : "screen-saver",
  );
  overlayWindow.setIgnoreMouseEvents(false);

  overlayWindow.setVisibleOnAllWorkspaces(true, {
    visibleOnFullScreen: true,
  });

  if (process.env['ELECTRON_RENDERER_URL']) {
    overlayWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/#/overlay`);
  } else {
    const overlayPath = path.join(
      __dirname,
      `../renderer/index.html`,
    );
    overlayWindow.loadURL(`file://${overlayPath}#/overlay`);
  }

  overlayWindow.on("closed", () => {
    overlayWindow = null;
  });

  overlayWindow.webContents.on(
    "did-fail-load",
    (event, errorCode, errorDescription) => {
      console.error("Overlay failed to load:", errorCode, errorDescription);
    },
  );

  overlayWindow.webContents.on("did-finish-load", () => {
    console.log("Overlay window loaded");
  });

  overlayWindow.webContents.on("console-message", (event, level, message) => {
    console.log(`[Overlay] ${message}`);
  });

  console.log(
    "Overlay window created, loading URL:",
    process.env['ELECTRON_RENDERER_URL']
      ? `${process.env['ELECTRON_RENDERER_URL']}/#/overlay`
      : "file URL",
  );
}

{
  const gotTheLock = app.requestSingleInstanceLock();
  if (!gotTheLock) {
    app.quit();
  } else {
    app.on("second-instance", (event, commandLine, workingDirectory) => {
      log.info("second-instance triggered. commandLine:", commandLine);
      if (mainWindow) {
        if (mainWindow.isMinimized()) mainWindow.restore();
        mainWindow.show();
        mainWindow.focus();
      }
      const url = commandLine.find(arg => arg.startsWith("realitylens://"));
      if (url) {
        log.info("Found deep link URL:", url);
        handleAuthCallback(url);
      } else {
        log.warn("No realitylens:// URL found in commandLine");
      }
    });

    app.on("open-url", (event, url) => {
      event.preventDefault();
      handleAuthCallback(url);
    });

    // Register protocol
    if (process.defaultApp) {
      if (process.argv.length >= 2) {
        app.setAsDefaultProtocolClient("realitylens", process.execPath, [
          path.resolve(process.argv[1]),
        ]);
      }
    } else {
      app.setAsDefaultProtocolClient("realitylens");
    }

    function handleAuthCallback(url: string) {
      try {
        const parsedUrl = new URL(url);
        if (parsedUrl.hostname === "auth-callback") {
          const token = parsedUrl.searchParams.get("token");
          const userId = parsedUrl.searchParams.get("user_id");
          if (token && mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.show();
            mainWindow.focus();
            mainWindow.webContents.send("google-login-success", {
              token,
              userId,
            });
          }
        }
      } catch (e) {
        console.error("Failed to parse deep link URL", e);
      }
    }

    // Do NOT quit when all windows are closed — the app lives in the tray.
    // User must click Quit in the tray context menu to exit.
    const icon = nativeImage
      .createFromPath(getIconPath())
      .resize({ width: 16, height: 16 });

    app.on("window-all-closed", () => {
      // intentionally empty — tray keeps the app alive
    });

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });

    app.whenReady().then(() => {
      if (process.platform === "darwin" && app.dock) {
        app.dock.hide();
      }
      createWindow();

      // ── Auto-updater setup ──────────────────────────────────────────────
      autoUpdater.autoDownload = true;
      autoUpdater.autoInstallOnAppQuit = true;

      autoUpdater.on("checking-for-update", () => {
        log.info("[AutoUpdater] Checking for update...");
      });

      autoUpdater.on("update-available", (info) => {
        log.info("[AutoUpdater] Update available:", info.version);
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send("update-available", info);
        }
      });

      autoUpdater.on("update-not-available", (info) => {
        log.info("[AutoUpdater] No update available. Current version is up to date.");
      });

      autoUpdater.on("download-progress", (progress) => {
        log.info(`[AutoUpdater] Download progress: ${Math.round(progress.percent)}%`);
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send("update-download-progress", progress);
        }
      });

      autoUpdater.on("update-downloaded", (info) => {
        log.info("[AutoUpdater] Update downloaded:", info.version);
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.webContents.send("update-downloaded", info);
        }
      });

      autoUpdater.on("error", (err) => {
        log.error("[AutoUpdater] Error:", err);
      });

      // Check for updates after a short delay to let the app finish loading
      setTimeout(() => {
        autoUpdater.checkForUpdatesAndNotify().catch((err) => {
          log.error("[AutoUpdater] Failed to check for updates:", err);
        });
      }, 3000);
      // ────────────────────────────────────────────────────────────────────

      const config = getConfig();

      // Robust startup registration: always ensure it's registered if enabled,
      // which fixes issues when the app path changes (e.g., from Squirrel to NSIS)
      if (app.isPackaged && config.startupEnabled !== false) {
        app.setLoginItemSettings({
          openAtLogin: true,
          openAsHidden: true,
          args: ["--hidden"],
        });
        if (config.startupEnabled === undefined) {
          config.startupEnabled = true;
          saveConfig(config);
          console.log("Configured to open on startup.");
        }
      }

      const ret = globalShortcut.register(config.shortcut, async () => {
        console.log("Shortcut Pressed");
        try {
          let hasToken = false;
          if (mainWindow && !mainWindow.isDestroyed()) {
            hasToken = await mainWindow.webContents.executeJavaScript(
              '!!(localStorage.getItem("token"))',
            );
          }
          if (hasToken) {
            createOverlayWindow();
          } else {
            // No token — open the main window and navigate to login
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.show();
              mainWindow.focus();
              mainWindow.webContents.send("navigate-to-login");
            } else {
              createWindow();
            }
          }
        } catch (err) {
          console.error("Shortcut auth check failed:", err);
          // Fallback: open login window
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.show();
            mainWindow.focus();
          }
        }
      });
      tray = new Tray(icon);
      console.log("Tray icon path:", getIconPath());
      var contextMenu = Menu.buildFromTemplate([
        {
          label: "Show App",
          click: function () {
            mainWindow?.show();
          },
        },
        {
          label: "Quit",
          click: function () {
            isQuitting = true;
            app.quit();
          },
        },
      ]);
      tray.setToolTip("RealityLens");
      tray.setContextMenu(contextMenu);
      tray.setIgnoreDoubleClickEvents(true);
      console.log("Shortcut Registered:", ret);
    });

    ipcMain.handle("minimise-app", () => {
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.hide();
        if (process.platform === "darwin" && app.dock) {
          app.dock.hide();
        }
      }
    });
    ipcMain.handle("capture-screen", async (_, area) => {
      try {
        if (process.platform === "win32") {
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.setOpacity(0);
          }
          if (overlayWindow && !overlayWindow.isDestroyed()) {
            overlayWindow.setOpacity(0);
          }
        } else {
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.hide();
          }
          if (overlayWindow && !overlayWindow.isDestroyed()) {
            overlayWindow.hide();
          }
        }

        const primaryDisplay = screen.getPrimaryDisplay();
        const scaleFactor = primaryDisplay.scaleFactor || 1;

        const sources = await desktopCapturer.getSources({
          types: ["screen"],
          thumbnailSize: {
            width: primaryDisplay.bounds.width * scaleFactor,
            height: primaryDisplay.bounds.height * scaleFactor,
          },
        });

        let primaryScreenSource = sources.find(
          (source) => source.display_id === String(primaryDisplay.id),
        );

        if (!primaryScreenSource) {
          console.warn(
            "Primary screen source not found by display_id, falling back to first available screen.",
          );
          primaryScreenSource = sources[0];
        }

        if (!primaryScreenSource) {
          throw new Error("Primary screen source not found.");
        }

        const image = primaryScreenSource.thumbnail;

        if (process.platform === "win32") {
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.hide();
            mainWindow.setOpacity(1);
          }
          if (overlayWindow && !overlayWindow.isDestroyed()) {
            overlayWindow.hide();
            overlayWindow.setOpacity(1);
          }
        }

        const x = Math.min(area.start.x, area.end.x);
        const y = Math.min(area.start.y, area.end.y);
        const width = Math.abs(area.end.x - area.start.x);
        const height = Math.abs(area.end.y - area.start.y);

        const selection = {
          x: Math.round(x * scaleFactor),
          y: Math.round(y * scaleFactor),
          width: Math.round(width * scaleFactor),
          height: Math.round(height * scaleFactor),
        };

        const croppedImage = image.crop(selection);

        const uploadsPath = path.join(
          app.getPath("temp"),
          "realitylens-uploads",
        );
        fs.rmSync(uploadsPath, { recursive: true, force: true });
        fs.mkdirSync(uploadsPath, { recursive: true });

        const filePath = path.join(uploadsPath, `capture-${Date.now()}.png`);
        fs.writeFileSync(filePath, croppedImage.toPNG());

        console.log("Saved at:", filePath);

        return filePath;
      } catch (err) {
        console.error(err);
        // Clean up overlay and restore main window so the shortcut works again
        if (overlayWindow && !overlayWindow.isDestroyed()) {
          overlayWindow.destroy();
          overlayWindow = null;
        }
        if (mainWindow && !mainWindow.isDestroyed()) {
          mainWindow.show();
          mainWindow.focus();
        }
        dialog.showErrorBox(
          "Capture failed",
          err instanceof Error
            ? err.message
            : "Unknown error while capturing screen",
        );
        throw err;
      } finally {
        if (overlayWindow && !overlayWindow.isDestroyed()) {
          if (process.platform !== "linux") {
            overlayWindow.setIgnoreMouseEvents(true, { forward: true });
          }
          overlayWindow.setFocusable(true);
          overlayWindow.show();
        }
      }
    });

    ipcMain.handle("finish-verification", async () => {
      if (overlayWindow && !overlayWindow.isDestroyed()) {
        overlayWindow.close();
      }
    });

    ipcMain.handle(
      "set-overlay-click-through",
      async (_, shouldClickThrough: boolean) => {
        if (!overlayWindow || overlayWindow.isDestroyed()) {
          return;
        }

        overlayWindow.setIgnoreMouseEvents(shouldClickThrough, {
          forward: true,
        });
      },
    );

    // Unregister all shortcuts when the app is quitting.
    app.on("will-quit", () => {
      globalShortcut.unregisterAll();
    });

    ipcMain.handle("open-external", (_, url) => {
      shell.openExternal(url);
    });

    ipcMain.handle("get-shortcut", () => {
      return getConfig().shortcut;
    });

    ipcMain.handle("get-app-version", () => {
      return app.getVersion();
    });

    // ── Auto-updater IPC handlers ──────────────────────────────────────
    ipcMain.handle("check-for-updates", async () => {
      try {
        const result = await autoUpdater.checkForUpdatesAndNotify();
        return result?.updateInfo;
      } catch (err) {
        log.error("[AutoUpdater] Manual check failed:", err);
        throw err;
      }
    });

    ipcMain.handle("install-update", () => {
      autoUpdater.quitAndInstall(false, true);
    });

    ipcMain.handle("get-startup-settings", () => {
      return app.getLoginItemSettings();
    });

    ipcMain.handle("set-startup-enabled", (_, enabled: boolean) => {
      app.setLoginItemSettings({
        openAtLogin: enabled,
        openAsHidden: true,
        args: ["--hidden"],
      });
      const config = getConfig();
      config.startupEnabled = enabled;
      saveConfig(config);
      return app.getLoginItemSettings();
    });
    // ──────────────────────────────────────────────────────────────────

    ipcMain.handle("update-shortcut", (_, newShortcut) => {
      const config = getConfig();
      config.shortcut = newShortcut;
      saveConfig(config);

      globalShortcut.unregisterAll();
      const ret = globalShortcut.register(newShortcut, async () => {
        console.log("Shortcut Pressed");
        try {
          let hasToken = false;
          if (mainWindow && !mainWindow.isDestroyed()) {
            hasToken = await mainWindow.webContents.executeJavaScript(
              '!!(localStorage.getItem("token"))',
            );
          }
          if (hasToken) {
            createOverlayWindow();
          } else {
            if (mainWindow && !mainWindow.isDestroyed()) {
              mainWindow.show();
              mainWindow.focus();
              mainWindow.webContents.send("navigate-to-login");
            } else {
              createWindow();
            }
          }
        } catch (err) {
          console.error("Shortcut auth check failed:", err);
          if (mainWindow && !mainWindow.isDestroyed()) {
            mainWindow.show();
            mainWindow.focus();
            mainWindow.webContents.send("navigate-to-login");
          }
        }
      });
      return ret;
    });
  } // end if (gotTheLock)
}
