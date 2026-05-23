import { Link } from '@inertiajs/react';
import {
    Bell,
    ClipboardList,
    Cog,
    LayoutGrid,
    ListChecks,
    Settings2,
    Users,
    Wrench,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as machineTypesIndex } from '@/routes/machine-types';
import { index as machinesIndex } from '@/routes/machines';
import { index as cleaningCyclesIndex } from '@/routes/cleaning-cycles';
import { index as shiftGroupsIndex } from '@/routes/shift-groups';
import { index as stakeholdersIndex } from '@/routes/stakeholders';
import { index as cleaningRecordsIndex, create as logCleaning } from '@/routes/cleaning-records';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Log Cleaning',
        href: logCleaning(),
        icon: ClipboardList,
    },
    {
        title: 'Cleaning Records',
        href: cleaningRecordsIndex(),
        icon: ListChecks,
    },
];

const setupNavItems: NavItem[] = [
    {
        title: 'Machines',
        href: machinesIndex(),
        icon: Wrench,
    },
    {
        title: 'Machine Types',
        href: machineTypesIndex(),
        icon: Cog,
    },
    {
        title: 'Cleaning Cycles',
        href: cleaningCyclesIndex(),
        icon: Settings2,
    },
    {
        title: 'Shift Groups',
        href: shiftGroupsIndex(),
        icon: Users,
    },
    {
        title: 'Stakeholders',
        href: stakeholdersIndex(),
        icon: Bell,
    },
];

const footerNavItems: NavItem[] = [];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} label="Cleaning" />
                <NavMain items={setupNavItems} label="Setup" />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
