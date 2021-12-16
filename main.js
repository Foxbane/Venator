//Declaration of constants and imports of packages needed fro app
const { app, BrowserWindow, Menu, ipcMain, shell, ipcRenderer } = require('electron')
const {ChildProcess, exec, spawn, execFile} = require('child_process')
const log = require('electron-log')
const { Console, error } = require('console')
const { stdout, stderr } = require('process')
const fs= require('fs')
//declariation of global variables, not ideal but should be ok for localised applcation.
var DID
var target
var file
var file_location

// Set environment
process.env.NODE_ENV = 'production'
const isDev = process.env.NODE_ENV !== 'production' ? true : false
let mainWindow
//settings for app window 
function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: 'Venator',
    width: isDev ? 900 : 600,
    height: 600,
    width: 450,
    resizable: isDev ? true : false,
    backgroundColor: '#483d8b',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  if (isDev) {
    mainWindow.webContents.openDevTools()
  }
  mainWindow.loadFile('./app/index.html')
}
//launcher and configuration for menu
app.on('ready', () => {
  createMainWindow()
  const mainMenu = Menu.buildFromTemplate(menu)
  Menu.setApplicationMenu(mainMenu)
})
const menu = [
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
//closing window, stop and remove active contianer
app.on('window-all-closed', () => {
    exec('docker kill'+" "+DID)
    exec('docker rm'+" "+DID)
    app.quit()
})
//Launching window, check docker is on the system
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow()
    var commandExists = require('command-exists');  
    commandExists('docker').then( {
    }).catch(mainWindow.webContents.send('Docker:error'), {
    });
  }
})
//Communicaiton with frontend 
ipcMain.on('send:cmd', (event,args) =>{
  console.log(args);
  startContainer(args);
})
//test selector with switch statement
ipcMain.on('start:analysis', (event,args) =>{
  console.log(args)
  test=args.test_type
  console.log(test)
  switch(test){
    case 'exiftool':
      runExif(args);
      break;
    case 'zipdump.py':
      runZipdump(args);
      break;
    case 'diec':
      runDiec(args);
      break;
    default:
      mainWindow.webContents.send('Error:encountered',`${stderr}`);
      break;
  }
});
//Takes file location and splits down for opening with notepad
ipcMain.on('open:file', (event,args) =>{
    let results= args.results_location;
    results1=results.replaceAll('"', '')
    console.log(results1)
    results2=results1.slice(1)
    console.log(results2)
    openFile(results2);
});
//call to reload app for further testing 
ipcMain.on('reload', (event)=> {
  exec('docker kill'+" "+DID)
  exec('docker rm'+" "+DID)
  mainWindow.loadFile('./app/index.html')
});

//Process Functions
//function for spinning up container
async function startContainer(args){
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
    mainWindow.webContents.send('Error:encountered',`${data}`);
  });
  dockers.on('close', (code) => {
    if(code==0){
      console.log(`child process exited with code ${code}`);
      sendFile();
    }
  });
}
//copies file from host to container
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
    mainWindow.webContents.send('Error:encountered',`${data}`);
  });
  transfer.on('close', (code) => {
    if(code==0){
      console.log(`child process exited with code ${code}`);
      console.log(`${stdout}`)
      mainWindow.webContents.send('setup:end',DID);
    }
  });
}
//opens the output file with notepad
async function openFile(){
  console.log(results2)
  const notepad= exec('notepad'+" "+results2)
  notepad.stdout.on('data', (data) => {    
    console.log(`${data}`)
  });
  notepad.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
    mainWindow.webContents.send('Error:encountered',`${data}`);
  });
  notepad.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
  });
}
//Functions for Tests 
async function runExif(args){
  let test_type = args.test_type
  let output_location= (">app/output/"+file+"_exif.txt")
  console.log(test_type);
  console.log(output_location);
  const starttest= exec('docker exec'+" "+DID+ " "+ test_type+ " "+file+" "+output_location)
  starttest.stdout.on('data', (data) => {    
    console.log(`${data}`)
  });
  starttest.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
    mainWindow.webContents.send('Error:encountered',`${data}`);
  });
  starttest.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    if (code==0) {
      console.log(`${stdout}`)
      mainWindow.webContents.send('Analysis:complete',output_location);
    }
  });
}
async function runZipdump(args){
  let test_type = args.test_type
  let output_location= (">app/output/"+file+"_zdump.txt")
  console.log(test_type);
  console.log(output_location);
  const starttest= exec('docker exec'+" "+DID+ " "+ test_type+ " "+file+" "+output_location)
  starttest.stdout.on('data', (data) => {    
    console.log(`${data}`)
  });
  starttest.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
    mainWindow.webContents.send('Error:encountered',`${data}`);
  });
  starttest.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    if (code==0) {
      console.log(`${stdout}`)
      mainWindow.webContents.send('Analysis:complete',output_location);
    }
  });
}
async function runDiec(args){
  let test_type = args.test_type
  let output_location= (">app/output/"+file+"_sysdig.txt")
  console.log(test_type);
  console.log(output_location);

  const starttest= exec('docker exec'+" "+DID+ " "+ test_type+ " "+"-d"+" "+file+" "+output_location)
  starttest.stdout.on('data', (data) => {    
    console.log(`${data}`)
  });
  starttest.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
    mainWindow.webContents.send('Error:encountered',`${data}`);
  });
  starttest.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
    if (code==0) {
      console.log(`${stdout}`)
      mainWindow.webContents.send('Analysis:complete',output_location);
    }
  });
}
