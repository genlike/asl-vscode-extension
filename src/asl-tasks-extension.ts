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
    static AslType = 'Asl';
    static tasksList: string[][] = [
        ["BUILDGEN", "Asl", "Build for ASL"],
        ["BUILDGEN", "Genio", "Build for Genio"]
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
		return undefined;
	}

	public resolveTask(_task: vscode.Task): vscode.Task | undefined {
		const task = _task.definition.task;
		// A Rake task consists of a task and an optional file as specified in RakeTaskDefinition
		// Make sure that this looks like a Rake task by checking that there is a task.
		if (task) {
			// resolveTask requires that the same definition object be used.
			const definition: AslTaskDefinition = <any>_task.definition;
            console.log("ResolveTask");
            console.log(_task);
			return new vscode.Task(definition, _task.scope ?? vscode.TaskScope.Workspace, definition.task, 'Asl', _task.execution);
		}
		return undefined;
	}

    async getAslTasks(): Promise<vscode.Task[]> {
        return this.createVsCodeTasks();
    }
    
    createVsCodeTasks(): vscode.Task[]{
        const workspaceFolders = vscode.workspace.workspaceFolders;
        let result:vscode.Task[] = [];
        if(!workspaceFolders) return result;
        ASLTaskBuilderClass.tasksList.forEach((task:string[]) => {
            let taskType: string = task[0];
            switch (taskType) {
                case "BUILDGEN":
                    console.log("BUILDGEN");
                    console.log(task)
                    result.push(...this.createBuildGenVsCodeTask(task, workspaceFolders))
                    break;
                default:
                    break;
            }
    
        });
        return result;
    }
    
    createBuildGenVsCodeTask(params:string[],workspaceFolders:readonly vscode.WorkspaceFolder[]): vscode.Task[]{
       let result: vscode.Task[] = [];
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
            vscode.workspace.fs.readDirectory(folderString).then((files:[string, vscode.FileType][]) => {
                files.forEach((file: [string, vscode.FileType]) => {
                    if(file[0].match(/([a-zA-Z0-9\s_\\.\-\(\):])+.asl/)) {
                        console.log(workspaceFolder + "\\" +file[0]);
                        let task = new vscode.Task(kind, workspaceFolder, params[2] , 'asl', new vscode.ShellExecution(`echo "${generatorPath} ${params[1]} ${workspaceFolder.uri}\\${file[0]}"`));    
                        result.push(task);
                        task.group = vscode.TaskGroup.Build;
                    }
                });
            });
            
        };
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


