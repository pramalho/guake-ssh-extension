import Gtk from "gi://Gtk";
import Gio from "gi://Gio";

const SETTINGS_SCHEMA = "org.gnome.shell.extensions.guake-ssh.rename-tab";

function init() {}

function buildPrefsWidget() {
    let settings = new Gio.Settings({ schema: SETTINGS_SCHEMA });

    let widget = new Gtk.Box({
        orientation: Gtk.Orientation.VERTICAL,
        spacing: 10,
        margin_top: 20,
        margin_bottom: 20,
        margin_start: 20,
        margin_end: 20,
    });

    // Checkbox for auto-rename-tab
    let label = new Gtk.Label({
        label: "Automatically rename new tabs:",
        halign: Gtk.Align.START,
    });
    let switchButton = new Gtk.Switch({
        active: settings.get_boolean("auto-rename-tab"),
    });
    switchButton.connect("state-set", (button, state) => {
        settings.set_boolean("auto-rename-tab", state);
    });

    let row = new Gtk.Box({
        orientation: Gtk.Orientation.HORIZONTAL,
        spacing: 10,
    });
    row.append(label);
    row.append(switchButton);

    widget.append(row);

    return widget;
}
