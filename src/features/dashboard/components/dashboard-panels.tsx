import {
  Activity,
  AlertTriangle,
  Archive,
  ArrowUpRight,
  BarChart2,
  Bell,
  Bot,
  Briefcase,
  Calendar,
  CalendarClock,
  CheckCircle,
  Clock,
  CreditCard,
  Download,
  Eye,
  FileQuestion,
  FileText,
  Flag,
  FolderOpen,
  Gauge,
  Headphones,
  Inbox,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Package,
  Percent,
  Plus,
  Search,
  Send,
  Settings,
  Sparkles,
  TrendingUp,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link } from 'react-router';

import { Spinner } from '@/components/ui/spinner';
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
  'new-inquiries': FileQuestion,
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
  { key: 'clients', label: 'Klienci', icon: Users },
  { key: 'catalog', label: 'Produkty', icon: Package },
  { key: 'messages', label: 'Wiadomości', icon: MessageSquare },
  { key: 'files', label: 'Pliki', icon: FolderOpen },
  { key: 'settings', label: 'Ustawienia', icon: Settings },
] as const;

type ClientTab = (typeof clientTabs)[number]['key'];

const adminTabs = [
  { key: 'overview', label: 'Przegląd', icon: Gauge },
  { key: 'clients', label: 'Klienci SaaS', icon: Briefcase },
  { key: 'subscriptions', label: 'Subskrypcje', icon: CreditCard },
  { key: 'payments', label: 'Płatności', icon: BarChart2 },
  { key: 'plans', label: 'Pakiety', icon: Package },
  { key: 'trials', label: 'Triale', icon: Calendar },
  { key: 'coupons', label: 'Rabaty', icon: Percent },
  { key: 'support', label: 'Support', icon: Headphones },
  { key: 'flags', label: 'Feature flags', icon: Flag },
  { key: 'logs', label: 'Logi', icon: Activity },
  { key: 'ai', label: 'AI', icon: Bot },
] as const;

type AdminTab = (typeof adminTabs)[number]['key'];

type TableColumn<T> = {
  key: string;
  label: string;
  className?: string;
  render: (item: T) => React.ReactNode;
};

type DemoOffer = {
  id: string;
  inquiryId: string;
  client: string;
  subject: string;
  amount: string;
  date: string;
  valid: string;
  status: string;
  version: string;
  author: string;
};

type DemoInquiry = {
  id: string;
  client: string;
  subject: string;
  date: string;
  status: string;
  priority: string;
  owner: string;
};

type DemoClient = {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  inquiries: number;
  lastContact: string;
};

type DemoCategory = {
  id: number;
  name: string;
  color: string;
  icon: string;
};

type DemoProduct = {
  id: number;
  name: string;
  sku: string;
  desc: string;
  unit: string;
  priceNet: number;
  vat: number;
  categoryId: number;
  active: boolean;
  tags: string[];
  usedInOffers: number;
  revenue: number;
};

type DemoThread = {
  id: number;
  client: string;
  from: string;
  subject: string;
  preview: string;
  date: string;
  unread: number;
  avatar: string;
  body: string;
};

const statusClasses: Record<string, string> = {
  Nowe: 'bg-blue-100 text-blue-700',
  'W toku': 'bg-orange-100 text-orange-700',
  Oczekuje: 'bg-yellow-100 text-yellow-700',
  'Wysłano ofertę': 'bg-purple-100 text-purple-700',
  Zaakceptowano: 'bg-green-100 text-green-700',
  Zamknięte: 'bg-gray-100 text-gray-600',
  Wysłana: 'bg-purple-100 text-purple-700',
  Szkic: 'bg-gray-100 text-gray-600',
  'W edycji': 'bg-yellow-100 text-yellow-700',
  Zaakceptowana: 'bg-green-100 text-green-700',
  Odrzucona: 'bg-red-100 text-red-700',
  Aktywny: 'bg-green-100 text-green-700',
  Aktywna: 'bg-green-100 text-green-700',
  Trial: 'bg-blue-100 text-blue-700',
  Zaległy: 'bg-red-100 text-red-700',
  Zaległa: 'bg-red-100 text-red-700',
  Opłacona: 'bg-green-100 text-green-700',
  Nieudana: 'bg-red-100 text-red-700',
  Wygasa: 'bg-orange-100 text-orange-700',
  Wygasły: 'bg-gray-100 text-gray-600',
  Otwarty: 'bg-blue-100 text-blue-700',
  Zamknięty: 'bg-gray-100 text-gray-600',
};

const priorityClasses: Record<string, string> = {
  Pilny: 'bg-red-100 text-red-700',
  Wysoki: 'bg-orange-100 text-orange-700',
  Normalny: 'bg-slate-100 text-slate-600',
  Niski: 'bg-gray-100 text-gray-500',
};

const demoInquiries: DemoInquiry[] = [
  {
    id: 'ZAP-2026-089',
    client: 'Techno Systems Sp. z o.o.',
    subject: 'Wycena integracji API z ERP',
    date: '22 lip 2026',
    status: 'Nowe',
    priority: 'Pilny',
    owner: 'A. Nowak',
  },
  {
    id: 'ZAP-2026-088',
    client: 'BuildCraft Polska',
    subject: 'Oferta na dostawę materiałów Q3',
    date: '21 lip 2026',
    status: 'W toku',
    priority: 'Wysoki',
    owner: 'K. Wiśniewska',
  },
  {
    id: 'ZAP-2026-087',
    client: 'Marta Kowalska',
    subject: 'Projekt strony internetowej',
    date: '21 lip 2026',
    status: 'Oczekuje',
    priority: 'Normalny',
    owner: 'P. Zając',
  },
  {
    id: 'ZAP-2026-086',
    client: 'Logis Trans S.A.',
    subject: 'Usługi transportowe - kontrakt roczny',
    date: '20 lip 2026',
    status: 'Wysłano ofertę',
    priority: 'Normalny',
    owner: 'A. Nowak',
  },
  {
    id: 'ZAP-2026-085',
    client: 'EkoFarm sp. z o.o.',
    subject: 'Sprzęt rolniczy - wycena 12 pozycji',
    date: '19 lip 2026',
    status: 'Zaakceptowano',
    priority: 'Niski',
    owner: 'K. Wiśniewska',
  },
  {
    id: 'ZAP-2026-084',
    client: 'Studio Kreatywne ART',
    subject: 'Kampania reklamowa - oferta',
    date: '18 lip 2026',
    status: 'Zamknięte',
    priority: 'Normalny',
    owner: 'P. Zając',
  },
];

const demoOffers: DemoOffer[] = [
  {
    id: 'OF-2026-045',
    inquiryId: 'ZAP-2026-089',
    client: 'Techno Systems Sp. z o.o.',
    subject: 'Integracja API z ERP',
    amount: '12 400 zl',
    date: '22 lip 2026',
    valid: '05 sie 2026',
    status: 'Wysłana',
    version: 'v2',
    author: 'A. Nowak',
  },
  {
    id: 'OF-2026-044',
    inquiryId: 'ZAP-2026-088',
    client: 'BuildCraft Polska',
    subject: 'Dostawa materiałów budowlanych Q3',
    amount: '8 750 zl',
    date: '21 lip 2026',
    valid: '04 sie 2026',
    status: 'Szkic',
    version: 'v1',
    author: 'AI Asystent',
  },
  {
    id: 'OF-2026-043',
    inquiryId: 'ZAP-2026-087',
    client: 'Marta Kowalska',
    subject: 'Projekt strony internetowej',
    amount: '4 200 zl',
    date: '20 lip 2026',
    valid: '03 sie 2026',
    status: 'W edycji',
    version: 'v1',
    author: 'P. Zając',
  },
  {
    id: 'OF-2026-042',
    inquiryId: 'ZAP-2026-085',
    client: 'EkoFarm sp. z o.o.',
    subject: 'Sprzęt rolniczy, 12 pozycji',
    amount: '34 800 zl',
    date: '19 lip 2026',
    valid: '02 sie 2026',
    status: 'Zaakceptowana',
    version: 'v3',
    author: 'K. Wiśniewska',
  },
];

const demoClients: DemoClient[] = [
  {
    id: 'KL-001',
    name: 'Marek Wiśniewski',
    company: 'Techno Systems Sp. z o.o.',
    email: 'm.wisniewski@technosys.pl',
    phone: '+48 600 123 456',
    inquiries: 8,
    lastContact: '22 lip 2026',
  },
  {
    id: 'KL-002',
    name: 'Joanna Kowalczyk',
    company: 'BuildCraft Polska',
    email: 'j.kowalczyk@buildcraft.pl',
    phone: '+48 510 234 567',
    inquiries: 3,
    lastContact: '21 lip 2026',
  },
  {
    id: 'KL-003',
    name: 'Marta Kowalska',
    company: 'MK Freelance',
    email: 'marta@mk-design.pl',
    phone: '+48 720 345 678',
    inquiries: 1,
    lastContact: '21 lip 2026',
  },
  {
    id: 'KL-004',
    name: 'Paweł Nowak',
    company: 'Logis Trans S.A.',
    email: 'p.nowak@logistrans.pl',
    phone: '+48 880 456 789',
    inquiries: 12,
    lastContact: '20 lip 2026',
  },
];

const demoCategories: DemoCategory[] = [
  { id: 1, name: 'Integracje', color: 'bg-blue-100 text-blue-700', icon: 'IN' },
  {
    id: 2,
    name: 'Wsparcie',
    color: 'bg-green-100 text-green-700',
    icon: 'WS',
  },
  {
    id: 3,
    name: 'Szkolenia',
    color: 'bg-purple-100 text-purple-700',
    icon: 'SZ',
  },
  { id: 4, name: 'Audyty', color: 'bg-orange-100 text-orange-700', icon: 'AU' },
];

const demoProducts: DemoProduct[] = [
  {
    id: 1,
    name: 'Integracja API - podstawowa',
    sku: 'INT-001',
    desc: 'Jednorazowe wdrożenie integracji z zewnętrznym systemem.',
    unit: 'usł.',
    priceNet: 3500,
    vat: 23,
    categoryId: 1,
    active: true,
    tags: ['popularne', 'API'],
    usedInOffers: 14,
    revenue: 49000,
  },
  {
    id: 2,
    name: 'Integracja API - rozszerzona',
    sku: 'INT-002',
    desc: 'Webhooki, synchronizacja dwukierunkowa i transformacja danych.',
    unit: 'usł.',
    priceNet: 6500,
    vat: 23,
    categoryId: 1,
    active: true,
    tags: ['API', 'zaawansowane'],
    usedInOffers: 7,
    revenue: 45500,
  },
  {
    id: 3,
    name: 'Wsparcie techniczne Basic',
    sku: 'WSP-001',
    desc: 'Abonamentowa opieka techniczna, odpowiedź do 8h.',
    unit: 'msc',
    priceNet: 200,
    vat: 23,
    categoryId: 2,
    active: true,
    tags: ['abonament'],
    usedInOffers: 22,
    revenue: 52800,
  },
  {
    id: 4,
    name: 'Wsparcie techniczne Premium',
    sku: 'WSP-002',
    desc: 'SLA 1h, dedykowany opiekun i monitoring.',
    unit: 'msc',
    priceNet: 500,
    vat: 23,
    categoryId: 2,
    active: true,
    tags: ['SLA'],
    usedInOffers: 9,
    revenue: 54000,
  },
  {
    id: 5,
    name: 'Szkolenie online - podstawy API',
    sku: 'SZK-001',
    desc: 'Szkolenie zdalne dla zespołu technicznego.',
    unit: 'szt.',
    priceNet: 600,
    vat: 23,
    categoryId: 3,
    active: true,
    tags: ['szkolenie'],
    usedInOffers: 8,
    revenue: 4800,
  },
  {
    id: 6,
    name: 'Audyt integracji ERP',
    sku: 'AUD-001',
    desc: 'Analiza istniejącej integracji i raport rekomendacji.',
    unit: 'usł.',
    priceNet: 1800,
    vat: 23,
    categoryId: 4,
    active: false,
    tags: ['audyt'],
    usedInOffers: 5,
    revenue: 9000,
  },
];

