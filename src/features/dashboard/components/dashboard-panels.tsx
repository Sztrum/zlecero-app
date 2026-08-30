import {
  AlertTriangle,
  ArrowUpRight,
  Briefcase,
  CalendarClock,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  Gauge,
  Inbox,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';

import { Badge } from '@/components/ui/badge';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { Spinner } from '@/components/ui/spinner';
import { StatCard } from '@/components/ui/stat-card';
import { paths } from '@/config/paths';
import {
  AdminDashboard,
  CompanyDashboard,
  DashboardCard,
  DashboardItem,
  DashboardTone,
} from '@/types/api';
import { cn } from '@/utils/cn';
import { formatMoney } from '@/utils/format-money';

const toneClasses: Record<DashboardTone, string> = {
  primary: 'border-primary/20 bg-primary/10 text-primary',
  info: 'border-blue-200 bg-blue-50 text-blue-700',
  warning: 'border-orange-200 bg-orange-50 text-orange-700',
  danger: 'border-red-200 bg-red-50 text-red-700',
};

const dotToneClasses: Record<DashboardTone, string> = {
  primary: 'bg-primary',
  info: 'bg-blue-500',
  warning: 'bg-orange-500',
  danger: 'bg-red-500',
};

const toneIcons: Record<string, LucideIcon> = {
  'new-inquiries': Inbox,
  'waiting-inquiries': Clock,
  'offer-actions': FileText,
  'overdue-orders': AlertTriangle,
  'active-companies': Briefcase,
  'trial-companies': CalendarClock,
  'limited-companies': AlertTriangle,
  'admin-actions': Clock,
};

const clientTabs = [
  { key: 'overview', label: 'Pulpit', icon: Gauge },
  { key: 'inquiries', label: 'Zapytania', icon: Inbox },
  { key: 'offers', label: 'Oferty', icon: FileText },
  { key: 'settings', label: 'Ustawienia', icon: Settings },
] as const;

type ClientTab = (typeof clientTabs)[number]['key'];

function CardGrid({ cards }: { cards: DashboardCard[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = toneIcons[card.id] ?? FileText;
        const body = (
          <div className="rounded-xl border border-[#EADBCD] bg-white p-5 shadow-sm transition hover:border-primary/35">
            <div className="flex items-start justify-between gap-4">
              <span
                className={cn(
                  'flex size-10 items-center justify-center rounded-lg border',
                  toneClasses[card.tone],
                )}
              >
                <Icon className="size-5" />
              </span>
              {card.href ? (
                <ArrowUpRight className="size-4 text-gray-300" />
              ) : null}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{card.label}</p>
            <p className="mt-1 font-display text-3xl font-extrabold text-[#33251D]">
              {card.value}
            </p>
          </div>
        );

        return card.href ? (
          <Link key={card.id} to={card.href}>
            {body}
          </Link>
        ) : (
          <div key={card.id}>{body}</div>
        );
      })}
    </div>
  );
}

