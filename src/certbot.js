

const child_process = require('child_process');
const fs = require('fs');

const { conf } = require('./conf');

async function runProcess(args) {

    let env = JSON.parse(JSON.stringify(process.env));
    env.CPANEL_PASSWORD = conf.cPanel.password;

    let { status, signal, error } = child_process.spawnSync(conf.certbot || 'certbot', args, {
        cwd: fs.realpathSync(`${__dirname}/..`),
        stdio: 'inherit',
        env: env,
    });

    if (error) {
        throw error;
    } else if (signal !== null) {
        throw Error(`certbot termination caused by signal ${signal}`);
    } else if (status != 0) {
        throw Error(`certbot terminated with exit code ${status}`);
    }
}

async function run(domains) {
    let args = [
        'certonly',
        '--config-dir', fs.realpathSync(`${__dirname}/../conf`),
        '--work-dir', fs.realpathSync(`${__dirname}/../work`),
        '--logs-dir', fs.realpathSync(`${__dirname}/../logs`),
        '--non-interactive',
        '--agree-tos',
        '--manual',
        '--manual-auth-hook', process.execPath + ' ' + fs.realpathSync(`${__dirname}/../start.js`) + ' auth',
        '--manual-cleanup-hook', process.execPath + ' ' + fs.realpathSync(`${__dirname}/../start.js`) + ' cleanup',
        '-d', domains.join(','),
    ];
    if (conf.dryRun) {
        args.push('--dry-run');
    }
    if (conf.testCert) {
        args.push('--test-cert');
    }
    console.log(`Starting certbot ${JSON.stringify(args)}`);
    await runProcess(args);
}

async function check() {
    await runProcess(['--version']);
}

exports.run = run;
exports.check = check;
