import { ApiClient, AppError } from '@services';

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const makeClient = (maxRetries = 0) =>
  new ApiClient({
    baseUrl: 'https://api.example.com',
    timeoutMs: 1000,
    maxRetries,
  });

describe('ApiClient', () => {
  let fetchMock: jest.SpyInstance;

  beforeEach(() => {
    fetchMock = jest.spyOn(globalThis, 'fetch');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns the parsed body on success', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, { id: 7 }));

    await expect(makeClient().get('/things/7')).resolves.toEqual({ id: 7 });
  });

  it('builds the URL from base, path and query', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, {}));

    await makeClient().get('/search', { query: { q: 'shoes', page: 2 } });

    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      'https://api.example.com/search?q=shoes&page=2',
    );
  });

  it('drops undefined query params instead of serialising them', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, {}));

    await makeClient().get('/search', {
      query: { q: 'shoes', cursor: undefined },
    });

    // A naive template string would send cursor=undefined.
    expect(fetchMock.mock.calls[0]?.[0]).not.toContain('cursor');
  });

  it('treats an empty body as success rather than a parse failure', async () => {
    // 204 must be constructed with a null body; it cannot carry one.
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await expect(makeClient().delete('/things/7')).resolves.toBeUndefined();
  });

  it('normalises an HTTP failure into an AppError', async () => {
    fetchMock.mockResolvedValue(jsonResponse(404, { message: 'nope' }));

    await expect(makeClient().get('/missing')).rejects.toMatchObject({
      kind: 'notFound',
      status: 404,
    });
  });

  it('normalises a non-JSON error body using the status', async () => {
    // A proxy returning an HTML error page is common and must not surface as
    // a parse failure.
    fetchMock.mockResolvedValue(
      new Response('<html>502 Bad Gateway</html>', { status: 502 }),
    );

    await expect(makeClient().get('/things')).rejects.toMatchObject({
      kind: 'server',
      status: 502,
    });
  });

  it('retries a retryable failure up to the limit', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(503, {}))
      .mockResolvedValueOnce(jsonResponse(503, {}))
      .mockResolvedValueOnce(jsonResponse(200, { ok: true }));

    await expect(makeClient(2).get('/flaky')).resolves.toEqual({ ok: true });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('does not retry a failure a retry cannot fix', async () => {
    fetchMock.mockImplementation(async () => jsonResponse(422, {}));

    await expect(makeClient(2).post('/things', {})).rejects.toMatchObject({
      kind: 'validation',
    });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('honours skipRetry', async () => {
    fetchMock.mockImplementation(async () => jsonResponse(503, {}));

    await expect(
      makeClient(2).get('/flaky', { skipRetry: true }),
    ).rejects.toMatchObject({ kind: 'server' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('applies request interceptors to the outgoing headers', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, {}));
    const client = makeClient();
    client.addRequestInterceptor((_config, headers) => ({
      ...headers,
      Authorization: 'Bearer abc',
    }));

    await client.get('/things');

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect((init.headers as Record<string, string>).Authorization).toBe(
      'Bearer abc',
    );
  });

  it('removes an interceptor when its teardown is called', async () => {
    fetchMock.mockResolvedValue(jsonResponse(200, {}));
    const client = makeClient();
    const remove = client.addRequestInterceptor((_c, headers) => ({
      ...headers,
      'X-Test': '1',
    }));

    remove();
    await client.get('/things');

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect((init.headers as Record<string, string>)['X-Test']).toBeUndefined();
  });

  it('replays the request once when an error interceptor asks for it', async () => {
    fetchMock
      .mockResolvedValueOnce(jsonResponse(401, {}))
      .mockResolvedValueOnce(jsonResponse(200, { ok: true }));

    const client = makeClient();
    const interceptor = jest.fn().mockResolvedValue(true);
    client.addErrorInterceptor(interceptor);

    await expect(client.get('/private')).resolves.toEqual({ ok: true });
    expect(interceptor).toHaveBeenCalledTimes(1);
  });

  it('does not loop when the replayed request fails the same way', async () => {
    // mockImplementation, not mockResolvedValue: a Response body can only be
    // read once, so a shared instance fails the second request for the wrong
    // reason.
    fetchMock.mockImplementation(async () => jsonResponse(401, {}));
    const client = makeClient();
    const interceptor = jest.fn().mockResolvedValue(true);
    client.addErrorInterceptor(interceptor);

    await expect(client.get('/private')).rejects.toMatchObject({
      kind: 'authentication',
    });
    // Interceptors run once per request, not once per attempt: a refresh that
    // keeps failing must not retry forever.
    expect(interceptor).toHaveBeenCalledTimes(1);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('surfaces a timeout as a timeout, not a cancellation', async () => {
    fetchMock.mockImplementation((_url: string, init: RequestInit) => {
      return new Promise((_resolve, reject) => {
        init.signal?.addEventListener('abort', () => {
          const error = new Error('Aborted');
          error.name = 'AbortError';
          reject(error);
        });
      });
    });

    const client = new ApiClient({
      baseUrl: 'https://api.example.com',
      timeoutMs: 20,
      maxRetries: 0,
    });

    await expect(client.get('/slow')).rejects.toMatchObject({
      kind: 'timeout',
    });
  });

  it('never retries a request the caller cancelled', async () => {
    const controller = new AbortController();
    fetchMock.mockImplementation((_url: string, init: RequestInit) => {
      return new Promise((_resolve, reject) => {
        init.signal?.addEventListener('abort', () => {
          const error = new Error('Aborted');
          error.name = 'AbortError';
          reject(error);
        });
      });
    });

    const promise = makeClient(3).get('/slow', { signal: controller.signal });
    controller.abort();

    await expect(promise).rejects.toBeInstanceOf(AppError);
    // Retrying would resurrect work the caller explicitly abandoned.
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
