
const fs = require('fs');

const { prompt } = require('./prompt');


let conf;
eval('conf = ' + fs.readFileSync(`${__dirname}/../conf.json`));

async function updateConf() {

    conf.domainToCert = {};
    for (let [id, cert] of Object.entries(conf.certificates)) {
        for (let domain in cert.domains) {
            conf.domainToCert[domain] = id;
        }
    }
    if (!conf.cPanel.password) {
        if ('CPANEL_PASSWORD' in process.env) {
            conf.cPanel.password = process.env.CPANEL_PASSWORD;
        } else {
            conf.cPanel.password = await prompt('cPanel password: ', true);
        }
    }
}

exports.conf = conf;
exports.updateConf = updateConf;
