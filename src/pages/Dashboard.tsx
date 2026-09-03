import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { useStore } from '../store';
import { formatNumber, formatFriendlyDate, PLATFORM_COLORS, STATUS_COLORS, cn } from '../lib/utils';
import { isToday, isBefore } from 'date-fns';
import { BarChart3, Clock, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { content, ideas, currentUser } = useStore();
  const navigate = useNavigate();

  const metrics = useMemo(() => {
    const published = content.filter(c => c.status === 'PUBLISHED').length;
    const scheduled = content.filter(c => c.status === 'SCHEDULED').length;
    const inProduction = content.filter(c => ['DRAFT', 'DESIGN', 'EDITING', 'BRIEF', 'RESEARCH'].includes(c.status)).length;
    const needApproval = content.filter(c => c.status === 'REVIEW' || c.status === 'CHANGES_REQUESTED').length;
    const overdue = content.filter(c => c.status !== 'PUBLISHED' && c.publishAt && isBefore(new Date(c.publishAt), new Date())).length;
    
    const totalViews = content.reduce((acc, curr) => acc + (curr.views || 0), 0);
    const totalEngagements = content.reduce((acc, curr) => acc + (curr.likes || 0) + (curr.commentsCount || 0) + (curr.shares || 0) + (curr.engagement || 0), 0);

    return { published, scheduled, inProduction, needApproval, overdue, totalViews, totalEngagements };
  }, [content]);

  const todayContent = useMemo(() => {
    return content.filter(c => c.publishAt && isToday(new Date(c.publishAt))).sort((a, b) => new Date(a.publishAt!).getTime() - new Date(b.publishAt!).getTime());
  }, [content]);

  const attentionRequired = useMemo(() => {
    return content.filter(c => 
      c.status === 'REVIEW' || 
      c.status === 'CHANGES_REQUESTED' ||
      (c.status !== 'PUBLISHED' && c.publishAt && isBefore(new Date(c.publishAt), new Date()))
    ).slice(0, 5);
  }, [content]);

  const pipelineStages = [
    { name: 'Ideas', count: ideas.length, icon: null },
    { name: 'Drafting', count: metrics.inProduction, icon: null },
    { name: 'Review', count: metrics.needApproval, icon: null },
    { name: 'Scheduled', count: metrics.scheduled, icon: null },
    { name: 'Published', count: metrics.published, icon: null },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Good morning, {currentUser.name.split(' ')[0]}</h1>
        <p className="text-slate-500 mt-1">Here's what's happening with your content today.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Scheduled</CardTitle>
            <Clock className="w-4 h-4 text-slate-400" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.scheduled}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Need Approval</CardTitle>
            <CheckCircle2 className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.needApproval}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Overdue</CardTitle>
            <AlertCircle className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.overdue}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Views</CardTitle>
            <BarChart3 className="w-4 h-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatNumber(metrics.totalViews)}</div>
            <p className="text-xs text-slate-500 mt-1 font-medium">{metrics.published} published • {metrics.scheduled} scheduled</p>
          </CardContent>
        </Card>
      </div>

      {/* Pipeline */}
      <Card>
        <CardHeader className="pb-4 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-sm font-medium uppercase tracking-wider text-slate-500">Pipeline</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="flex items-center">
            {pipelineStages.map((stage, i) => (
              <div 
                key={stage.name} 
                className={cn(
                  "flex-1 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors",
                  i !== pipelineStages.length - 1 && "border-r border-slate-100 dark:border-slate-800"
                )}
                onClick={() => navigate('/planner')}
              >
                <div className="text-3xl font-bold text-slate-900 dark:text-white mb-1">{stage.count}</div>
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wide">{stage.name}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Today</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {todayContent.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">No content scheduled for today.</div>
            ) : (
              todayContent.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => navigate(`/content/${item.id}`)}
                  className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                >
                  <div className="w-16 text-right pt-1">
                    <span className="text-sm font-medium">{formatFriendlyDate(item.publishAt).split(', ')[1] || 'TBD'}</span>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", PLATFORM_COLORS[item.platform] || "bg-slate-100 text-slate-700")}>
                        {item.platform}
                      </span>
                      <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded uppercase", STATUS_COLORS[item.status] || "bg-slate-100 text-slate-500")}>
                        {item.status}
                      </span>
                    </div>
                    <p className="font-medium line-clamp-1">{item.title}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Attention Required */}
        <Card>
          <CardHeader>
            <CardTitle>Needs Attention</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {attentionRequired.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">You're all caught up!</div>
            ) : (
              attentionRequired.map((item) => {
                const isOverdue = item.status !== 'PUBLISHED' && item.publishAt && isBefore(new Date(item.publishAt), new Date());
                
                return (
                  <div 
                    key={item.id}
                    onClick={() => navigate(`/content/${item.id}`)}
                    className="flex items-start gap-4 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                  >
                    <div className="mt-1">
                      {isOverdue ? (
                        <AlertCircle className="w-5 h-5 text-red-500" />
                      ) : (
                        <CheckCircle2 className="w-5 h-5 text-amber-500" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium line-clamp-1">{item.title}</p>
                      <p className="text-sm text-slate-500 mt-0.5">
                        {isOverdue ? 'Overdue' : 'Awaiting approval'} • {item.platform}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
