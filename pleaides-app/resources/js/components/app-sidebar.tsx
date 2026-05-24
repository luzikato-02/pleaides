import { Link } from '@inertiajs/react';
import {
    Bell,
    Calculator,
    ClipboardList,
    Cog,
    Factory,
    FileText,
    LayoutGrid,
    ListChecks,
    Package,
    Ruler,
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
import { dashboard, weavingCalculator, weavingDashboard } from '@/routes';
import { index as machineTypesIndex } from '@/routes/machine-types';
import { index as machinesIndex } from '@/routes/machines';
import { index as cleaningCyclesIndex } from '@/routes/cleaning-cycles';
import { index as shiftGroupsIndex } from '@/routes/shift-groups';
import { index as stakeholdersIndex } from '@/routes/stakeholders';
import { index as cleaningRecordsIndex, create as logCleaning } from '@/routes/cleaning-records';
import { index as productionAreasIndex } from '@/routes/production-areas';
import { index as weavingMachineStandardsIndex } from '@/routes/weaving-machine-standards';
import { index as tubeTypesIndex } from '@/routes/tube-types';
import { index as weavingCalculationsIndex } from '@/routes/weaving-calculations';
import type { NavItem } from '@/types';

const cleaningNavItems: NavItem[] = [
    { title: 'Dashboard',         href: dashboard(),             icon: LayoutGrid   },
    { title: 'Log Cleaning',      href: logCleaning(),           icon: ClipboardList },
    { title: 'Cleaning Records',  href: cleaningRecordsIndex(),  icon: ListChecks   },
];

const weavingNavItems: NavItem[] = [
    { title: 'Weaving Dashboard',      href: weavingDashboard(),          icon: LayoutGrid  },
    { title: 'Weaving Calculator',     href: weavingCalculator(),         icon: Calculator  },
    { title: 'Calculation Records',    href: weavingCalculationsIndex(),  icon: FileText    },
];

const setupNavItems: NavItem[] = [
    { title: 'Machines',          href: machinesIndex(),                  icon: Wrench    },
    { title: 'Machine Types',     href: machineTypesIndex(),              icon: Cog       },
    { title: 'Cleaning Cycles',   href: cleaningCyclesIndex(),            icon: Settings2 },
    { title: 'Shift Groups',      href: shiftGroupsIndex(),               icon: Users     },
    { title: 'Stakeholders',      href: stakeholdersIndex(),              icon: Bell      },
    { title: 'Production Areas',  href: productionAreasIndex(),           icon: Factory   },
    { title: 'Weaving Standards', href: weavingMachineStandardsIndex(),   icon: Ruler     },
    { title: 'Tube Types',        href: tubeTypesIndex(),                 icon: Package   },
];

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
                <NavMain items={cleaningNavItems} label="Cleaning" />
                <NavMain items={weavingNavItems}  label="Weaving Adjustments" />
                <NavMain items={setupNavItems}    label="Setup" />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={[]} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
