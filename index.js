const core = require('@actions/core');
const httpClient = require('@actions/http-client');

const HTTP_TIMEOUT_MS = 10_000;
const GITHUB_API_VERSION = '2022-11-28';

async function checkRunner({
  token,
  primaryRunnerLabels,
  fallbackRunner,
  primariesRequired,
  apiPath,
}) {
  const http = new httpClient.HttpClient('http-client', [], {
    socketTimeout: HTTP_TIMEOUT_MS,
  });
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': GITHUB_API_VERSION,
  };

  const response = await http.getJson(
    `https://api.github.com/${apiPath}`,
    headers
  );

  if (response.statusCode !== 200) {
    return {
      error: `Failed to get runners. Status code: ${response.statusCode}`,
    };
  }

  const runners = response.result.runners || [];
  let useRunner = fallbackRunner;
  let primaryIsOnline = false;
  let sufficientPrimaries = false;
  let primariesAvailableCount = 0;
  const requirePrimaries =
    typeof primariesRequired === 'number' && primariesRequired > 0;

  for (const runner of runners) {
    if (runner.status !== 'online') continue;

    const runnerLabels = runner.labels.map((label) => label.name);
    if (!primaryRunnerLabels.every((label) => runnerLabels.includes(label))) {
      continue;
    }

    primaryIsOnline = true;

    if (requirePrimaries) {
      if (runner.busy === true) continue;
      primariesAvailableCount++;
      if (primariesAvailableCount < primariesRequired) continue;
    }

    sufficientPrimaries = true;
    useRunner = primaryRunnerLabels.join(',');
    break;
  }

  // return a JSON string so it can be parsed using `fromJson`, e.g. fromJson('["self-hosted","linux"]')
  return {
    useRunner: JSON.stringify(useRunner.split(',')),
    primaryIsOnline,
    sufficientPrimaries,
  };
}

function parsePrimariesRequired(input) {
  if (input === undefined || input === null || input === '') return undefined;
  if (typeof input === 'number') {
    return Number.isFinite(input) && input > 0 ? input : undefined;
  }
  const n = parseInt(input, 10);
  return Number.isFinite(n) && n > 0 ? n : undefined;
}

function resolveApiPath({ organization, enterprise, owner, repo }) {
  if (organization && enterprise) {
    throw new Error(
      'You cannot specify both organization and enterprise inputs. Please choose one.'
    );
  }
  if (organization) return `orgs/${organization}/actions/runners`;
  if (enterprise) return `enterprises/${enterprise}/actions/runners`;
  return `repos/${owner}/${repo}/actions/runners`;
}

async function reportFallback(fallbackRunner, reason) {
  core.warning(
    'Checking for available runners failed, but fallback-on-error is true'
  );
  core.warning(`Original error: ${reason}`);
  core.warning(`using runner: ${fallbackRunner}`);
  core.summary.addRaw(
    `Selected runner ${fallbackRunner}. Check log for details.`
  );
  await core.summary.write();
  core.setOutput('use-runner', JSON.stringify([fallbackRunner]));
}

async function main() {
  const githubRepository = process.env.GITHUB_REPOSITORY;
  const organization = core.getInput('organization', { required: false });
  const enterprise = core.getInput('enterprise', { required: false });
  const [owner, repo] = githubRepository.split('/');
  const apiPath = resolveApiPath({ organization, enterprise, owner, repo });

  const fallbackOnError = core.getBooleanInput('fallback-on-error', {
    required: false,
  });
  let fallbackRunner;

  try {
    fallbackRunner = core.getInput('fallback-runner', { required: true });

    const inputs = {
      apiPath,
      token: core.getInput('github-token', { required: true }),
      primaryRunnerLabels: core
        .getInput('primary-runner', { required: true })
        .split(','),
      fallbackRunner,
      primariesRequired: parsePrimariesRequired(
        core.getInput('primaries-required', { required: false })
      ),
    };

    const { useRunner, primaryIsOnline, sufficientPrimaries, error } =
      await checkRunner(inputs);

    if (error) {
      if (!fallbackOnError) {
        core.setFailed(error);
        return;
      }
      await reportFallback(fallbackRunner, error);
      return;
    }

    core.info(`Primary runner is online: ${primaryIsOnline}`);
    core.info(`Sufficient primary runners available: ${sufficientPrimaries}`);
    core.info(`Using runner: ${useRunner}`);
    core.summary.addRaw(`Selected runner ${useRunner}. Check log for details.`);
    await core.summary.write();
    core.setOutput('use-runner', useRunner);
  } catch (error) {
    if (fallbackRunner === undefined || !fallbackOnError) {
      core.setFailed(error);
    } else {
      await reportFallback(fallbackRunner, error);
    }
  }
}

module.exports = { checkRunner, parsePrimariesRequired, resolveApiPath };

if (require.main === module) {
  main();
}
