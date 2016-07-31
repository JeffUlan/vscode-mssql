'use strict';
import vscode = require('vscode');
import Constants = require('../models/constants');
import { RecentConnections } from '../models/recentConnections';
import { ConnectionCredentials } from '../models/connectionCredentials';
import { ConnectionProfile } from '../models/connectionProfile';
import { IConnectionCredentials, IConnectionProfile, IConnectionCredentialsQuickPickItem } from '../models/interfaces';
import { IQuestion, IPrompter, QuestionTypes } from '../prompts/question';

export class ConnectionUI {
    private _context: vscode.ExtensionContext;
    private _prompter: IPrompter;

    constructor(context: vscode.ExtensionContext, prompter: IPrompter) {
        this._context = context;
        this._prompter = prompter;
    }

    // Helper to let user choose a connection from a picklist
    // Return the ConnectionInfo for the user's choice
    public showConnections(): Promise<IConnectionCredentials> {
        const self = this;
        return new Promise<IConnectionCredentials>((resolve, reject) => {
            let recentConnections = new RecentConnections(self._context);
            recentConnections.getPickListItems()
            .then((picklist: IConnectionCredentialsQuickPickItem[]) => {
                return new Promise<IConnectionCredentials>(() => {
                    if (picklist.length === 0) {
                        // No recent connections - prompt to open user settings or workspace settings to add a connection
                        self.openUserOrWorkspaceSettings();
                        return false;
                    } else {
                        // We have recent connections - show them in a picklist
                        return self.promptItemChoice({
                            placeHolder: Constants.recentConnectionsPlaceholder,
                            matchOnDescription: true
                        }, picklist)
                            .then(selection => {
                                resolve(self.handleSelectedConnection(selection, recentConnections));
                            });
                    }
                });
            });
        });
    }

    // requests the user to choose an item from the list
    private promptItemChoice<T extends vscode.QuickPickItem>(options: vscode.QuickPickOptions, choices: T[]): Promise<T> {
        let question: IQuestion = {
            type: QuestionTypes.expand,
            name: 'question',
            message: options.placeHolder,
            matchOptions: options,
            choices: choices
        };
        return this._prompter.promptSingle(question);
    }

    // Helper to prompt user to open VS Code user settings or workspace settings
    private openUserOrWorkspaceSettings(): void {
        let openGlobalSettingsItem: vscode.MessageItem = {
            'title': Constants.labelOpenGlobalSettings
        };

        let openWorkspaceSettingsItem: vscode.MessageItem = {
            'title': Constants.labelOpenWorkspaceSettings
        };

        vscode.window.showWarningMessage(Constants.extensionName
                                         + ': '
                                         + Constants.msgNoConnectionsInSettings, openGlobalSettingsItem, openWorkspaceSettingsItem)
        .then((selectedItem: vscode.MessageItem) => {
            if (selectedItem === openGlobalSettingsItem) {
                vscode.commands.executeCommand('workbench.action.openGlobalSettings');
            } else if (selectedItem === openWorkspaceSettingsItem) {
                vscode.commands.executeCommand('workbench.action.openWorkspaceSettings');
            }
        });
    }

    private handleSelectedConnection(selection: IConnectionCredentialsQuickPickItem, recentConnections: RecentConnections): Promise<IConnectionCredentials> {
        const self = this;
        return new Promise<IConnectionCredentials>((resolve, reject) => {
            if (selection !== undefined) {
                let connectFunc: Promise<IConnectionCredentials>;
                if (selection.isNewConnectionQuickPickItem) {
                    // call the workflow to create a new connection
                    connectFunc = self.createAndSaveProfile();
                } else {
                    // user chose a connection from picklist. Prompt for mandatory info that's missing (e.g. username and/or password)
                    let connectionCreds = selection.connectionCreds;
                    connectFunc = self.promptForMissingInfo(connectionCreds);
                }

                connectFunc.then((resolvedConnectionCreds) => {
                    if (!resolvedConnectionCreds) {
                        return false;
                    }
                    resolve(resolvedConnectionCreds);
                });
            }
        });
    }

    // Calls the create profile workflow
    public createAndSaveProfile(): Promise<IConnectionProfile> {
        let recentConnections = new RecentConnections(this._context);
        return this.promptForCreateProfile()
            .then(profile => recentConnections.saveConnection(profile));
    }

    private promptForCreateProfile(): Promise<IConnectionProfile> {
        return ConnectionProfile.createProfile(this._prompter);
    }

    // Prompt user for missing details in the given IConnectionCredentials
    private promptForMissingInfo(credentials: IConnectionCredentials): Promise<IConnectionCredentials> {
        return ConnectionCredentials.ensureRequiredPropertiesSet(credentials, false, this._prompter);
    }

    // Prompts the user to pick a profile for removal, then removes from the global saved state
    public removeProfile(): Promise<boolean> {
        let self = this;
        let recentConnections = new RecentConnections(self._context);

        // Flow: Select profile to remove, confirm removal, remove
        return recentConnections.getProfilePickListItems()
            .then(profiles => self.selectProfileForRemoval(profiles))
            .then(profile => {
                if (profile) {
                    return recentConnections.removeProfile(profile);
                }
                return false;
            });
    }

    private selectProfileForRemoval(profiles: IConnectionCredentialsQuickPickItem[]): Promise<IConnectionProfile> {
        let self = this;
        if (!profiles) {
            // Inform the user we have no profiles available for deletion
            // TODO: consider moving to prompter if we separate all UI logic from workflows in the future
            vscode.window.showErrorMessage(Constants.msgNoProfilesSaved);
            return Promise.resolve(undefined);
        }

        let chooseProfile = 'ChooseProfile';
        let confirm = 'ConfirmRemoval';
        let questions: IQuestion[] = [
            {
                // 1: what profile should we remove?
                type: QuestionTypes.expand,
                name: 'ChooseProfile',
                message: Constants.msgSelectProfile,
                matchOptions: { matchOnDescription: true },
                choices: profiles
            },
            {
                // 2: Confirm removal before proceeding
                type: QuestionTypes.confirm,
                name: 'ConfirmRemoval',
                message: Constants.confirmRemoveProfilePrompt
            }
        ];

        // Prompt and return the value if the user confirmed
        return self._prompter.prompt(questions).then(answers => {
            if (answers[confirm]) {
                let profilePickItem = <IConnectionCredentialsQuickPickItem> answers[chooseProfile];
                return profilePickItem.connectionCreds;
            } else {
                return undefined;
            }
        });
    }
}
