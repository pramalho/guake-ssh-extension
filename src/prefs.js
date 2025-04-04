import Gio from "gi://Gio";
import Adw from "gi://Adw";

import {ExtensionPreferences, gettext as _} from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

export default class GuakeSSHPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const page = new Adw.PreferencesPage({
            title: _("Guake SSH Preferences"),
            icon_name: "dialog-information-symbolic",
        });
        window.add(page);

        const configGroup = new Adw.PreferencesGroup({
            title: _("Configuration"),
            description: _("Configuration for Guake SSH"),
        });
        page.add(configGroup);

        const row = new Adw.SwitchRow({
            title: _("Rename Guake Tab"),
            subtitle: _("Rename the new Guake tab to the SSH host name"),
        });
        configGroup.add(row);

        const helpGroup = new Adw.PreferencesGroup({
            title: _("Usage"),
            description: _("Usage instructions for Guake SSH"),
        });
        page.add(helpGroup);

        const usage = new Adw.ActionRow({
            title: _("How to Use"),
            subtitle: _("- Left mouse click: new tab\n- Right mouse click: split vertical current tab\n- Middle mouse click: split horizontal current tab"),
        });
        helpGroup.add(usage);

        const hidefiles = new Adw.ActionRow({
            title: _("Hidding SSH Config files on .ssh/config.d"),
            subtitle: _("If you want a file inside config.d to not be listed in the menu, you can either append the word hide to the end of the file name or add #ignore-file as the first line of the file."),
        });
        helpGroup.add(hidefiles);

        const hideconnections = new Adw.ActionRow({
            title: _("Hiding SSH Connections"),
            subtitle: _("If you want to hide an SSH connection from the dropdown menu, add #hide at the end of the Host line in your .ssh/config file."),
        });
        helpGroup.add(hideconnections);

        window._settings = this.getSettings();
        window._settings.bind("rename-tab", row, "active",
            Gio.SettingsBindFlags.DEFAULT);
    }
}
