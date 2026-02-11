import {
    createConnection,
    TextDocuments,
    TextDocumentSyncKind,
} from 'vscode-languageserver/node';
import {
    TextDocument,
} from 'vscode-languageserver-textdocument';

const connection = createConnection();
const startMsg = `Sample server running in node ${process.version}`;
connection.console.info(startMsg);
console.error('=== SERVER DEBUG: Server initialized ===');
console.error(startMsg);

let documents: TextDocuments<TextDocument>;

connection.onInitialize(() => {
	console.error('=== SERVER DEBUG: onInitialize called ===');
    documents = new TextDocuments(TextDocument);
    if (documents == null) {
        throw new Error('Failed to create TextDocuments manager.');
    }

    documents.listen(connection);
    documents.onDidOpen((event) => {
        const uri = event.document.uri;
        connection.console.log(`Document opened: ${uri}`);
    });
    documents.onDidChangeContent((change) => {
        const uri = change.document.uri;
        connection.console.log(`Document changed: ${uri}`);
    });
    documents.onDidClose((event) => {
        const uri = event.document.uri;
        connection.console.log(`Document closed: ${uri}`);
    });

    return {
        capabilities: {
            textDocumentSync: {
                openClose: true,
                change: TextDocumentSyncKind.Incremental,
            },
        },
    };
});

connection.listen();