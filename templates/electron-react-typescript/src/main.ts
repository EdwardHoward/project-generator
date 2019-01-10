import {app, BrowserWindow} from 'electron';

function onReady(){
   const mainWindow = new BrowserWindow({
      width: 800,
      height: 600
   });

   const fileName = `file://${__dirname}/index.html`;
   mainWindow.loadURL(fileName);
   mainWindow.on('close', () => app.quit());
}

app.on('ready', () => onReady());
app.on('window-all-closed', () => app.quit());
