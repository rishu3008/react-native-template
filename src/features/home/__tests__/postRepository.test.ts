import { postRepository } from '@features/home';
import { apiClient, AppError } from '@services';

describe('postRepository', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns validated posts', async () => {
    jest
      .spyOn(apiClient, 'get')
      .mockResolvedValue([{ id: 1, title: 'a', body: 'b' }]);

    await expect(postRepository.list()).resolves.toEqual([
      { id: 1, title: 'a', body: 'b' },
    ]);
  });

  it('rejects a response whose shape does not match the schema', async () => {
    // TypeScript validates nothing at runtime. Without the schema, a renamed
    // field arrives as undefined and fails far from the request, usually as a
    // render crash.
    jest.spyOn(apiClient, 'get').mockResolvedValue([{ id: 1, heading: 'a' }]);

    await expect(postRepository.list()).rejects.toMatchObject({
      kind: 'parse',
    });
  });

  it('rejects a wrong-typed field rather than coercing it', async () => {
    jest
      .spyOn(apiClient, 'get')
      .mockResolvedValue([{ id: '1', title: 'a', body: 'b' }]);

    await expect(postRepository.list()).rejects.toBeInstanceOf(AppError);
  });

  it('passes transport failures through unchanged', async () => {
    const failure = AppError.from('network');
    jest.spyOn(apiClient, 'get').mockRejectedValue(failure);

    // Already normalised upstream; re-wrapping would lose the kind.
    await expect(postRepository.list()).rejects.toBe(failure);
  });

  it('requests a single post by id', async () => {
    const get = jest
      .spyOn(apiClient, 'get')
      .mockResolvedValue({ id: 7, title: 'a', body: 'b' });

    await expect(postRepository.byId('7')).resolves.toMatchObject({ id: 7 });
    expect(get).toHaveBeenCalledWith('/posts/7', {});
  });

  it('forwards an abort signal so an unmount cancels the request', async () => {
    const controller = new AbortController();
    const get = jest.spyOn(apiClient, 'get').mockResolvedValue([]);

    await postRepository.list(controller.signal);

    expect(get).toHaveBeenCalledWith(
      '/posts',
      expect.objectContaining({ signal: controller.signal }),
    );
  });
});
