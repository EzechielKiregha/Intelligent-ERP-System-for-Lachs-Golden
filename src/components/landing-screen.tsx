// components/landing-screen.tsx
'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight,
  CheckCircle,
  Github,
  Layers,
  LayoutDashboard,
  Zap,
} from 'lucide-react'
import { Button } from './ui/button'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Separator } from './ui/separator'
import { useAuth } from 'contents/authContext'
import { useGetWorkspaces } from '@/features/workspaces/api/use-get-workspaces'
import { User, Workspace } from '@/generated/prisma'

interface LandingScreenProps {
  initialWorkspaces: Workspace[] | null
}

export default function LandingScreen() {
  const { user: authUser } = useAuth()
  const { data } = useGetWorkspaces();
  const [user, setUser] = useState<User | null>(authUser)
  const [workspaces, setWorkspaces] = useState<Workspace[] | null>(data)

  useEffect(() => {
    setUser(authUser || null)
    const { data } = useGetWorkspaces();
    setWorkspaces(data)
  }, [authUser])

  const workspaceUrl = user
    ? workspaces && workspaces.length > 0
      ? `/workspaces/${workspaces[0].id}`
      : '/workspaces/create'
    : '/sign-in'

  return (
    <div className="flex flex-col min-h-screen bg-sidebar text-sidebar-foreground">
      {/* Navigation */}
      <header className="fixed top-0 w-full bg-sidebar bg-opacity-90 backdrop-blur-md border-b border-sidebar-border z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-2">
            <LayoutDashboard className="h-6 w-6 text-sidebar-primary" />
            <span className="text-xl font-bold">Intelligent ERP TaskPilot</span>
          </Link>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="hover:text-sidebar-primary">
              Features
            </a>
            <a href="#how-it-works" className="hover:text-sidebar-primary">
              How It Works
            </a>
            <a href="#pricing" className="hover:text-sidebar-primary">
              Pricing
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Link href={workspaceUrl}>
              <Button size="sm">
                {user ? 'Go to Workspace' : 'Get Started'}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-20">
        {/* Hero */}
        <section className="py-20">
          <div className="container mx-auto px-4 text-center space-y-6">
            <span className="inline-block bg-sidebar-primary/20 text-sidebar-primary rounded-full px-3 py-1 text-sm">
              High‑Quality Project Management
            </span>
            <h1 className="text-3xl md:text-5xl font-bold max-w-3xl mx-auto">
              Manage tasks and projects like a pro with Intelligent ERP TaskPilot
            </h1>
            <p className="text-lg text-sidebar-foreground/80 max-w-2xl mx-auto">
              A streamlined, developer‑friendly alternative to Jira. Track your work
              with speed, clarity, and zero bloat.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link href={workspaceUrl}>
                <Button size="lg" className="flex items-center gap-2">
                  {user ? 'Go to Workspace' : 'Get Started'}
                  {!user && <ArrowRight className="h-4 w-4" />}
                </Button>
              </Link>
            </div>
          </div>
        </section>

        <Separator className="mx-4" />

        {/* Features */}
        <section id="features" className="py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-8">
              Powerful Features
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  icon: <Layers className="h-6 w-6 text-sidebar-primary" />,
                  title: 'Task Management',
                  desc: 'Organize and track tasks with custom workflows and priorities.',
                },
                {
                  icon: <Zap className="h-6 w-6 text-sidebar-primary" />,
                  title: 'Fast & Responsive',
                  desc: 'Real‑time updates and a lightweight interface for maximum speed.',
                },
                {
                  icon: <Github className="h-6 w-6 text-sidebar-primary" />,
                  title: 'Open Source',
                  desc: 'Fully customizable and community‑driven under MIT license.',
                },
              ].map((f) => (
                <Card
                  key={f.title}
                  className="bg-sidebar rounded-lg border-sidebar-border"
                >
                  <CardHeader className="text-center">
                    <div className="mx-auto mb-3 inline-flex items-center justify-center bg-sidebar-primary/10 rounded-full p-3">
                      {f.icon}
                    </div>
                    <CardTitle className="text-lg">{f.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-sm text-sidebar-foreground/80">
                    {f.desc}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <Separator className="mx-4" />

        {/* How It Works */}
        <section id="how-it-works" className="py-16">
          <div className="container mx-auto px-4 flex flex-col-reverse md:flex-row items-center gap-8">
            <div className="space-y-6 md:w-1/2">
              {[
                {
                  icon: <CheckCircle className="h-5 w-5 text-sidebar-primary" />,
                  title: 'Create Projects',
                  desc: 'Set up projects and invite your team to collaborate seamlessly.',
                },
                {
                  icon: <CheckCircle className="h-5 w-5 text-sidebar-primary" />,
                  title: 'Manage Tasks',
                  desc: 'Assign, prioritize, and move tasks through customizable stages.',
                },
                {
                  icon: <CheckCircle className="h-5 w-5 text-sidebar-primary" />,
                  title: 'Track Progress',
                  desc: 'Gain insights with built‑in dashboards and status reports.',
                },
              ].map((step) => (
                <div key={step.title} className="flex items-start gap-4">
                  <div className="p-2 rounded-full bg-sidebar-primary/10">
                    {step.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold">{step.title}</h3>
                    <p className="text-sm text-sidebar-foreground/80">
                      {step.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="md:w-1/2 rounded-lg overflow-hidden border-sidebar-border">
              <div className="relative aspect-video bg-sidebar">
                <Image
                  src="/dashboard-img.png"
                  alt="Illustration of the TaskPilot dashboard"
                  fill
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <Separator className="mx-4" />

        {/* Pricing */}
        <section id="pricing" className="py-16">
          <div className="container mx-auto px-4 text-center space-y-6">
            <h2 className="text-2xl md:text-3xl font-bold">Pricing</h2>
            <p className="text-sidebar-foreground/80 max-w-2xl mx-auto">
              Always free and open source.
            </p>

            <Card className="max-w-md mx-auto bg-sidebar border-sidebar-border">
              <CardHeader className="pt-8 text-center">
                <CardTitle className="text-2xl font-bold">Open Source</CardTitle>
                <div className="mt-2 text-4xl font-bold">$0</div>
                <p className="mt-1 text-sm text-sidebar-foreground/80">
                  Forever free (until we run out of servers!)
                </p>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <ul className="space-y-2 text-sidebar-foreground">
                  {[
                    'Unlimited workspaces',
                    'Unlimited projects',
                    'Unlimited tasks',
                    'Invite team members',
                  ].map((feat) => (
                    <li key={feat} className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-sidebar-primary" />
                      {feat}
                    </li>
                  ))}
                </ul>
                <Link href={workspaceUrl}>
                  <Button className="w-full">Get Started</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>

        <Separator className="mx-4" />

        {/* Call To Action */}
        <section className="py-16 bg-sidebar-primary text-sidebar-primary-foreground">
          <div className="container mx-auto px-4 text-center space-y-4">
            <h2 className="text-2xl md:text-3xl font-bold">
              Ready to streamline your workflow?
            </h2>
            <p className="max-w-2xl mx-auto">
              Join thousands of developers using Intelligent ERP TaskPilot today.
            </p>
            <Link href={workspaceUrl}>
              <Button size="lg" variant="outline">
                {user ? 'Go to Workspace' : 'Get Started Now'}
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-sidebar-border py-6">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-4 gap-4">
          <div className="flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-sidebar-primary" />
            <span className="text-sm">© 2025 Intelligent ERP TaskPilot</span>
          </div>
          <div className="flex gap-4">
            <Link href="/privacy-policy" className="text-sidebar-foreground/80 hover:text-sidebar-foreground">
              Privacy Policy
            </Link>
            <Link href="/terms-of-service" className="text-sidebar-foreground/80 hover:text-sidebar-foreground">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
