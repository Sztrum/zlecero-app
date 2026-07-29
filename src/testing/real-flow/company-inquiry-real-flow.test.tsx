import {
  execFileSync,
  spawn,
  type ChildProcessWithoutNullStreams,
} from 'node:child_process';
import { closeSync, existsSync, openSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterAll, beforeAll, expect, test } from 'vitest';

import { App } from '@/app';
import { env } from '@/config/env';
import { getInquiries } from '@/features/inquiries/api/inquiries';
import { api } from '@/lib/api-client';

const realFlowApiUrl = 'http://127.0.0.1:8100/api/v1';
const realFlowPort = '8100';
const backendPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../../../../zlecero',
);
const databasePath = `/tmp/zlecero-real-flow-${process.pid}.sqlite`;
let laravelServer: ChildProcessWithoutNullStreams | null = null;
let laravelOutput = '';
let unmountApp: (() => void) | null = null;

const laravelEnv = {
  ...process.env,
  APP_ENV: 'testing',
  BCRYPT_ROUNDS: '4',
  CACHE_STORE: 'array',
  DB_CONNECTION: 'sqlite',
  DB_DATABASE: databasePath,
  LOG_CHANNEL: 'stderr',
  MAIL_MAILER: 'array',
  QUEUE_CONNECTION: 'sync',
  SESSION_DRIVER: 'array',
  TELESCOPE_ENABLED: 'false',
};

const waitForLaravel = async () => {
  const deadline = Date.now() + 30000;

  while (Date.now() < deadline) {
    if (laravelServer?.exitCode !== null) {
      throw new Error(`Laravel server exited early:\n${laravelOutput}`);
    }

    try {
      const response = await fetch(`${realFlowApiUrl}/auth/profile`, {
        headers: { Accept: 'application/json' },
      });

      if (response.status === 401) {
        return;
      }
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 250));
    }
  }

  throw new Error(`Laravel server did not become ready:\n${laravelOutput}`);
};

const readRegisteredUser = (email: string): { id: string; hash: string } => {
  const output = execFileSync(
    'php',
    [
      '-r',
      [
        'require "vendor/autoload.php";',
        '$app = require "bootstrap/app.php";',
        '$app->make(Illuminate\\Contracts\\Console\\Kernel::class)->bootstrap();',
        '$user = App\\V1\\Modules\\User\\Domain\\Models\\User::where("email", $argv[1])->firstOrFail();',
        'echo json_encode(["id" => $user->id, "hash" => $user->generateHashToEmailVerification()]);',
      ].join(' '),
      email,
    ],
    {
      cwd: backendPath,
      env: laravelEnv,
      encoding: 'utf8',
    },
  );

  return JSON.parse(output) as { id: string; hash: string };
};

const renderAt = (path: string) => {
  unmountApp?.();
  window.history.pushState({}, '', path);

  const view = render(<App />);
  unmountApp = view.unmount;

  return view;
};

const clickOffersTab = async (user: ReturnType<typeof userEvent.setup>) => {
  const offerButtons = screen.getAllByRole('button', { name: /Oferty/ });
  await user.click(offerButtons[offerButtons.length - 1]);
};

beforeAll(async () => {
  expect(env.API_URL).toBe(realFlowApiUrl);
  expect(env.ENABLE_API_MOCKING).toBe(false);
  expect(existsSync(backendPath)).toBe(true);

  closeSync(openSync(databasePath, 'w'));

  execFileSync('php', ['artisan', 'migrate', '--force'], {
    cwd: backendPath,
    env: laravelEnv,
    stdio: 'pipe',
  });

  laravelServer = spawn(
    'php',
    ['artisan', 'serve', '--host=127.0.0.1', `--port=${realFlowPort}`],
    {
      cwd: backendPath,
      env: laravelEnv,
    },
  );
  laravelServer.stdout.on('data', (chunk) => {
    laravelOutput += chunk.toString();
  });
  laravelServer.stderr.on('data', (chunk) => {
    laravelOutput += chunk.toString();
  });

  await waitForLaravel();
});

