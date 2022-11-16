import * as vscode from 'vscode';

export class ASLCustomCommands implements vscode.Disposable {

    context: vscode.ExtensionContext;
    constructor(context: vscode.ExtensionContext){
        this.context = context;
    }
    dispose() {
        //
    }
    public registerCommands(){
        console.log('REGISTERED COMMANDS: asl.genie and asl.zip');
        vscode.commands.registerCommand('asl.genie.import',this.genieCallBack);
        vscode.commands.registerCommand('asl.zip.import',this.zipCallBack);
        vscode.commands.registerCommand('asl.genie.export',this.exportGenieCallBack);
    } 

    genieCallBack(...context: any[]){
        console.log("GenieCallback");
    }

    zipCallBack(...context: any[]){
        console.log("ZipCallback");
    }


    exportGenieCallBack(...context: any[]){
        console.log("exportGenie");
        let fileUri:vscode.Uri = context[0];
        console.log(fileUri.path)
    }
}