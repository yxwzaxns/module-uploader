import electron,{ app, screen } from 'electron'

export function changeDisplayPosition(){
    if(app.isReady){
        const displays = screen.getAllDisplays()
        const externalDisplay = displays.find((display) => {
            return display.bounds.x !== 0 || display.bounds.y !== 0
        })

        if (externalDisplay) {
            return {
                x: externalDisplay.bounds.x + 50,
                y: externalDisplay.bounds.y + 50
            }
        }

        return {
            x: displays[0].bounds.x + 50,
            y: displays[0].bounds.y + 550
        }
    }
}

export function changeWebPreferences(): electron.BrowserWindowConstructorOptions {
    return {
        webPreferences:{
            devTools: true,
            nodeIntegration: true,
            contextIsolation: false
        }
    }
}