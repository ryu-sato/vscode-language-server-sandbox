import * as path from 'path';
import { ExtensionContext } from 'vscode';
import { LanguageClient, LanguageClientOptions, RevealOutputChannelOn, ServerOptions, TransportKind } from 'vscode-languageclient/node';

let client: LanguageClient;

export async function activate(context: ExtensionContext) {
    console.error('=== CLIENT DEBUG: activate() called ===');
    const serverModule = context.asAbsolutePath(
        path.join('server', 'out', 'server.js')
    );
    console.error(`=== CLIENT DEBUG: serverModule path = ${serverModule} ===`);

    const serverOptions: ServerOptions = {
        run: {
            module: serverModule,
            transport: TransportKind.ipc,
            options: {
                cwd: process.cwd(),
            },
        },
        debug: {
            module: serverModule,
            transport: TransportKind.ipc,
            options: {
                cwd: process.cwd(),
                execArgv: ['--nolazy', '--inspect=6009'],
            },
        },
    };

    const clientOptions: LanguageClientOptions = {
        documentSelector: [
            { scheme: 'file', language: 'plaintext' },
            { scheme: 'untitled', language: 'plaintext' },
        ],
		// 警告パネルでの表示名
		diagnosticCollectionName: 'sample',
		revealOutputChannelOn: RevealOutputChannelOn.Never,
		initializationOptions: {},
		progressOnInitialization: true,
    };

    try {
        console.error('=== CLIENT DEBUG: Creating LanguageClient ===');
        client = new LanguageClient('LSPSampleExample', 'Sample LSP Server', serverOptions, clientOptions);
        console.error('=== CLIENT DEBUG: Starting client ===');
        await client.start();
        console.error('=== CLIENT DEBUG: Client started successfully ===');
    } catch (error) {
        console.error('=== CLIENT DEBUG: Failed to start language client ===', error);
    }
}

export async function deactivate(): Promise<void> {
    if (client) {
        await client.stop();
    }
}