afterAll(() => {
  laravelServer?.kill();
  laravelServer = null;
  rmSync(databasePath, { force: true });
});

test('runs the company inquiry flow against the real Laravel API with MSW disabled', async () => {
  const user = userEvent.setup();
  const runId = crypto.randomUUID();
  const email = `real-flow-${runId}@example.invalid`;
  const password = 'ZleceroTest123!';
  const inquiryTitle = `Real flow inquiry ${runId}`;
  const inquiryDescription = `Real Laravel flow verification ${runId}`;
  const internalNote = `Internal note ${runId}`;

  renderAt('/auth/register');

  await user.type(
    await screen.findByLabelText('Imię i nazwisko'),
    'Real Flow Owner',
  );
  await user.type(screen.getByLabelText('E-mail'), email);
  await user.type(screen.getByLabelText('Nazwa firmy'), `Real Flow ${runId}`);
  await user.type(screen.getByLabelText('Hasło'), password);
  await user.type(screen.getByLabelText('Powtórz hasło'), password);
  await user.click(
    screen.getByLabelText(
      'Akceptuję warunki wymagane do utworzenia konta firmowego.',
    ),
  );
  await user.click(screen.getByRole('button', { name: 'Utwórz konto' }));

  await screen.findByText(
    'Wróć do pracy nad zapytaniami, ofertami i klientami.',
  );

  const registeredUser = readRegisteredUser(email);
  await api.post(
    `/auth/verify-email/${registeredUser.id}/email/verify/${registeredUser.hash}`,
  );

  await user.type(screen.getByLabelText('E-mail'), email);
  await user.type(screen.getByLabelText('Hasło'), password);
  await user.click(screen.getByRole('button', { name: 'Zaloguj się' }));

  await screen.findByText('Dzień dobry, Real Flow Owner');

  const profile = await api.get('/auth/profile');
  expect(profile.data.email).toBe(email);

  await screen.findByText(
    'Najważniejsze zapytania, oferty i zlecenia wymagające działania.',
  );

  window.history.pushState({}, '', '/app/inquiries');
  window.dispatchEvent(new PopStateEvent('popstate'));

  await screen.findByText('Zarządzaj wszystkimi zapytaniami w jednym miejscu.');
  await user.click(screen.getByRole('button', { name: 'Nowe zapytanie' }));
  await user.type(screen.getByLabelText('Tytuł'), inquiryTitle);
  await user.type(screen.getByLabelText('Opis'), inquiryDescription);
  await user.click(screen.getByRole('button', { name: 'Utwórz zapytanie' }));

  await screen.findByText(inquiryTitle);

  const inquiries = await waitFor(async () => {
    const currentInquiries = await getInquiries();
    const inquiry = currentInquiries.find(
      (item) => item.title === inquiryTitle,
    );
    expect(inquiry).toBeDefined();

    return currentInquiries;
  });
  const createdInquiry = inquiries.find((item) => item.title === inquiryTitle);
  expect(createdInquiry).toBeDefined();

  if (!createdInquiry) {
    throw new Error('Created inquiry was not returned by Laravel.');
  }

  window.history.pushState(
    {},
    '',
    `/app/inquiries?inquiry=${createdInquiry.id}`,
  );
  window.dispatchEvent(new PopStateEvent('popstate'));

  await screen.findByText(inquiryDescription);
  await clickOffersTab(user);
  await user.type(
    screen.getByLabelText('Nowa notatka wewnętrzna'),
    internalNote,
  );
  await user.click(screen.getByRole('button', { name: 'Dodaj notatkę' }));

  await screen.findByText(internalNote);

  const refreshedInquiry = await api.get(`/inquiries/${createdInquiry.id}`);
  expect(refreshedInquiry.data.notes[0].body).toBe(internalNote);

  renderAt(`/app/inquiries?inquiry=${createdInquiry.id}`);

  await screen.findByText(inquiryDescription);
  await clickOffersTab(user);

  const drawer = screen.getByRole('dialog');
  expect(within(drawer).getByText(internalNote)).toBeInTheDocument();
});
