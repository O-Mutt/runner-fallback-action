const {
  checkRunner,
  parsePrimariesRequired,
  resolveApiPath,
} = require('./index');
const mockGetJson = jest.fn();

jest.mock('@actions/http-client', () => {
  return {
    HttpClient: jest.fn().mockImplementation(() => {
      return {
        getJson: mockGetJson,
      };
    }),
    BearerCredentialHandler: jest.fn(),
  };
});

describe('checkRunner', () => {
  beforeEach(() => {
    mockGetJson.mockClear();
  });

  it('should use the primary runner if it is online', async () => {
    mockGetJson.mockResolvedValue({
      statusCode: 200,
      result: {
        runners: [
          {
            status: 'online',
            busy: true,
            labels: [{ name: 'self-hosted' }, { name: 'linux' }],
          },
          {
            status: 'online',
            busy: false,
            labels: [{ name: 'self-hosted' }, { name: 'linux' }],
          },
        ],
      },
    });

    const result = await checkRunner({
      token: 'fake-token',
      apiPath: 'repos/fake-owner/fake-repo/actions/runners',
      primaryRunnerLabels: ['self-hosted', 'linux'],
      fallbackRunner: 'ubuntu-latest',
      primariesRequired: 1,
    });

    expect(result).toEqual({
      useRunner: '["self-hosted","linux"]',
      primaryIsOnline: true,
      sufficientPrimaries: true,
    });
  });

  it('should use the fallback runner if primaries are online but busy', async () => {
    mockGetJson.mockResolvedValue({
      statusCode: 200,
      result: {
        runners: [
          {
            status: 'online',
            busy: true,
            labels: [{ name: 'self-hosted' }, { name: 'linux' }],
          },
          {
            status: 'online',
            busy: true,
            labels: [{ name: 'self-hosted' }, { name: 'linux' }],
          },
          {
            status: 'online',
            busy: false,
            labels: [{ name: 'self-hosted' }, { name: 'linux' }],
          },
        ],
      },
    });

    const result = await checkRunner({
      token: 'fake-token',
      apiPath: 'repos/fake-owner/fake-repo/actions/runners',
      primaryRunnerLabels: ['self-hosted', 'linux'],
      fallbackRunner: 'ubuntu-latest',
      primariesRequired: 3,
    });

    expect(result).toEqual({
      useRunner: '["ubuntu-latest"]',
      primaryIsOnline: true,
      sufficientPrimaries: false,
    });
  });

  it('should use the fallback runner if the primary is not online', async () => {
    mockGetJson.mockResolvedValue({
      statusCode: 200,
      result: {
        runners: [
          {
            status: 'offline',
            labels: [{ name: 'self-hosted' }, { name: 'linux' }],
          },
        ],
      },
    });

    const result = await checkRunner({
      token: 'fake-token',
      apiPath: 'repos/fake-owner/fake-repo/actions/runners',
      primaryRunnerLabels: ['self-hosted', 'linux'],
      fallbackRunner: 'ubuntu-latest',
    });

    expect(result).toEqual({
      useRunner: '["ubuntu-latest"]',
      primaryIsOnline: false,
      sufficientPrimaries: false,
    });
  });

  it('should accept a busy primary when primariesRequired is not set', async () => {
    // Regression guard: previously `primariesRequired !== undefined` was checked,
    // but core.getInput returns "" not undefined, so the busy-skip path ran when
    // the user did not request a free primary. With proper parsing, an unset
    // primaries-required should treat any online matching primary as sufficient.
    mockGetJson.mockResolvedValue({
      statusCode: 200,
      result: {
        runners: [
          {
            status: 'online',
            busy: true,
            labels: [{ name: 'self-hosted' }, { name: 'linux' }],
          },
        ],
      },
    });

    const result = await checkRunner({
      token: 'fake-token',
      apiPath: 'repos/fake-owner/fake-repo/actions/runners',
      primaryRunnerLabels: ['self-hosted', 'linux'],
      fallbackRunner: 'ubuntu-latest',
      primariesRequired: undefined,
    });

    expect(result).toEqual({
      useRunner: '["self-hosted","linux"]',
      primaryIsOnline: true,
      sufficientPrimaries: true,
    });
  });

  it('should return an error when the API returns a non-200 status', async () => {
    mockGetJson.mockResolvedValue({
      statusCode: 401,
      result: null,
    });

    const result = await checkRunner({
      token: 'fake-token',
      apiPath: 'repos/fake-owner/fake-repo/actions/runners',
      primaryRunnerLabels: ['self-hosted', 'linux'],
      fallbackRunner: 'ubuntu-latest',
    });

    expect(result).toEqual({
      error: 'Failed to get runners. Status code: 401',
    });
  });

  it('should match a primary that has extra labels beyond those required', async () => {
    mockGetJson.mockResolvedValue({
      statusCode: 200,
      result: {
        runners: [
          {
            status: 'online',
            busy: false,
            labels: [
              { name: 'self-hosted' },
              { name: 'linux' },
              { name: 'gpu' },
              { name: 'x64' },
            ],
          },
        ],
      },
    });

    const result = await checkRunner({
      token: 'fake-token',
      apiPath: 'repos/fake-owner/fake-repo/actions/runners',
      primaryRunnerLabels: ['self-hosted', 'linux'],
      fallbackRunner: 'ubuntu-latest',
    });

    expect(result.primaryIsOnline).toBe(true);
    expect(result.sufficientPrimaries).toBe(true);
  });

  it('should send the recommended GitHub API headers', async () => {
    mockGetJson.mockResolvedValue({
      statusCode: 200,
      result: { runners: [] },
    });

    await checkRunner({
      token: 'fake-token',
      apiPath: 'repos/fake-owner/fake-repo/actions/runners',
      primaryRunnerLabels: ['self-hosted', 'linux'],
      fallbackRunner: 'ubuntu-latest',
    });

    expect(mockGetJson).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        Authorization: 'Bearer fake-token',
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
      })
    );
  });

  describe('alternative api handling', () => {
    it('should query organization runners if organization is provided', async () => {
      mockGetJson.mockResolvedValue({
        statusCode: 200,
        result: {
          runners: [],
        },
      });

      await checkRunner({
        token: 'fake-token',
        apiPath: 'orgs/call-me-ishmael/actions/runners',
        primaryRunnerLabels: ['self-hosted', 'linux'],
        fallbackRunner: 'ubuntu-latest',
      });

      expect(mockGetJson).toHaveBeenCalledWith(
        'https://api.github.com/orgs/call-me-ishmael/actions/runners',
        expect.anything()
      );
    });
    it('should query enterprise runners if enterprise is provided', async () => {
      mockGetJson.mockResolvedValue({
        statusCode: 200,
        result: {
          runners: [],
        },
      });

      await checkRunner({
        token: 'fake-token',
        apiPath: 'enterprises/i-am-the-enterprise-now/actions/runners',
        primaryRunnerLabels: ['self-hosted', 'linux'],
        fallbackRunner: 'ubuntu-latest',
      });

      expect(mockGetJson).toHaveBeenCalledWith(
        'https://api.github.com/enterprises/i-am-the-enterprise-now/actions/runners',
        expect.anything()
      );
    });
  });
});

