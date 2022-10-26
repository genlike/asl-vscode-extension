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
    //private aslPromise: Thenable<vscode.Task[]> | undefined = undefined;

    context: vscode.ExtensionContext;



    constructor(context: vscode.ExtensionContext, workspaceRoot: string) {
        this.context = context;
        // const pattern = path.join(workspaceRoot, '**','*.asl');
        // console.log(pattern);
		// const fileWatcher = vscode.workspace.createFileSystemWatcher(pattern);
		// fileWatcher.onDidChange(() => this.aslPromise = undefined);
		// fileWatcher.onDidCreate(() => this.aslPromise = undefined);
		// fileWatcher.onDidDelete(() => this.aslPromise = undefined);
    }


    public provideTasks(): Thenable<vscode.Task[]> | undefined {
		// if(!this.aslPromise){
        //     this.aslPromise = this.getAslTasks();
        // }
		return this.getAslTasks();
	}

	public resolveTask(_task: vscode.Task): vscode.Task | undefined {
		const task = _task.definition.task;
        console.log("Pre-If ResolveTask");
        console.log(_task);
		// A Rake task consists of a task and an optional file as specified in RakeTaskDefinition
		// Make sure that this looks like a Rake task by checking that there is a task.
		if (task) {
			// resolveTask requires that the same definition object be used.
			const definition: AslTaskDefinition = <any>_task.definition;
            console.log("ResolveTask");
            console.log(_task);
			return new vscode.Task(definition, _task.scope ?? vscode.TaskScope.Workspace, definition.task, 'asl', _task.execution);
		}
		return undefined;
	}

    async getAslTasks(): Promise<vscode.Task[]> {
        return await this.createVsCodeTasks();
    }
    
    async createVsCodeTasks(): Promise<vscode.Task[]>{
        const workspaceFolders = vscode.workspace.workspaceFolders;
        const result:vscode.Task[] = [];
        const tempResult:Promise<vscode.Task[]>[] = [];
        if(!workspaceFolders) return result;
        ASLTaskBuilderClass.tasksList.forEach(async (task:string[]) => {
            let taskType: string = task[0];
            switch (taskType) {
                case "BUILDGEN":
                    console.log("BUILDGEN");
                    tempResult.push(this.createBuildGenVsCodeTask(task, workspaceFolders));
                    break;
                default:
                    break;
            }
    
        });
        
        const resultTemp:vscode.Task[][] = await Promise.all(tempResult);
        resultTemp.forEach(taskArray => {
            result.push(...taskArray)
        });
        result.forEach(t => {
            console.log(t.name);
        });
        return result;
    }
    
    async createBuildGenVsCodeTask(params:string[],workspaceFolders:readonly vscode.WorkspaceFolder[]): Promise<vscode.Task[]>{
        const result: vscode.Task[] = [];
        const kind: AslTaskDefinition = {
            type: 'asl',
            task: params[2]

        };
        let generatorPath = this.context.asAbsolutePath(path.join('server', 'mydsl', 'bin','generator.sh'));
        for (const workspaceFolder of workspaceFolders) {
            const folderString = workspaceFolder.uri;
		    if (!folderString) {
			    continue;
		    }
            console.log("Folder: " + folderString.fsPath);
            const findPattern = path.join("**","*.asl");
            const rejectPattern = path.join("lib","*.asl");
            for (const fileUri of await vscode.workspace.findFiles(findPattern, rejectPattern)) {
                let name = fileUri.fsPath;
                if(name.match(/([a-zA-Z0-9\s_\\.\-\(\):\/])+.asl/)) {
                    console.log(name);
                    const task = new vscode.Task(kind, workspaceFolders[0],"Build " + name + params[2] , 'asl', new vscode.ShellExecution(`echo "${generatorPath} ${params[1]} ${name}"`));    
                    task.group = vscode.TaskGroup.Build;
                    result.push(task);
                }
            }
        };
        result.forEach(t => {
            console.log(t.name);
        });
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


