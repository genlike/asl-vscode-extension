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

import * as vscode from 'vscode';
import { ASLLspVscodeExtension } from './asl-lsp-extension';
import { SprottyLspVscodeExtension } from 'sprotty-vscode/lib/lsp';
//import { ASLTaskBuilderClass } from './asl-tasks-extension';
import { ASLCustomCommands } from './asl-commands-extension';

let extension: SprottyLspVscodeExtension;
//let aslTaskProvider: vscode.Disposable | undefined;
let aslCustomCommand: ASLCustomCommands;

export function activate(context: vscode.ExtensionContext) {
    
    extension = new ASLLspVscodeExtension(context);
    aslCustomCommand = new ASLCustomCommands(context);
    aslCustomCommand.registerCommands();
    const workspaceRoot = (vscode.workspace.workspaceFolders && (vscode.workspace.workspaceFolders.length > 0))
		? vscode.workspace.workspaceFolders[0].uri.fsPath : undefined;
	if (!workspaceRoot) {
		return;
	}
    //aslTaskProvider = vscode.tasks.registerTaskProvider(ASLTaskBuilderClass.AslType, new ASLTaskBuilderClass(context, workspaceRoot));
}

export function deactivate(): Thenable<void> {
    //if(aslTaskProvider) aslTaskProvider.dispose();
    if(aslCustomCommand) aslCustomCommand.dispose();
    if (!extension) return Promise.resolve(undefined);

    return extension.deactivateLanguageClient();

}
