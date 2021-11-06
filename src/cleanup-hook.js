const { conf, updateConf } = require('./conf');
const { cPanel2 } = require('./cpanel');

async function cleanup(domain) {
    console.log(`Deleting file ${domain.path}/.well-known/acme-challenge/${process.env.CERTBOT_TOKEN}`);
    await cPanel2('Fileman', 'fileop', {
        op: 'unlink',
        sourcefiles: `${domain.path}/.well-known/acme-challenge/${process.env.CERTBOT_TOKEN}`,
        doubledecode: 0,
    });
    try {
        await cPanel2('Fileman', 'fileop', {
            op: 'unlink',
            sourcefiles: `${domain.path}/.well-known/acme-challenge`,
            doubledecode: 0,
        });
    } catch (ex) { }
    try {
        await cPanel2('Fileman', 'fileop', {
            op: 'unlink',
            sourcefiles: `${domain.path}/.well-known`,
            doubledecode: 0,
        });
    } catch (ex) { }
}

async function main() {
    await updateConf();

    for (let [id, cert] of Object.entries(conf.certificates)) {
        for (let [domainName, domain] of Object.entries(cert.domains)) {
            if (domainName == process.env.CERTBOT_DOMAIN) {
                await cleanup(domain);
            }
        }
    }

    return 0;
}

exports.main = main;
