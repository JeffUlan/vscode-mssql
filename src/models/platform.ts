/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import * as child_process from 'child_process';

export enum Platform {
    Unknown = <any>'Unknown',
    Windows = <any>'Windows',
    OSX = <any> 'OSX',
    CentOS = <any>'CentOS',
    Debian = <any>'Debian',
    Fedora = <any>'Fedora',
    OpenSUSE = <any>'OpenSUSE',
    RHEL = <any>'RHEL',
    Ubuntu14 = <any>'Ubuntu14',
    Ubuntu16 = <any>'Ubuntu16'
}

export function getCurrentPlatform(): Platform {
    if (process.platform === 'win32') {
        return Platform.Windows;
    } else if (process.platform === 'darwin') {
        return Platform.OSX;
    } else if (process.platform === 'linux') {
        // Get the text of /etc/os-release to discover which Linux distribution we're running on.
        // For details: https://www.freedesktop.org/software/systemd/man/os-release.html
        const text = child_process.execSync('cat /etc/os-release').toString();
        const lines = text.split('\n');

        function getValue(name: string): String {
            for (let line of lines) {
                line = line.trim();
                if (line.startsWith(name)) {
                    const equalsIndex = line.indexOf('=');
                    if (equalsIndex >= 0) {
                        let value = line.substring(equalsIndex + 1);

                        // Strip double quotes if necessary
                        if (value.length > 1 && value.startsWith('"') && value.endsWith('"')) {
                            value = value.substring(1, value.length - 1);
                        }

                        return value;
                    }
                }
            }

            return undefined;
        }

        const id = getValue('ID');

        switch (id) {
            case 'ubuntu':
                const versionId = getValue('VERSION_ID');
                if (versionId.startsWith('14')) {
                    // This also works for Linux Mint
                    return Platform.Ubuntu14;
                } else if (versionId.startsWith('16')) {
                    return Platform.Ubuntu16;
                }

                break;
            case 'centos':
                return Platform.CentOS;
            case 'fedora':
                return Platform.Fedora;
            case 'opensuse':
                return Platform.OpenSUSE;
            case 'rhel':
                return Platform.RHEL;
            case 'debian':
                return Platform.Debian;
            case 'ol':
                // Oracle Linux is binary compatible with CentOS
                return Platform.CentOS;
            case 'elementary OS':
            case 'elementary':
                const eOSVersionId = getValue('VERSION_ID');
                if (eOSVersionId.startsWith('0.3')) {
                    // Elementary OS 0.3 Freya is binary compatible with Ubuntu 14.04
                    return Platform.Ubuntu14;
                } else if (eOSVersionId.startsWith('0.4')) {
                    // Elementary OS 0.4 Loki is binary compatible with Ubuntu 16.04
                    return Platform.Ubuntu16;
                }
            default:
                return Platform.Windows;
        }
    }

    return Platform.Unknown;
}
