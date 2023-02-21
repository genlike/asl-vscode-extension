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

import * as net from 'net';
import * as vscode from 'vscode';
import { LanguageClient, LanguageClientOptions, StreamInfo } from 'vscode-languageclient';
import { LspLabelEditActionHandler, WorkspaceEditActionHandler, SprottyLspEditVscodeExtension } from "sprotty-vscode/lib/lsp/editing";
import { SprottyDiagramIdentifier, SprottyLspWebview } from 'sprotty-vscode/lib/lsp';
import { SprottyWebview } from 'sprotty-vscode/lib/sprotty-webview';

const LS_PORT = 3011;

export class ASLLspVscodeExtension extends SprottyLspEditVscodeExtension {

    constructor(context: vscode.ExtensionContext) {
        super('asl', context);
    }

    protected getDiagramType(commandArgs: any[]): string | undefined {
        if (commandArgs.length === 0
            || commandArgs[0] instanceof vscode.Uri && commandArgs[0].path.endsWith('.asl')) {
            return 'asl-diagram';
        }
    }

    createWebView(identifier: SprottyDiagramIdentifier): SprottyWebview {
        const webview = new SprottyLspWebview({
            extension: this,
            identifier,
            localResourceRoots: [
                this.getExtensionFileUri('pack')
            ],
            scriptUri: this.getExtensionFileUri('pack', 'webview.js'),
            singleton: false // Change this to `true` to enable a singleton view
        });
        webview.addActionHandler(WorkspaceEditActionHandler);
        webview.addActionHandler(LspLabelEditActionHandler);
        return webview;
    }

    protected activateLanguageClient(context: vscode.ExtensionContext): LanguageClient {

        let connectionInfo = {
            port: LS_PORT
        };
        let serverOptions = () => {
            // Connect to language server via socket
            let socket = net.connect(connectionInfo);
            let result: StreamInfo = {
                writer: socket,
                reader: socket
            };
            return Promise.resolve(result);
        };
        
        let clientOptions: LanguageClientOptions = {
                documentSelector: [{ scheme: 'file', language: 'asl' }],
        };





        // const executable = process.platform === 'win32' ? 'start-ls-itlingo.bat' : 'start-ls-itlingo';
        // const languageServerPath =  path.join('server', 'mydsl', 'bin', executable);
        // const serverLauncher = context.asAbsolutePath(languageServerPath);
        // const serverOptions: ServerOptions = {
        //     run: {
        //         command: serverLauncher,
        //         args: ['-trace']
        //     },
        //     debug: {
        //         command: serverLauncher,
        //         args: ['-trace']
        //     }
        // };
        // const clientOptions: LanguageClientOptions = {
        //     documentSelector: [{ scheme: 'file', language: 'rsl' }],
        // };
        const languageClient = new LanguageClient('ASLLanguageClient', 'ASL Language Server', serverOptions, clientOptions);
        languageClient.start();
        return languageClient;
    }
}
