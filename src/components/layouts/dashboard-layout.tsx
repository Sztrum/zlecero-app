import {
  Bell,
  Building2,
  ClipboardList,
  Contact,
  FileText,
  Home,
  Inbox,
  LogOut,
  Menu,
  PanelLeftClose,
  Search,
  User2,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, useNavigate, useNavigation } from 'react-router';

import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { paths } from '@/config/paths';
import { useLogout } from '@/lib/auth';
import { cn } from '@/utils/cn';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown';
import { Link } from '../ui/link';

type SideNavigationItem = {
  name: string;
  to: string;
  icon: LucideIcon;
  badge?: string;
};

const Logo = ({ dark = false }: { dark?: boolean }) => {
  return (
    <Link
      className={cn(
        'flex items-center gap-2.5 font-display text-sm font-bold',
        dark ? 'text-white' : 'text-[#33251D]',
      )}
      to={paths.home.getHref()}
    >
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Zap className="size-4" />
      </span>
      <span>Zlecero</span>
    </Link>
  );
};

const Progress = () => {
  const { state, location } = useNavigation();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(0);
  }, [location?.pathname]);

  useEffect(() => {
    if (state === 'loading') {
      const timer = setInterval(() => {
        setProgress((oldProgress) => {
          const newProgress = oldProgress + 10;
          return newProgress > 100 ? 100 : newProgress;
        });
      }, 300);

      return () => {
        clearInterval(timer);
      };
    }
  }, [state]);

  if (state !== 'loading') {
    return null;
  }

  return (
    <div
      className="fixed left-0 top-0 z-50 h-1 bg-primary transition-all duration-200 ease-in-out"
      style={{ width: `${progress}%` }}
    />
  );
};

const navigation: SideNavigationItem[] = [
  { name: 'Pulpit', to: paths.app.dashboard.getHref(), icon: Home },
  { name: 'Klienci', to: paths.app.customers.getHref(), icon: Contact },
  {
    name: 'Zapytania',
    to: paths.app.inquiries.getHref(),
    icon: Inbox,
    badge: '3',
  },
  { name: 'Oferty', to: paths.app.offers.getHref(), icon: FileText },
  { name: 'Zlecenia', to: paths.app.orders.getHref(), icon: ClipboardList },
  { name: 'Firma', to: paths.app.company.getHref(), icon: Building2 },
  { name: 'Użytkownicy', to: paths.app.companyUsers.getHref(), icon: Users },
];

const NavigationLinks = ({ dark = false }: { dark?: boolean }) => (
  <nav className="space-y-1">
    {navigation.map((item) => (
      <NavLink
        key={item.name}
        to={item.to}
        end
        className={({ isActive }) =>
          cn(
            'group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
            dark
              ? 'text-white/55 hover:bg-white/10 hover:text-white'
              : 'text-muted-foreground hover:bg-[#FAF5ED] hover:text-[#33251D]',
            isActive &&
              (dark
                ? 'bg-primary/30 text-white'
                : 'bg-primary/10 text-primary'),
          )
        }
      >
        <item.icon className="size-4 shrink-0" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate">{item.name}</span>
        {item.badge ? (
          <span className="flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
            {item.badge}
          </span>
        ) : null}
      </NavLink>
    ))}
  </nav>
);

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();
  const logout = useLogout({
    onSuccess: () => navigate(paths.auth.login.getHref()),
  });

  return (
    <div className="flex min-h-screen bg-[#FAF5ED] text-[#33251D]">
      <Progress />
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-60 flex-col border-r border-[#EADBCD] bg-white lg:flex">
        <div className="flex h-16 shrink-0 items-center border-b border-[#EADBCD] px-5">
          <Logo />
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-4">
          <p className="mb-2 px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Menu główne
          </p>
          <NavigationLinks />
        </div>
        <div className="border-t border-[#EADBCD] p-3">
          <div className="flex items-center gap-2.5 rounded-lg p-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              AN
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-semibold">Agnieszka Nowak</p>
              <p className="truncate text-[10px] text-muted-foreground">
                Professional
              </p>
            </div>
            <button
              type="button"
              className="rounded-md p-1.5 text-muted-foreground transition hover:bg-[#FAF5ED] hover:text-[#33251D]"
              onClick={() => logout.mutate({})}
            >
              <LogOut className="size-4" />
              <span className="sr-only">Wyloguj</span>
            </button>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col lg:pl-60">
        <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b border-[#EADBCD] bg-white px-4 lg:px-6">
          <Drawer>
            <DrawerTrigger asChild>
              <Button size="icon" variant="outline" className="lg:hidden">
                <Menu className="size-5" />
                <span className="sr-only">Otwórz menu</span>
              </Button>
            </DrawerTrigger>
            <DrawerContent side="left" className="max-w-72 bg-white p-0">
              <div className="flex h-16 items-center justify-between border-b border-[#EADBCD] px-5">
                <Logo />
                <PanelLeftClose className="size-4 text-muted-foreground" />
              </div>
              <div className="px-3 py-4">
                <NavigationLinks />
              </div>
            </DrawerContent>
          </Drawer>

          <div className="hidden max-w-sm flex-1 items-center gap-2 rounded-lg border border-[#EADBCD] bg-[#FAF5ED] px-3 py-2 md:flex">
            <Search className="size-4 text-muted-foreground" />
            <input
              aria-label="Szukaj"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              placeholder="Szukaj zapytań, klientów..."
              type="search"
            />
          </div>

          <div className="ml-auto flex items-center gap-2">
            <Button variant="ghost" size="icon" aria-label="Powiadomienia">
              <Bell className="size-5" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
                  <span className="sr-only">Otwórz menu użytkownika</span>
                  <User2 className="size-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => navigate(paths.app.profile.getHref())}
                >
                  Profil
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout.mutate({})}>
                  Wyloguj
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="min-w-0 flex-1 px-4 py-6 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}
