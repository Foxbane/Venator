const { app, BrowserWindow, Menu, ipcMain, shell, ipcRenderer } = require('electron')
const {ChildProcess, exec, spawn} = require('child_process')
const log = require('electron-log')
const { Console, error } = require('console')
const { stdout } = require('process')
var DID
var target
globalThis.file
globalThis.file_location

// Set env
process.env.NODE_ENV = 'development'

const isDev = process.env.NODE_ENV !== 'production' ? true : false
const isMac = process.platform === 'darwin' ? true : false

let mainWindow

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: 'Venator',
    width: isDev ? 1200 : 800,
    height: 900,
    wdith: 600,
    icon: './assets/icons/icon.png',
    resizable: isDev ? true : false,
    backgroundColor: 'darkslateblue',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (isDev) {
    mainWindow.webContents.openDevTools()
  }
  mainWindow.loadFile('./app/index.html')
}

app.on('ready', () => {
  createMainWindow()
  const mainMenu = Menu.buildFromTemplate(menu)
  Menu.setApplicationMenu(mainMenu)
})

const menu = [
  ...(isMac ? [{ role: 'appMenu' }] : []),
  {
    role: 'fileMenu',

  },
  ...(isDev
    ? [
        {
          label: 'Developer',
          submenu: [
            { role: 'reload' },
            { role: 'forcereload' },
            { type: 'separator' },
            { role: 'toggledevtools' },
          ],
        },
      ]
    : []),
]

app.on('window-all-closed', () => {
  if (!isMac) {
    exec('docker kill'+" "+DID)
    exec('docker rm'+" "+DID)
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow()
  }
})

ipcMain.on('send:cmd', (event,args) =>{
  console.log(args);
  sendCommand(args);
})
ipcMain.on('start:analysis', (event,args) =>{
  console.log(args);
  startAnalysis(args);
})

async function sendCommand(args){
  target = args.target
  file = args.filen
  file_location = (":home/remnux/"+file)
  console.log(target,file);

  const dockers = exec('docker run --detach remnux/remnux-distro');
    dockers.stdout.on('data', (data) => {          
      let dockerID=(`${data}`)  
      console.log(dockerID) 
      DID=dockerID.substring(0,11);
      console.log(DID)
    });
    dockers.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });
    dockers.on('close', (code) => {
     console.log(`child process exited with code ${code}`);
     sendFile();
    });
}
  async function sendFile(){
    console.log("the container id is "+ DID);
    let filep= (DID+":home/remnux/")
    console.log(filep)
    console.log('docker cp'+" "+target+" "+filep)
    const transfer = exec('docker cp'+" "+target+" "+filep)
      transfer.stdout.on('data', (data) => {    
        console.log(`${data}`)          
      });
      
      transfer.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
      });
      
      transfer.on('close', (code) => {
      console.log(`child process exited with code ${code}`);
      });
      console.log(`${stdout}`)
      mainWindow.webContents.send('setup:end',DID);
  }

async function startAnalysis(args){
  let test_type = args.test_type
  let output_location= ("> app/output/"+file+"_output.txt")
  console.log(test_type);
  console.log(output_location);
  const starttest= exec('docker exec'+" "+DID+ " "+ test_type+ " "+file+" "+output_location)
    starttest.stdout.on('data', (data) => {    
      console.log(`${data}`)

    });
    starttest.stderr.on('data', (data) => {
      console.error(`stderr: ${data}`);
    });
    starttest.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    
    });
    console.log(`${stdout}`)
    mainWindow.webContents.send('Analysis:complete',output_location);
}
