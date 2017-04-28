/* --------------------------------------------------------------------------------------------
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */
/**
 * Interfaces needed for interacting with the localwebservice
 * Separate from the contracts defined in the models folder because that version has
 * a dependency on vscode which will not build on the front end
 * Must be updated whenever there is a change to these interfaces
 */

export interface IDbColumn {
    allowDBNull?: boolean;
    baseCatalogName: string;
    baseColumnName: string;
    baseSchemaName: string;
    baseServerName: string;
    baseTableName: string;
    columnName: string;
    columnOrdinal?: number;
    columnSize?: number;
    isAliased?: boolean;
    isAutoIncrement?: boolean;
    isExpression?: boolean;
    isHidden?: boolean;
    isIdentity?: boolean;
    isKey?: boolean;
    isBytes?: boolean;
    isChars?: boolean;
    isSqlVariant?: boolean;
    isUdt?: boolean;
    dataType: string;
    isXml?: boolean;
    isJson?: boolean;
    isLong?: boolean;
    isReadOnly?: boolean;
    isUnique?: boolean;
    numericPrecision?: number;
    numericScale?: number;
    udtAssemblyQualifiedName: string;
    dataTypeName: string;
}

export class DbCellValue {
    displayValue: string;
    isNull: boolean;
}

export class ResultSetSubset {
    rowCount: number;
    rows: DbCellValue[][];
}

export class ResultSetSummary {
    id: number;
    rowCount: number;
    columnInfo: IDbColumn[];
}

export class BatchSummary {
    id: number;
    selection: ISelectionData;
    resultSetSummaries: ResultSetSummary[];
    executionElapsed: string;
    executionEnd: string;
    executionStart: string;
}

export interface IGridResultSet {
    columns: IDbColumn[];
    rowsUri: string;
    numberOfRows: number;
}

export interface ISelectionData {
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
}

export interface IMessageLink {
    uri: string;
    text: string;
}

export interface IMessage {
    batchId?: number;
    time: string;
    message: string;
    isError: boolean;
    link?: IMessageLink;
}

export interface IGridIcon {
    showCondition: () => boolean;
    icon: () => string;
    hoverText: () => string;
    functionality: (batchId: number, resultId: number, index: number) => void;
}

export interface IResultsConfig {
    shortcuts: { [key: string]: string };
    messagesDefaultOpen: boolean;
}

export class WebSocketEvent {
    type: string;
    data: any;
}

/**
 * Simplified interface for a Range object returned by the Rangy javascript plugin
 *
 * @export
 * @interface IRange
 */
export interface IRange {
    selectNodeContents(el): void;
    /**
     * Returns any user-visible text covered under the range, using standard HTML Range API calls
     *
     * @returns {string}
     *
     * @memberOf IRange
     */
    toString(): string;
    /**
     * Replaces the current selection with this range. Equivalent to rangy.getSelection().setSingleRange(range).
     *
     *
     * @memberOf IRange
     */
    select(): void;

    /**
     * Returns the `Document` element containing the range
     *
     * @returns {Document}
     *
     * @memberOf IRange
     */
    getDocument(): Document;

    /**
     * Detaches the range so it's no longer tracked by Rangy using DOM manipulation
     *
     *
     * @memberOf IRange
     */
    detach(): void;

    /**
     * Gets formatted text under a range. This is an improvement over toString() which contains unnecessary whitespac
     *
     * @returns {string}
     *
     * @memberOf IRange
     */
    text(): string;
}
