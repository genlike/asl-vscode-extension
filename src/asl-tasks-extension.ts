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
        ["BUILDGEN", "Genio", " for Genio"]
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
            this.aslPromise = this.getAslTasks();
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
        //const promiseList: Promise<vscode.Task[]>[] = [];
        const result:vscode.Task[] = [];
        if(!workspaceFolders) return result;
        for(const taskArray of ASLTaskBuilderClass.tasksList) {
            let taskType: string = taskArray[0];
            if(taskType ==  "BUILDGEN") {

                    let filenameArray: string[][] =await this.fetchAslFiles(workspaceFolders);
                    let generatorPath = this.context.asAbsolutePath(path.join('server', 'mydsl', 'bin','generator.sh'));

                    for(const filename of filenameArray) {
                        const kind: AslTaskDefinition = {
                            type: 'asl',
                            task: taskArray[2]
                        };
                        console.log(filename);
                        const label = "Build " + filename[0] + taskArray[2];
                        var command = new vscode.ShellExecution(`echo "${generatorPath} ${taskArray[1]} ${filename[1]}"`)
                        const newTask = new vscode.Task(kind, workspaceFolders[0],label, 'asl', command);
                        console.log(newTask.execution);
                        newTask.group = vscode.TaskGroup.Build;
                        result.push(newTask);
                    }
            }
    
        };
        //result = await Promise.all(result)
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
                result.push([fileUri.fsPath.substring(folderString.fsPath.length+1),fileUri.fsPath]);
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
	 * The current file
	 */
	file?: string;
}


