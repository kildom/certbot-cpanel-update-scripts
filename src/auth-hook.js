const { conf, updateConf } = require('./conf');
const { cPanel, cPanel2 } = require('./cpanel');

async function authenticate(domain) {
    console.log(`Creating file ${domain.path}/.well-known/acme-challenge/${process.env.CERTBOT_TOKEN}`);
    try {
        await cPanel2('Fileman', 'mkdir', {
            path: domain.path,
            name: '.well-known',
        });
    } catch (ex) { }
    try {
        await cPanel2('Fileman', 'mkdir', {
            path: `${domain.path}/.well-known`,
            name: 'acme-challenge',
        });
    } catch (ex) { }
    await cPanel('Fileman/save_file_content', {
        dir: domain.path + '/.well-known/acme-challenge',
        file: process.env.CERTBOT_TOKEN,
        content: process.env.CERTBOT_VALIDATION,
    });
}

async function main() {
    await updateConf();

    for (let [id, cert] of Object.entries(conf.certificates)) {
        for (let [domainName, domain] of Object.entries(cert.domains)) {
            if (domainName == process.env.CERTBOT_DOMAIN) {
                await authenticate(domain);
            }
        }
    }

    await new Promise(resolve => setTimeout(resolve, 5000));

    return 0;
}

exports.main = main;
