import { renderApp, waitFor } from '@/testing/test-utils';

import { Head } from '../head';

test('should set document title', async () => {
  await renderApp(<Head title="Test" />, { user: null });

  await waitFor(() => expect(document.title).toBe('Test | Zlecero'));
});
