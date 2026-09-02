import { app, autoUpdater, BrowserWindow, dialog, ipcMain } from 'electron';
import path from 'node:path';
import os from 'node:os';
import Store from 'electron-store';
import started from 'electron-squirrel-startup';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

// ─── Auto-update (Squirrel.Windows) ─────────────────────────
// Servidor que hospeda os arquivos de release (RELEASES + .nupkg), gerados por
// `npm run make` e copiados manualmente pra lá a cada versão nova. Ajuste esta
// URL se o servidor da API mudar.
const UPDATE_FEED_URL = 'http://192.168.30.22:5225/updates/win32/x64';
const UPDATE_CHECK_INTERVAL_MS = 4 * 60 * 60 * 1000; // 4 horas

function setupAutoUpdater() {
  // Squirrel.Windows só existe no app empacotado/instalado - em dev (npm start)
  // não há Update.exe, e autoUpdater.setFeedURL lançaria erro.
  if (!app.isPackaged || process.platform !== 'win32') return;

  autoUpdater.setFeedURL({ url: UPDATE_FEED_URL });

  autoUpdater.on('update-downloaded', (_event, _releaseNotes, releaseName) => {
    dialog
      .showMessageBox({
        type: 'info',
        buttons: ['Reiniciar agora', 'Depois'],
        defaultId: 0,
        cancelId: 1,
        title: 'Atualização disponível',
        message: `Uma nova versão do Compass (${releaseName}) foi baixada.`,
        detail: 'Reinicie o aplicativo para aplicar a atualização.',
      })
      .then(({ response }) => {
        if (response === 0) {
          autoUpdater.quitAndInstall();
        }
      });
  });

  autoUpdater.on('error', (err) => {
    console.error('Erro ao verificar atualizações do Compass:', err);
  });

  autoUpdater.checkForUpdates();
  setInterval(() => autoUpdater.checkForUpdates(), UPDATE_CHECK_INTERVAL_MS);
}

interface CompassStoreSchema {
  hasSeenWelcome: boolean;
}

const compassStore = new Store<CompassStoreSchema>({
  defaults: {
    hasSeenWelcome: false,
  },
});

ipcMain.handle('compass:get-os-username', () => os.userInfo().username);
ipcMain.handle('compass:get-has-seen-welcome', () => compassStore.get('hasSeenWelcome', false));
ipcMain.handle('compass:set-has-seen-welcome', (_event, value: boolean) => {
  compassStore.set('hasSeenWelcome', value);
  return true;
});

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    titleBarStyle: 'hidden',
    titleBarOverlay: {
      color: '#32307B',       // fundo da área dos botões (bate com o resto da barra)
      symbolColor: '#FFFFFF', // cor dos ícones minimizar/maximizar/fechar
      height: 44,             // altura da barra — combine com a altura do seu header React
    },
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }

  // Open the DevTools apenas em desenvolvimento (nunca no app empacotado).
  if (!app.isPackaged) {
    mainWindow.webContents.openDevTools();
  }
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createWindow();
  setupAutoUpdater();
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
// Porta de debug remoto só em desenvolvimento - nunca deixar isso aberto num app empacotado.
if (!app.isPackaged) {
  app.commandLine.appendSwitch('remote-debugging-port', '9222');
}
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
