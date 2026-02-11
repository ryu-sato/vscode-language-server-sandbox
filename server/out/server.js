"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const node_1 = require("vscode-languageserver/node");
const vscode_languageserver_textdocument_1 = require("vscode-languageserver-textdocument");
const connection = (0, node_1.createConnection)();
connection.console.info(`Sample server running in node ${process.version}`);
let documents;
connection.onInitialize(() => {
    documents = new node_1.TextDocuments(vscode_languageserver_textdocument_1.TextDocument);
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
                change: node_1.TextDocumentSyncKind.Incremental,
            },
        },
    };
});
connection.listen();
//# sourceMappingURL=server.js.map