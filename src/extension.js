import GObject from 'gi://GObject';
import St from 'gi://St';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import Gdk from 'gi://Gdk';

import {Extension, gettext as _} from 'resource:///org/gnome/shell/extensions/extension.js';
import * as PanelMenu from 'resource:///org/gnome/shell/ui/panelMenu.js';
import * as PopupMenu from 'resource:///org/gnome/shell/ui/popupMenu.js';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';

const GuakeSSH = GObject.registerClass(
class GuakeSSH extends PanelMenu.Button {
    _init() {
        super._init(0.0, _('SSH Connections'));

        // Icon for the button in the panel
        this.add_child(new St.Icon({
            icon_name: 'utilities-terminal-symbolic',
            style_class: 'system-status-icon'
        }));

        // Adds this button to the panel
        Main.panel.addToStatusArea('guake-ssh', this);

        // Scrollable section of the menu
        this._scrollableSection = new PopupMenu.PopupMenuSection();
        this.menu.addMenuItem(this._scrollableSection);

        // Apply scrolling to the menu
        this._scrollableSection.actor.set_style("max-height: 20em; overflow-y: auto;");

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
                    // If the file is "1-winscp", skip it ... TODO : remove this
                    if (filename === "1-winscp") {
                        continue;
                    }
                    // Add a separator with the file name
                    let fileSeparator = new PopupMenu.PopupSeparatorMenuItem(filename);
                    // Remove the first two characters from the file name
                    fileSeparator.label.text = fileSeparator.label.text.substring(2);
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
        let refreshMenuItem = new PopupMenu.PopupMenuItem(_('> Refresh Hosts <'));
        refreshMenuItem.connect('activate', () => {
            log('Refreshing SSH hosts...');
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
            let hosts = [];
            let match;
            while ((match = hostPattern.exec(config)) !== null) {
                hosts.push(match[1]);
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

        menuItem.connect('activate', (actor, event) => {
            let button = event.get_button();

            // 3 is the code for the right mouse button
            // let rightClick = button === 3;
            // let middleClick = button === 2;
            // let ctrlPressed = (event.get_state() & Gdk.ModifierType.CONTROL_MASK) !== 0;

            // log(`Right click detected: ${rightClick}`);
            // log(`Middle click detected: ${middleClick}`);
            // log(`Ctrl pressed: ${ctrlPressed}`);

            // let split = middleClick || ctrlPressed ? true : false;

            // let split = middleClick ? "--split-horizontal" : (rightClick ? "--split-vertical" : "");

            // Chamar a função para conectar ao SSH
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


        let command = ['guake', split, '-e', `ssh ${host}`];
        GLib.spawn_async(null, command, null, GLib.SpawnFlags.SEARCH_PATH, null);
        // open guake
        let guakeCommand = ['guake', '--show'];
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
