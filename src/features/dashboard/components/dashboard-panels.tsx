import {
  AlertTriangle,
  ArrowUpRight,
  Briefcase,
  CalendarClock,
  Clock,
  FileQuestion,
  FileText,
  type LucideIcon,
} from 'lucide-react';
import { Link } from 'react-router';

import { Spinner } from '@/components/ui/spinner';
import {
  AdminDashboard,
  CompanyDashboard,
  DashboardCard,
  DashboardItem,
  DashboardTone,
} from '@/types/api';
import { formatMoney } from '@/utils/format-money';

const toneClasses: Record<DashboardTone, string> = {
  primary: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  info: 'bg-blue-50 text-blue-700 border-blue-200',
  warning: 'bg-orange-50 text-orange-700 border-orange-200',
  danger: 'bg-red-50 text-red-700 border-red-200',
};

const toneIcons: Record<string, LucideIcon> = {
  'new-inquiries': FileQuestion,
  'waiting-inquiries': Clock,
  'offer-actions': FileText,
  'overdue-orders': AlertTriangle,
  'active-companies': Briefcase,
  'trial-companies': CalendarClock,
  'limited-companies': AlertTriangle,
  'admin-actions': Clock,
};

const CardGrid = ({ cards }: { cards: DashboardCard[] }) => (
  <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
    {cards.map((card) => {
      const Icon = toneIcons[card.id] ?? FileText;
      const body = (
        <div className="rounded-xl border bg-white p-5 shadow-sm transition hover:border-indigo-200">
          <div className="flex items-start justify-between gap-4">
            <span
              className={`flex size-10 items-center justify-center rounded-lg border ${toneClasses[card.tone]}`}
            >
              <Icon className="size-5" />
            </span>
            {card.href ? (
              <ArrowUpRight className="size-4 text-gray-300" />
            ) : null}
          </div>
          <p className="mt-4 text-sm text-gray-500">{card.label}</p>
          <p className="mt-1 text-3xl font-bold text-gray-950">{card.value}</p>
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

const ItemList = ({
  title,
  empty,
  items,
}: {
  title: string;
  empty: string;
  items: DashboardItem[];
}) => (
  <section className="rounded-xl border bg-white shadow-sm">
    <div className="border-b px-5 py-4">
      <h2 className="text-sm font-semibold text-gray-950">{title}</h2>
    </div>
    <div className="divide-y">
      {items.length === 0 ? (
        <p className="px-5 py-8 text-sm text-gray-500">{empty}</p>
      ) : (
        items.map((item) => (
          <Link
            key={item.id}
            to={item.href}
            className="flex items-center gap-4 px-5 py-4 transition hover:bg-gray-50"
          >
            <span
              className={`size-2 rounded-full ${
                item.tone === 'danger'
                  ? 'bg-red-500'
                  : item.tone === 'warning'
                    ? 'bg-orange-500'
                    : item.tone === 'info'
                      ? 'bg-blue-500'
                      : 'bg-indigo-500'
              }`}
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-950">
                {item.title}
              </p>
              <p className="truncate text-xs text-gray-500">
                {item.label}
                {item.customerName ? ` · ${item.customerName}` : ''}
              </p>
            </div>
            <span className="text-xs text-gray-400">{item.dueAt ?? ''}</span>
          </Link>
        ))
      )}
    </div>
  </section>
);

export const DashboardLoading = () => (
  <div className="flex min-h-[320px] items-center justify-center rounded-xl border bg-white">
    <Spinner size="lg" />
  </div>
);

export const DashboardError = ({ title }: { title: string }) => (
  <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
    {title}
  </div>
);

export const CompanyDashboardPanel = ({ data }: { data: CompanyDashboard }) => (
  <div className="space-y-6">
    <CardGrid cards={data.cards} />
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
      <div className="space-y-6">
        <ItemList
          title="Wymagają uwagi"
          empty="Brak pilnych spraw do obsłużenia."
          items={data.attentionItems}
        />
        <ItemList
          title="Zadania na dziś"
          empty="Brak zapytań z terminem odpowiedzi na dziś."
          items={data.tasksToday}
        />
      </div>
      <div className="space-y-6">
        <section className="rounded-xl border bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-gray-950">
            Podstawowe statystyki
          </h2>
          <div className="mt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Aktywne zapytania</span>
              <strong>{data.stats.activeInquiries}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Wysłane oferty</span>
              <strong>{formatMoney(data.stats.sentOffersGrossCents)}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Zaakceptowane oferty</span>
              <strong>
                {formatMoney(data.stats.acceptedOffersGrossCents)}
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Aktywne zlecenia</span>
              <strong>{data.stats.activeOrders}</strong>
            </div>
          </div>
        </section>
        <ItemList
          title="Najbliższe terminy"
          empty="Brak terminów realizacji w najbliższym tygodniu."
          items={data.upcomingDeadlines}
        />
      </div>
    </div>
  </div>
);

export const AdminDashboardPanel = ({ data }: { data: AdminDashboard }) => (
  <div className="space-y-6">
    <CardGrid cards={data.cards} />
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(320px,0.9fr)]">
      <section className="rounded-xl border bg-white shadow-sm">
        <div className="border-b px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-950">
            Ostatnio zarejestrowane firmy
          </h2>
        </div>
        <div className="divide-y">
          {data.recentCompanies.map((company) => (
            <div key={company.id} className="px-5 py-4">
              <p className="text-sm font-semibold text-gray-950">
                {company.name}
              </p>
              <p className="text-xs text-gray-500">
                {company.slug} · trial do {company.trialEndsAt ?? 'brak daty'}
              </p>
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-xl border bg-white shadow-sm">
        <div className="border-b px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-950">
            Alerty administracyjne
          </h2>
        </div>
        <div className="divide-y">
          {data.alerts.length === 0 ? (
            <p className="px-5 py-8 text-sm text-gray-500">
              Brak alertów platformowych.
            </p>
          ) : (
            data.alerts.map((alert) => (
              <div key={alert.id} className="px-5 py-4">
                <span
                  className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${toneClasses[alert.severity]}`}
                >
                  {alert.severity}
                </span>
                <p className="mt-2 text-sm font-medium text-gray-950">
                  {alert.label}
                </p>
                <p className="text-xs text-gray-500">{alert.companyName}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  </div>
);
