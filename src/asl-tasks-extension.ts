/********************************************************************************
 * Copyright (c) 2018 TypeFox and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/

import * as path from 'path';
import * as vscode from 'vscode';

export class ASLTaskBuilderClass  implements vscode.TaskProvider {
    static AslType = 'asl';
    static tasksList: string[][] = [
        ["BUILDGEN", "Asl", " for ASL"],
        ["BUILDGEN", "Genio", " for Genio"],
        ["BUILDGEN", "All", " for All"],
        ["BUILDIMP", "Genio", " for Asl"]
    ]
    private aslPromise: Thenable<vscode.Task[]> | undefined = undefined;

    context: vscode.ExtensionContext;

    constructor(context: vscode.ExtensionContext, workspaceRoot: string) {
        this.context = context;
        const pattern = path.join(workspaceRoot, '**','*.asl');
        console.log(pattern);
		const fileWatcher = vscode.workspace.createFileSystemWatcher(pattern);
		fileWatcher.onDidChange(() => this.aslPromise = undefined);
		fileWatcher.onDidCreate(() => this.aslPromise = undefined);
		fileWatcher.onDidDelete(() => this.aslPromise = undefined);
    }


    public provideTasks(): Thenable<vscode.Task[]> | undefined {
		if(!this.aslPromise){
           this.aslPromise =  this.getAslTasks()
        }
		return this.aslPromise;
	}

	public resolveTask(_task: vscode.Task): vscode.Task | undefined {
		return undefined;
	}

    async getAslTasks(): Promise<vscode.Task[]> {
        const result = await Promise.resolve(this.createVsCodeTasks());
        for(const task of result){
            console.log(task);
        }
        return result;
    }
    
     async createVsCodeTasks(): Promise<vscode.Task[]>{
        const workspaceFolders = vscode.workspace.workspaceFolders;
        const result:vscode.Task[] = [];
        if(!workspaceFolders) return result;
        for(const taskArray of ASLTaskBuilderClass.tasksList) {
            let taskType: string = taskArray[0];

            if(taskType ==  "BUILDGEN") {
                    let filenameArray: string[][] =await this.fetchAslFiles(workspaceFolders);
                    let generatorPath = this.context.asAbsolutePath(path.join('server', 'mydsl', 'bin','generator.sh'));

                    for(const filename of filenameArray) {
                        const label = "Build " + filename[0] + taskArray[2];
                        const commandString :string = `cd ${this.context.asAbsolutePath(path.join('server', 'mydsl', 'bin'))} && ${generatorPath} ${taskArray[1]} ${filename[1]} ${filename[2]}`
                        const kind: AslTaskDefinition = {
                            type: 'shell',
                            task: label,
                            command: commandString
                        };
                        console.log(filename);
                        
                        const command = new vscode.ShellExecution(commandString)
                        const newTask = new vscode.Task(kind, workspaceFolders[0],label, 'asl', command);
                        newTask.group = vscode.TaskGroup.Build;
                        result.push(newTask);
                    }
            } else if (taskType =="BUILDIMP" ){
                const label = "Import " + taskArray[1] + "to Asl";
                const kind: AslTaskDefinition = {
                    type: 'custombuildscript',
                    task: label,
                    command: "echo generating"
                };
                
                const command = new vscode.CustomExecution(async (): Promise<vscode.Pseudoterminal> => {
                    return new CustomBuildTaskTerminal(taskArray[1]);
                })
                const newTask = new vscode.Task(kind, workspaceFolders[0],label, 'asl', command);
                newTask.group = vscode.TaskGroup.Build;
                result.push(newTask);
            }
        };
        console.log("COUNT: " + result.length + "/");
        return result;
    }
    
    async fetchAslFiles(workspaceFolders:readonly vscode.WorkspaceFolder[]): Promise<string[][]>{
        const result: string[][] = [];
        for (const workspaceFolder of workspaceFolders) {
            const folderString = workspaceFolder.uri;
		    if (!folderString) {
			    continue;
		    }
            const findPattern = path.join("**","*.asl");
            const rejectPattern = path.join("lib","*.asl");
            for (const fileUri of await Promise.resolve(vscode.workspace.findFiles(findPattern, rejectPattern))) {
                result.push([fileUri.fsPath.substring(folderString.fsPath.length+1),fileUri.fsPath, workspaceFolders[0].uri.fsPath]);
            }
        }
        return result;
    }

}

interface AslTaskDefinition extends vscode.TaskDefinition {
	/**
	 * The task name
	 */
	task: string;
    
    /**
	 * Command to be executed 
	 */
    command: string;

    /**
	 * The current file
	 */
	file?: string;
    
}


class CustomBuildTaskTerminal implements vscode.Pseudoterminal {

    private _platform:string;

	constructor(platform:string) {
        this._platform = platform;
	}
    onDidWrite: vscode.Event<string>;
    onDidOverrideDimensions?: vscode.Event<vscode.TerminalDimensions | undefined> | undefined;
    onDidClose?: vscode.Event<number | void> | undefined;
    handleInput?(data: string): void {
        throw new Error('Method not implemented.');
    }
    setDimensions?(dimensions: vscode.TerminalDimensions): void {
        throw new Error('Method not implemented.');
    }

	open(initialDimensions: vscode.TerminalDimensions | undefined): void {
        this.doBuild();
	}

	close(): void {
		
	}

	private async doBuild(): Promise<void> {
		return new Promise<void>(async() => {
			const askForInputFolder:vscode.InputBoxOptions = {
                prompt:"What is the input folder?"
            }
            const askForOutputFile:vscode.InputBoxOptions = {
                prompt:"What is the output filename?"
            }

            const inputFolder = await vscode.window.showInputBox(askForInputFolder);
            const outputFile = await vscode.window.showInputBox(askForOutputFile);
            vscode.window.showInformationMessage('Generating for: ' + inputFolder + "/" + outputFile + "/" +  this._platform);
		});
	}
}