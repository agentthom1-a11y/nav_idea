import { useMemo } from 'react';
import { useStore } from '../store';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { ArrowUpRight, ArrowDownRight, Activity, TrendingUp, CheckCircle2, AlertCircle, FileText } from 'lucide-react';
import { formatNumber, cn, PLATFORM_COLORS, STATUS_COLORS } from '../lib/utils';
import { isBefore, parseISO, getDay } from 'date-fns';

export default function Analytics() {
  const { content, ideas, pillars } = useStore();

  const metrics = useMemo(() => {
    const totalViews = content.reduce((sum, c) => sum + (c.views || 0), 0);
    const totalLikes = content.reduce((sum, c) => sum + (c.likes || 0), 0);
    const totalShares = content.reduce((sum, c) => sum + (c.shares || 0), 0);
    const totalComments = content.reduce((sum, c) => sum + (c.commentsCount || 0), 0);
    const totalEngagements = totalLikes + totalShares + totalComments + content.reduce((sum, c) => sum + (c.engagement || 0), 0);
    
    const engagementRate = totalViews > 0 
      ? ((totalEngagements / totalViews) * 100).toFixed(1) + '%' 
      : (totalEngagements > 0 ? '100%' : '0.0%');

    const publishedItems = content.filter(c => c.status === 'PUBLISHED');
    const scheduledItems = content.filter(c => c.status === 'SCHEDULED');
    const reviewItems = content.filter(c => c.status === 'REVIEW' || c.status === 'CHANGES_REQUESTED');
    const approvedItems = content.filter(c => c.status === 'APPROVED');
    const overdueItems = content.filter(c => c.status !== 'PUBLISHED' && c.publishAt && isBefore(new Date(c.publishAt), new Date()));

    // Dynamic Score calculation based on completion, scheduling, and publication
    let calculatedScore = 0;
    if (content.length > 0) {
      const completionRatio = content.filter(c => (c.caption && c.caption.length > 20) || (c.script && c.script.length > 20)).length / content.length;
      const workflowProgress = (publishedItems.length * 1.0 + approvedItems.length * 0.8 + scheduledItems.length * 0.9 + reviewItems.length * 0.5) / content.length;
      calculatedScore = Math.min(100, Math.max(10, Math.round((completionRatio * 40) + (workflowProgress * 60))));
    }

    // Workflow Health Indicators
    const totalDated = content.filter(c => c.publishAt).length;
    const onSchedule = totalDated - overdueItems.length;
    const scheduleConsistency = totalDated > 0 ? Math.round((onSchedule / totalDated) * 100) : (content.length > 0 ? 100 : 0);
    
    const advancedWorkflowCount = content.filter(c => c.status !== 'IDEA' && c.status !== 'RESEARCH').length;
    const productionVelocity = content.length > 0 ? Math.round((advancedWorkflowCount / content.length) * 100) : 0;
    
    const resolvedReviewCount = approvedItems.length + publishedItems.length + scheduledItems.length;
    const totalReviewInteractions = resolvedReviewCount + reviewItems.length;
    const approvalEfficiency = totalReviewInteractions > 0 ? Math.round((resolvedReviewCount / totalReviewInteractions) * 100) : 100;

    return {
      totalViews,
      totalEngagements,
      engagementRate,
      publishedCount: publishedItems.length,
      scheduledCount: scheduledItems.length,
      reviewCount: reviewItems.length,
      overdueCount: overdueItems.length,
      calculatedScore,
      scheduleConsistency,
      productionVelocity,
      approvalEfficiency,
      totalContent: content.length,
      totalIdeas: ideas.length
    };
  }, [content, ideas]);

  // Aggregate views and engagement across days of the week based on actual content publish/created dates
  const weeklyPerformance = useMemo(() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const dayData: Record<string, { views: number; engagement: number; count: number }> = {
      Mon: { views: 0, engagement: 0, count: 0 },
      Tue: { views: 0, engagement: 0, count: 0 },
      Wed: { views: 0, engagement: 0, count: 0 },
      Thu: { views: 0, engagement: 0, count: 0 },
      Fri: { views: 0, engagement: 0, count: 0 },
      Sat: { views: 0, engagement: 0, count: 0 },
      Sun: { views: 0, engagement: 0, count: 0 },
    };

    content.forEach(item => {
      const dateStr = item.publishAt || item.createdAt;
      if (dateStr) {
        try {
          const d = parseISO(dateStr);
          const dayName = days[getDay(d)];
          if (dayData[dayName]) {
            dayData[dayName].views += (item.views || 0);
            dayData[dayName].engagement += ((item.likes || 0) + (item.commentsCount || 0) + (item.shares || 0) + (item.engagement || 0));
            dayData[dayName].count += 1;
          }
        } catch (e) {}
      }
    });

    return ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(day => ({
      name: day,
      views: dayData[day].views,
      engagement: dayData[day].engagement,
      posts: dayData[day].count
    }));
  }, [content]);

  // Real Performance by Content Pillar
  const pillarPerformance = useMemo(() => {
    return pillars.map(pillar => {
      const pillarItems = content.filter(c => c.pillarId === pillar.id);
      const views = pillarItems.reduce((sum, c) => sum + (c.views || 0), 0);
      const count = pillarItems.length;
      return {
        name: pillar.name,
        count,
        views,
        color: pillar.color || '#3b82f6'
      };
    }).sort((a, b) => b.count - a.count || b.views - a.views);
  }, [content, pillars]);

  // Real Top Performing or Latest Content
  const topContent = useMemo(() => {
    return [...content].sort((a, b) => {
      if ((b.views || 0) !== (a.views || 0)) {
        return (b.views || 0) - (a.views || 0);
      }
      return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
    }).slice(0, 5);
  }, [content]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
        <p className="text-slate-500 mt-1">Real-time content performance and workflow metrics from your workspace.</p>
      </div>

      {/* Real KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500">Total Reach</p>
            <div className="mt-2 flex items-baseline gap-2">
              <h2 className="text-3xl font-bold">{formatNumber(metrics.totalViews)}</h2>
              <span className="flex items-center text-xs font-semibold text-slate-500">
                {metrics.totalContent} posts
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500">Engagement Rate</p>
            <div className="mt-2 flex items-baseline gap-2">
              <h2 className="text-3xl font-bold">{metrics.engagementRate}</h2>
              <span className="flex items-center text-xs font-semibold text-slate-500">
                {formatNumber(metrics.totalEngagements)} total
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500">Published Content</p>
            <div className="mt-2 flex items-baseline gap-2">
              <h2 className="text-3xl font-bold">{metrics.publishedCount}</h2>
              <span className={cn(
                "flex items-center text-xs font-semibold",
                metrics.publishedCount > 0 ? "text-emerald-600" : "text-slate-400"
              )}>
                {metrics.scheduledCount} scheduled
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <p className="text-sm font-medium text-slate-500">Content Quality Score</p>
            <div className="mt-2 flex items-baseline gap-2">
              <h2 className="text-3xl font-bold">{metrics.calculatedScore}/100</h2>
              <span className={cn(
                "flex items-center text-xs font-semibold",
                metrics.calculatedScore >= 70 ? "text-emerald-600" : "text-amber-500"
              )}>
                <TrendingUp className="w-3.5 h-3.5 mr-1" /> Health
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Real Performance Chart */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Performance Overview</CardTitle>
              <p className="text-xs text-slate-500 mt-1">Weekly breakdown of views and engagement across all posts</p>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyPerformance} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}`} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Area type="monotone" dataKey="views" name="Views" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorViews)" />
                  <Area type="monotone" dataKey="engagement" name="Engagement" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorEngagement)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Real Content Health Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Content Health</CardTitle>
            <p className="text-xs text-slate-500">Pipeline execution & review efficiency</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Schedule Consistency</span>
                <span className="font-bold text-emerald-600">{metrics.scheduleConsistency}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                <div className="bg-emerald-500 h-2 rounded-full transition-all duration-500" style={{ width: `${metrics.scheduleConsistency}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Production Velocity</span>
                <span className="font-bold text-blue-600">{metrics.productionVelocity}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full transition-all duration-500" style={{ width: `${metrics.productionVelocity}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Approval Efficiency</span>
                <span className={cn("font-bold", metrics.approvalEfficiency >= 80 ? "text-emerald-600" : "text-amber-500")}>
                  {metrics.approvalEfficiency}%
                </span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                <div className={cn("h-2 rounded-full transition-all duration-500", metrics.approvalEfficiency >= 80 ? "bg-emerald-500" : "bg-amber-500")} style={{ width: `${metrics.approvalEfficiency}%` }}></div>
              </div>
            </div>

            {/* Real Workflow Bottleneck Callout */}
            <div className={cn(
              "mt-6 p-4 rounded-lg flex gap-3 border text-xs",
              metrics.reviewCount > 0 
                ? "bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-200"
                : metrics.overdueCount > 0
                ? "bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-200"
                : "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-200"
            )}>
              {metrics.reviewCount > 0 ? (
                <>
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Review Bottleneck</p>
                    <p className="mt-0.5">{metrics.reviewCount} piece(s) currently awaiting approval in review.</p>
                  </div>
                </>
              ) : metrics.overdueCount > 0 ? (
                <>
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Overdue Content</p>
                    <p className="mt-0.5">{metrics.overdueCount} piece(s) are past their planned schedule date.</p>
                  </div>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm">Optimal Workflow</p>
                    <p className="mt-0.5">All content is progressing smoothly without bottlenecks.</p>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Real Pillar Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Content by Pillar</CardTitle>
            <p className="text-xs text-slate-500">Distribution of active content pieces across defined strategic pillars</p>
          </CardHeader>
          <CardContent>
            {pillarPerformance.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">No pillars configured yet.</div>
            ) : (
              <div className="h-[250px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={pillarPerformance} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <XAxis type="number" allowDecimals={false} hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={120} fontSize={12} />
                    <Tooltip cursor={{ fill: 'transparent' }} formatter={(val: any) => [`${val} pieces`, 'Count']} />
                    <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={24} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Real Content Table */}
        <Card>
          <CardHeader>
            <CardTitle>Top Active Content</CardTitle>
            <p className="text-xs text-slate-500">Highest priority and most viewed content pieces in your workspace</p>
          </CardHeader>
          <CardContent>
            {topContent.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm flex flex-col items-center justify-center">
                <FileText className="w-8 h-8 text-slate-300 mb-2" />
                <p>No content items yet.</p>
                <p className="text-xs text-slate-400 mt-1">Create your first content piece to begin tracking analytics.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {topContent.map((item, i) => (
                  <div key={item.id} className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 last:border-0 pb-4 last:pb-0">
                    <div className="flex gap-3 items-center min-w-0 flex-1 mr-4">
                      <span className="font-bold text-slate-300 dark:text-slate-600 w-4 text-center">{i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm text-slate-900 dark:text-slate-100 truncate">{item.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded uppercase", PLATFORM_COLORS[item.platform] || "bg-slate-100 text-slate-600")}>
                            {item.platform}
                          </span>
                          <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded uppercase", STATUS_COLORS[item.status] || "bg-slate-100 text-slate-600")}>
                            {item.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-sm text-slate-900 dark:text-white">{formatNumber(item.views || 0)}</p>
                      <p className="text-[10px] text-slate-400">Views</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