function TabBar<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: readonly { key: T; label: string; icon: LucideIcon }[];
  active: T;
  onChange: (tab: T) => void;
}) {
  return (
    <div className="flex gap-1 overflow-x-auto rounded-xl border border-[#EADBCD] bg-white p-1 shadow-sm">
      {tabs.map((tab) => {
        const Icon = tab.icon;

        return (
          <button
            key={tab.key}
            className={cn(
              'inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition',
              active === tab.key
                ? 'bg-primary text-white'
                : 'text-muted-foreground hover:bg-[#FAF5ED] hover:text-[#33251D]',
            )}
            type="button"
            onClick={() => onChange(tab.key)}
          >
            <Icon className="size-4" />
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

function ItemList({
  title,
  empty,
  items,
  onSelect,
}: {
  title: string;
  empty: string;
  items: DashboardItem[];
  onSelect?: (item: DashboardItem) => void;
}) {
  return (
    <section className="rounded-xl border border-[#EADBCD] bg-white shadow-sm">
      <div className="border-b border-[#EADBCD] px-5 py-4">
        <h2 className="font-display text-sm font-bold text-[#33251D]">
          {title}
        </h2>
      </div>
      <div className="divide-y divide-[#EADBCD]">
        {items.length === 0 ? (
          <p className="px-5 py-8 text-sm text-muted-foreground">{empty}</p>
        ) : (
          items.map((item) => (
            <button
              key={item.id}
              className="flex w-full items-center gap-4 px-5 py-4 text-left transition hover:bg-[#FAF5ED]"
              type="button"
              onClick={() => onSelect?.(item)}
            >
              <span
                className={cn('size-2 rounded-full', dotToneClasses[item.tone])}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#33251D]">
                  {item.title}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {item.label}
                  {item.customerName ? ` · ${item.customerName}` : ''}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                {item.dueAt ?? ''}
              </span>
            </button>
          ))
        )}
      </div>
    </section>
  );
}

function HandOffCard({
  title,
  description,
  actionLabel,
  to,
}: {
  title: string;
  description: string;
  actionLabel: string;
  to: string;
}) {
  return (
    <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-semibold text-primary">{title}</p>
          <p className="mt-1 text-sm text-[#33251D]">{description}</p>
        </div>
        <Link
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
          to={to}
        >
          <ArrowUpRight className="size-4" />
          {actionLabel}
        </Link>
      </div>
    </div>
  );
}

export function DashboardLoading() {
  return (
    <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-[#EADBCD] bg-white">
      <Spinner size="lg" />
    </div>
  );
}

export function DashboardError({ title }: { title: string }) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
      {title}
    </div>
  );
}

export function CompanyDashboardPanel({ data }: { data: CompanyDashboard }) {
  const navigate = useNavigate();
  const [active, setActive] = useState<ClientTab>('overview');
  const [selectedItem, setSelectedItem] = useState<DashboardItem | null>(null);
  const [isItemDrawerOpen, setIsItemDrawerOpen] = useState(false);

  const allItems = useMemo(
    () => [
      ...data.attentionItems,
      ...data.tasksToday,
      ...data.upcomingDeadlines,
    ],
    [data.attentionItems, data.tasksToday, data.upcomingDeadlines],
  );

  const inquiryItems = allItems.filter((item) => item.type === 'inquiry');
  const offerItems = allItems.filter((item) => item.type === 'offer');

  const openItem = (item: DashboardItem) => {
    setSelectedItem(item);
    setIsItemDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      <TabBar active={active} tabs={clientTabs} onChange={setActive} />

      {active === 'overview' ? (
        <div className="space-y-6">
          <CardGrid cards={data.cards} />

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.9fr)]">
            <section className="rounded-xl border border-[#EADBCD] bg-white shadow-sm">
              <div className="flex items-center justify-between gap-4 border-b border-[#EADBCD] px-5 py-4">
                <div>
                  <h2 className="font-display text-sm font-bold text-[#33251D]">
                    Najnowsze sprawy, które warto poprowadzić dalej
                  </h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Połączenie zapytań, ofert i terminów z API.
                  </p>
                </div>
                <button
                  className="text-xs font-semibold text-primary hover:underline"
                  type="button"
                  onClick={() => setActive('inquiries')}
                >
                  Zobacz wszystkie
                </button>
              </div>
              <div className="divide-y divide-[#EADBCD]">
                {allItems.length === 0 ? (
                  <p className="px-5 py-8 text-sm text-muted-foreground">
                    Brak spraw wymagających uwagi.
                  </p>
                ) : (
                  allItems.slice(0, 6).map((item) => (
                    <button
                      key={item.id}
                      className="grid w-full grid-cols-[minmax(0,1.6fr)_120px_100px] items-center gap-4 px-5 py-4 text-left transition hover:bg-[#FFFDF9] max-md:grid-cols-1"
                      type="button"
                      onClick={() => openItem(item)}
                    >
                      <div className="min-w-0">
                        <p className="truncate font-mono text-xs font-semibold text-primary">
                          {item.type.toUpperCase()}
                        </p>
                        <p className="mt-0.5 truncate text-sm font-semibold text-[#33251D]">
                          {item.title}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {item.customerName ?? 'Brak klienta'} · {item.label}
                        </p>
                      </div>
                      <Badge
                        label={item.tone === 'danger' ? 'Pilne' : item.status}
                        className={toneClasses[item.tone]}
                      />
                      <span className="text-xs text-muted-foreground">
                        {item.dueAt ?? 'bez daty'}
                      </span>
                    </button>
                  ))
                )}
              </div>
            </section>

            <div className="space-y-6">
              <section className="rounded-xl border border-[#EADBCD] bg-white p-5 shadow-sm">
                <h2 className="font-display text-sm font-bold text-[#33251D]">
                  Podstawowe statystyki
                </h2>
                <div className="mt-4 space-y-3 text-sm">
                  {[
                    ['Aktywne zapytania', data.stats.activeInquiries],
                    [
                      'Wysłane oferty',
                      formatMoney(data.stats.sentOffersGrossCents),
                    ],
                    [
                      'Zaakceptowane oferty',
                      formatMoney(data.stats.acceptedOffersGrossCents),
                    ],
                    ['Aktywne zlecenia', data.stats.activeOrders],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between gap-4">
                      <span className="text-muted-foreground">{label}</span>
                      <strong>{value}</strong>
                    </div>
                  ))}
                </div>
              </section>
              <ItemList
                title="Najbliższe terminy"
                empty="Brak terminów realizacji w najbliższym tygodniu."
                items={data.upcomingDeadlines}
                onSelect={openItem}
              />
            </div>
          </div>
        </div>
      ) : null}

      {active === 'inquiries' ? (
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-extrabold text-[#33251D]">
                Zarządzaj wszystkimi zapytaniami w jednym miejscu.
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {data.stats.activeInquiries} aktywnych spraw w kolejce zespołu
              </p>
            </div>
            <button
              className="hidden items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 sm:inline-flex"
              type="button"
              onClick={() => navigate(paths.app.inquiries.getHref())}
            >
              <Inbox className="size-4" />
              Otwórz kolejkę
            </button>
          </div>
          <HandOffCard
            title="Zapytania gotowe do obsługi"
            description="Przejdź do kolejki, aby filtrować sprawy, dopisać odpowiedź i sprawdzić powiązane materiały."
            actionLabel="Otwórz zapytania"
            to={paths.app.inquiries.getHref()}
          />
          <section className="rounded-xl border border-[#EADBCD] bg-white shadow-sm">
            <div className="border-b border-[#EADBCD] px-5 py-4">
              <h3 className="font-display text-sm font-bold text-[#33251D]">
                Zapytania wymagające uwagi
              </h3>
            </div>
            <div className="divide-y divide-[#EADBCD]">
              {inquiryItems.length === 0 ? (
                <p className="px-5 py-8 text-sm text-muted-foreground">
                  Brak pilnych zapytań w dashboardzie.
                </p>
              ) : (
                inquiryItems.map((item) => (
                  <button
                    key={item.id}
                    className="grid w-full grid-cols-[minmax(0,1.6fr)_120px_44px] items-center gap-4 px-5 py-4 text-left transition hover:bg-[#FFFDF9] max-md:grid-cols-1"
                    type="button"
                    onClick={() => navigate(item.href)}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-mono text-xs font-semibold text-primary">
                        {item.id.replace(/^inquiry-/, '')}
                      </p>
                      <p className="mt-0.5 truncate text-sm font-semibold text-[#33251D]">
                        {item.title}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {item.customerName ?? 'Brak klienta'} · {item.label}
                      </p>
                    </div>
                    <Badge
                      label={item.tone === 'danger' ? 'Pilne' : item.status}
                      className={toneClasses[item.tone]}
                    />
                    <span className="flex justify-end text-muted-foreground">
                      <Eye className="size-4" />
                    </span>
                  </button>
                ))
              )}
            </div>
          </section>
        </div>
      ) : null}

      {active === 'offers' ? (
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-extrabold text-[#33251D]">
                Twórz, wysyłaj i śledź każdą ofertę od szkicu.
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Wartości liczone z ofert firmy dostępnych w API dashboardu.
              </p>
            </div>
            <button
              className="hidden items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 sm:inline-flex"
              type="button"
              onClick={() => navigate(paths.app.offers.getHref())}
            >
              <FileText className="size-4" />
              Otwórz oferty
            </button>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <StatCard
              icon={Clock}
              label="Wysłane oferty"
              value={formatMoney(data.stats.sentOffersGrossCents)}
              iconColor="bg-orange-50 text-orange-600"
              valueColor="text-orange-600"
            />
            <StatCard
              icon={CheckCircle2}
              label="Zaakceptowane oferty"
              value={formatMoney(data.stats.acceptedOffersGrossCents)}
              iconColor="bg-green-50 text-green-600"
              valueColor="text-green-600"
            />
          </div>
          <HandOffCard
            title="Pełna lista ofert"
            description="Filtruj po statusie, sprawdź terminy ważności, generuj PDF i rejestruj akceptacje w widoku ofert."
            actionLabel="Otwórz oferty"
            to={paths.app.offers.getHref()}
          />
          <ItemList
            title="Oferty wymagające działania"
            empty="Brak ofert wymagających działania."
            items={offerItems}
            onSelect={openItem}
          />
        </div>
      ) : null}

      {active === 'settings' ? (
        <div className="space-y-5">
          <div>
            <h2 className="font-display text-2xl font-extrabold text-[#33251D]">
              Ustawienia firmy i zespołu.
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Dostępne są ustawienia oparte o realne kontrakty API. Pozostałe
              obszary pojawią się razem z ich backendem.
            </p>
          </div>
          <HandOffCard
            title="Dane firmy"
            description="Nazwa, dane rozliczeniowe, adres i kolor marki wykorzystywany w dokumentach."
            actionLabel="Otwórz dane firmy"
            to={paths.app.company.getHref()}
          />
          <HandOffCard
            title="Użytkownicy"
            description="Zapraszaj pracowników, nadawaj role i dezaktywuj dostęp osobom, które odeszły z zespołu."
            actionLabel="Otwórz użytkowników"
            to={paths.app.companyUsers.getHref()}
          />
        </div>
      ) : null}

      <Drawer open={isItemDrawerOpen} onOpenChange={setIsItemDrawerOpen}>
        <DrawerContent
          side="right"
          className="flex h-full w-[min(96vw,36rem)] max-w-none flex-col overflow-hidden border-[#EADBCD] bg-white p-0 sm:max-w-none"
        >
          {selectedItem ? (
            <>
              <DrawerHeader className="border-b border-[#EADBCD] px-6 py-4 pr-14 text-left">
                <p className="font-mono text-xs font-semibold text-primary">
                  {selectedItem.id}
                </p>
                <DrawerTitle className="font-display text-lg font-bold text-[#33251D]">
                  {selectedItem.title}
                </DrawerTitle>
                <DrawerDescription>{selectedItem.label}</DrawerDescription>
              </DrawerHeader>
              <div className="flex-1 space-y-5 overflow-y-auto p-6">
                <div className="rounded-xl bg-[#FAF5ED] p-4">
                  <p className="text-xs text-muted-foreground">Klient</p>
                  <p className="mt-1 font-semibold text-[#33251D]">
                    {selectedItem.customerName ?? 'Brak klienta'}
                  </p>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-[#EADBCD] p-4">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <Badge
                      label={selectedItem.status}
                      className={cn('mt-2', toneClasses[selectedItem.tone])}
                    />
                  </div>
                  <div className="rounded-xl border border-[#EADBCD] p-4">
                    <p className="text-xs text-muted-foreground">Termin</p>
                    <p className="mt-2 text-sm font-semibold text-[#33251D]">
                      {selectedItem.dueAt ?? 'bez daty'}
                    </p>
                  </div>
                </div>
                <div className="rounded-xl border border-[#EADBCD] p-4">
                  <p className="text-xs text-muted-foreground">Opiekun</p>
                  <p className="mt-1 text-sm font-semibold text-[#33251D]">
                    {selectedItem.ownerName ?? 'Nieprzypisany'}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap justify-end gap-2 border-t border-[#EADBCD] p-4">
                <Link
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
                  to={selectedItem.href}
                >
                  Otwórz szczegóły
                </Link>
              </div>
            </>
          ) : null}
        </DrawerContent>
      </Drawer>
    </div>
  );
}

export function AdminDashboardPanel({ data }: { data: AdminDashboard }) {
  return (
    <div className="space-y-6">
      <CardGrid cards={data.cards} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
        <section className="rounded-xl border border-[#EADBCD] bg-white shadow-sm">
          <div className="border-b border-[#EADBCD] px-5 py-4">
            <h2 className="font-display text-sm font-bold text-[#33251D]">
              Ostatnio zarejestrowane firmy
            </h2>
          </div>
          <div className="divide-y divide-[#EADBCD]">
            {data.recentCompanies.length === 0 ? (
              <p className="px-5 py-8 text-sm text-muted-foreground">
                Brak nowych firm w tym okresie.
              </p>
            ) : (
              data.recentCompanies.map((company) => (
                <div
                  key={company.id}
                  className="flex items-center gap-4 px-5 py-4"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                    {company.name[0]}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#33251D]">
                      {company.name}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {company.slug} · trial do{' '}
                      {company.trialEndsAt ?? 'brak daty'}
                    </p>
                  </div>
                  <Badge
                    label={
                      company.onboardingCompletedAt ? 'Aktywny' : 'Onboarding'
                    }
                    className={
                      company.onboardingCompletedAt
                        ? 'bg-green-100 text-green-700'
                        : 'bg-orange-100 text-orange-700'
                    }
                  />
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-xl border border-[#EADBCD] bg-white shadow-sm">
          <div className="border-b border-[#EADBCD] px-5 py-4">
            <h2 className="font-display text-sm font-bold text-[#33251D]">
              Alerty platformy
            </h2>
          </div>
          <div className="divide-y divide-[#EADBCD]">
            {data.alerts.length === 0 ? (
              <p className="px-5 py-8 text-sm text-muted-foreground">
                Brak alertów wymagających reakcji.
              </p>
            ) : (
              data.alerts.map((alert) => (
                <div
                  key={alert.id}
                  className="flex items-start gap-3 px-5 py-4"
                >
                  <span
                    className={cn(
                      'mt-1.5 size-2 shrink-0 rounded-full',
                      dotToneClasses[alert.severity],
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[#33251D]">
                      {alert.label}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {alert.companyName}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {alert.createdAt ?? ''}
                  </span>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
