

const { argv, exit } = require('process');
const auth = require('./src/auth-hook');
const cleanup = require('./src/cleanup-hook');
const main = require('./src/main');

async function start() {

    let r;

    try {

        switch ((argv[2] || '').toLowerCase()) {
            case 'auth':
                r = await auth.main();
                break;
            case 'cleanup':
                r = await cleanup.main();
                break;
            default:
                r = await main.main();
                break;
        }

        exit(r);

    } catch (ex) {
        console.error('Unhandled exception:');
        console.error(ex);
        exit(99);
    }

}

start();

/*

const { execSync } = require('child_process');
const fs = require('fs');

function run(command, env) {
    env = { ...JSON.parse(JSON.stringify(process.env)), ...(env || {}) };
    return execSync(command, { env, encoding: 'utf-8' });
}

function time() {
    return Math.floor(Date.now() / 1000);
}

async function showCertificates(ask) {
    let installed = await cPanel('SSL/installed_hosts');
    for (let host of installed) {
        for (let domain of host.certificate.domains) {
            if (!(domain in conf.domainToCert)) {
                continue;
            }
            let hostCert = host.certificate;
            let confCert = conf.certificates[conf.domainToCert[domain]];
            confCert.domains[domain].daysToTheEnd = (hostCert.not_after - time()) / 60 / 60 / 24;
        }
    }
    for (let [id, cert] of Object.entries(conf.certificates)) {
        let daysToTheEnd = 10000000000;
        for (let domain of Object.values(cert.domains)) {
            daysToTheEnd = Math.min(daysToTheEnd, Math.max(0, domain.daysToTheEnd || 0));
        }
        console.log(`Certificate ${id}:`);
        console.log('    ' + Object.keys(cert.domains).join(', '));
        if (ask && daysToTheEnd > conf.allowedExpirationDays) {
            let r = await prompt(`    Expiration in ${Math.round(daysToTheEnd)} days. Do you want to update (y/n)? `);
            r = r.toLowerCase();
            cert.update = r == 'y' || r == 'yes' || r == '1' || r == 't' || r == 'true';
        } else {
            console.log(`    Expiration in ${Math.round(daysToTheEnd)} days`);
            cert.update = true;
        }
    }
}

async function main() {
    try {
        console.log(run('certbot --version'));
    } catch (ex) {
        console.log('Missing "certbot".');
        return 1;
    }
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
    await showCertificates(true);
}

main().then(r => {
    process.exit(r);
}).catch(ex => {
    console.log(ex);
    process.exit(100);
});
*/
