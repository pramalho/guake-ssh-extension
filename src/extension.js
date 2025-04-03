import GObject from "gi://GObject";
import St from "gi://St";
import GLib from "gi://GLib";
import Gio from "gi://Gio";

const SETTINGS_SCHEMA = "org.gnome.shell.extensions.guake-ssh";

import {Extension, gettext as _} from "resource:///org/gnome/shell/extensions/extension.js";
import * as PanelMenu from "resource:///org/gnome/shell/ui/panelMenu.js";
import * as PopupMenu from "resource:///org/gnome/shell/ui/popupMenu.js";

import * as Main from "resource:///org/gnome/shell/ui/main.js";

const GuakeSSH = GObject.registerClass(
class GuakeSSH extends PanelMenu.Button {
    _init() {
        super._init(0.0, _("SSH Connections"));

        this._settings = new Gio.Settings({ schema: SETTINGS_SCHEMA });

        // Icon in the panel
        this.add_child(new St.Icon({
            icon_name: "utilities-terminal-symbolic",
            style_class: "system-status-icon"
        }));

        // Adds the button to the panel
        Main.panel.addToStatusArea("guake-ssh", this);

        // Create a scrollable section
        this._scrollableSection = new PopupMenu.PopupMenuSection();

        // Create a ScrollView to enable scrolling
        let scrollView = new St.ScrollView({
            style_class: "vfade",
            overlay_scrollbars: true,
            hscrollbar_policy: St.PolicyType.NEVER,
            vscrollbar_policy: St.PolicyType.AUTOMATIC,
        });

        // Add the section inside the ScrollView
        scrollView.set_child(this._scrollableSection.actor);
        this.menu.box.add_child(scrollView);

        // Applies a CSS style to limit the height
        scrollView.set_style("max-height: 50em;");

        // Adds a separator
        this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        // Load SSH hosts
        this._loadSSHHosts();
    }

    _loadSSHHosts() {
        let configFiles = [
            GLib.get_home_dir() + "/.ssh/config",
            GLib.get_home_dir() + "/.ssh/config.d/"
        ];

        for (let path of configFiles) {
            let file = Gio.File.new_for_path(path);

            if (!file.query_exists(null)) {
                continue;
            }

            if (file.query_file_type(Gio.FileQueryInfoFlags.NONE, null) === Gio.FileType.DIRECTORY) {
                let enumerator = file.enumerate_children("standard::*", Gio.FileQueryInfoFlags.NONE, null);
                let fileInfo;
                while ((fileInfo = enumerator.next_file(null)) !== null) {
                    let filename = fileInfo.get_name();

                    // Ignore files that end with "hide"
                    if (filename.endsWith("hide")) {
                        continue;
                    }

                    //if the first line of the file is a comment  with #ignore-file then ignore the file
                    let filePath = Gio.File.new_for_path(path + filename);
                    let [success, contents] = filePath.load_contents(null);
                    if (success) {
                        let config = new TextDecoder().decode(contents);
                        if (config.includes("#ignore-file")) {
                            continue;
                        }
                    }

                    // Add a separator with the file name
                    let fileSeparator = new PopupMenu.PopupSeparatorMenuItem(filename);

                    // Remove the first two characters from the file name if start number and dash (I organize my files this way)
                    if (/^\d+-/.test(fileSeparator.label.text)) {
                        fileSeparator.label.text = fileSeparator.label.text.substring(2);
                    }

                    this._scrollableSection.addMenuItem(fileSeparator);

                    let childFile = Gio.File.new_for_path(path + filename);
                    this._parseSSHConfigFile(childFile);
                }
            } else {
                // Parse the single config file
                this._parseSSHConfigFile(file);
            }
        }

        // Adds a final separator
        this._scrollableSection.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());

        // Adds the "Refresh Hosts" option
        let refreshMenuItem = new PopupMenu.PopupMenuItem(_("> Refresh Hosts <"));
        refreshMenuItem.connect("activate", () => {
            log("Refreshing SSH hosts...");
            let children = this._scrollableSection.actor.get_children();
            for (let child of children) {
                child.destroy();
            }
            this._loadSSHHosts(); // reload hosts
        });
        this._scrollableSection.addMenuItem(refreshMenuItem);
    }

    _parseSSHConfigFile(file) {
        let [success, contents] = file.load_contents(null);
        if (success) {
            let config = new TextDecoder().decode(contents);
            let hostPattern = /Host\s+([^\s]+)/g;
            config = config.split("\n").filter(line => !line.includes("#hide")).join("\n");
            let hosts = [];
            let match;
            while ((match = hostPattern.exec(config)) !== null) {
                let host = match[1];
                // ignore names with ftp in any part of the name
                if (host.includes("ftp")) {
                    continue;
                }
                hosts.push(host);
            }

            // Sort the hosts alphabetically (case insensitive)
            hosts.sort((a, b) => a.toLowerCase().localeCompare(b.toLowerCase()));

            // add hosts to menu
            for (let host of hosts) {
                this._addHostToMenu(host);
            }
        }
    }

    _addHostToMenu(host) {
        let menuItem = new PopupMenu.PopupMenuItem(`${host}`);

        menuItem.connect("activate", (actor, event) => {
            let button = event.get_button();

            // Call the function to connect to SSH
            this._connectSSH(host, button);
        });

        // Ensure the menu exists before adding the item
        if (this._scrollableSection) {
            this._scrollableSection.addMenuItem(menuItem);
        }

    }

    _connectSSH(host, button) {
        // rightClick = 3;
        // middleClick = 2;

        let split = button == 2 ? "--split-horizontal" : (button == 3 ? "--split-vertical" : "");


        let command = ["guake", split, "-e", `ssh ${host}`];
        GLib.spawn_async(null, command, null, GLib.SpawnFlags.SEARCH_PATH, null);


        let rename = this._settings.get_int("auto-rename-tab");
        if (rename) {
            let renameCommand = ["guake", "--rename-tab", `${host}`];
            GLib.spawn_async(null, renameCommand, null, GLib.SpawnFlags.SEARCH_PATH, null);
        }

        // open guake
        let guakeCommand = ["guake", "--show"];
        GLib.spawn_async(null, guakeCommand, null, GLib.SpawnFlags.SEARCH_PATH, null);
        // close menu
        this.menu.close();
    }
});


export default class GuakeSSHExtension extends Extension {
    enable() {
        this._indicator = new GuakeSSH();
        Main.panel.addToStatusArea(this.uuid, this._indicator);
    }

    disable() {
        this._indicator.destroy();
        this._indicator = null;
    }
}
