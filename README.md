# GuakeSSH

GuakeSSH is a GNOME extension that allows you to manage SSH connections directly from the GNOME panel. With this extension, you can easily access your configured SSH hosts from a dropdown menu.

## Usage

After installation, you will see a new icon in the GNOME panel. Click the icon to view your configured SSH connections in ```.ssh/config``` or any files in ```.ssh/config.d```. You can click on a host to connect via SSH.

- **Left mouse click:** new tab
- **Right mouse click:** split vertical current tab
- **Middle mouse click:** split horizontal current tab

## Installation

1. Clone this repository:
   ```
   git clone hhttps://github.com/pramalho/guake-ssh-extension
   ```

2. Navigate to the extension directory:
   ```
   cd guake-ssh-extension
   ```

3. Install the extension:
   ```
   npm run setup
   ```

4. Enable the extension via GNOME Tweaks or the GNOME Extensions interface.


## Contribution

Contributions are welcome! Feel free to open issues or pull requests.

## TODO
- [ ] Scroll when to many connections
- [ ] Option to hide unnecessary connections
- [ ] Publish on gnome extensions :D

## License

This extension is licensed under the [MIT License](LICENSE).
