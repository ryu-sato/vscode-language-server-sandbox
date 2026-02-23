import {
    createConnection,
    TextDocuments,
    TextDocumentSyncKind,
    Connection,
} from 'vscode-languageserver/node';
import {
    TextDocument,
} from 'vscode-languageserver-textdocument';
import {
    AbstractMessageReader,
    AbstractMessageWriter,
    DataCallback,
    Message,
    Disposable,
} from 'vscode-jsonrpc';
import { WebSocket, WebSocketServer } from 'ws';
import { IncomingMessage } from 'http';

class WebSocketMessageReader extends AbstractMessageReader {
    private callback: DataCallback | undefined;

    constructor(socket: WebSocket) {
        super();
        socket.on('message', (data) => {
            try {
                if (this.callback) {
                    const str = Buffer.isBuffer(data)
                        ? data.toString('utf8')
                        : data.toString();
                    // LSP wire format: "Content-Length: N\r\n\r\n{...json...}"
                    const bodyStart = str.indexOf('\r\n\r\n');
                    const json = bodyStart !== -1 ? str.slice(bodyStart + 4) : str;
                    this.callback(JSON.parse(json) as Message);
                }
            } catch (e) {
                this.fireError(e as Error);
            }
        });
        socket.on('error', (e) => this.fireError(e));
        socket.on('close', () => this.fireClose());
    }

    listen(callback: DataCallback): Disposable {
        this.callback = callback;
        return { dispose: () => { this.callback = undefined; } };
    }
}

class WebSocketMessageWriter extends AbstractMessageWriter {
    constructor(private readonly socket: WebSocket) {
        super();
        socket.on('error', (e) => this.fireError(e));
        socket.on('close', () => this.fireClose());
    }

    write(msg: Message): Promise<void> {
        return new Promise((resolve, reject) => {
            const json = JSON.stringify(msg);
            const header = `Content-Length: ${Buffer.byteLength(json, 'utf8')}\r\n\r\n`;
            this.socket.send(header + json, (err) => {
                if (err) { reject(err); } else { resolve(); }
            });
        });
    }

    end(): void {
        this.socket.close();
    }
}

function setupConnection(connection: Connection): void {
    connection.console.info(`Sample server running in node ${process.version}`);
    console.error('=== SERVER DEBUG: Server initialized ===');

    const documents = new TextDocuments(TextDocument);
    documents.listen(connection);
    documents.onDidOpen((event) => {
        connection.console.log(`Document opened: ${event.document.uri}`);
    });
    documents.onDidChangeContent((change) => {
        connection.console.log(`Document changed: ${change.document.uri}`);
    });
    documents.onDidClose((event) => {
        connection.console.log(`Document closed: ${event.document.uri}`);
    });

    connection.onInitialize(() => {
        console.error('=== SERVER DEBUG: onInitialize called ===');
        return {
            capabilities: {
                textDocumentSync: {
                    openClose: true,
                    change: TextDocumentSyncKind.Incremental,
                },
            },
        };
    });
}

if (process.argv.includes('--ws')) {
    // WebSocket mode: for web clients such as the ACE editor
    const wss = new WebSocketServer({ port: 3000 });
    wss.on('connection', (ws: WebSocket, req: IncomingMessage) => {
        const pathname = new URL(req.url ?? '/', 'http://localhost').pathname;
        if (pathname !== '/exampleServer') {
            ws.close();
            return;
        }
        const connection = createConnection(
            new WebSocketMessageReader(ws),
            new WebSocketMessageWriter(ws),
        );
        setupConnection(connection);
        connection.listen();
    });
    console.error('=== SERVER: WebSocket mode listening on ws://127.0.0.1:3000/exampleServer ===');
} else {
    // IPC mode (default): used by the VS Code extension
    const connection = createConnection();
    setupConnection(connection);
    connection.listen();
}
