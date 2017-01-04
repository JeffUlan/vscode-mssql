/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import VscodeWrapper from './vscodeWrapper';
import vscode = require('vscode');
import path = require('path');
import os = require('os');
const fs = require('fs');

/**
 * Service for creating untitled documents for SQL query
 */
export default class UntitledSqlDocumentService {
    private _counter: number = 1;

    constructor(private vscodeWrapper: VscodeWrapper) {
    }

    /**
     * Creates new untitled document for SQL query and opens in new editor tab
     */
    public newQuery(): Promise<boolean> {

        return new Promise<boolean>((resolve, reject) => {
            try {
                let filePath = this.createUntitledFilePath();
                let docUri: vscode.Uri = vscode.Uri.parse('untitled:' + filePath);

                // Open an untitled document. So the  file doesn't have to exist in disk
                this.vscodeWrapper.openTextDocument(docUri).then(doc => {
                    // Show the new untitled document in the editor's first tab and change the focus to it.
                    this.vscodeWrapper.showTextDocument(doc, 1, false).then(textDoc => {
                        this._counter++;
                        resolve(true);
                    });
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    private createUntitledFilePath(): string {
        let filePath = UntitledSqlDocumentService.createFilePath(this._counter);
        while (fs.existsSync(filePath)) {
            this._counter++;
            filePath = UntitledSqlDocumentService.createFilePath(this._counter);
        }
        while (this.vscodeWrapper.textDocuments.find(x => x.fileName.toUpperCase() === filePath.toUpperCase())) {
            this._counter++;
            filePath = UntitledSqlDocumentService.createFilePath(this._counter);
        }
        return filePath;
    }

    public static createFilePath(counter: number): string {
        return path.join(os.tmpdir(), `SQLQuery${counter}.sql`);
    }
}

