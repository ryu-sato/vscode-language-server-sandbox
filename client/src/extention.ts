import { ExtensionContext, Uri } from 'vscode';
import { LanguageClient, LanguageClientOptions, ServerOptions, TransportKind } from 'vscode-languageclient/node';

let client: LanguageClient;

export async function activate(context: ExtensionContext) {
    const serverModule = Uri.joinPath(context.extensionUri, 'server', 'out', 'server.js').fsPath;

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
            { scheme: 'file' },
            { scheme: 'untitled' },
        ],
    };

    try {
        client = new LanguageClient('LSPSampleExample', 'Sample LSP Server', serverOptions, clientOptions);
        await client.start();
    } catch (error) {
        console.error('Failed to start language client:', error);
    }
}

export async function deactivate(): Promise<void> {
    if (client) {
        await client.stop();
    }
}
