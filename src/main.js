
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
        } else if (ask && daysToTheEnd <= conf.expirationDaysAsk) {
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