describe('parsePrimariesRequired', () => {
  it('returns undefined for empty string (the @actions/core unset value)', () => {
    expect(parsePrimariesRequired('')).toBeUndefined();
  });

  it('returns undefined for undefined or null', () => {
    expect(parsePrimariesRequired(undefined)).toBeUndefined();
    expect(parsePrimariesRequired(null)).toBeUndefined();
  });

  it('parses a numeric string', () => {
    expect(parsePrimariesRequired('3')).toBe(3);
  });

  it('passes through a positive number', () => {
    expect(parsePrimariesRequired(2)).toBe(2);
  });

  it('returns undefined for zero, negative, or non-numeric input', () => {
    expect(parsePrimariesRequired('0')).toBeUndefined();
    expect(parsePrimariesRequired(0)).toBeUndefined();
    expect(parsePrimariesRequired('-1')).toBeUndefined();
    expect(parsePrimariesRequired('abc')).toBeUndefined();
  });
});

describe('resolveApiPath', () => {
  it('returns the repo path by default', () => {
    expect(
      resolveApiPath({
        organization: '',
        enterprise: '',
        owner: 'o',
        repo: 'r',
      })
    ).toBe('repos/o/r/actions/runners');
  });

  it('returns the org path when organization is set', () => {
    expect(
      resolveApiPath({
        organization: 'acme',
        enterprise: '',
        owner: 'o',
        repo: 'r',
      })
    ).toBe('orgs/acme/actions/runners');
  });

  it('returns the enterprise path when enterprise is set', () => {
    expect(
      resolveApiPath({
        organization: '',
        enterprise: 'big',
        owner: 'o',
        repo: 'r',
      })
    ).toBe('enterprises/big/actions/runners');
  });

  it('throws when both organization and enterprise are set', () => {
    expect(() =>
      resolveApiPath({
        organization: 'acme',
        enterprise: 'big',
        owner: 'o',
        repo: 'r',
      })
    ).toThrow(/both organization and enterprise/);
  });
});
