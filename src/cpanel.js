
const https = require('https');

const { conf } = require('./conf');


function cPanel(func, params) {

    let data = Object.entries(params || {})
        .map(([key, value]) => encodeURI(key) + '=' + encodeURI(value))
        .join('&');

    return new Promise((resolve, reject) => {

        let output = '';
        const options = {
            hostname: conf.cPanel.host,
            port: conf.cPanel.port,
            path: `${conf.cPanel.path}execute/${func}`,
            method: 'POST',
            auth: `${conf.cPanel.user}:${conf.cPanel.password}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': data.length
            }
        };

        const req = https.request(options, res => {
            if (res.statusCode != 200) {
                reject(Error(`cPanel response ${res.statusCode}`));
                return;
            }
            res.setEncoding('utf8');
            res.on('data', d => {
                output += d;
            });
            res.on('end', () => {
                try {
                    let res = JSON.parse(output);
                    if (res.status != 1) {
                        reject(Error(`cPanel method failed: ${(res.errors || ['Unknown error']).join('\n')}`));
                        return;
                    }
                    if (res.warnings) {
                        console.log('cPanel method warning: ' + res.warnings.join('\ncPanel method warning: '));
                    }
                    resolve(res.data);
                } catch (ex) {
                    reject(ex);
                }
            });
        })

        req.on('error', error => {
            reject(error);
        })

        req.write(data);
        req.end();
    });
}


function cPanel2(mod, func, params) {

    params = JSON.parse(JSON.stringify(params || {}));
    params.cpanel_jsonapi_module = mod;
    params.cpanel_jsonapi_func = func;

    let data = Object.entries(params)
        .map(([key, value]) => encodeURI(key) + '=' + encodeURI(value))
        .join('&');

    return new Promise((resolve, reject) => {

        let output = '';
        const options = {
            hostname: conf.cPanel.host,
            port: conf.cPanel.port,
            path: `${conf.cPanel.path}json-api/cpanel`,
            method: 'POST',
            auth: `${conf.cPanel.user}:${conf.cPanel.password}`,
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Content-Length': data.length
            }
        };

        const req = https.request(options, res => {
            if (res.statusCode != 200) {
                reject(Error(`cPanel response ${res.statusCode}`));
                return;
            }
            res.setEncoding('utf8');
            res.on('data', d => {
                output += d;
            });
            res.on('end', () => {
                try {
                    let res = JSON.parse(output).cpanelresult;
                    if (res.error) {
                        reject(Error(`cPanel method failed: ${res.error}`));
                        return;
                    }
                    resolve(res.data);
                } catch (ex) {
                    reject(ex);
                }
            });
        })

        req.on('error', error => {
            reject(error);
        })

        req.write(data);
        req.end();
    });
}

exports.cPanel = cPanel;
exports.cPanel2 = cPanel2;
