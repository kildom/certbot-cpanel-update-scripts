# Let's Encrypt update script for cPanel

The script communicates with cPanel running on external server using cPanel UAPI and API 2. When the Let's Encrypt SSL certificates will expire soon, the script will renew it and install with cPanel.

## Usage

Configure the script in the `conf.json` file. You can use `conf-sample.json` file as a starting point and follow the instructios contained in it.

Run the script:

```bash
node start.js
```
