import * as vscode from 'vscode';

export class ASLCustomCommands {

    static registerCommands(){
        console.log('REGISTERED COMMANDS: asl.genie and asl.zip');
        vscode.commands.registerCommand('asl.genie.import',this.genieCallBack);
        vscode.commands.registerCommand('asl.zip.import',this.genieCallBack);
    } 

    static genieCallBack(context: any[]){
        console.log("GenieCallback");
        for(const element of context){
            console.log(element);
        }
    }

    static zipCallBack(context: any[]){
        console.log("ZipCallback");
        for(const element of context){
            console.log(element);
        }
    }
}