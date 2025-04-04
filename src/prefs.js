import Gio from "gi://Gio";
import Adw from "gi://Adw";

import {ExtensionPreferences, gettext as _} from "resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js";

export default class GuakeSSHPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        // Create a preferences page, with a single group
        const page = new Adw.PreferencesPage({
            title: _("Guake SSH Preferences"),
            icon_name: "dialog-information-symbolic",
        });
        window.add(page);

        const group = new Adw.PreferencesGroup({
            title: _("Configuration"),
            description: _("Configuration for Guake SSH"),
        });
        page.add(group);

        // Create a new preferences row
        const row = new Adw.SwitchRow({
            title: _("Rename Guake Tab"),
            subtitle: _("Rename the new Guake tab to the SSH host name"),
        });
        group.add(row);

        window._settings = this.getSettings();
        window._settings.bind("rename-tab", row, "active",
            Gio.SettingsBindFlags.DEFAULT);
    }
}
