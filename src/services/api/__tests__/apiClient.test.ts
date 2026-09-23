import { ApiClient, AppError } from '@services';

/**
 * Axios is mocked at the module boundary so `axios.create()` hands back a
 * controllable instance. The real isCancel/isAxiosError/AxiosError are kept,
 * because the normaliser uses them to tell a cancellation from a timeout from
 * an offline device -- reimplementing that in a mock would test the mock.
 */
const mockRequest = jest.fn();

jest.mock('axios', () => {
  const actual = jest.requireActual('axios');

  const mocked = {
    create: jest.fn(() => ({
      request: (...args: unknown[]) => mockRequest(...args),
    })),
    isCancel: actual.isCancel,
    isAxiosError: actual.isAxiosError,
    AxiosError: actual.AxiosError,
  };

  return { __esModule: true, default: mocked, ...mocked };
});

const { AxiosError } = require('axios');

const ok = (data: unknown, status = 200) => ({
  data,
  status,
  config: {},
  request: {},
  headers: {},
  statusText: '',
});

const makeClient = (maxRetries = 0) =>
  new ApiClient({
    baseUrl: 'https://api.example.com',
    timeoutMs: 1000,
    maxRetries,
  });

describe('ApiClient', () => {
  beforeEach(() => {
    mockRequest.mockReset();
  });

  it('returns the parsed body on success', async () => {
    mockRequest.mockResolvedValue(ok({ id: 7 }));

    await expect(makeClient().get('/things/7')).resolves.toEqual({ id: 7 });
  });

  it('passes path, method and query through', async () => {
    mockRequest.mockResolvedValue(ok({}));

    await makeClient().get('/search', { query: { q: 'shoes', page: 2 } });

    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        url: '/search',
        method: 'GET',
        params: { q: 'shoes', page: 2 },
      }),
    );
  });

  it('treats an empty body as success rather than a parse failure', async () => {
    mockRequest.mockResolvedValue(ok(undefined, 204));

    await expect(makeClient().delete('/things/7')).resolves.toBeUndefined();
  });

  it('normalises an HTTP failure into an AppError', async () => {
    mockRequest.mockResolvedValue(ok({ message: 'nope' }, 404));

    await expect(makeClient().get('/missing')).rejects.toMatchObject({
      kind: 'notFound',
      status: 404,
    });
  });

  it('normalises a non-JSON error body using the status', async () => {
    // A proxy returning an HTML error page is common and must not surface as
    // a parse failure.
    mockRequest.mockResolvedValue(ok('<html>502 Bad Gateway</html>', 502));

    await expect(makeClient().get('/things')).rejects.toMatchObject({
      kind: 'server',
      status: 502,
    });
  });

  it('retries a retryable failure up to the limit', async () => {
    mockRequest
      .mockResolvedValueOnce(ok({}, 503))
      .mockResolvedValueOnce(ok({}, 503))
      .mockResolvedValueOnce(ok({ ok: true }));

    await expect(makeClient(2).get('/flaky')).resolves.toEqual({ ok: true });
    expect(mockRequest).toHaveBeenCalledTimes(3);
  });

  it('does not retry a failure a retry cannot fix', async () => {
    mockRequest.mockResolvedValue(ok({}, 422));

    await expect(makeClient(2).post('/things', {})).rejects.toMatchObject({
      kind: 'validation',
    });
    expect(mockRequest).toHaveBeenCalledTimes(1);
  });

  it('honours skipRetry', async () => {
    mockRequest.mockResolvedValue(ok({}, 503));

    await expect(
      makeClient(2).get('/flaky', { skipRetry: true }),
    ).rejects.toMatchObject({ kind: 'server' });
    expect(mockRequest).toHaveBeenCalledTimes(1);
  });

  it('applies request interceptors to the outgoing headers', async () => {
    mockRequest.mockResolvedValue(ok({}));
    const client = makeClient();
    client.addRequestInterceptor((_config, headers) => ({
      ...headers,
      Authorization: 'Bearer abc',
    }));

    await client.get('/things');

    expect(mockRequest).toHaveBeenCalledWith(
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: 'Bearer abc' }),
      }),
    );
  });

  it('removes an interceptor when its teardown is called', async () => {
    mockRequest.mockResolvedValue(ok({}));
    const client = makeClient();
    const remove = client.addRequestInterceptor((_c, headers) => ({
      ...headers,
      'X-Test': '1',
    }));

    remove();
    await client.get('/things');

    const sent = mockRequest.mock.calls[0]?.[0] as {
      headers: Record<string, string>;
    };
    expect(sent.headers['X-Test']).toBeUndefined();
  });

  it('replays the request once when an error interceptor asks for it', async () => {
    mockRequest
      .mockResolvedValueOnce(ok({}, 401))
      .mockResolvedValueOnce(ok({ ok: true }));

    const client = makeClient();
    const interceptor = jest.fn().mockResolvedValue(true);
    client.addErrorInterceptor(interceptor);

    await expect(client.get('/private')).resolves.toEqual({ ok: true });
    expect(interceptor).toHaveBeenCalledTimes(1);
  });

  it('does not loop when the replayed request fails the same way', async () => {
    mockRequest.mockResolvedValue(ok({}, 401));
    const client = makeClient();
    const interceptor = jest.fn().mockResolvedValue(true);
    client.addErrorInterceptor(interceptor);

    await expect(client.get('/private')).rejects.toMatchObject({
      kind: 'authentication',
    });
    // Interceptors run once per mockRequest, not once per attempt: a refresh that
    // keeps failing must not retry forever.
    expect(interceptor).toHaveBeenCalledTimes(1);
    expect(mockRequest).toHaveBeenCalledTimes(2);
  });

  it('surfaces a timeout as a timeout, not a cancellation', async () => {
    mockRequest.mockRejectedValue(
      new AxiosError('timeout of 1000ms exceeded', 'ECONNABORTED'),
    );

    await expect(makeClient().get('/slow')).rejects.toMatchObject({
      kind: 'timeout',
    });
  });

  it('never retries a request the caller cancelled', async () => {
    mockRequest.mockRejectedValue(new AxiosError('canceled', 'ERR_CANCELED'));

    await expect(makeClient(3).get('/slow')).rejects.toBeInstanceOf(AppError);
    // Retrying would resurrect work the caller explicitly abandoned.
    expect(mockRequest).toHaveBeenCalledTimes(1);
  });

  it('reports an unreachable host as a network failure', async () => {
    const error = new AxiosError('Network Error', 'ERR_NETWORK');
    error.request = {};
    mockRequest.mockRejectedValue(error);

    await expect(makeClient().get('/things')).rejects.toMatchObject({
      kind: 'network',
    });
  });

  it('forwards upload progress, which is why this client uses axios', async () => {
    mockRequest.mockImplementation(async (config: Record<string, unknown>) => {
      const onUploadProgress = config.onUploadProgress as
        | ((e: { loaded: number; total: number }) => void)
        | undefined;
      onUploadProgress?.({ loaded: 50, total: 200 });
      return ok({});
    });

    const onUploadProgress = jest.fn();
    await makeClient().post('/upload', {}, { onUploadProgress });

    // React Native's fetch cannot report this at all.
    expect(onUploadProgress).toHaveBeenCalledWith({
      loaded: 50,
      total: 200,
      ratio: 0.25,
    });
  });
});
