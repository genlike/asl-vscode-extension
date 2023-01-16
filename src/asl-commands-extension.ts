import * as vscode from 'vscode';
import * as path from 'path';
//import * as cp from "child_process";


export class ASLCustomCommands implements vscode.Disposable {

    context: vscode.ExtensionContext;
    constructor(context: vscode.ExtensionContext){
        this.context = context;
    }
    dispose() {
        //
    }

    registerCommands(){
        console.log('REGISTERED COMMANDS: asl.genie and asl.zip');
        //vscode.commands.registerCommand('genie.import',this.genieCallBack);
        vscode.commands.registerCommand('zip.import',this.zipCallBack);
        vscode.commands.registerCommand('genio.export',this.exportGenieCallBack);
    } 

    genieCallBack(...context: any[]){
        console.log("GenieCallback");
    }

    zipCallBack(...context: any[]){
        console.log("ZipCallback");
        let fileUri = context[0];
        console.log(fileUri);
        const askForOutputFile:vscode.InputBoxOptions = {
            prompt:"What is the output file name?"
        }
        
        const askForPlatform:vscode.QuickPickOptions = {
            placeHolder:"PLATFORM",
            canPickMany: false 
        }
//             const askForOutputFile:vscode.InputBoxOptions = {
//                 prompt:"What is the output filename?"
//             }
            
             const outputfile = vscode.window.showInputBox(askForOutputFile);
             const outputPlatform = vscode.window.showQuickPick(['GENIO'], askForPlatform);
            vscode.window.showInformationMessage('Generating for: ' + outputfile + "/" + outputPlatform + "/");
        //let generatorPath = this.context.asAbsolutePath(path.join('server', 'mydsl', 'bin','generator.sh'));
        console.log(outputfile + " "+  outputPlatform);
    }


    exportGenieCallBack(...callcontext: any[]){
        console.log("exportGenie");
        let fileUri = callcontext[0];
        console.log(fileUri);
        console.log("exportGenie-context");
        console.log(this.context)
        let generatorPath = this.context.asAbsolutePath(path.join('server', 'mydsl', 'bin','generator.sh'));
        let generatorType = 'Genie';
        
        const workspaceRoot = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
		? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;
        console.log("exportGenie-0-");
        console.log(workspaceRoot)
	    if (!workspaceRoot) {
		    return;
	    }
        console.log("exportGenie-1-");
        const commandString :string = `${generatorPath} ${generatorType} ${fileUri.path} ${workspaceRoot}`
        console.log(commandString);
        console.log("exportGenie-2-");
        //cp.execSync(commandString);
    }
}