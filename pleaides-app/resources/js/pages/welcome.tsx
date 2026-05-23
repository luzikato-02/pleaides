import { Head, Link, usePage } from '@inertiajs/react';
import AppLogoIcon from '@/components/app-logo-icon';
import { dashboard, login } from '@/routes';
import { register } from '@/routes';

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Welcome" />
            <div className="flex min-h-screen flex-col items-center justify-center bg-[#0f0f13] px-6 py-12 text-white">

                {/* Nav */}
                <nav className="absolute top-0 right-0 flex items-center gap-3 p-6">
                    {auth.user ? (
                        <Link
                            href={dashboard()}
                            className="rounded-md border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white backdrop-blur hover:bg-white/20"
                        >
                            Dashboard
                        </Link>
                    ) : (
                        <>
                            <Link
                                href={login()}
                                className="px-4 py-1.5 text-sm text-white/70 hover:text-white"
                            >
                                Log in
                            </Link>
                            <Link
                                href={register()}
                                className="rounded-md border border-white/20 bg-white/10 px-4 py-1.5 text-sm text-white backdrop-blur hover:bg-white/20"
                            >
                                Register
                            </Link>
                        </>
                    )}
                </nav>

                {/* Hero */}
                <div className="flex flex-col items-center gap-8 text-center">

                    {/* Logo — large star cluster */}
                    <div className="flex size-24 items-center justify-center rounded-2xl bg-white/10 backdrop-blur ring-1 ring-white/20">
                        <AppLogoIcon className="size-14 fill-white" />
                    </div>

                    {/* Name & tagline */}
                    <div className="space-y-3">
                        <h1 className="text-5xl font-bold tracking-tight">Pleaides</h1>
                        <p className="max-w-sm text-base text-white/60">
                            Machine cleaning compliance — track every cycle, every team,
                            every due date across your production floor.
                        </p>
                    </div>

                    {/* CTA */}
                    <div className="flex gap-3">
                        {auth.user ? (
                            <Link
                                href={dashboard()}
                                className="rounded-lg bg-white px-6 py-2.5 text-sm font-medium text-[#0f0f13] hover:bg-white/90"
                            >
                                Go to Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    href={register()}
                                    className="rounded-lg bg-white px-6 py-2.5 text-sm font-medium text-[#0f0f13] hover:bg-white/90"
                                >
                                    Get started
                                </Link>
                                <Link
                                    href={login()}
                                    className="rounded-lg border border-white/20 px-6 py-2.5 text-sm font-medium text-white hover:bg-white/10"
                                >
                                    Log in
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Feature pills */}
                    <div className="flex flex-wrap justify-center gap-2 text-xs text-white/50">
                        {[
                            'Cleaning records',
                            'Due-date tracking',
                            'Shift group leaders',
                            'Stakeholder alerts',
                            'CSV export',
                        ].map((f) => (
                            <span
                                key={f}
                                className="rounded-full border border-white/10 bg-white/5 px-3 py-1"
                            >
                                {f}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Decorative star field */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                    <svg className="h-full w-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                        {[
                            [120,80,1.2],[340,150,0.8],[560,60,1.0],[780,200,0.6],[1000,90,1.1],
                            [1150,180,0.7],[200,420,0.9],[450,380,1.3],[680,450,0.7],[900,400,1.0],
                            [1100,350,0.8],[80,600,1.1],[320,550,0.6],[600,620,0.9],[850,580,1.2],
                            [1050,640,0.7],[160,750,0.8],[500,720,1.0],[740,780,0.6],[980,730,0.9],
                        ].map(([x,y,r],i) => (
                            <circle key={i} cx={x} cy={y} r={r} fill="white"/>
                        ))}
                    </svg>
                </div>

            </div>
        </>
    );
}
