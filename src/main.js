
const fs = require('fs');

const { conf, updateConf } = require('./conf');
const certbot = require('./certbot');
const { cPanel } = require('./cpanel');
const { prompt } = require('./prompt');


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
            daysToTheEnd = Math.round(Math.min(daysToTheEnd, Math.max(0, domain.daysToTheEnd || 0)));
        }
        console.log(`Certificate ${id}:`);
        console.log('    ' + Object.keys(cert.domains).join(', '));
        if (daysToTheEnd <= conf.expirationDaysUpdate) {
            console.log(`    Expiration in ${daysToTheEnd} days. Doing update.`);
            cert.update = true;
        } else if (ask && conf.expirationDaysAsk && daysToTheEnd <= conf.expirationDaysAsk) {
            let r = await prompt(`    Expiration in ${daysToTheEnd} days. Do you want to update (y/n)? `);
            r = r.toLowerCase();
            cert.update = r == 'y' || r == 'yes' || r == '1' || r == 't' || r == 'true';
        } else {
            console.log(`    Expiration in ${daysToTheEnd} days. No need to update.`);
            cert.update = false;
        }
    }
}


async function updateCertificates()
{
    for (let [id, cert] of Object.entries(conf.certificates)) {
        if (!cert.update) {
            continue;
        }
        console.log(`============================= Updating ${id} =============================`);
        console.log(Object.keys(cert.domains).join(' '));
        await certbot.run(Object.keys(cert.domains));
        if (conf.dryRun) {
            continue;
        }
        for (let [domainName, domain] of Object.entries(cert.domains)) {
            if (!domain.install) {
                continue;
            }
            console.log(`Installing certificate for ${domainName}`)
            let res = await cPanel('SSL/install_ssl', {
                cert: fs.readFileSync(`${__dirname}/../conf/live/${id}/cert.pem`, 'utf-8'),
                domain: domainName,
                key: fs.readFileSync(`${__dirname}/../conf/live/${id}/privkey.pem`, 'utf-8'),
                cabundle: fs.readFileSync(`${__dirname}/../conf/live/${id}/chain.pem`, 'utf-8'),
            });
            console.log(`  ID:              ${res.cert_id}`);
            console.log(`  Domain:          ${res.domain}`);
            console.log(`  Extra domains:   ${(res.extra_certificate_domains || []).join(' ')}`);
            console.log(`  IP:              ${res.ip}`);
            console.log(`  Key:             ${res.key_id}`);
            console.log(`  Message:         ${res.message}`);
            console.log(`  Status:          ${res.statusmsg}`);
            console.log(`  User:            ${res.user}`);
            console.log(`  Warning domains: ${(res.warning_domains || []).join(' ')}`);
            console.log(`  Working domains: ${(res.working_domains || []).join(' ')}`);
        }
    }
}

async function main() {
    await updateConf();
    await certbot.check();
    console.log('============================= Current certificates =============================');
    await showCertificates(true);
    await updateCertificates();
    console.log('============================= Updated certificates =============================');
    await showCertificates(false);
    return 0;
}

exports.main = main;
