'use client';

import { Activity, ArrowRight, Webhook } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import useSWR from 'swr';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { pollStatsAction } from '@/lib/actions';
import type { GlobalStats, ProjectStats } from '@/lib/stats-storage';
import type { Project } from '@/lib/types';

interface DashboardProps {
  initialProjects: Project[];
  initialGlobalStats: GlobalStats;
  initialProjectStats: (Project & { webhookCount: number; lastWebhook: number | null })[];
}

// Cache keys
const STATS_CACHE_KEY = 'slingshot_stats_data';
const STATS_ETAG_KEY = 'slingshot_stats_etag';

export function Dashboard({
  initialProjects,
  initialGlobalStats,
  initialProjectStats,
}: DashboardProps) {
  const [mounted, setMounted] = useState(false);
  
  // State for stats
  const [globalStats, setGlobalStats] = useState<GlobalStats>(initialGlobalStats);
  const [projectStatsMap, setProjectStatsMap] = useState<Record<string, ProjectStats>>({});
  const [mergedProjects, setMergedProjects] = useState(initialProjectStats);

  // Load from cache on mount
  useEffect(() => {
    setMounted(true);
    try {
      const cachedData = localStorage.getItem(STATS_CACHE_KEY);
      if (cachedData) {
        const { global, projects } = JSON.parse(cachedData);
        if (global && projects) {
          setGlobalStats(global);
          setProjectStatsMap(projects);
          // We don't immediately update mergedProjects here to avoid layout shift from initial SSR
          // unless the cache is significantly newer, but for now let's trust the SWR flow
        }
      }
    } catch (e) {
      console.error('Failed to load stats cache', e);
    }
  }, []);

  // SWR for polling
  const { data: pollResult } = useSWR(
    mounted ? 'stats' : null,
    async () => {
      const currentEtag = localStorage.getItem(STATS_ETAG_KEY);
      return pollStatsAction(currentEtag);
    },
    {
      refreshInterval: 5000, // Poll every 5 seconds
      revalidateOnFocus: true,
    }
  );

  // Handle updates
  useEffect(() => {
    if (pollResult?.changed && pollResult.stats) {
      const { global, projects } = pollResult.stats;
      
      // Update state
      setGlobalStats(global);
      setProjectStatsMap(projects);
      
      // Update cache
      localStorage.setItem(STATS_CACHE_KEY, JSON.stringify(pollResult.stats));
      if (pollResult.etag) {
        localStorage.setItem(STATS_ETAG_KEY, pollResult.etag);
      }
    }
  }, [pollResult]);

  // Merge projects with latest stats
  useEffect(() => {
    // If we have updated stats in the map, merge them
    if (Object.keys(projectStatsMap).length > 0) {
      const updated = initialProjects.map(project => {
        const stats = projectStatsMap[project.slug];
        return {
          ...project,
          webhookCount: stats?.webhookCount || 0,
          lastWebhook: stats?.lastWebhookTimestamp || null,
        };
      });
      setMergedProjects(updated);
    }
  }, [initialProjects, projectStatsMap]);

  // Use merged projects if available, otherwise initial (SSR)
  const projectsToRender = mergedProjects;
  const totalWebhooks = globalStats.totalWebhooks;

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* First Column: Projects List */}
      <div className="lg:col-span-2 space-y-6 order-1 lg:order-1">
        <Card className="border border-border/50 bg-card">
          <CardHeader>
            <CardTitle>Webhook Projects</CardTitle>
            <CardDescription>
              All your webhook testing projects
            </CardDescription>
          </CardHeader>
          <CardContent>
            {projectsToRender.length === 0 ? (
              <div className="text-center py-8 bg-muted/50 rounded-lg">
                <Webhook className="h-16 w-16 text-primary mx-auto mb-3" />
                <p className="font-semibold text-foreground mb-1">
                  No projects yet
                </p>
                <p className="text-sm text-muted-foreground">
                  Create your first webhook project to start receiving and
                  testing webhooks
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {projectsToRender.map((project) => (
                  <Link
                    key={project.slug}
                    href={`/${project.slug}`}
                    className="block p-3 rounded-lg border border-border/50 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foreground truncate">
                            {project.slug}
                          </span>
                          {project.slug === 'slingshot' && (
                            <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
                              Default
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span>{project.webhookCount} webhooks</span>
                          {project.lastWebhook && (
                            <span>
                              Last:{' '}
                              {new Date(
                                project.lastWebhook,
                              ).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0 ml-2" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Second Column: Stats */}
      <div className="space-y-3 order-3 lg:order-2">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-1 lg:gap-3">
          <Card className="border border-border/50 bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 lg:p-6">
              <CardTitle className="text-xs font-medium lg:text-sm">
                Webhook Projects
              </CardTitle>
              <Webhook className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 pt-0 lg:p-6 lg:pt-0">
              <div className="text-xl font-bold lg:text-2xl">
                {globalStats.totalProjects || initialProjects.length}
              </div>
              <p className="text-[10px] lg:text-xs text-muted-foreground">
                Active webhook endpoints
              </p>
            </CardContent>
          </Card>

          <Card className="border border-border/50 bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-3 lg:p-6">
              <CardTitle className="text-xs font-medium lg:text-sm">
                Total Webhooks
              </CardTitle>
              <Activity className="h-3 w-3 lg:h-4 lg:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="p-3 pt-0 lg:p-6 lg:pt-0">
              <div className="text-xl font-bold lg:text-2xl">
                {totalWebhooks}
              </div>
              <p className="text-[10px] lg:text-xs text-muted-foreground">
                Received
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