const demoThreads: DemoThread[] = [
  {
    id: 0,
    client: 'Techno Systems',
    from: 'm.wisniewski@technosys.pl',
    subject: 'RE: Integracja API z ERP',
    preview:
      'Mamy kilka pytań dotyczących harmonogramu wdrożenia oraz stagingu.',
    date: '14:32',
    unread: 2,
    avatar: 'TS',
    body: 'Dzień dobry,\n\nDziękuję za przesłaną ofertę v2. Czy możliwe jest testowanie integracji na środowisku staging przed produkcją? Prosimy też o potwierdzenie harmonogramu wdrożenia.',
  },
  {
    id: 1,
    client: 'BuildCraft Polska',
    from: 'j.kowalczyk@buildcraft.pl',
    subject: 'Zapytanie o materiały budowlane',
    preview: 'Załączam listę pozycji i proszę o wycenę z dostawą etapową.',
    date: '11:15',
    unread: 0,
    avatar: 'BP',
    body: 'Dzień dobry,\n\nInteresuje nas dostawa materiałów budowlanych na projekt Q3. Załączam szczegółową listę pozycji. Prosimy o wycenę z możliwością dostawy etapowej.',
  },
  {
    id: 2,
    client: 'EkoFarm sp. z o.o.',
    from: 'a.zielinska@ekofarm.pl',
    subject: 'Akceptacja oferty OF-2026-042',
    preview: 'Potwierdzamy akceptację. Proszę o fakturę zaliczkową.',
    date: 'wczoraj',
    unread: 0,
    avatar: 'EF',
    body: 'Dzień dobry,\n\nPotwierdzamy akceptację oferty OF-2026-042 na dostawę sprzętu rolniczego. Proszę o wystawienie faktury zaliczkowej na 30% wartości.',
  },
];

const demoFiles = [
  {
    id: 1,
    name: 'Oferta_OF-2026-045_v2.pdf',
    type: 'PDF',
    size: '245 KB',
    inquiry: 'ZAP-2026-089',
    date: '22 lip 2026',
    uploader: 'Zlecero AI',
  },
  {
    id: 2,
    name: 'specyfikacja_techniczna.docx',
    type: 'DOC',
    size: '1.2 MB',
    inquiry: 'ZAP-2026-089',
    date: '22 lip 2026',
    uploader: 'Klient',
  },
  {
    id: 3,
    name: 'plan_budowy_2026.jpg',
    type: 'IMG',
    size: '3.4 MB',
    inquiry: 'ZAP-2026-088',
    date: '21 lip 2026',
    uploader: 'Klient',
  },
  {
    id: 4,
    name: 'cennik_uslug_2026.xlsx',
    type: 'XLS',
    size: '45 KB',
    inquiry: 'ZAP-2026-086',
    date: '20 lip 2026',
    uploader: 'Ty',
  },
];

const revenueData = [
  { month: 'Sty', mrr: 18400, inquiries: 312 },
  { month: 'Lut', mrr: 22100, inquiries: 378 },
  { month: 'Mar', mrr: 26800, inquiries: 451 },
  { month: 'Kwi', mrr: 31200, inquiries: 524 },
  { month: 'Maj', mrr: 38700, inquiries: 618 },
  { month: 'Cze', mrr: 45100, inquiries: 703 },
  { month: 'Lip', mrr: 52400, inquiries: 821 },
];

const saasClients = [
  {
    id: 'C-001',
    company: 'Techno Systems Sp. z o.o.',
    plan: 'Professional',
    mrr: '249 zl',
    status: 'Aktywny',
    users: 7,
    joined: '03.02.2026',
  },
  {
    id: 'C-002',
    company: 'BuildCraft Polska',
    plan: 'Starter',
    mrr: '99 zl',
    status: 'Aktywny',
    users: 2,
    joined: '14.03.2026',
  },
  {
    id: 'C-003',
    company: 'Kowalski & Partners',
    plan: 'Enterprise',
    mrr: '890 zl',
    status: 'Aktywny',
    users: 24,
    joined: '27.01.2026',
  },
  {
    id: 'C-004',
    company: 'EkoFarm sp. z o.o.',
    plan: 'Professional',
    mrr: '249 zl',
    status: 'Trial',
    users: 4,
    joined: '18.07.2026',
  },
  {
    id: 'C-005',
    company: 'Studio Kreatywne ART',
    plan: 'Starter',
    mrr: '99 zl',
    status: 'Zaległy',
    users: 1,
    joined: '22.05.2026',
  },
];

const adminSubscriptions = [
  {
    id: 'SUB-001',
    company: 'Kowalski & Partners',
    plan: 'Enterprise',
    amount: '890 zl',
    renewal: '27.07.2026',
    status: 'Aktywna',
    method: 'Przelew',
  },
  {
    id: 'SUB-002',
    company: 'Logis Trans S.A.',
    plan: 'Enterprise',
    amount: '890 zl',
    renewal: '10.08.2026',
    status: 'Aktywna',
    method: 'Przelew',
  },
  {
    id: 'SUB-003',
    company: 'Techno Systems',
    plan: 'Professional',
    amount: '249 zl',
    renewal: '03.08.2026',
    status: 'Aktywna',
    method: 'Karta',
  },
  {
    id: 'SUB-004',
    company: 'Studio Kreatywne ART',
    plan: 'Starter',
    amount: '99 zl',
    renewal: '22.07.2026',
    status: 'Zaległa',
    method: 'Karta',
  },
];

const adminPayments = [
  {
    id: 'PAY-2026-0124',
    company: 'Kowalski & Partners',
    plan: 'Enterprise',
    amount: '890 zl',
    date: '27 cze 2026',
    status: 'Opłacona',
    invoice: 'FV/2026/0124',
  },
  {
    id: 'PAY-2026-0123',
    company: 'Techno Systems',
    plan: 'Professional',
    amount: '249 zl',
    date: '03 cze 2026',
    status: 'Opłacona',
    invoice: 'FV/2026/0122',
  },
  {
    id: 'PAY-2026-0120',
    company: 'Studio Kreatywne ART',
    plan: 'Starter',
    amount: '99 zl',
    date: '22 cze 2026',
    status: 'Nieudana',
    invoice: '-',
  },
];

const adminTrials = [
  {
    company: 'EkoFarm sp. z o.o.',
    email: 'a.zielinska@ekofarm.pl',
    started: '18 lip 2026',
    expires: '01 sie 2026',
    daysLeft: 10,
    users: 4,
    status: 'Aktywny',
  },
  {
    company: 'WebDev Crew',
    email: 'jan@webdevcrew.pl',
    started: '20 lip 2026',
    expires: '03 sie 2026',
    daysLeft: 12,
    users: 3,
    status: 'Aktywny',
  },
  {
    company: 'Biuro Podróży Marek',
    email: 'biuro@bpmarek.pl',
    started: '10 lip 2026',
    expires: '24 lip 2026',
    daysLeft: 2,
    users: 1,
    status: 'Wygasa',
  },
];

const adminCoupons = [
  {
    code: 'START30',
    discount: '30%',
    type: 'Procentowy',
    uses: 23,
    maxUses: 100,
    expires: '31.08.2026',
    active: true,
  },
  {
    code: 'ANNUAL2026',
    discount: '2 msc gratis',
    type: 'Miesiące gratis',
    uses: 8,
    maxUses: 50,
    expires: '31.12.2026',
    active: true,
  },
  {
    code: 'WIOSNA24',
    discount: '20%',
    type: 'Procentowy',
    uses: 67,
    maxUses: 100,
    expires: '30.04.2024',
    active: false,
  },
];

const adminTickets = [
  {
    id: 'TKT-0089',
    company: 'Techno Systems',
    subject: 'Problem z integracją Gmail',
    priority: 'Wysoki',
    status: 'Otwarty',
    date: '22 lip 2026',
  },
  {
    id: 'TKT-0088',
    company: 'BuildCraft Polska',
    subject: 'Jak eksportować dane do Excel?',
    priority: 'Normalny',
    status: 'W toku',
    date: '21 lip 2026',
  },
  {
    id: 'TKT-0087',
    company: 'EkoFarm sp. z o.o.',
    subject: 'Błąd podczas generowania PDF',
    priority: 'Pilny',
    status: 'Otwarty',
    date: '21 lip 2026',
  },
];

const adminFlags = [
  {
    key: 'ai_draft',
    label: 'AI - szkice ofert',
    desc: 'Automatyczne tworzenie wstępnej oferty po otrzymaniu zapytania.',
    enabled: true,
    plan: 'Professional+',
  },
  {
    key: 'client_panel',
    label: 'Panel klienta',
    desc: 'Klient może śledzić status, akceptować oferty i wysyłać pliki.',
    enabled: true,
    plan: 'Wszystkie',
  },
  {
    key: 'multi_mailbox',
    label: 'Wiele skrzynek e-mail',
    desc: 'Obsługa wielu adresów jednocześnie.',
    enabled: true,
    plan: 'Professional+',
  },
  {
    key: 'sso',
    label: 'SSO / Active Directory',
    desc: 'Logowanie przez firmowy SSO.',
    enabled: false,
    plan: 'Enterprise',
  },
];

const adminLogs = [
  {
    time: '14:32:15',
    level: 'INFO',
    service: 'email-sync',
    message: 'Synced 3 new messages for technosys@zlecero.pl',
  },
  {
    time: '14:31:02',
    level: 'INFO',
    service: 'ai',
    message: 'Draft offer generated for ZAP-2026-089',
  },
  {
    time: '14:28:44',
    level: 'WARN',
    service: 'payments',
    message: 'Payment retry failed for Studio Kreatywne ART',
  },
  {
    time: '13:58:22',
    level: 'ERROR',
    service: 'pdf',
    message: 'PDF generation timeout for OF-2026-044',
  },
];

const aiUsage = [
  {
    company: 'Kowalski & Partners',
    plan: 'Enterprise',
    drafts: 145,
    tokens: '284 000',
    requests: 312,
    lastUsed: '22 lip 2026',
  },
  {
    company: 'Techno Systems',
    plan: 'Professional',
    drafts: 67,
    tokens: '124 000',
    requests: 145,
    lastUsed: '22 lip 2026',
  },
  {
    company: 'EkoFarm sp. z o.o.',
    plan: 'Trial',
    drafts: 12,
    tokens: '24 000',
    requests: 25,
    lastUsed: '21 lip 2026',
  },
];

