import * as vscode from 'vscode';
import * as path from 'path';
import * as cp from "child_process";


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
        //vscode.commands.registerCommand('genie.import',this.genieCallBack);
        vscode.commands.registerCommand('zip.import',this.zipCallBack);
        vscode.commands.registerCommand('genie.export',this.exportGenieCallBack);
    } 

    genieCallBack(...context: any[]){
        console.log("GenieCallback");
    }

    zipCallBack(...context: any[]){
        console.log("ZipCallback");
    }


    exportGenieCallBack(...context: any[]){
        console.log("exportGenie");
        let fileUri = context[0];
        console.log(fileUri);
        let generatorPath = this.context.asAbsolutePath(path.join('server', 'mydsl', 'bin','generator.sh'));
        let generatorType = 'Genie';
        console.log("exportGenie-0-");
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
        cp.execSync(commandString);
    }
}