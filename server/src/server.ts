import {
    createConnection,
} from 'vscode-languageserver/node';

const connection = createConnection();
connection.console.info(`Sample server running in node ${process.version}`);

connection.listen();