const planRows = [
  {
    name: 'Light',
    price: '20 zl',
    users: '1',
    inquiries: '20 / msc',
    mailboxes: '1',
    ai: false,
    count: 158,
  },
  {
    name: 'Starter',
    price: '99 zl',
    users: '3',
    inquiries: '100 / msc',
    mailboxes: '1',
    ai: true,
    count: 481,
  },
  {
    name: 'Professional',
    price: '249 zl',
    users: '10',
    inquiries: 'Bez limitu',
    mailboxes: '3',
    ai: true,
    count: 521,
  },
  {
    name: 'Enterprise',
    price: 'Indywidualnie',
    users: 'Bez limitu',
    inquiries: 'Bez limitu',
    mailboxes: 'Bez limitu',
    ai: true,
    count: 87,
  },
];

function Badge({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded px-2 py-0.5 text-xs font-medium',
        className,
      )}
    >
      {label}
    </span>
  );
}

function ActionNotice({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss: () => void;
}) {
  return (
    <div className="fixed bottom-5 right-5 z-40 flex max-w-sm items-start gap-3 rounded-xl border border-primary/20 bg-white p-4 text-sm text-[#33251D] shadow-xl shadow-[#9C442D]/15">
      <CheckCircle className="mt-0.5 size-4 shrink-0 text-primary" />
      <p className="min-w-0 flex-1">{message}</p>
      <button
        aria-label="Zamknij komunikat"
        className="text-muted-foreground transition hover:text-[#33251D]"
        type="button"
        onClick={onDismiss}
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  iconColor,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
  iconColor: string;
}) {
  return (
    <div className="rounded-xl border border-[#EADBCD] bg-white p-5 shadow-sm">
      <div
        className={cn(
          'flex size-10 items-center justify-center rounded-lg',
          iconColor,
        )}
      >
        <Icon className="size-5" />
      </div>
      <p className="mt-4 text-sm text-muted-foreground">{label}</p>
      <p className="mt-1 font-display text-3xl font-extrabold text-[#33251D]">
        {value}
      </p>
      {sub ? (
        <p className="mt-1 text-xs font-semibold text-green-600">{sub}</p>
      ) : null}
    </div>
  );
}

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
  dark = false,
}: {
  tabs: readonly { key: T; label: string; icon: LucideIcon }[];
  active: T;
  onChange: (tab: T) => void;
  dark?: boolean;
}) {
  return (
    <div
      className={cn(
        'flex gap-1 overflow-x-auto rounded-xl border p-1',
        dark
          ? 'border-white/10 bg-[#33251D]'
          : 'border-[#EADBCD] bg-white shadow-sm',
      )}
    >
      {tabs.map((tab) => {
        const Icon = tab.icon;

        return (
          <button
            key={tab.key}
            className={cn(
              'inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition',
              active === tab.key
                ? dark
                  ? 'bg-primary text-white'
                  : 'bg-primary text-white'
                : dark
                  ? 'text-white/55 hover:bg-white/10 hover:text-white'
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

function DataTable<T>({
  columns,
  items,
  onRowClick,
}: {
  columns: TableColumn<T>[];
  items: T[];
  onRowClick?: (item: T) => void;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-[#EADBCD] bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#EADBCD] bg-[#FFFDF9]">
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={cn(
                    'px-5 py-3 text-left text-xs font-semibold text-muted-foreground',
                    column.className,
                  )}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EADBCD]">
            {items.map((item, index) => (
              <tr
                key={index}
                className={cn(
                  'transition hover:bg-[#FFFDF9]',
                  onRowClick && 'cursor-pointer',
                )}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={cn('px-5 py-4 align-middle', column.className)}
                  >
                    {column.render(item)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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

function MiniBars({
  data,
  valueKey,
}: {
  data: typeof revenueData;
  valueKey: 'mrr' | 'inquiries';
}) {
  const max = Math.max(...data.map((item) => item[valueKey]));

  return (
    <div className="flex h-44 items-end gap-3 rounded-xl bg-[#FFFDF9] p-4">
      {data.map((item) => (
        <div key={item.month} className="flex h-full min-w-0 flex-1 flex-col">
          <div className="flex flex-1 items-end">
            <div
              className="w-full rounded-t-md bg-primary transition-all"
              style={{
                height: `${Math.max((item[valueKey] / max) * 100, 8)}%`,
              }}
            />
          </div>
          <span className="mt-2 text-center text-[10px] text-muted-foreground">
            {item.month}
          </span>
        </div>
      ))}
    </div>
  );
}

function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-lg border border-[#EADBCD] bg-white px-3 py-2">
      <Search className="size-4 shrink-0 text-muted-foreground" />
      <input
        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        aria-label={placeholder}
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
      />
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
  const [active, setActive] = useState<ClientTab>('overview');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('Wszystkie');
  const [selectedThread, setSelectedThread] = useState(demoThreads[0]?.id ?? 0);
  const [selectedItem, setSelectedItem] = useState<DashboardItem | null>(null);
  const [selectedInquiry, setSelectedInquiry] = useState<DemoInquiry | null>(
    null,
  );
  const [products, setProducts] = useState(demoProducts);
  const [catalogCategory, setCatalogCategory] = useState<number | 'all'>('all');
  const [catalogQuery, setCatalogQuery] = useState('');
  const [catalogView, setCatalogView] = useState<'list' | 'grid'>('list');
  const [editingProduct, setEditingProduct] = useState<DemoProduct | null>(
    null,
  );
  const [settingsTab, setSettingsTab] = useState<
    'company' | 'users' | 'email' | 'workflow' | 'ai' | 'notifications'
  >('company');
  const [workflowStatuses, setWorkflowStatuses] = useState([
    'Nowe',
    'W toku',
    'Oczekuje',
    'Wysłano ofertę',
    'Zaakceptowano',
    'Zamknięte',
  ]);
  const [newWorkflowStatus, setNewWorkflowStatus] = useState('');
  const [aiSettings, setAiSettings] = useState({
    draft: true,
    detect: true,
    pricing: true,
    autoClose: false,
  });
  const [notifications, setNotifications] = useState({
    newInquiry: true,
    offerAccepted: true,
    noReply: true,
    dailySummary: false,
  });
  const [notice, setNotice] = useState<string | null>(null);

  const allItems = useMemo(
    () => [
      ...data.attentionItems,
      ...data.tasksToday,
      ...data.upcomingDeadlines,
    ],
    [data.attentionItems, data.tasksToday, data.upcomingDeadlines],
  );

  const visibleInquiries = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('pl-PL');

    return demoInquiries.filter((inquiry) => {
      const matchesFilter = filter === 'Wszystkie' || inquiry.status === filter;
      const searchable =
        `${inquiry.id} ${inquiry.client} ${inquiry.subject} ${inquiry.owner}`.toLocaleLowerCase(
          'pl-PL',
        );

      return matchesFilter && (!normalized || searchable.includes(normalized));
    });
  }, [filter, query]);

  const activeThread =
    demoThreads.find((thread) => thread.id === selectedThread) ??
    demoThreads[0];

  const visibleProducts = useMemo(() => {
    const normalized = catalogQuery.trim().toLocaleLowerCase('pl-PL');

    return products.filter((product) => {
      const matchesCategory =
        catalogCategory === 'all' || product.categoryId === catalogCategory;
      const searchable =
        `${product.name} ${product.sku} ${product.desc} ${product.tags.join(' ')}`.toLocaleLowerCase(
          'pl-PL',
        );

      return (
        matchesCategory && (!normalized || searchable.includes(normalized))
      );
    });
  }, [catalogCategory, catalogQuery, products]);

  const quickAction = (label: string) => {
    setNotice(`${label}: akcja została zapisana w wersji demonstracyjnej.`);
  };

  const categoryOf = (categoryId: number) =>
    demoCategories.find((category) => category.id === categoryId) ??
    demoCategories[0];

  const formatZloty = (value: number) => `${value.toLocaleString('pl-PL')} zl`;

  const saveProduct = () => {
    if (!editingProduct) {
      return;
    }

    if (editingProduct.id === 0) {
      const nextId = Math.max(0, ...products.map((product) => product.id)) + 1;
      setProducts([...products, { ...editingProduct, id: nextId }]);
    } else {
      setProducts(
        products.map((product) =>
          product.id === editingProduct.id ? editingProduct : product,
        ),
      );
    }

    setEditingProduct(null);
    quickAction('Zapis produktu');
  };

  return (
    <div className="space-y-6">
      {notice ? (
        <ActionNotice message={notice} onDismiss={() => setNotice(null)} />
      ) : null}

      <TabBar active={active} tabs={clientTabs} onChange={setActive} />

      {active === 'overview' ? (
        <div className="space-y-6">
          <section className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-center gap-4">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Sparkles className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-[#33251D]">
                  AI wykrył brakujące dane w najpilniejszej sprawie.
                </p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Uzupełnij budżet i termin, zanim oferta trafi do klienta.
                </p>
              </div>
              <button
                className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white transition hover:bg-primary/90"
                type="button"
                onClick={() => quickAction('Uzupełnienie danych')}
              >
                Uzupełnij
              </button>
            </div>
          </section>

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
                {allItems.slice(0, 6).map((item) => (
                  <button
                    key={item.id}
                    className="grid w-full grid-cols-[minmax(0,1.6fr)_120px_100px] items-center gap-4 px-5 py-4 text-left transition hover:bg-[#FFFDF9] max-md:grid-cols-1"
                    type="button"
                    onClick={() => setSelectedItem(item)}
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
                ))}
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
                onSelect={setSelectedItem}
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
                24 aktywne · 3 wymagają uwagi
              </p>
            </div>
            <button
              className="hidden items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 sm:inline-flex"
              type="button"
              onClick={() => quickAction('Nowe zapytanie')}
            >
              <Plus className="size-4" />
              Nowe zapytanie
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <SearchBox
              value={query}
              placeholder="Szukaj zapytań, klientów..."
              onChange={setQuery}
            />
            {[
              'Wszystkie',
              'Nowe',
              'W toku',
              'Oczekuje',
              'Wysłano ofertę',
              'Zaakceptowano',
            ].map((item) => (
              <button
                key={item}
                aria-pressed={filter === item}
                className={cn(
                  'rounded-lg px-3 py-1.5 text-xs font-medium transition-colors',
                  filter === item
                    ? 'bg-primary text-white shadow-sm'
                    : 'border border-[#EADBCD] bg-white text-muted-foreground hover:bg-[#FAF5ED] hover:text-[#33251D]',
                )}
                type="button"
                onClick={() => setFilter(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="overflow-hidden rounded-xl border border-[#EADBCD] bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#EADBCD] bg-[#FFFDF9]">
                    <th className="px-6 py-3 text-left text-xs font-semibold text-muted-foreground">
                      Nr / Klient
                    </th>
                    <th className="hidden px-4 py-3 text-left text-xs font-semibold text-muted-foreground md:table-cell">
                      Temat
                    </th>
                    <th className="hidden px-4 py-3 text-left text-xs font-semibold text-muted-foreground lg:table-cell">
                      Data
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">
                      Status
                    </th>
                    <th className="hidden px-4 py-3 text-left text-xs font-semibold text-muted-foreground md:table-cell">
                      Priorytet
                    </th>
                    <th className="hidden px-4 py-3 text-left text-xs font-semibold text-muted-foreground lg:table-cell">
                      Opiekun
                    </th>
                    <th className="px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EADBCD]">
                  {visibleInquiries.map((inquiry) => (
                    <tr
                      key={inquiry.id}
                      className="cursor-pointer transition-colors hover:bg-[#FFFDF9]"
                      onClick={() => setSelectedInquiry(inquiry)}
                    >
                      <td className="px-6 py-4">
                        <div className="font-mono text-xs font-semibold text-[#33251D]">
                          {inquiry.id}
                        </div>
                        <div className="mt-0.5 text-xs text-muted-foreground">
                          {inquiry.client}
                        </div>
                      </td>
                      <td className="hidden max-w-[220px] p-4 text-xs text-[#33251D] md:table-cell">
                        <span className="line-clamp-1">{inquiry.subject}</span>
                      </td>
                      <td className="hidden p-4 text-xs text-muted-foreground lg:table-cell">
                        {inquiry.date}
                      </td>
                      <td className="p-4">
                        <Badge
                          label={inquiry.status}
                          className={
                            statusClasses[inquiry.status] ??
                            'bg-gray-100 text-gray-600'
                          }
                        />
                      </td>
                      <td className="hidden p-4 md:table-cell">
                        <Badge
                          label={inquiry.priority}
                          className={
                            priorityClasses[inquiry.priority] ??
                            'bg-gray-100 text-gray-600'
                          }
                        />
                      </td>
                      <td className="hidden p-4 text-xs text-muted-foreground lg:table-cell">
                        {inquiry.owner}
                      </td>
                      <td
                        className="p-4"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <div className="flex items-center gap-1">
                          <button
                            className="p-1 text-muted-foreground transition-colors hover:text-[#33251D]"
                            type="button"
                            onClick={() => setSelectedInquiry(inquiry)}
                          >
                            <Eye className="size-4" />
                          </button>
                          <button
                            className="p-1 text-muted-foreground transition-colors hover:text-[#33251D]"
                            type="button"
                            onClick={() => {
                              const offer =
                                demoOffers.find(
                                  (offer) => offer.client === inquiry.client,
                                ) ?? demoOffers[0];

                              quickAction(
                                `Oferta ${offer.id} dla ${inquiry.id}`,
                              );
                            }}
                          >
                            <FileText className="size-4" />
                          </button>
                          <button
                            className="p-1 text-muted-foreground transition-colors hover:text-[#33251D]"
                            type="button"
                            onClick={() => quickAction('Menu zapytania')}
                          >
                            <MoreHorizontal className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : null}

      {active === 'offers' ? (
        <div className="space-y-5">
          <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <h2 className="font-display text-2xl font-extrabold text-[#33251D]">
                Twórz, wysyłaj i śledź każdą ofertę od szkicu.
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Widok z referencji z szybkim podglądem i akcjami.
              </p>
            </div>
            <button
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
              type="button"
              onClick={() => quickAction('Nowa oferta')}
            >
              <Plus className="size-4" />
              Nowa oferta
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-4">
            {[
              ['Łączna wartość', '225 650 zl', 'text-[#33251D]'],
              ['Zaakceptowane', '190 800 zl', 'text-green-600'],
              ['Oczekujące', '21 150 zl', 'text-orange-600'],
              ['Konwersja', '68%', 'text-primary'],
            ].map(([label, value, color]) => (
              <div
                key={label}
                className="rounded-xl border border-[#EADBCD] bg-white p-4 shadow-sm"
              >
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className={cn('mt-1 font-display text-xl font-bold', color)}>
                  {value}
                </p>
              </div>
            ))}
          </div>
          <DataTable
            items={demoOffers}
            columns={[
              {
                key: 'id',
                label: 'Nr oferty',
                render: (offer) => (
                  <div>
                    <p className="font-mono text-xs font-semibold text-primary">
                      {offer.id}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {offer.date}
                    </p>
                  </div>
                ),
              },
              {
                key: 'client',
                label: 'Klient / temat',
                render: (offer) => (
                  <div className="min-w-[220px]">
                    <p className="text-sm font-semibold text-[#33251D]">
                      {offer.client}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {offer.subject}
                    </p>
                  </div>
                ),
              },
              {
                key: 'amount',
                label: 'Kwota',
                className: 'hidden lg:table-cell',
                render: (offer) => (
                  <span className="font-semibold text-[#33251D]">
                    {offer.amount}
                  </span>
                ),
              },
              {
                key: 'valid',
                label: 'Ważna do',
                className: 'hidden md:table-cell',
                render: (offer) => (
                  <span className="text-xs text-muted-foreground">
                    {offer.valid}
                  </span>
                ),
              },
              {
                key: 'status',
                label: 'Status',
                render: (offer) => (
                  <Badge
                    label={offer.status}
                    className={statusClasses[offer.status]}
                  />
                ),
              },
            ]}
          />
        </div>
      ) : null}

      {active === 'clients' ? (
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-extrabold text-[#33251D]">
                Buduj pełną historię relacji z każdym klientem.
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Lista klientów zgodna układem z dashboardu referencyjnego.
              </p>
            </div>
            <button
              className="hidden items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 sm:inline-flex"
              type="button"
              onClick={() => quickAction('Dodanie klienta')}
            >
              <Plus className="size-4" />
              Dodaj klienta
            </button>
          </div>
          <DataTable
            items={demoClients}
            columns={[
              {
                key: 'client',
                label: 'Klient',
                render: (client) => (
                  <div className="flex min-w-[240px] items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {client.name
                        .split(' ')
                        .map((part) => part[0])
                        .join('')
                        .slice(0, 2)}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-[#33251D]">
                        {client.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {client.company}
                      </p>
                    </div>
                  </div>
                ),
              },
              {
                key: 'email',
                label: 'E-mail',
                className: 'hidden md:table-cell',
                render: (client) => (
                  <span className="text-xs text-muted-foreground">
                    {client.email}
                  </span>
                ),
              },
              {
                key: 'phone',
                label: 'Telefon',
                className: 'hidden lg:table-cell',
                render: (client) => (
                  <span className="text-xs text-muted-foreground">
                    {client.phone}
                  </span>
                ),
              },
              {
                key: 'inquiries',
                label: 'Zapytania',
                render: (client) => (
                  <span className="text-sm font-semibold text-[#33251D]">
                    {client.inquiries}
                  </span>
                ),
              },
              {
                key: 'last',
                label: 'Ostatni kontakt',
                className: 'hidden lg:table-cell',
                render: (client) => (
                  <span className="text-xs text-muted-foreground">
                    {client.lastContact}
                  </span>
                ),
              },
            ]}
          />
        </div>
      ) : null}

      {active === 'catalog' ? (
        <div
          className="-mx-4 -my-6 flex overflow-hidden rounded-xl border border-[#EADBCD] bg-white shadow-sm sm:-mx-6 lg:-mx-8"
          style={{ minHeight: 'calc(100vh - 12rem)' }}
        >
          <aside className="hidden w-64 shrink-0 flex-col border-r border-[#EADBCD] bg-white lg:flex">
            <div className="flex items-center justify-between border-b border-[#EADBCD] px-4 py-3">
              <span className="text-xs font-bold uppercase tracking-wide text-[#33251D]">
                Kategorie
              </span>
              <button
                className="rounded p-1 text-muted-foreground transition hover:text-primary"
                type="button"
                onClick={() => quickAction('Nowa kategoria')}
              >
                <Plus className="size-4" />
              </button>
            </div>
            <div className="flex-1 space-y-1 overflow-y-auto p-2">
              <button
                className={cn(
                  'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition',
                  catalogCategory === 'all'
                    ? 'bg-primary/10 font-semibold text-primary'
                    : 'text-muted-foreground hover:bg-[#FAF5ED] hover:text-[#33251D]',
                )}
                type="button"
                onClick={() => setCatalogCategory('all')}
              >
                <span className="flex size-7 items-center justify-center rounded-lg bg-[#FAF5ED] text-[10px] font-bold">
                  ALL
                </span>
                <span className="flex-1 text-left text-xs">Wszystkie</span>
                <span className="text-[10px] font-bold opacity-60">
                  {products.length}
                </span>
              </button>
              {demoCategories.map((category) => (
                <button
                  key={category.id}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition',
                    catalogCategory === category.id
                      ? 'bg-primary/10 font-semibold text-primary'
                      : 'text-muted-foreground hover:bg-[#FAF5ED] hover:text-[#33251D]',
                  )}
                  type="button"
                  onClick={() => setCatalogCategory(category.id)}
                >
                  <span
                    className={cn(
                      'flex size-7 items-center justify-center rounded-lg text-[10px] font-bold',
                      category.color,
                    )}
                  >
                    {category.icon}
                  </span>
                  <span className="flex-1 text-left text-xs">
                    {category.name}
                  </span>
                  <span className="text-[10px] font-bold opacity-60">
                    {
                      products.filter(
                        (product) => product.categoryId === category.id,
                      ).length
                    }
                  </span>
                </button>
              ))}
            </div>
            <div className="border-t border-[#EADBCD] bg-[#FFFDF9] px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                Łączny przychód z katalogu
              </p>
              <p className="mt-1 font-display text-lg font-bold text-[#33251D]">
                {formatZloty(
                  products.reduce(
                    (total, product) => total + product.revenue,
                    0,
                  ),
                )}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {products.filter((product) => product.active).length} aktywnych
                · {demoCategories.length} kategorie
              </p>
            </div>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex flex-wrap items-center gap-3 border-b border-[#EADBCD] bg-white p-4 lg:px-6">
              <div className="min-w-[240px] flex-1">
                <SearchBox
                  value={catalogQuery}
                  placeholder="Szukaj nazwy, SKU lub tagu..."
                  onChange={setCatalogQuery}
                />
              </div>
              <div className="flex overflow-hidden rounded-lg border border-[#EADBCD]">
                {(['list', 'grid'] as const).map((view) => (
                  <button
                    key={view}
                    className={cn(
                      'px-3 py-2 transition',
                      catalogView === view
                        ? 'bg-primary text-white'
                        : 'bg-white text-muted-foreground hover:bg-[#FAF5ED]',
                    )}
                    type="button"
                    onClick={() => setCatalogView(view)}
                  >
                    {view === 'list' ? (
                      <FolderOpen className="size-4" />
                    ) : (
                      <BarChart2 className="size-4" />
                    )}
                  </button>
                ))}
              </div>
              <button
                className="inline-flex items-center gap-2 rounded-lg border border-[#EADBCD] px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-[#FAF5ED]"
                type="button"
                onClick={() => quickAction('Import / Export CSV')}
              >
                <Download className="size-4" />
                Import / Export
              </button>
              <button
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
                type="button"
                onClick={() =>
                  setEditingProduct({
                    id: 0,
                    name: '',
                    sku: '',
                    desc: '',
                    unit: 'usł.',
                    priceNet: 0,
                    vat: 23,
                    categoryId:
                      catalogCategory === 'all'
                        ? demoCategories[0].id
                        : catalogCategory,
                    active: true,
                    tags: [],
                    usedInOffers: 0,
                    revenue: 0,
                  })
                }
              >
                <Plus className="size-4" />
                Nowy produkt
              </button>
            </div>

            {catalogView === 'list' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#EADBCD] bg-[#FFFDF9]">
                      {[
                        'Produkt / Usługa',
                        'Kategoria',
                        'J.m.',
                        'Cena netto',
                        'Brutto',
                        'Status',
                        '',
                      ].map((heading) => (
                        <th
                          key={heading}
                          className="px-5 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EADBCD]">
                    {visibleProducts.map((product) => {
                      const category = categoryOf(product.categoryId);

                      return (
                        <tr
                          key={product.id}
                          className={cn(
                            'cursor-pointer transition hover:bg-[#FFFDF9]',
                            !product.active && 'opacity-60',
                          )}
                          onClick={() => setEditingProduct(product)}
                        >
                          <td className="px-5 py-4">
                            <div className="flex min-w-[260px] items-center gap-3">
                              <span
                                className={cn(
                                  'flex size-9 shrink-0 items-center justify-center rounded-lg text-[10px] font-bold',
                                  category.color,
                                )}
                              >
                                {category.icon}
                              </span>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-semibold text-[#33251D]">
                                  {product.name}
                                </p>
                                <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">
                                  {product.sku}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-4">
                            <Badge
                              label={category.name}
                              className={category.color}
                            />
                          </td>
                          <td className="px-5 py-4 text-xs text-muted-foreground">
                            {product.unit}
                          </td>
                          <td className="px-5 py-4 font-mono text-sm font-semibold text-[#33251D]">
                            {formatZloty(product.priceNet)}
                          </td>
                          <td className="px-5 py-4 font-mono text-sm font-semibold text-primary">
                            {formatZloty(
                              Math.round(
                                product.priceNet * (1 + product.vat / 100),
                              ),
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <Badge
                              label={product.active ? 'Aktywny' : 'Ukryty'}
                              className={
                                product.active
                                  ? 'bg-green-100 text-green-700'
                                  : 'bg-gray-100 text-gray-500'
                              }
                            />
                          </td>
                          <td className="px-5 py-4">
                            <MoreHorizontal className="size-4 text-muted-foreground" />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="grid gap-4 p-5 md:grid-cols-2 xl:grid-cols-3">
                {visibleProducts.map((product) => {
                  const category = categoryOf(product.categoryId);

                  return (
                    <button
                      key={product.id}
                      className={cn(
                        'rounded-xl border border-[#EADBCD] bg-white p-4 text-left transition hover:border-primary/30 hover:shadow-sm',
                        !product.active && 'opacity-60',
                      )}
                      type="button"
                      onClick={() => setEditingProduct(product)}
                    >
                      <div className="mb-3 flex items-start justify-between gap-4">
                        <span
                          className={cn(
                            'flex size-10 items-center justify-center rounded-xl text-[10px] font-bold',
                            category.color,
                          )}
                        >
                          {category.icon}
                        </span>
                        <Badge
                          label={product.active ? 'Aktywny' : 'Ukryty'}
                          className={
                            product.active
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-500'
                          }
                        />
                      </div>
                      <p className="text-sm font-semibold text-[#33251D]">
                        {product.name}
                      </p>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                        {product.desc}
                      </p>
                      <div className="mt-4 flex items-end justify-between border-t border-[#EADBCD] pt-3">
                        <div>
                          <p className="text-[10px] text-muted-foreground">
                            netto
                          </p>
                          <p className="font-mono text-sm font-bold text-[#33251D]">
                            {formatZloty(product.priceNet)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-muted-foreground">
                            przychód
                          </p>
                          <p className="font-mono text-xs font-semibold text-primary">
                            {formatZloty(product.revenue)}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      ) : null}

      {active === 'settings' ? (
        <div className="max-w-5xl space-y-5">
          <div>
            <h2 className="font-display text-2xl font-extrabold text-[#33251D]">
              Dostosuj Zlecero do sposobu pracy swojej firmy.
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Konfiguracja systemu, integracji i funkcji Twojego konta.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'company', label: 'Firma', icon: Briefcase },
              { key: 'users', label: 'Użytkownicy', icon: Users },
              { key: 'email', label: 'E-mail', icon: Mail },
              { key: 'workflow', label: 'Workflow', icon: Gauge },
              { key: 'ai', label: 'AI Asystent', icon: Sparkles },
              { key: 'notifications', label: 'Powiadomienia', icon: Bell },
            ].map((tab) => {
              const Icon = tab.icon;

              return (
                <button
                  key={tab.key}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition',
                    settingsTab === tab.key
                      ? 'bg-primary text-white'
                      : 'border border-[#EADBCD] bg-white text-muted-foreground hover:bg-[#FAF5ED]',
                  )}
                  type="button"
                  onClick={() => setSettingsTab(tab.key as typeof settingsTab)}
                >
                  <Icon className="size-3" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {settingsTab === 'company' ? (
            <section className="rounded-xl border border-[#EADBCD] bg-white shadow-sm">
              <div className="border-b border-[#EADBCD] px-6 py-4">
                <h3 className="font-display text-sm font-bold text-[#33251D]">
                  Dane firmy
                </h3>
              </div>
              <div className="grid gap-4 p-6 md:grid-cols-2">
                {[
                  ['Nazwa firmy', 'Acme Sp. z o.o.'],
                  ['NIP', '123-456-78-90'],
                  ['E-mail firmowy', 'biuro@acme.pl'],
                  ['Telefon', '+48 22 300 40 50'],
                  ['Adres', 'ul. Marszałkowska 1, Warszawa'],
                  ['Strona www', 'https://acme.pl'],
                ].map(([label, value]) => (
                  <label key={label} className="block">
                    <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      {label}
                    </span>
                    <input
                      className="w-full rounded-lg border border-[#EADBCD] bg-[#FAF5ED] px-3 py-2 text-sm outline-none transition focus:border-primary"
                      defaultValue={value}
                    />
                  </label>
                ))}
              </div>
            </section>
          ) : null}

          {settingsTab === 'users' ? (
            <section className="rounded-xl border border-[#EADBCD] bg-white shadow-sm">
              <div className="flex items-center justify-between border-b border-[#EADBCD] px-6 py-4">
                <h3 className="font-display text-sm font-bold text-[#33251D]">
                  Użytkownicy i role
                </h3>
                <button
                  className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-white"
                  type="button"
                  onClick={() => quickAction('Zaproszenie użytkownika')}
                >
                  Zaproś
                </button>
              </div>
              <div className="divide-y divide-[#EADBCD]">
                {[
                  ['Agnieszka Nowak', 'a.nowak@acme.pl', 'Administrator', true],
                  [
                    'Karol Wiśniewski',
                    'k.wisniewski@acme.pl',
                    'Konsultant',
                    true,
                  ],
                  ['Paulina Zając', 'p.zajac@acme.pl', 'Konsultant', false],
                ].map(([name, email, role, activeUser]) => (
                  <div
                    key={String(email)}
                    className="flex items-center gap-4 px-6 py-4"
                  >
                    <span className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {String(name)
                        .split(' ')
                        .map((part) => part[0])
                        .join('')
                        .slice(0, 2)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#33251D]">
                        {name}
                      </p>
                      <p className="text-xs text-muted-foreground">{email}</p>
                    </div>
                    <Badge
                      label={String(role)}
                      className="bg-primary/10 text-primary"
                    />
                    <Badge
                      label={activeUser ? 'Aktywny' : 'Nieaktywny'}
                      className={
                        activeUser
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-500'
                      }
                    />
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {settingsTab === 'email' ? (
            <section className="rounded-xl border border-[#EADBCD] bg-white p-6 shadow-sm">
              <h3 className="font-display text-sm font-bold text-[#33251D]">
                Skrzynki e-mail
              </h3>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {[
                  ['biuro@acme.pl', 'Główna skrzynka', true],
                  ['wyceny@acme.pl', 'Wyceny i oferty', true],
                  ['serwis@acme.pl', 'Serwis', false],
                ].map(([email, label, connected]) => (
                  <div
                    key={String(email)}
                    className="rounded-xl border border-[#EADBCD] bg-[#FFFDF9] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-[#33251D]">
                          {email}
                        </p>
                        <p className="text-xs text-muted-foreground">{label}</p>
                      </div>
                      <Badge
                        label={connected ? 'Połączona' : 'Do konfiguracji'}
                        className={
                          connected
                            ? 'bg-green-100 text-green-700'
                            : 'bg-orange-100 text-orange-700'
                        }
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          {settingsTab === 'workflow' ? (
            <section className="rounded-xl border border-[#EADBCD] bg-white p-6 shadow-sm">
              <h3 className="font-display text-sm font-bold text-[#33251D]">
                Statusy workflow
              </h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {workflowStatuses.map((status) => (
                  <span
                    key={status}
                    className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary"
                  >
                    {status}
                    <button
                      className="text-primary/60 hover:text-red-600"
                      type="button"
                      onClick={() =>
                        setWorkflowStatuses(
                          workflowStatuses.filter((item) => item !== status),
                        )
                      }
                    >
                      <X className="size-3" />
                    </button>
                  </span>
                ))}
              </div>
              <div className="mt-4 flex max-w-md gap-2">
                <input
                  className="min-w-0 flex-1 rounded-lg border border-[#EADBCD] bg-[#FAF5ED] px-3 py-2 text-sm outline-none focus:border-primary"
                  placeholder="Nowy status..."
                  value={newWorkflowStatus}
                  onChange={(event) => setNewWorkflowStatus(event.target.value)}
                />
                <button
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white"
                  type="button"
                  onClick={() => {
                    if (!newWorkflowStatus.trim()) {
                      return;
                    }

                    setWorkflowStatuses([
                      ...workflowStatuses,
                      newWorkflowStatus.trim(),
                    ]);
                    setNewWorkflowStatus('');
                  }}
                >
                  Dodaj
                </button>
              </div>
            </section>
          ) : null}

          {settingsTab === 'ai' || settingsTab === 'notifications' ? (
            <section className="rounded-xl border border-[#EADBCD] bg-white shadow-sm">
              <div className="border-b border-[#EADBCD] px-6 py-4">
                <h3 className="font-display text-sm font-bold text-[#33251D]">
                  {settingsTab === 'ai' ? 'AI Asystent' : 'Powiadomienia'}
                </h3>
              </div>
              <div className="divide-y divide-[#EADBCD]">
                {Object.entries(
                  settingsTab === 'ai' ? aiSettings : notifications,
                ).map(([key, enabled]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-4 px-6 py-4"
                  >
                    <div>
                      <p className="text-sm font-semibold text-[#33251D]">
                        {{
                          draft: 'Automatyczne szkice ofert',
                          detect: 'Wykrywanie brakujących danych',
                          pricing: 'Sugestie wyceny',
                          autoClose: 'Automatyczne zamykanie spraw',
                          newInquiry: 'Nowe zapytanie',
                          offerAccepted: 'Akceptacja oferty',
                          noReply: 'Brak odpowiedzi klienta',
                          dailySummary: 'Dzienne podsumowanie',
                        }[key] ?? key}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Zachowanie przełącznika zgodne z dashboardem
                        referencyjnym.
                      </p>
                    </div>
                    <button
                      aria-pressed={enabled}
                      className={cn(
                        'relative h-6 w-11 rounded-full transition',
                        enabled ? 'bg-primary' : 'bg-[#EADBCD]',
                      )}
                      type="button"
                      onClick={() => {
                        if (settingsTab === 'ai') {
                          setAiSettings({
                            ...aiSettings,
                            [key]: !enabled,
                          });
                        } else {
                          setNotifications({
                            ...notifications,
                            [key]: !enabled,
                          });
                        }
                      }}
                    >
                      <span
                        className={cn(
                          'absolute top-1 size-4 rounded-full bg-white shadow transition',
                          enabled ? 'left-6' : 'left-1',
                        )}
                      />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          ) : null}
        </div>
      ) : null}

      {active === 'messages' ? (
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-extrabold text-[#33251D]">
                Prowadź komunikację z jednej wspólnej skrzynki.
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Wybór wątku, treść wiadomości i szkic odpowiedzi AI.
              </p>
            </div>
            <button
              className="hidden items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 sm:inline-flex"
              type="button"
              onClick={() => quickAction('Nowa wiadomość')}
            >
              <Plus className="size-4" />
              Nowa wiadomość
            </button>
          </div>
          <div className="grid min-h-[560px] overflow-hidden rounded-xl border border-[#EADBCD] bg-white shadow-sm lg:grid-cols-[320px_1fr]">
            <div className="border-b border-[#EADBCD] lg:border-b-0 lg:border-r">
              <div className="border-b border-[#EADBCD] p-3">
                <SearchBox
                  value=""
                  placeholder="Szukaj wiadomości..."
                  onChange={() => undefined}
                />
              </div>
              <div className="max-h-[520px] overflow-y-auto">
                {demoThreads.map((thread) => (
                  <button
                    key={thread.id}
                    className={cn(
                      'w-full border-b border-[#EADBCD] px-4 py-4 text-left transition',
                      selectedThread === thread.id
                        ? 'border-l-2 border-l-primary bg-primary/5'
                        : 'hover:bg-[#FFFDF9]',
                    )}
                    type="button"
                    onClick={() => setSelectedThread(thread.id)}
                  >
                    <div className="flex items-start gap-3">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {thread.avatar}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <p className="truncate text-xs font-semibold text-[#33251D]">
                            {thread.client}
                          </p>
                          <span className="text-[10px] text-muted-foreground">
                            {thread.date}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-xs font-medium text-[#33251D]">
                          {thread.subject}
                        </p>
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                          {thread.preview}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            {activeThread ? (
              <div className="flex min-w-0 flex-col">
                <div className="flex items-center justify-between gap-4 border-b border-[#EADBCD] px-5 py-4">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#33251D]">
                      {activeThread.subject}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      Od: {activeThread.from} · {activeThread.date}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      className="rounded-md border border-[#EADBCD] p-2 text-muted-foreground transition hover:bg-[#FAF5ED]"
                      type="button"
                      onClick={() => quickAction('Archiwizacja wiadomości')}
                    >
                      <Archive className="size-4" />
                    </button>
                    <button
                      className="rounded-md border border-[#EADBCD] p-2 text-muted-foreground transition hover:bg-[#FAF5ED]"
                      type="button"
                      onClick={() => quickAction('Menu wiadomości')}
                    >
                      <MoreHorizontal className="size-4" />
                    </button>
                  </div>
                </div>
                <div className="flex-1 space-y-4 p-5">
                  <div className="rounded-xl bg-[#FAF5ED] p-5">
                    <p className="whitespace-pre-line text-sm leading-relaxed text-[#33251D]">
                      {activeThread.body}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 rounded-xl border border-primary/20 bg-primary/5 p-3 text-xs font-medium text-primary">
                    <Sparkles className="size-4" />
                    AI przygotował szkic odpowiedzi do sprawdzenia.
                  </div>
                </div>
                <div className="border-t border-[#EADBCD] p-4">
                  <textarea
                    className="w-full resize-none rounded-xl border border-[#EADBCD] bg-[#FAF5ED] px-4 py-3 text-sm outline-none transition focus:border-primary"
                    defaultValue="Dzień dobry,\n\nDziękuję za pytania. Odpowiedzi poniżej:"
                    rows={3}
                  />
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex gap-2">
                      <button
                        className="rounded-lg border border-[#EADBCD] px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-[#FAF5ED]"
                        type="button"
                        onClick={() => quickAction('Dołączenie pliku')}
                      >
                        Dołącz plik
                      </button>
                      <button
                        className="rounded-lg border border-[#EADBCD] px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-[#FAF5ED]"
                        type="button"
                        onClick={() => quickAction('Szablon wiadomości')}
                      >
                        Szablon
                      </button>
                    </div>
                    <button
                      className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
                      type="button"
                      onClick={() => quickAction('Wysłanie odpowiedzi')}
                    >
                      <Send className="size-4" />
                      Wyślij odpowiedź
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {active === 'files' ? (
        <div className="space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="font-display text-2xl font-extrabold text-[#33251D]">
                Trzymaj wszystkie pliki przy właściwych sprawach.
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Załączniki, oferty PDF i pliki klienta w jednym widoku.
              </p>
            </div>
            <button
              className="hidden items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 sm:inline-flex"
              type="button"
              onClick={() => quickAction('Dodanie pliku')}
            >
              <Plus className="size-4" />
              Dodaj plik
            </button>
          </div>
          <DataTable
            items={demoFiles}
            columns={[
              {
                key: 'name',
                label: 'Nazwa pliku',
                render: (file) => (
                  <div className="flex min-w-[240px] items-center gap-3">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-[10px] font-bold text-primary">
                      {file.type}
                    </span>
                    <span className="text-sm font-semibold text-[#33251D]">
                      {file.name}
                    </span>
                  </div>
                ),
              },
              {
                key: 'size',
                label: 'Rozmiar',
                className: 'hidden md:table-cell',
                render: (file) => (
                  <span className="text-xs text-muted-foreground">
                    {file.size}
                  </span>
                ),
              },
              {
                key: 'inquiry',
                label: 'Zapytanie',
                className: 'hidden lg:table-cell',
                render: (file) => (
                  <span className="text-xs font-semibold text-primary">
                    {file.inquiry}
                  </span>
                ),
              },
              {
                key: 'uploader',
                label: 'Dodał',
                render: (file) => (
                  <Badge
                    label={file.uploader}
                    className={
                      file.uploader === 'Zlecero AI'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-orange-50 text-orange-700'
                    }
                  />
                ),
              },
              {
                key: 'action',
                label: '',
                render: () => (
                  <button
                    className="rounded-md p-1.5 text-muted-foreground transition hover:bg-[#FAF5ED] hover:text-[#33251D]"
                    type="button"
                    onClick={() => quickAction('Pobranie pliku')}
                  >
                    <Download className="size-4" />
                  </button>
                ),
              },
            ]}
          />
        </div>
      ) : null}

      {selectedItem ? (
        <div className="fixed inset-0 z-30 flex justify-end">
          <button
            aria-label="Zamknij szczegóły"
            className="absolute inset-0 bg-black/30"
            type="button"
            onClick={() => setSelectedItem(null)}
          />
          <aside className="relative flex size-full max-w-xl flex-col bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#EADBCD] px-6 py-4">
              <div>
                <p className="font-mono text-xs font-semibold text-primary">
                  {selectedItem.id}
                </p>
                <h3 className="font-display text-lg font-bold text-[#33251D]">
                  {selectedItem.title}
                </h3>
              </div>
              <button
                className="rounded-md p-2 text-muted-foreground transition hover:bg-[#FAF5ED]"
                type="button"
                onClick={() => setSelectedItem(null)}
              >
                <X className="size-5" />
              </button>
            </div>
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
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <p className="text-sm font-semibold text-primary">
                  Następny krok
                </p>
                <p className="mt-1 text-sm text-[#33251D]">
                  Zweryfikuj dane, dopisz brakujące informacje i przejdź do
                  szczegółu sprawy.
                </p>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-2 border-t border-[#EADBCD] p-4">
              <button
                className="rounded-lg border border-[#EADBCD] px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-[#FAF5ED]"
                type="button"
                onClick={() => quickAction('Przypisanie opiekuna')}
              >
                Przypisz
              </button>
              <Link
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
                to={selectedItem.href}
              >
                Otwórz szczegóły
              </Link>
            </div>
          </aside>
        </div>
      ) : null}

      {selectedInquiry ? (
        <div className="fixed inset-0 z-30 flex justify-end">
          <button
            aria-label="Zamknij szczegóły zapytania"
            className="absolute inset-0 bg-black/30"
            type="button"
            onClick={() => setSelectedInquiry(null)}
          />
          <aside className="relative flex size-full max-w-2xl flex-col bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-[#EADBCD] px-6 py-4">
              <div>
                <p className="font-mono text-xs font-semibold text-primary">
                  {selectedInquiry.id}
                </p>
                <h3 className="mt-1 font-display text-lg font-bold text-[#33251D]">
                  {selectedInquiry.subject}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {selectedInquiry.client}
                </p>
              </div>
              <button
                className="rounded-md p-2 text-muted-foreground transition hover:bg-[#FAF5ED]"
                type="button"
                onClick={() => setSelectedInquiry(null)}
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 space-y-5 overflow-y-auto p-6">
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-[#EADBCD] p-4">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <Badge
                    label={selectedInquiry.status}
                    className={cn(
                      'mt-2',
                      statusClasses[selectedInquiry.status],
                    )}
                  />
                </div>
                <div className="rounded-xl border border-[#EADBCD] p-4">
                  <p className="text-xs text-muted-foreground">Priorytet</p>
                  <Badge
                    label={selectedInquiry.priority}
                    className={cn(
                      'mt-2',
                      priorityClasses[selectedInquiry.priority],
                    )}
                  />
                </div>
                <div className="rounded-xl border border-[#EADBCD] p-4">
                  <p className="text-xs text-muted-foreground">Opiekun</p>
                  <p className="mt-2 text-sm font-semibold text-[#33251D]">
                    {selectedInquiry.owner}
                  </p>
                </div>
              </div>
              <section className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 size-4 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-semibold text-primary">
                      AI może przygotować szkic oferty
                    </p>
                    <p className="mt-1 text-sm text-[#33251D]">
                      Układ i zachowanie są zgodne z referencją: zapytanie
                      otwiera boczny szczegół, a szybkie akcje działają bez
                      opuszczania tabeli.
                    </p>
                  </div>
                </div>
              </section>
              <section className="rounded-xl border border-[#EADBCD] p-4">
                <h4 className="font-display text-sm font-bold text-[#33251D]">
                  Oś sprawy
                </h4>
                <div className="mt-4 space-y-3">
                  {[
                    ['Odebrano zapytanie', selectedInquiry.date],
                    ['Rozpoznano klienta', selectedInquiry.client],
                    ['Przypisano opiekuna', selectedInquiry.owner],
                  ].map(([label, value]) => (
                    <div key={label} className="flex items-center gap-3">
                      <span className="size-2 rounded-full bg-primary" />
                      <div>
                        <p className="text-sm font-semibold text-[#33251D]">
                          {label}
                        </p>
                        <p className="text-xs text-muted-foreground">{value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
            <div className="flex flex-wrap justify-end gap-2 border-t border-[#EADBCD] p-4">
              <button
                className="rounded-lg border border-[#EADBCD] px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-[#FAF5ED]"
                type="button"
                onClick={() => quickAction('Wiadomość do klienta')}
              >
                Napisz wiadomość
              </button>
              <button
                className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
                type="button"
                onClick={() => quickAction('Szkic oferty')}
              >
                Utwórz ofertę
              </button>
            </div>
          </aside>
        </div>
      ) : null}

      {editingProduct ? (
        <div className="fixed inset-0 z-30 flex justify-end">
          <button
            aria-label="Zamknij edytor produktu"
            className="absolute inset-0 bg-black/30"
            type="button"
            onClick={() => setEditingProduct(null)}
          />
          <aside className="relative flex size-full max-w-2xl flex-col bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-[#EADBCD] px-6 py-4">
              <div>
                <p className="font-mono text-xs font-semibold text-primary">
                  {editingProduct.id === 0 ? 'NOWY' : editingProduct.sku}
                </p>
                <h3 className="mt-1 font-display text-lg font-bold text-[#33251D]">
                  {editingProduct.id === 0
                    ? 'Nowy produkt / usługa'
                    : editingProduct.name}
                </h3>
              </div>
              <button
                className="rounded-md p-2 text-muted-foreground transition hover:bg-[#FAF5ED]"
                type="button"
                onClick={() => setEditingProduct(null)}
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="flex-1 space-y-4 overflow-y-auto p-6">
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Nazwa
                </span>
                <input
                  className="w-full rounded-lg border border-[#EADBCD] bg-[#FAF5ED] px-3 py-2.5 text-sm outline-none focus:border-primary"
                  value={editingProduct.name}
                  onChange={(event) =>
                    setEditingProduct({
                      ...editingProduct,
                      name: event.target.value,
                    })
                  }
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Opis
                </span>
                <textarea
                  className="w-full resize-none rounded-lg border border-[#EADBCD] bg-[#FAF5ED] px-3 py-2.5 text-sm outline-none focus:border-primary"
                  rows={3}
                  value={editingProduct.desc}
                  onChange={(event) =>
                    setEditingProduct({
                      ...editingProduct,
                      desc: event.target.value,
                    })
                  }
                />
              </label>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    SKU
                  </span>
                  <input
                    className="w-full rounded-lg border border-[#EADBCD] bg-[#FAF5ED] px-3 py-2.5 font-mono text-sm outline-none focus:border-primary"
                    value={editingProduct.sku}
                    onChange={(event) =>
                      setEditingProduct({
                        ...editingProduct,
                        sku: event.target.value,
                      })
                    }
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Kategoria
                  </span>
                  <select
                    className="w-full rounded-lg border border-[#EADBCD] bg-[#FAF5ED] px-3 py-2.5 text-sm outline-none focus:border-primary"
                    value={editingProduct.categoryId}
                    onChange={(event) =>
                      setEditingProduct({
                        ...editingProduct,
                        categoryId: Number(event.target.value),
                      })
                    }
                  >
                    {demoCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Cena netto
                  </span>
                  <input
                    className="w-full rounded-lg border border-[#EADBCD] bg-[#FAF5ED] px-3 py-2.5 font-mono text-sm outline-none focus:border-primary"
                    type="number"
                    value={editingProduct.priceNet}
                    onChange={(event) =>
                      setEditingProduct({
                        ...editingProduct,
                        priceNet: Number(event.target.value),
                      })
                    }
                  />
                </label>
                <label className="block">
                  <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    VAT
                  </span>
                  <select
                    className="w-full rounded-lg border border-[#EADBCD] bg-[#FAF5ED] px-3 py-2.5 text-sm outline-none focus:border-primary"
                    value={editingProduct.vat}
                    onChange={(event) =>
                      setEditingProduct({
                        ...editingProduct,
                        vat: Number(event.target.value),
                      })
                    }
                  >
                    <option value={23}>23%</option>
                    <option value={8}>8%</option>
                    <option value={5}>5%</option>
                    <option value={0}>0%</option>
                  </select>
                </label>
              </div>
              <div className="grid grid-cols-3 divide-x divide-primary/10 rounded-xl border border-primary/15 bg-primary/5 px-4 py-3">
                {[
                  ['Netto', editingProduct.priceNet],
                  [
                    `VAT ${editingProduct.vat}%`,
                    Math.round(
                      (editingProduct.priceNet * editingProduct.vat) / 100,
                    ),
                  ],
                  [
                    'Brutto',
                    Math.round(
                      editingProduct.priceNet * (1 + editingProduct.vat / 100),
                    ),
                  ],
                ].map(([label, value]) => (
                  <div
                    key={String(label)}
                    className="px-4 first:pl-0 last:pr-0"
                  >
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                      {label}
                    </p>
                    <p className="mt-0.5 font-mono text-sm font-bold text-[#33251D]">
                      {formatZloty(Number(value))}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-[#FAF5ED] px-4 py-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-[#33251D]">
                    Aktywny w katalogu
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Widoczny przy tworzeniu ofert.
                  </p>
                </div>
                <button
                  aria-pressed={editingProduct.active}
                  className={cn(
                    'relative h-6 w-11 rounded-full transition',
                    editingProduct.active ? 'bg-primary' : 'bg-[#EADBCD]',
                  )}
                  type="button"
                  onClick={() =>
                    setEditingProduct({
                      ...editingProduct,
                      active: !editingProduct.active,
                    })
                  }
                >
                  <span
                    className={cn(
                      'absolute top-1 size-4 rounded-full bg-white shadow transition',
                      editingProduct.active ? 'left-6' : 'left-1',
                    )}
                  />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-[#EADBCD] p-4">
              {editingProduct.id > 0 ? (
                <button
                  className="text-xs font-semibold text-red-600 hover:underline"
                  type="button"
                  onClick={() => {
                    setProducts(
                      products.filter(
                        (product) => product.id !== editingProduct.id,
                      ),
                    );
                    setEditingProduct(null);
                    quickAction('Usunięcie produktu');
                  }}
                >
                  Usuń produkt
                </button>
              ) : (
                <span />
              )}
              <div className="flex gap-2">
                <button
                  className="rounded-lg border border-[#EADBCD] px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-[#FAF5ED]"
                  type="button"
                  onClick={() => setEditingProduct(null)}
                >
                  Anuluj
                </button>
                <button
                  className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:opacity-40"
                  disabled={!editingProduct.name.trim()}
                  type="button"
                  onClick={saveProduct}
                >
                  {editingProduct.id === 0
                    ? 'Dodaj do katalogu'
                    : 'Zapisz zmiany'}
                </button>
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}

export function AdminDashboardPanel({ data }: { data: AdminDashboard }) {
  const [active, setActive] = useState<AdminTab>('overview');
  const [notice, setNotice] = useState<string | null>(null);
  const [flags, setFlags] = useState<Record<string, boolean>>(
    Object.fromEntries(adminFlags.map((flag) => [flag.key, flag.enabled])),
  );
  const [announcementSent, setAnnouncementSent] = useState(false);

  const action = (label: string) => {
    setNotice(`${label}: akcja została zapisana w wersji demonstracyjnej.`);
  };

  return (
    <div className="space-y-6">
      {notice ? (
        <ActionNotice message={notice} onDismiss={() => setNotice(null)} />
      ) : null}

      <TabBar active={active} dark tabs={adminTabs} onChange={setActive} />

      {active === 'overview' ? (
        <div className="space-y-6">
          <CardGrid cards={data.cards} />

          <section className="rounded-xl border border-[#EADBCD] bg-white p-6 shadow-sm">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-base font-bold text-[#33251D]">
                  Śledź, jak rośnie miesięczny przychód powtarzalny.
                </h2>
                <p className="mt-1 text-xs text-muted-foreground">
                  Styczeń - Lipiec 2026
                </p>
              </div>
              <Badge label="+184% YTD" className="bg-green-50 text-green-700" />
            </div>
            <MiniBars data={revenueData} valueKey="mrr" />
          </section>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(320px,0.9fr)]">
            <section className="rounded-xl border border-[#EADBCD] bg-white shadow-sm">
              <div className="flex items-center justify-between gap-4 border-b border-[#EADBCD] px-5 py-4">
                <h2 className="font-display text-sm font-bold text-[#33251D]">
                  Ostatnio zarejestrowane firmy
                </h2>
                <button
                  className="text-xs font-semibold text-primary hover:underline"
                  type="button"
                  onClick={() => setActive('clients')}
                >
                  Zobacz klientów
                </button>
              </div>
              <div className="divide-y divide-[#EADBCD]">
                {data.recentCompanies.map((company) => (
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
                          ? statusClasses.Aktywny
                          : 'bg-orange-100 text-orange-700'
                      }
                    />
                  </div>
                ))}
              </div>
            </section>
            <section className="rounded-xl border border-[#EADBCD] bg-white p-5 shadow-sm">
              <h2 className="font-display text-sm font-bold text-[#33251D]">
                Rozkład planów
              </h2>
              <div className="mt-5 space-y-4">
                {[
                  ['Enterprise', 87, 7, 'bg-primary'],
                  ['Professional', 521, 42, 'bg-blue-400'],
                  ['Starter', 481, 39, 'bg-blue-200'],
                  ['Trial', 158, 12, 'bg-orange-300'],
                ].map(([name, count, pct, color]) => (
                  <div key={String(name)}>
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#33251D]">
                        {name}
                      </span>
                      <span className="text-muted-foreground">
                        {count} firm · {pct}%
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-[#FAF5ED]">
                      <div
                        className={cn('h-full rounded-full', String(color))}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      ) : null}

      {active === 'clients' ? (
        <DataTable
          items={saasClients}
          columns={[
            {
              key: 'company',
              label: 'Firma',
              render: (client) => (
                <div className="flex min-w-[240px] items-center gap-3">
                  <span className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                    {client.company[0]}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[#33251D]">
                      {client.company}
                    </p>
                    <p className="text-xs text-muted-foreground">{client.id}</p>
                  </div>
                </div>
              ),
            },
            {
              key: 'plan',
              label: 'Plan',
              render: (client) => (
                <span className="text-xs font-semibold">{client.plan}</span>
              ),
            },
            {
              key: 'mrr',
              label: 'MRR',
              className: 'hidden md:table-cell',
              render: (client) => (
                <span className="text-xs text-[#33251D]">{client.mrr}</span>
              ),
            },
            {
              key: 'users',
              label: 'Użytkownicy',
              className: 'hidden lg:table-cell',
              render: (client) => (
                <span className="text-xs text-muted-foreground">
                  {client.users}
                </span>
              ),
            },
            {
              key: 'status',
              label: 'Status',
              render: (client) => (
                <Badge
                  label={client.status}
                  className={statusClasses[client.status]}
                />
              ),
            },
          ]}
        />
      ) : null}

      {active === 'subscriptions' ? (
        <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              icon={CheckCircle}
              label="Aktywne"
              value="1 089"
              iconColor="bg-green-50 text-green-600"
            />
            <StatCard
              icon={TrendingUp}
              label="MRR łączny"
              value="52 400 zl"
              iconColor="bg-primary/10 text-primary"
            />
            <StatCard
              icon={AlertTriangle}
              label="Zaległe"
              value="12"
              iconColor="bg-red-50 text-red-600"
            />
          </div>
          <DataTable
            items={adminSubscriptions}
            columns={[
              {
                key: 'id',
                label: 'ID / firma',
                render: (row) => (
                  <div>
                    <p className="font-mono text-xs font-semibold text-primary">
                      {row.id}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {row.company}
                    </p>
                  </div>
                ),
              },
              {
                key: 'plan',
                label: 'Plan',
                render: (row) => (
                  <span className="text-xs font-semibold">{row.plan}</span>
                ),
              },
              {
                key: 'amount',
                label: 'Kwota',
                className: 'hidden md:table-cell',
                render: (row) => (
                  <span className="font-semibold text-[#33251D]">
                    {row.amount}
                  </span>
                ),
              },
              {
                key: 'renewal',
                label: 'Odnowienie',
                className: 'hidden lg:table-cell',
                render: (row) => (
                  <span className="text-xs text-muted-foreground">
                    {row.renewal}
                  </span>
                ),
              },
              {
                key: 'status',
                label: 'Status',
                render: (row) => (
                  <Badge
                    label={row.status}
                    className={statusClasses[row.status]}
                  />
                ),
              },
            ]}
          />
        </div>
      ) : null}

      {active === 'payments' ? (
        <DataTable
          items={adminPayments}
          columns={[
            {
              key: 'id',
              label: 'ID płatności',
              render: (row) => (
                <span className="font-mono text-xs font-semibold text-primary">
                  {row.id}
                </span>
              ),
            },
            {
              key: 'company',
              label: 'Firma',
              className: 'hidden md:table-cell',
              render: (row) => (
                <span className="text-xs text-[#33251D]">{row.company}</span>
              ),
            },
            {
              key: 'amount',
              label: 'Kwota',
              render: (row) => (
                <span className="font-semibold text-[#33251D]">
                  {row.amount}
                </span>
              ),
            },
            {
              key: 'status',
              label: 'Status',
              render: (row) => (
                <Badge
                  label={row.status}
                  className={statusClasses[row.status]}
                />
              ),
            },
            {
              key: 'invoice',
              label: 'Faktura',
              className: 'hidden lg:table-cell',
              render: (row) => (
                <span className="text-xs text-muted-foreground">
                  {row.invoice}
                </span>
              ),
            },
          ]}
        />
      ) : null}

      {active === 'plans' ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {planRows.map((plan) => (
            <section
              key={plan.name}
              className="rounded-xl border border-[#EADBCD] bg-white p-5 shadow-sm"
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="font-display text-lg font-bold text-[#33251D]">
                  {plan.name}
                </h2>
                <Badge
                  label={`${plan.count} firm`}
                  className="bg-primary/10 text-primary"
                />
              </div>
              <p className="font-display text-3xl font-extrabold text-[#33251D]">
                {plan.price}
              </p>
              <div className="mt-5 space-y-2 text-xs">
                {[
                  ['Użytkownicy', plan.users],
                  ['Zapytania', plan.inquiries],
                  ['Skrzynki e-mail', plan.mailboxes],
                  ['AI asystent', plan.ai ? 'tak' : 'nie'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-3">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-semibold text-[#33251D]">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
              <button
                className="mt-5 w-full rounded-lg border border-[#EADBCD] px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-[#FAF5ED]"
                type="button"
                onClick={() => action(`Edycja pakietu ${plan.name}`)}
              >
                Edytuj pakiet
              </button>
            </section>
          ))}
        </div>
      ) : null}

      {active === 'trials' ? (
        <DataTable
          items={adminTrials}
          columns={[
            {
              key: 'company',
              label: 'Firma',
              render: (row) => (
                <div>
                  <p className="text-sm font-semibold text-[#33251D]">
                    {row.company}
                  </p>
                  <p className="text-xs text-muted-foreground">{row.email}</p>
                </div>
              ),
            },
            {
              key: 'expires',
              label: 'Wygasa',
              className: 'hidden md:table-cell',
              render: (row) => (
                <span className="text-xs text-muted-foreground">
                  {row.expires}
                </span>
              ),
            },
            {
              key: 'days',
              label: 'Dni',
              render: (row) => (
                <span
                  className={cn(
                    'font-display text-lg font-bold',
                    row.daysLeft <= 2 ? 'text-red-600' : 'text-[#33251D]',
                  )}
                >
                  {row.daysLeft}
                </span>
              ),
            },
            {
              key: 'status',
              label: 'Status',
              render: (row) => (
                <Badge
                  label={row.status}
                  className={statusClasses[row.status]}
                />
              ),
            },
            {
              key: 'action',
              label: '',
              render: (row) => (
                <button
                  className="text-xs font-semibold text-primary hover:underline"
                  type="button"
                  onClick={() => action(`Konwersja triala ${row.company}`)}
                >
                  Konwertuj
                </button>
              ),
            },
          ]}
        />
      ) : null}

      {active === 'coupons' ? (
        <div className="space-y-5">
          <div className="flex justify-end">
            <button
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary/90"
              type="button"
              onClick={() => action('Nowy kod rabatowy')}
            >
              <Plus className="size-4" />
              Nowy kod
            </button>
          </div>
          <DataTable
            items={adminCoupons}
            columns={[
              {
                key: 'code',
                label: 'Kod',
                render: (row) => (
                  <span className="rounded bg-[#FAF5ED] px-2 py-1 font-mono text-xs font-semibold text-primary">
                    {row.code}
                  </span>
                ),
              },
              {
                key: 'discount',
                label: 'Rabat',
                render: (row) => (
                  <span className="font-semibold text-[#33251D]">
                    {row.discount}
                  </span>
                ),
              },
              {
                key: 'uses',
                label: 'Użycia',
                render: (row) => (
                  <span className="text-xs text-muted-foreground">
                    {row.uses}/{row.maxUses}
                  </span>
                ),
              },
              {
                key: 'status',
                label: 'Status',
                render: (row) => (
                  <Badge
                    label={row.active ? 'Aktywny' : 'Wygasły'}
                    className={
                      row.active ? statusClasses.Aktywny : statusClasses.Wygasły
                    }
                  />
                ),
              },
            ]}
          />
        </div>
      ) : null}

      {active === 'support' ? (
        <DataTable
          items={adminTickets}
          columns={[
            {
              key: 'id',
              label: 'Ticket',
              render: (row) => (
                <span className="font-mono text-xs font-semibold text-primary">
                  {row.id}
                </span>
              ),
            },
            {
              key: 'subject',
              label: 'Temat',
              render: (row) => (
                <div className="min-w-[260px]">
                  <p className="text-sm font-semibold text-[#33251D]">
                    {row.subject}
                  </p>
                  <p className="text-xs text-muted-foreground">{row.company}</p>
                </div>
              ),
            },
            {
              key: 'priority',
              label: 'Priorytet',
              render: (row) => (
                <Badge
                  label={row.priority}
                  className={priorityClasses[row.priority]}
                />
              ),
            },
            {
              key: 'status',
              label: 'Status',
              render: (row) => (
                <Badge
                  label={row.status}
                  className={statusClasses[row.status]}
                />
              ),
            },
          ]}
        />
      ) : null}

      {active === 'flags' ? (
        <div className="grid gap-4 md:grid-cols-2">
          {adminFlags.map((flag) => (
            <section
              key={flag.key}
              className="rounded-xl border border-[#EADBCD] bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="font-display text-sm font-bold text-[#33251D]">
                    {flag.label}
                  </h2>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {flag.desc}
                  </p>
                  <Badge
                    label={flag.plan}
                    className="mt-3 bg-primary/10 text-primary"
                  />
                </div>
                <button
                  aria-pressed={flags[flag.key]}
                  className={cn(
                    'relative h-6 w-11 rounded-full transition',
                    flags[flag.key] ? 'bg-primary' : 'bg-[#EADBCD]',
                  )}
                  type="button"
                  onClick={() => {
                    setFlags((current) => ({
                      ...current,
                      [flag.key]: !current[flag.key],
                    }));
                    action(`Feature flag ${flag.label}`);
                  }}
                >
                  <span
                    className={cn(
                      'absolute top-1 size-4 rounded-full bg-white shadow transition',
                      flags[flag.key] ? 'left-6' : 'left-1',
                    )}
                  />
                </button>
              </div>
            </section>
          ))}
        </div>
      ) : null}

      {active === 'logs' ? (
        <div className="overflow-hidden rounded-xl border border-[#EADBCD] bg-[#33251D] shadow-sm">
          <div className="border-b border-white/10 px-5 py-4">
            <h2 className="font-display text-sm font-bold text-white">
              Logi systemowe
            </h2>
          </div>
          <div className="divide-y divide-white/10">
            {adminLogs.map((log) => (
              <div
                key={`${log.time}-${log.message}`}
                className="grid gap-3 px-5 py-3 font-mono text-xs text-white/70 md:grid-cols-[90px_70px_120px_1fr]"
              >
                <span>{log.time}</span>
                <span
                  className={cn(
                    log.level === 'ERROR'
                      ? 'text-red-300'
                      : log.level === 'WARN'
                        ? 'text-orange-300'
                        : 'text-green-300',
                  )}
                >
                  {log.level}
                </span>
                <span>{log.service}</span>
                <span>{log.message}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {active === 'ai' ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              icon={Bot}
              label="Szkice ofert"
              value="351"
              sub="+42 dziś"
              iconColor="bg-primary/10 text-primary"
            />
            <StatCard
              icon={Activity}
              label="Requesty AI"
              value="770"
              sub="+18% tydz."
              iconColor="bg-blue-50 text-blue-700"
            />
            <StatCard
              icon={Clock}
              label="Śr. czas odpowiedzi"
              value="1.8s"
              sub="-0.3s"
              iconColor="bg-green-50 text-green-700"
            />
          </div>
          <DataTable
            items={aiUsage}
            columns={[
              {
                key: 'company',
                label: 'Firma',
                render: (row) => (
                  <div>
                    <p className="text-sm font-semibold text-[#33251D]">
                      {row.company}
                    </p>
                    <p className="text-xs text-muted-foreground">{row.plan}</p>
                  </div>
                ),
              },
              {
                key: 'drafts',
                label: 'Szkice',
                render: (row) => (
                  <span className="font-semibold text-[#33251D]">
                    {row.drafts}
                  </span>
                ),
              },
              {
                key: 'tokens',
                label: 'Tokeny',
                className: 'hidden md:table-cell',
                render: (row) => (
                  <span className="text-xs text-muted-foreground">
                    {row.tokens}
                  </span>
                ),
              },
              {
                key: 'last',
                label: 'Ostatnio',
                className: 'hidden lg:table-cell',
                render: (row) => (
                  <span className="text-xs text-muted-foreground">
                    {row.lastUsed}
                  </span>
                ),
              },
            ]}
          />
        </div>
      ) : null}

      {active === 'overview' ? null : (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#33251D]">
                Komunikat do klientów platformy
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Zachowanie z referencji: akcja ma widoczny stan po wysłaniu.
              </p>
            </div>
            <button
              className={cn(
                'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition',
                announcementSent
                  ? 'bg-green-600 text-white'
                  : 'bg-primary text-white hover:bg-primary/90',
              )}
              type="button"
              onClick={() => {
                setAnnouncementSent(true);
                action('Wysyłka komunikatu');
              }}
            >
              <Bell className="size-4" />
              {announcementSent ? 'Wysłano' : 'Wyślij komunikat'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
